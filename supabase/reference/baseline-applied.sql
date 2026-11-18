-- SISTEM PENGAJUAN SURAT: schema + RLS + RPC (v1.0)
-- Target: project Supabase development BARU. Review before production.
-- Guest publik tidak memiliki akun; auth hanya untuk Admin.
-- Jalankan di Supabase SQL Editor sebagai pemilik database.

BEGIN;

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO anon, authenticated;

-- 1) TABEL UTAMA --------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nama text,
  role text NOT NULL DEFAULT 'guest' CHECK (role IN ('admin','guest')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.jenis_surat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode text NOT NULL UNIQUE CHECK (kode ~ '^[A-Z][A-Z0-9_]{1,29}$'),
  nama text NOT NULL CHECK (char_length(btrim(nama)) BETWEEN 3 AND 120),
  deskripsi text,
  is_active boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.form_surat_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis_surat_id uuid NOT NULL REFERENCES public.jenis_surat(id) ON DELETE CASCADE,
  field_key text NOT NULL CHECK (field_key ~ '^[a-z][a-z0-9_]{0,49}$'),
  label text NOT NULL CHECK (char_length(btrim(label)) BETWEEN 1 AND 120),
  tipe_input text NOT NULL CHECK (tipe_input IN ('text','textarea','number','date','select','email','tel')),
  placeholder text,
  wajib boolean NOT NULL DEFAULT false,
  opsi text[] NOT NULL DEFAULT ARRAY[]::text[],
  panjang_maksimum integer NOT NULL DEFAULT 255 CHECK (panjang_maksimum BETWEEN 1 AND 2000),
  urutan integer NOT NULL DEFAULT 0 CHECK (urutan >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (jenis_surat_id, field_key),
  CONSTRAINT check_select_options CHECK (
    (tipe_input = 'select' AND cardinality(opsi) BETWEEN 1 AND 100)
    OR (tipe_input <> 'select' AND cardinality(opsi) = 0)
  )
);

CREATE TABLE public.permohonan_surat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_permohonan text NOT NULL UNIQUE DEFAULT (
    'SUR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16))
  ),
  jenis_surat_id uuid NOT NULL REFERENCES public.jenis_surat(id) ON DELETE RESTRICT,
  nama_pemohon text NOT NULL CHECK (char_length(btrim(nama_pemohon)) BETWEEN 3 AND 120),
  no_hp text NOT NULL CHECK (no_hp ~ '^[+0-9() .-]{8,20}$'),
  email text,
  jawaban jsonb NOT NULL CHECK (jsonb_typeof(jawaban) = 'object'),
  snapshot_form jsonb NOT NULL CHECK (jsonb_typeof(snapshot_form) = 'array'),
  status text NOT NULL DEFAULT 'menunggu'
    CHECK (status IN ('menunggu','diproses','disetujui','ditolak','selesai')),
  catatan_admin text,
  diproses_oleh uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.permohonan_status_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  permohonan_id uuid NOT NULL REFERENCES public.permohonan_surat(id) ON DELETE CASCADE,
  status_sebelumnya text CHECK (status_sebelumnya IS NULL OR status_sebelumnya IN ('menunggu','diproses','disetujui','ditolak','selesai')),
  status_baru text NOT NULL CHECK (status_baru IN ('menunggu','diproses','disetujui','ditolak','selesai')),
  catatan text,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.log_aktivitas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  aksi text NOT NULL,
  entitas text NOT NULL,
  entitas_id text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(detail) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_jenis_surat_active ON public.jenis_surat (is_active, nama);
CREATE INDEX idx_form_surat_fields_order ON public.form_surat_fields (jenis_surat_id, urutan, id);
CREATE INDEX idx_permohonan_created ON public.permohonan_surat (created_at DESC);
CREATE INDEX idx_permohonan_status_created ON public.permohonan_surat (status, created_at DESC);
CREATE INDEX idx_permohonan_jenis_created ON public.permohonan_surat (jenis_surat_id, created_at DESC);
CREATE INDEX idx_status_history_permohonan ON public.permohonan_status_history (permohonan_id, created_at, id);
CREATE INDEX idx_log_aktivitas_created ON public.log_aktivitas (created_at DESC);

-- 2) FUNGSI INTERNAL ---------------------------------------------------------
CREATE FUNCTION app_private.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
      AND p.is_active = true
  );
$$;
REVOKE ALL ON FUNCTION app_private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.is_admin() TO anon, authenticated;

CREATE FUNCTION app_private.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION app_private.touch_updated_at() FROM PUBLIC;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
CREATE TRIGGER set_jenis_surat_updated_at BEFORE UPDATE ON public.jenis_surat
  FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
CREATE TRIGGER set_form_fields_updated_at BEFORE UPDATE ON public.form_surat_fields
  FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();
CREATE TRIGGER set_permohonan_updated_at BEFORE UPDATE ON public.permohonan_surat
  FOR EACH ROW EXECUTE FUNCTION app_private.touch_updated_at();

CREATE FUNCTION app_private.handle_new_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama, role)
  VALUES (NEW.id, COALESCE(NEW.email,''), NULLIF(NEW.raw_user_meta_data ->> 'nama',''), 'guest')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION app_private.handle_new_auth_user() FROM PUBLIC;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW
  EXECUTE FUNCTION app_private.handle_new_auth_user();

CREATE FUNCTION app_private.audit_master_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_row jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN v_row := to_jsonb(OLD);
  ELSE v_row := to_jsonb(NEW);
  END IF;
  INSERT INTO public.log_aktivitas (actor_id, aksi, entitas, entitas_id, detail)
  VALUES (
    auth.uid(), lower(TG_OP), TG_TABLE_NAME, v_row ->> 'id',
    jsonb_build_object('jenis_surat_id', v_row ->> 'jenis_surat_id', 'nama', COALESCE(v_row ->> 'nama', v_row ->> 'label'))
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;
REVOKE ALL ON FUNCTION app_private.audit_master_changes() FROM PUBLIC;
CREATE TRIGGER audit_jenis_surat AFTER INSERT OR UPDATE OR DELETE ON public.jenis_surat
  FOR EACH ROW EXECUTE FUNCTION app_private.audit_master_changes();
CREATE TRIGGER audit_form_surat_fields AFTER INSERT OR UPDATE OR DELETE ON public.form_surat_fields
  FOR EACH ROW EXECUTE FUNCTION app_private.audit_master_changes();

CREATE FUNCTION app_private.audit_role_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    INSERT INTO public.log_aktivitas (actor_id, aksi, entitas, entitas_id, detail)
    VALUES (auth.uid(), 'role_changed', 'profiles', NEW.id::text,
      jsonb_build_object('role_lama', OLD.role, 'role_baru', NEW.role,
                         'aktif_lama', OLD.is_active, 'aktif_baru', NEW.is_active));
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION app_private.audit_role_change() FROM PUBLIC;
CREATE TRIGGER audit_profile_role AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION app_private.audit_role_change();

-- 3) RLS DAN GRANT -----------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jenis_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_surat_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permohonan_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permohonan_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas ENABLE ROW LEVEL SECURITY;

-- Cabut akses default secara SPESIFIK. Jangan mengubah grant tabel lain di proyek.
REVOKE ALL ON public.profiles, public.jenis_surat, public.form_surat_fields,
  public.permohonan_surat, public.permohonan_status_history, public.log_aktivitas
  FROM PUBLIC, anon, authenticated;

-- Profil: authenticated boleh baca profil sendiri; admin boleh baca semua.
GRANT SELECT ON public.profiles TO authenticated;
CREATE POLICY profiles_read ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR (SELECT app_private.is_admin()));

-- Katalog: publik boleh baca hanya jenis aktif dan field milik jenis aktif.
GRANT SELECT ON public.jenis_surat, public.form_surat_fields TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.jenis_surat, public.form_surat_fields TO authenticated;

CREATE POLICY jenis_surat_read ON public.jenis_surat
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR (SELECT app_private.is_admin()));
CREATE POLICY jenis_surat_insert ON public.jenis_surat
  FOR INSERT TO authenticated WITH CHECK ((SELECT app_private.is_admin()));
CREATE POLICY jenis_surat_update ON public.jenis_surat
  FOR UPDATE TO authenticated
  USING ((SELECT app_private.is_admin())) WITH CHECK ((SELECT app_private.is_admin()));
CREATE POLICY jenis_surat_delete ON public.jenis_surat
  FOR DELETE TO authenticated USING ((SELECT app_private.is_admin()));

CREATE POLICY form_fields_read ON public.form_surat_fields
  FOR SELECT TO anon, authenticated
  USING (
    (SELECT app_private.is_admin())
    OR EXISTS (
      SELECT 1 FROM public.jenis_surat j
      WHERE j.id = jenis_surat_id AND j.is_active = true
    )
  );
CREATE POLICY form_fields_insert ON public.form_surat_fields
  FOR INSERT TO authenticated WITH CHECK ((SELECT app_private.is_admin()));
CREATE POLICY form_fields_update ON public.form_surat_fields
  FOR UPDATE TO authenticated
  USING ((SELECT app_private.is_admin())) WITH CHECK ((SELECT app_private.is_admin()));
CREATE POLICY form_fields_delete ON public.form_surat_fields
  FOR DELETE TO authenticated USING ((SELECT app_private.is_admin()));

-- Data permohonan, status dan log HANYA bisa dibaca Admin. Semua mutation terkunci.
GRANT SELECT ON public.permohonan_surat, public.permohonan_status_history,
  public.log_aktivitas TO authenticated;
CREATE POLICY permohonan_admin_read ON public.permohonan_surat
  FOR SELECT TO authenticated USING ((SELECT app_private.is_admin()));
CREATE POLICY history_admin_read ON public.permohonan_status_history
  FOR SELECT TO authenticated USING ((SELECT app_private.is_admin()));
CREATE POLICY log_admin_read ON public.log_aktivitas
  FOR SELECT TO authenticated USING ((SELECT app_private.is_admin()));

-- 4) RPC PUBLIK DIPANGGIL HANYA OLEH EDGE FUNCTION DENGAN SERVICE ROLE -------
CREATE FUNCTION public.submit_public_application(
  p_jenis_surat_id uuid,
  p_nama_pemohon text,
  p_no_hp text,
  p_email text,
  p_jawaban jsonb
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_jenis public.jenis_surat%ROWTYPE;
  v_field public.form_surat_fields%ROWTYPE;
  v_snapshot jsonb;
  v_value jsonb;
  v_text text;
  v_key text;
  v_id uuid;
  v_kode text;
BEGIN
  IF p_nama_pemohon IS NULL OR char_length(btrim(p_nama_pemohon)) NOT BETWEEN 3 AND 120 THEN
    RAISE EXCEPTION 'Nama pemohon tidak valid';
  END IF;
  IF p_no_hp IS NULL OR p_no_hp !~ '^[+0-9() .-]{8,20}$' THEN
    RAISE EXCEPTION 'Nomor HP tidak valid';
  END IF;
  IF p_email IS NOT NULL AND p_email <> '' AND
     (char_length(p_email) > 254 OR p_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$') THEN
    RAISE EXCEPTION 'Email tidak valid';
  END IF;
  IF p_jawaban IS NULL OR jsonb_typeof(p_jawaban) <> 'object'
     OR octet_length(p_jawaban::text) > 32768 THEN
    RAISE EXCEPTION 'Data formulir tidak valid atau terlalu besar';
  END IF;

  SELECT * INTO v_jenis FROM public.jenis_surat
  WHERE id = p_jenis_surat_id AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Jenis surat tidak ditemukan atau tidak aktif'; END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'field_key', f.field_key, 'label', f.label, 'tipe_input', f.tipe_input,
    'wajib', f.wajib, 'opsi', to_jsonb(f.opsi),
    'urutan', f.urutan, 'panjang_maksimum', f.panjang_maksimum
  ) ORDER BY f.urutan, f.id), '[]'::jsonb)
  INTO v_snapshot FROM public.form_surat_fields f WHERE f.jenis_surat_id = p_jenis_surat_id;
  IF jsonb_array_length(v_snapshot) = 0 THEN
    RAISE EXCEPTION 'Formulir jenis surat belum dikonfigurasi';
  END IF;

  -- Jangan izinkan field tambahan yang tidak terdaftar pada formulir.
  FOR v_key IN SELECT jsonb_object_keys(p_jawaban) LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.form_surat_fields f
      WHERE f.jenis_surat_id = p_jenis_surat_id AND f.field_key = v_key
    ) THEN
      RAISE EXCEPTION 'Field formulir tidak dikenal: %', v_key;
    END IF;
  END LOOP;

  FOR v_field IN SELECT * FROM public.form_surat_fields
    WHERE jenis_surat_id = p_jenis_surat_id ORDER BY urutan, id LOOP
    v_value := p_jawaban -> v_field.field_key;
    IF v_value IS NULL OR v_value = 'null'::jsonb OR
       (jsonb_typeof(v_value) = 'string' AND btrim(p_jawaban ->> v_field.field_key) = '') THEN
      IF v_field.wajib THEN
        RAISE EXCEPTION 'Field % wajib diisi', v_field.label;
      END IF;
      CONTINUE;
    END IF;

    IF v_field.tipe_input = 'number' THEN
      IF jsonb_typeof(v_value) <> 'number' THEN
        RAISE EXCEPTION 'Field % harus berupa angka', v_field.label;
      END IF;
    ELSE
      IF jsonb_typeof(v_value) <> 'string' THEN
        RAISE EXCEPTION 'Field % harus berupa teks', v_field.label;
      END IF;
      v_text := p_jawaban ->> v_field.field_key;
      IF char_length(v_text) > v_field.panjang_maksimum THEN
        RAISE EXCEPTION 'Field % terlalu panjang', v_field.label;
      END IF;
      CASE v_field.tipe_input
        WHEN 'select' THEN
          IF NOT (v_text = ANY(v_field.opsi)) THEN
            RAISE EXCEPTION 'Pilihan % tidak tersedia', v_field.label;
          END IF;
        WHEN 'date' THEN
          IF v_text !~ '^\d{4}-\d{2}-\d{2}$' THEN
            RAISE EXCEPTION 'Format tanggal % tidak valid', v_field.label;
          END IF;
          PERFORM v_text::date;
        WHEN 'email' THEN
          IF v_text !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' THEN
            RAISE EXCEPTION 'Email pada % tidak valid', v_field.label;
          END IF;
        WHEN 'tel' THEN
          IF v_text !~ '^[+0-9() .-]{8,20}$' THEN
            RAISE EXCEPTION 'Telepon pada % tidak valid', v_field.label;
          END IF;
        ELSE NULL;
      END CASE;
    END IF;
  END LOOP;

  INSERT INTO public.permohonan_surat
    (jenis_surat_id, nama_pemohon, no_hp, email, jawaban, snapshot_form)
  VALUES
    (p_jenis_surat_id, btrim(p_nama_pemohon), btrim(p_no_hp),
     NULLIF(btrim(COALESCE(p_email,'')),''), p_jawaban, v_snapshot)
  RETURNING id, kode_permohonan INTO v_id, v_kode;

  INSERT INTO public.permohonan_status_history
    (permohonan_id, status_sebelumnya, status_baru, actor_id)
  VALUES (v_id, NULL, 'menunggu', NULL);

  INSERT INTO public.log_aktivitas (actor_id, aksi, entitas, entitas_id, detail)
  VALUES (NULL, 'submitted', 'permohonan_surat', v_id::text,
          jsonb_build_object('kode_permohonan', v_kode, 'jenis_surat_id', p_jenis_surat_id));

  RETURN jsonb_build_object('id', v_id, 'kode_permohonan', v_kode, 'status', 'menunggu');
END;
$$;
REVOKE ALL ON FUNCTION public.submit_public_application(uuid,text,text,text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_public_application(uuid,text,text,text,jsonb) TO service_role;

-- 5) ADMIN RPC - UBAH STATUS SECARA TERKONTROL -------------------------------
CREATE FUNCTION public.admin_change_status(
  p_permohonan_id uuid,
  p_status_baru text,
  p_catatan text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_old text;
BEGIN
  IF NOT (SELECT app_private.is_admin()) THEN
    RAISE EXCEPTION 'Akses ditolak';
  END IF;
  SELECT status INTO v_old FROM public.permohonan_surat
    WHERE id = p_permohonan_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Permohonan tidak ditemukan'; END IF;

  IF NOT (
    (v_old = 'menunggu' AND p_status_baru IN ('diproses','ditolak')) OR
    (v_old = 'diproses' AND p_status_baru IN ('disetujui','ditolak')) OR
    (v_old = 'disetujui' AND p_status_baru = 'selesai')
  ) THEN
    RAISE EXCEPTION 'Transisi status tidak diizinkan: % -> %', v_old, p_status_baru;
  END IF;
  IF p_status_baru = 'ditolak' AND btrim(COALESCE(p_catatan,'')) = '' THEN
    RAISE EXCEPTION 'Alasan penolakan wajib diisi';
  END IF;
  IF char_length(COALESCE(p_catatan,'')) > 2000 THEN
    RAISE EXCEPTION 'Catatan terlalu panjang';
  END IF;

  UPDATE public.permohonan_surat
    SET status = p_status_baru, catatan_admin = NULLIF(btrim(COALESCE(p_catatan,'')),''),
        diproses_oleh = auth.uid()
    WHERE id = p_permohonan_id;
  INSERT INTO public.permohonan_status_history
    (permohonan_id, status_sebelumnya, status_baru, catatan, actor_id)
    VALUES (p_permohonan_id, v_old, p_status_baru,
            NULLIF(btrim(COALESCE(p_catatan,'')),''), auth.uid());
  INSERT INTO public.log_aktivitas (actor_id, aksi, entitas, entitas_id, detail)
    VALUES (auth.uid(), 'status_changed', 'permohonan_surat', p_permohonan_id::text,
            jsonb_build_object('dari', v_old, 'menjadi', p_status_baru));
END;
$$;
REVOKE ALL ON FUNCTION public.admin_change_status(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_change_status(uuid,text,text) TO authenticated;

-- 6) ADMIN RPC - GANTI ROLE TANPA DIRECT UPDATE ------------------------------
CREATE FUNCTION public.admin_set_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_old_role text;
BEGIN
  IF NOT (SELECT app_private.is_admin()) THEN
    RAISE EXCEPTION 'Akses ditolak';
  END IF;
  IF p_role NOT IN ('admin','guest') OR p_role IS NULL THEN
    RAISE EXCEPTION 'Role tidak valid';
  END IF;
  SELECT role INTO v_old_role FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pengguna tidak ditemukan'; END IF;
  IF p_user_id = auth.uid() AND p_role <> 'admin' THEN
    RAISE EXCEPTION 'Admin tidak dapat menurunkan role dirinya sendiri';
  END IF;
  IF v_old_role IS DISTINCT FROM p_role THEN
    UPDATE public.profiles SET role = p_role WHERE id = p_user_id;
    -- Trigger audit_profile_role merekam perubahan.
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_role(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid,text) TO authenticated;

-- 7) RETROAKTIF - BACKFILL PROFILE UNTUK USER AUTH YANG SUDAH ADA ------------
INSERT INTO public.profiles (id, email, nama, role)
SELECT u.id, COALESCE(u.email,''), NULLIF(u.raw_user_meta_data ->> 'nama',''), 'guest'
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- BOOTSTRAP FIRST ADMIN (JALANKAN TERPISAH SETELAH ADMIN DIBUAT MELALUI AUTH):
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'UUID-AKUN-ADMIN-ANDA';
-- Verifikasi: SELECT id, email, role FROM public.profiles WHERE role = 'admin';
-- JANGAN membuka sign-up publik hanya untuk membuat akun pertama.
