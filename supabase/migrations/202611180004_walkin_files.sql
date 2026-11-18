BEGIN;
CREATE FUNCTION public.admin_submit_walkin_with_files(p_jenis_surat_id uuid,p_nama_pemohon text,p_no_hp text,p_email text,p_jawaban jsonb,p_key uuid,p_access_hash text,p_payload_hash text,p_session_id uuid,p_files uuid[]) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb; v_payload jsonb; v_hash text; v_existing uuid;
BEGIN
 IF NOT (SELECT app_private.is_admin()) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 v_payload:=jsonb_build_object('jenis_surat_id',p_jenis_surat_id,'nama_pemohon',p_nama_pemohon,'no_hp',p_no_hp,'email',p_email,'jawaban',p_jawaban);
 -- Client checksum is deliberately ignored. Database canonical JSON includes real actor and source.
 v_hash:=encode(pg_catalog.sha256(convert_to(jsonb_build_object('payload',v_payload,'files',(SELECT COALESCE(jsonb_agg(x ORDER BY x),'[]'::jsonb) FROM unnest(p_files) x),'session_id',p_session_id,'access_hash',p_access_hash,'source','loket','actor',auth.uid())::text,'UTF8')),'hex');
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_key::text,1));
 SELECT application_id INTO v_existing FROM app_private.application_receipts WHERE idempotency_key=p_key;
 result:=public.submit_application_with_files(p_key,p_access_hash,v_hash,v_payload,p_session_id,p_files);
 IF v_existing IS NOT NULL THEN RETURN result; END IF;
 UPDATE public.permohonan_surat SET source='loket' WHERE id=(result->>'id')::uuid;
 UPDATE public.permohonan_status_history SET actor_id=auth.uid() WHERE permohonan_id=(result->>'id')::uuid AND actor_id IS NULL;
 INSERT INTO public.log_aktivitas(actor_id,aksi,entitas,entitas_id,detail) VALUES(auth.uid(),'walkin_submitted','permohonan_surat',result->>'id','{}');
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.admin_submit_walkin_with_files(uuid,text,text,text,jsonb,uuid,text,text,uuid,uuid[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_submit_walkin_with_files(uuid,text,text,text,jsonb,uuid,text,text,uuid,uuid[]) TO authenticated;
COMMIT;

