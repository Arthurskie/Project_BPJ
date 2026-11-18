BEGIN;
CREATE FUNCTION public.admin_update_own_profile(p_nama text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT (SELECT app_private.is_admin()) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 IF p_nama IS NULL OR char_length(btrim(p_nama)) NOT BETWEEN 1 AND 120 THEN RAISE EXCEPTION 'INVALID_NAME'; END IF;
 UPDATE public.profiles SET nama=btrim(p_nama) WHERE id=auth.uid();
END $$;
CREATE FUNCTION public.admin_save_letter_type(p_id uuid,p_kode text,p_nama text,p_deskripsi text,p_is_active boolean,p_fields jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE v_id uuid; f jsonb;
BEGIN
 IF NOT (SELECT app_private.is_admin()) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 IF p_fields IS NULL OR jsonb_typeof(p_fields)<>'array' OR jsonb_array_length(p_fields)>100 THEN RAISE EXCEPTION 'INVALID_FIELDS'; END IF;
 IF p_id IS NULL THEN
 INSERT INTO public.jenis_surat(kode,nama,deskripsi,is_active,created_by) VALUES(p_kode,p_nama,p_deskripsi,p_is_active,auth.uid()) RETURNING jenis_surat.id INTO v_id;
 ELSE
 SELECT j.id INTO v_id FROM public.jenis_surat j WHERE j.id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
 UPDATE public.jenis_surat SET kode=p_kode,nama=p_nama,deskripsi=p_deskripsi,is_active=p_is_active WHERE jenis_surat.id=p_id;
 END IF;
 DELETE FROM public.form_surat_fields WHERE jenis_surat_id=v_id;
 FOR f IN SELECT value FROM jsonb_array_elements(p_fields) LOOP
 INSERT INTO public.form_surat_fields(jenis_surat_id,field_key,label,tipe_input,placeholder,wajib,opsi,panjang_maksimum,urutan) VALUES(v_id,f->>'field_key',f->>'label',f->>'tipe_input',f->>'placeholder',COALESCE((f->>'wajib')::boolean,false),ARRAY(SELECT jsonb_array_elements_text(COALESCE(f->'opsi','[]'))),COALESCE((f->>'panjang_maksimum')::integer,255),COALESCE((f->>'urutan')::integer,0));
 END LOOP;
 RETURN v_id;
END $$;
CREATE FUNCTION public.promote_invited_admin(p_inviter uuid,p_user_id uuid,p_email text,p_started_at timestamptz) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE u auth.users;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=p_inviter AND role='admin' AND is_active) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
 SELECT * INTO u FROM auth.users WHERE id=p_user_id FOR UPDATE;
 IF NOT FOUND OR u.created_at<p_started_at OR u.invited_at IS NULL OR u.invited_at<p_started_at OR lower(u.email)<>lower(p_email) OR u.last_sign_in_at IS NOT NULL OR u.email_confirmed_at IS NOT NULL THEN RAISE EXCEPTION 'INVITATION_REFUSED'; END IF;
 UPDATE public.profiles SET role='admin',is_active=true WHERE id=p_user_id AND role='guest';
 IF NOT FOUND THEN RAISE EXCEPTION 'INVITATION_REFUSED'; END IF;
 INSERT INTO public.log_aktivitas(actor_id,aksi,entitas,entitas_id,detail) VALUES(p_inviter,'admin_invited','profiles',p_user_id::text,'{}');
END $$;
REVOKE ALL ON FUNCTION public.admin_update_own_profile(text),public.admin_save_letter_type(uuid,text,text,text,boolean,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_update_own_profile(text),public.admin_save_letter_type(uuid,text,text,text,boolean,jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.promote_invited_admin(uuid,uuid,text,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.promote_invited_admin(uuid,uuid,text,timestamptz) TO service_role;
COMMIT;


