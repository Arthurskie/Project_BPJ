BEGIN;
ALTER TABLE public.permohonan_surat ADD COLUMN source text NOT NULL DEFAULT 'online' CHECK (source IN ('online','loket'));
ALTER TABLE public.permohonan_surat ADD COLUMN public_note text CHECK (char_length(public_note) <= 2000);
CREATE TABLE app_private.application_receipts (
 idempotency_key uuid PRIMARY KEY,
 access_hash text NOT NULL CHECK (access_hash ~ '^[a-f0-9]{64}$'),
 payload_hash text NOT NULL CHECK (payload_hash ~ '^[a-f0-9]{64}$'),
 application_id uuid UNIQUE REFERENCES public.permohonan_surat(id) ON DELETE CASCADE,
 receipt jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE app_private.application_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON app_private.application_receipts FROM PUBLIC, anon, authenticated;
CREATE FUNCTION public.secure_submit_application(p_key uuid,p_access_hash text,p_payload_hash text,p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE r app_private.application_receipts; result jsonb;
BEGIN
 IF p_key IS NULL OR p_access_hash IS NULL OR p_access_hash !~ '^[a-f0-9]{64}$' OR p_payload_hash IS NULL OR p_payload_hash !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'INVALID_REQUEST'; END IF;
 INSERT INTO app_private.application_receipts(idempotency_key,access_hash,payload_hash) VALUES(p_key,p_access_hash,p_payload_hash) ON CONFLICT DO NOTHING;
 SELECT * INTO r FROM app_private.application_receipts WHERE idempotency_key=p_key FOR UPDATE;
 IF r.access_hash IS DISTINCT FROM p_access_hash OR r.payload_hash IS DISTINCT FROM p_payload_hash THEN RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT'; END IF;
 IF r.receipt IS NOT NULL THEN RETURN r.receipt; END IF;
 PERFORM 1 FROM public.jenis_surat WHERE id=(p_payload->>'jenis_surat_id')::uuid FOR SHARE;
 result := public.submit_public_application((p_payload->>'jenis_surat_id')::uuid,p_payload->>'nama_pemohon',p_payload->>'no_hp',p_payload->>'email',p_payload->'jawaban');
 UPDATE app_private.application_receipts SET application_id=(result->>'id')::uuid,receipt=result WHERE idempotency_key=p_key;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.secure_submit_application(uuid,text,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.secure_submit_application(uuid,text,text,jsonb) TO service_role;
CREATE FUNCTION public.secure_track_application(p_code text,p_access_hash text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
 SELECT jsonb_build_object('kode_permohonan',p.kode_permohonan,'status',p.status,'jenis_surat',j.nama,'created_at',p.created_at,'updated_at',p.updated_at,'public_note',p.public_note)
 FROM public.permohonan_surat p JOIN app_private.application_receipts r ON r.application_id=p.id JOIN public.jenis_surat j ON j.id=p.jenis_surat_id
 WHERE p.kode_permohonan=p_code AND r.access_hash=p_access_hash;
$$;
REVOKE ALL ON FUNCTION public.secure_track_application(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.secure_track_application(text,text) TO service_role;
CREATE FUNCTION public.admin_submit_walkin(p_jenis_surat_id uuid,p_nama_pemohon text,p_no_hp text,p_email text,p_jawaban jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE result jsonb;
BEGIN
 IF NOT (SELECT app_private.is_admin()) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 PERFORM 1 FROM public.jenis_surat WHERE id=p_jenis_surat_id FOR SHARE;
 result := public.submit_public_application(p_jenis_surat_id,p_nama_pemohon,p_no_hp,p_email,p_jawaban);
 UPDATE public.permohonan_surat SET source='loket' WHERE id=(result->>'id')::uuid;
 UPDATE public.permohonan_status_history SET actor_id=auth.uid() WHERE permohonan_id=(result->>'id')::uuid;
 INSERT INTO public.log_aktivitas(actor_id,aksi,entitas,entitas_id,detail) VALUES(auth.uid(),'walkin_submitted','permohonan_surat',result->>'id','{}');
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.admin_submit_walkin(uuid,text,text,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_submit_walkin(uuid,text,text,text,jsonb) TO authenticated;
CREATE FUNCTION public.admin_set_public_note(p_permohonan_id uuid,p_note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NOT (SELECT app_private.is_admin()) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 IF char_length(p_note)>2000 THEN RAISE EXCEPTION 'INVALID_REQUEST'; END IF;
 UPDATE public.permohonan_surat SET public_note=nullif(btrim(p_note),'') WHERE id=p_permohonan_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
 INSERT INTO public.log_aktivitas(actor_id,aksi,entitas,entitas_id,detail) VALUES(auth.uid(),'public_note_changed','permohonan_surat',p_permohonan_id::text,'{}');
END $$;
REVOKE ALL ON FUNCTION public.admin_set_public_note(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_set_public_note(uuid,text) TO authenticated;
COMMIT;


