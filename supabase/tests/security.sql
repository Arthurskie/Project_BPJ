-- Run after migration in staging SQL Editor. Transaction leaves no data behind.
begin;
do $$
declare f text; t text;
begin
 foreach t in array array['submissions','staff_roles','audit_logs','upload_capabilities','rate_limits','letter_counters'] loop
  if not (select relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname=t) then raise exception 'RLS disabled: %',t; end if;
  if has_table_privilege('anon','public.'||t,'SELECT') or has_table_privilege('anon','public.'||t,'INSERT') or has_table_privilege('authenticated','public.'||t,'UPDATE') or has_table_privilege('authenticated','public.'||t,'DELETE') or has_table_privilege('authenticated','public.'||t,'INSERT') then raise exception 'Unexpected table privilege: %',t; end if;
 end loop;
 if has_function_privilege('anon','public.bpj_guest_internal(text,jsonb)','EXECUTE') or has_function_privilege('authenticated','public.bpj_guest_internal(text,jsonb)','EXECUTE') then raise exception 'Guest internal exposed'; end if;
 if not has_function_privilege('service_role','public.bpj_guest_internal(text,jsonb)','EXECUTE') then raise exception 'Gateway cannot execute'; end if;
 if has_function_privilege('anon','public.bpj_staff_action(text,jsonb)','EXECUTE') then raise exception 'Staff RPC exposed'; end if;
 if exists(select 1 from storage.buckets where id='bpj-documents' and public) then raise exception 'Documents bucket is public'; end if;
end $$;
set local role authenticated;
do $$ begin
 begin
  perform public.bpj_staff_action('getAllSubmissions','{}');
  raise exception 'Unauthenticated staff action unexpectedly succeeded';
 exception when insufficient_privilege then null;
 end;
end $$;
rollback;
