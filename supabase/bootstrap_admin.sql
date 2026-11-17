-- First create/invite the administrator in Dashboard > Authentication > Users.
-- Replace only this email. This script does not set passwords or trust user metadata.
begin;
do $$
declare admin_id uuid; admin_email text = 'admin999x@gmail.com';
begin
 if admin_email like '%example.invalid' then raise exception 'Replace administrator email first'; end if;
 select id into admin_id from auth.users where lower(email)=lower(admin_email);
 if admin_id is null then raise exception 'Create the Auth user in Dashboard first'; end if;
 insert into public.staff_profiles(id,name,email,department) values(admin_id,'Administrator',admin_email,'Administrasi') on conflict(id) do update set email=excluded.email;
 insert into public.staff_roles(user_id,role,active) values(admin_id,'super_admin',true) on conflict(user_id) do update set role='super_admin',active=true;
 insert into public.audit_logs(actor_id,actor_name,action,target_id) values(admin_id,'SQL operator','bootstrap_admin',admin_id::text);
end $$;
commit;
