BEGIN;
CREATE FUNCTION app_private.lock_form_parent() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF TG_OP='UPDATE' AND OLD.jenis_surat_id IS DISTINCT FROM NEW.jenis_surat_id THEN
 PERFORM 1 FROM public.jenis_surat WHERE id IN(OLD.jenis_surat_id,NEW.jenis_surat_id) ORDER BY id FOR UPDATE;
 ELSIF TG_OP='DELETE' THEN
 PERFORM 1 FROM public.jenis_surat WHERE id=OLD.jenis_surat_id FOR UPDATE;
 ELSE
 PERFORM 1 FROM public.jenis_surat WHERE id=NEW.jenis_surat_id FOR UPDATE;
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION app_private.lock_form_parent() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER serialize_form_mutations BEFORE INSERT OR UPDATE OR DELETE ON public.form_surat_fields FOR EACH ROW EXECUTE FUNCTION app_private.lock_form_parent();
COMMIT;
