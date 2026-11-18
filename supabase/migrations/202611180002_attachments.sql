BEGIN;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('application-attachments','application-attachments',false,10485760,ARRAY['application/pdf','image/jpeg','image/png']) ON CONFLICT(id) DO NOTHING;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM storage.buckets WHERE id='application-attachments' AND public=false AND file_size_limit=10485760 AND allowed_mime_types @> ARRAY['application/pdf','image/jpeg','image/png']::text[] AND allowed_mime_types <@ ARRAY['application/pdf','image/jpeg','image/png']::text[]) THEN RAISE EXCEPTION 'Existing attachment bucket configuration unsafe: operator review required'; END IF;
END $$;
CREATE TABLE app_private.upload_capabilities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), access_hash text NOT NULL CHECK(access_hash ~ '^[a-f0-9]{64}$'), capability_hash text NOT NULL CHECK(capability_hash ~ '^[a-f0-9]{64}$'),
 session_id uuid NOT NULL, object_path text NOT NULL UNIQUE, verified_path text UNIQUE, original_name text NOT NULL CHECK(char_length(original_name) BETWEEN 1 AND 180),
 expected_size integer NOT NULL CHECK(expected_size BETWEEN 1 AND 10485760), expected_type text NOT NULL CHECK(expected_type IN('application/pdf','image/jpeg','image/png')),
 sha256 text, status text NOT NULL DEFAULT 'pending' CHECK(status IN('pending','ready','cancelled','deleting')),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '15 minutes', signed_until timestamptz NOT NULL DEFAULT now()+interval '3 hours',
 created_at timestamptz NOT NULL DEFAULT now(), consumed_at timestamptz, application_id uuid REFERENCES public.permohonan_surat(id) ON DELETE RESTRICT
);
ALTER TABLE app_private.upload_capabilities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app_private.upload_capabilities FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.prepare_attachment(p_access_hash text,p_capability_hash text,p_session_id uuid,p_name text,p_size integer,p_type text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r app_private.upload_capabilities;
BEGIN
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_access_hash,0));
 IF (SELECT count(*) FROM app_private.upload_capabilities WHERE access_hash=p_access_hash AND session_id=p_session_id AND status IN('pending','ready') AND consumed_at IS NULL AND expires_at>now())>=5 THEN RAISE EXCEPTION 'FILE_LIMIT'; END IF;
 INSERT INTO app_private.upload_capabilities(access_hash,capability_hash,session_id,object_path,original_name,expected_size,expected_type) VALUES(p_access_hash,p_capability_hash,p_session_id,'temporary/'||gen_random_uuid()::text,p_name,p_size,p_type) RETURNING * INTO r;
 RETURN to_jsonb(r);
END $$;
CREATE FUNCTION public.get_attachment_capability(p_id uuid,p_access_hash text,p_capability_hash text,p_session_id uuid) RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 SELECT to_jsonb(c) FROM app_private.upload_capabilities c WHERE id=p_id AND access_hash=p_access_hash AND capability_hash=p_capability_hash AND session_id=p_session_id AND status IN('pending','ready') AND consumed_at IS NULL AND expires_at>now();
$$;
CREATE FUNCTION public.finalize_attachment(p_id uuid,p_access_hash text,p_capability_hash text,p_session_id uuid,p_verified_path text,p_sha256 text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r app_private.upload_capabilities;
BEGIN
 SELECT * INTO r FROM app_private.upload_capabilities WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR r.access_hash IS DISTINCT FROM p_access_hash OR r.capability_hash IS DISTINCT FROM p_capability_hash OR r.session_id IS DISTINCT FROM p_session_id OR r.status NOT IN('pending','ready') OR r.consumed_at IS NOT NULL OR r.expires_at<=now() THEN RAISE EXCEPTION 'UPLOAD_REFUSED'; END IF;
 IF r.status='ready' THEN RETURN jsonb_build_object('id',r.id,'name',r.original_name,'size',r.expected_size,'mime',r.expected_type,'verified_path',r.verified_path); END IF;
 IF p_verified_path IS NULL OR p_sha256 IS NULL OR p_verified_path NOT LIKE 'verified/%' OR p_sha256 !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'UPLOAD_REFUSED'; END IF;
 UPDATE app_private.upload_capabilities SET status='ready',verified_path=p_verified_path,sha256=p_sha256 WHERE id=p_id;
 RETURN jsonb_build_object('id',r.id,'name',r.original_name,'size',r.expected_size,'mime',r.expected_type,'verified_path',p_verified_path);
END $$;
CREATE FUNCTION public.cancel_attachment(p_id uuid,p_access_hash text,p_capability_hash text,p_session_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 UPDATE app_private.upload_capabilities SET status='cancelled' WHERE id=p_id AND access_hash=p_access_hash AND capability_hash=p_capability_hash AND session_id=p_session_id AND consumed_at IS NULL;
END $$;
CREATE FUNCTION public.submit_application_with_files(p_key uuid,p_access_hash text,p_payload_hash text,p_payload jsonb,p_session_id uuid,p_files uuid[]) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb; c app_private.upload_capabilities; file_id uuid;
BEGIN
 IF p_key IS NULL OR p_access_hash IS NULL OR p_access_hash !~ '^[a-f0-9]{64}$' OR p_payload_hash IS NULL OR p_payload_hash !~ '^[a-f0-9]{64}$' OR p_files IS NULL OR (cardinality(p_files)>0 AND p_session_id IS NULL) OR array_position(p_files,NULL) IS NOT NULL OR cardinality(p_files)>5 OR cardinality(p_files)<>(SELECT count(DISTINCT x) FROM unnest(p_files) x) THEN RAISE EXCEPTION 'INVALID_FILES'; END IF;
 -- Lock deterministic order before receipt: every submission follows this order.
 FOR c IN SELECT * FROM app_private.upload_capabilities WHERE id=ANY(p_files) ORDER BY id FOR UPDATE LOOP NULL; END LOOP;
 result:=public.secure_submit_application(p_key,p_access_hash,p_payload_hash,p_payload);
 FOREACH file_id IN ARRAY p_files LOOP
 SELECT * INTO c FROM app_private.upload_capabilities WHERE id=file_id;
 IF NOT FOUND OR c.access_hash IS DISTINCT FROM p_access_hash OR c.session_id IS DISTINCT FROM p_session_id OR c.status<>'ready' OR c.verified_path IS NULL OR (c.consumed_at IS NULL AND c.expires_at<=now()) OR (c.application_id IS NOT NULL AND c.application_id<>(result->>'id')::uuid) THEN RAISE EXCEPTION 'INVALID_FILES'; END IF;
 UPDATE app_private.upload_capabilities SET consumed_at=COALESCE(consumed_at,now()),application_id=(result->>'id')::uuid WHERE id=file_id;
 END LOOP;
 RETURN result;
END $$;
CREATE VIEW public.application_attachments WITH(security_barrier=true) AS SELECT id,application_id,original_name,expected_size AS size,expected_type AS mime,created_at FROM app_private.upload_capabilities WHERE status='ready' AND consumed_at IS NOT NULL AND (SELECT app_private.is_admin());
REVOKE ALL ON public.application_attachments FROM PUBLIC,anon;
GRANT SELECT ON public.application_attachments TO authenticated;
CREATE FUNCTION public.admin_attachment_path(p_id uuid) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE path text;
BEGIN
 IF NOT (SELECT app_private.is_admin()) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 SELECT verified_path INTO path FROM app_private.upload_capabilities WHERE id=p_id AND status='ready' AND consumed_at IS NOT NULL;
 RETURN path;
END $$;
CREATE FUNCTION public.claim_expired_attachments() RETURNS SETOF app_private.upload_capabilities LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 RETURN QUERY UPDATE app_private.upload_capabilities SET status='deleting' WHERE application_id IS NULL AND consumed_at IS NULL AND created_at<now()-interval '24 hours' AND signed_until<now() AND expires_at<now() RETURNING *;
END $$;
REVOKE ALL ON FUNCTION public.prepare_attachment(text,text,uuid,text,integer,text),public.get_attachment_capability(uuid,text,text,uuid),public.finalize_attachment(uuid,text,text,uuid,text,text),public.cancel_attachment(uuid,text,text,uuid),public.submit_application_with_files(uuid,text,text,jsonb,uuid,uuid[]),public.claim_expired_attachments() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_attachment(text,text,uuid,text,integer,text),public.get_attachment_capability(uuid,text,text,uuid),public.finalize_attachment(uuid,text,text,uuid,text,text),public.cancel_attachment(uuid,text,text,uuid),public.submit_application_with_files(uuid,text,text,jsonb,uuid,uuid[]),public.claim_expired_attachments() TO service_role;
REVOKE ALL ON FUNCTION public.admin_attachment_path(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_attachment_path(uuid) TO authenticated;
COMMIT;



