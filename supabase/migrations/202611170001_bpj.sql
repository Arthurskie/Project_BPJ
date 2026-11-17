-- Apply once through the Supabase SQL editor or migrations. No auth users are created.
create extension if not exists pgcrypto with schema extensions;
create table public.letter_types (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null unique, description text not null default '', requirements jsonb not null default '[]', active boolean not null default true, created_at timestamptz not null default now());
create table public.staff_profiles (id uuid primary key references auth.users(id) on delete cascade, name text not null, email text, nip text, department text not null default '', created_at timestamptz not null default now());
create table public.staff_roles (user_id uuid primary key references public.staff_profiles(id) on delete cascade, role text not null check(role in ('super_admin','verifikator','petugas')), active boolean not null default true);
create table public.officials (id uuid primary key default gen_random_uuid(), name text not null, nip text not null, role text not null, active boolean not null default true);
create table public.submissions (id uuid primary key default gen_random_uuid(), tracking_code text not null unique default upper(encode(extensions.gen_random_bytes(16),'hex')), letter_type_id uuid not null references public.letter_types(id), letter_type_snapshot jsonb not null, nik text not null check(nik ~ '^[0-9]{16}$'), nama text not null check(length(trim(nama)) between 1 and 200), email text, phone text, form_data jsonb not null default '{}', files jsonb not null default '[]', status text not null default 'pending' check(status in ('pending','diproses','selesai','ditolak')), letter_number text, letter_number_normalized text generated always as (upper(regexp_replace(letter_number,'[[:space:]]','','g'))) stored unique, official_id uuid references public.officials(id), official_name text, rejection_reason text, verification_notes text, source text not null default 'online', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), completed_at timestamptz, check(status <> 'selesai' or (nullif(trim(letter_number),'') is not null and official_id is not null)), check(status <> 'ditolak' or nullif(trim(rejection_reason),'') is not null));
create table public.audit_logs (id uuid primary key default gen_random_uuid(), actor_id uuid, actor_name text not null, action text not null, target_id text, details jsonb not null default '{}', created_at timestamptz not null default now());
create table public.letter_counters (year integer primary key, sequence bigint not null);
create table public.upload_capabilities (token uuid primary key default gen_random_uuid(), path text not null unique, content_type text not null, size bigint not null check(size between 1 and 10485760), expires_at timestamptz not null default now()+interval '15 minutes', consumed_at timestamptz);
create table public.rate_limits (key text primary key, count integer not null, expires_at timestamptz not null);
alter table public.letter_types enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.staff_roles enable row level security;
alter table public.officials enable row level security;
alter table public.submissions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.letter_counters enable row level security;
alter table public.upload_capabilities enable row level security;
alter table public.rate_limits enable row level security;
create function public.bpj_staff_role() returns text language sql stable security definer set search_path = '' as $$ select role from public.staff_roles where user_id=auth.uid() and active $$;
revoke all on function public.bpj_staff_role() from public,anon;
grant execute on function public.bpj_staff_role() to authenticated;
create policy guest_letter_types on public.letter_types for select to anon using(active);
create policy staff_letter_types on public.letter_types for select to authenticated using(active or public.bpj_staff_role() is not null);
create policy own_profile on public.staff_profiles for select to authenticated using(id=auth.uid() and public.bpj_staff_role() is not null);
create policy staff_submissions on public.submissions for select to authenticated using(public.bpj_staff_role() is not null);
create policy staff_officials on public.officials for select to authenticated using(public.bpj_staff_role() is not null);
create policy staff_audit on public.audit_logs for select to authenticated using(public.bpj_staff_role() is not null);
revoke all on public.letter_types,public.staff_profiles,public.staff_roles,public.submissions,public.audit_logs,public.officials,public.letter_counters,public.upload_capabilities,public.rate_limits from anon,authenticated;
grant select on public.letter_types to anon,authenticated;
grant select on public.staff_profiles,public.submissions,public.audit_logs,public.officials to authenticated;
create function public.bpj_my_profile() returns jsonb language sql stable security definer set search_path='' as $$ select to_jsonb(p)||jsonb_build_object('role',r.role,'is_active',r.active) from public.staff_profiles p join public.staff_roles r on r.user_id=p.id where p.id=auth.uid() and r.active $$;
revoke all on function public.bpj_my_profile() from public,anon;
grant execute on function public.bpj_my_profile() to authenticated;
create function public.bpj_guard_terminal() returns trigger language plpgsql set search_path='' as $$ begin if old.status in ('selesai','ditolak') then raise exception 'terminal submission is immutable'; end if; new.updated_at=now(); return new; end $$;
create trigger immutable_terminal before update or delete on public.submissions for each row execute function public.bpj_guard_terminal();
create function public.bpj_validate_applicant(p jsonb) returns void language plpgsql set search_path='' as $$ begin
 if coalesce(p->>'nik','') !~ '^[0-9]{16}$' or length(trim(coalesce(p->>'nama',''))) not between 1 and 200 then raise exception 'Invalid applicant'; end if;
 if nullif(trim(p->'form_data'->>'alamat'),'') is null or nullif(trim(p->'form_data'->>'keperluan'),'') is null then raise exception 'Address and purpose required'; end if;
 if length(p::text)>65536 or (nullif(p->>'email','') is not null and (length(p->>'email')>254 or p->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')) then raise exception 'Invalid applicant'; end if;
 if not exists(select 1 from public.letter_types where id=(p->>'letter_type_id')::uuid and active) then raise exception 'Inactive letter type'; end if;
end $$;
revoke all on function public.bpj_validate_applicant(jsonb) from public,anon,authenticated;
create function public.bpj_guest_internal(p_action text,p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.submissions; cap public.upload_capabilities; tok text; attachments jsonb='[]'; cnt integer; begin
 if p_action='rate' then
  delete from public.rate_limits where expires_at<now();
  insert into public.rate_limits as r(key,count,expires_at) values(p_payload->>'key',1,now()+interval '10 minutes') on conflict(key) do update set count=r.count+1 returning count into cnt;
  return jsonb_build_object('allowed',cnt<=case when p_payload->>'kind'='submit' then 10 else 30 end);
 elsif p_action='upload' then
  if p_payload->>'content_type' not in ('application/pdf','image/jpeg','image/png') then raise exception 'Unsupported file type'; end if;
  insert into public.upload_capabilities(path,content_type,size) values('pending/'||gen_random_uuid()::text||case p_payload->>'content_type' when 'application/pdf' then '.pdf' when 'image/png' then '.png' else '.jpg' end,p_payload->>'content_type',(p_payload->>'size')::bigint) returning * into cap;
  return to_jsonb(cap);
 elsif p_action='remove' then
  select * into cap from public.upload_capabilities where token=(p_payload->>'token')::uuid and consumed_at is null for update;
  if cap.token is null then raise exception 'Invalid upload'; end if;
  delete from public.upload_capabilities where token=cap.token; return jsonb_build_object('path',cap.path);
 elsif p_action='track' then
  select * into s from public.submissions where nik=p_payload->>'nik' and tracking_code=upper(p_payload->>'tracking_code');
  if s.id is null then raise exception 'Submission not found'; end if;
  return jsonb_build_object('tracking_code',s.tracking_code,'status',s.status,'created_at',s.created_at,'updated_at',s.updated_at,'letter_number',s.letter_number,'rejection_reason',s.rejection_reason,'letter_type_name',s.letter_type_snapshot->>'name');
 elsif p_action='submit' then
  perform public.bpj_validate_applicant(p_payload);
  if jsonb_array_length(coalesce(p_payload->'attachment_tokens','[]'))>5 then raise exception 'Too many files'; end if;
  for tok in select jsonb_array_elements_text(coalesce(p_payload->'attachment_tokens','[]')) loop
   select * into cap from public.upload_capabilities where token=tok::uuid and expires_at>now() and consumed_at is null for update;
   if cap.token is null or not exists(select 1 from storage.objects where bucket_id='bpj-documents' and name=cap.path and (metadata->>'size')::bigint=cap.size and metadata->>'mimetype'=cap.content_type) then raise exception 'Invalid or incomplete upload'; end if;
   update public.upload_capabilities set consumed_at=now() where token=cap.token;
   attachments=attachments||jsonb_build_array(jsonb_build_object('path',cap.path,'name',split_part(cap.path,'/',2),'type',cap.content_type,'size',cap.size));
  end loop;
  insert into public.submissions(letter_type_id,letter_type_snapshot,nik,nama,email,phone,form_data,files) values((p_payload->>'letter_type_id')::uuid,(select to_jsonb(t) from public.letter_types t where t.id=(p_payload->>'letter_type_id')::uuid),p_payload->>'nik',trim(p_payload->>'nama'),nullif(p_payload->>'email',''),p_payload->>'phone',p_payload->'form_data',attachments) returning * into s;
  insert into public.audit_logs(actor_name,action,target_id) values('Warga','submit',s.id::text);
  return jsonb_build_object('id',s.id,'tracking_code',s.tracking_code,'status',s.status,'created_at',s.created_at);
 end if; raise exception 'Unknown action'; end $$;
revoke all on function public.bpj_guest_internal(text,jsonb) from public,anon,authenticated;
grant execute on function public.bpj_guest_internal(text,jsonb) to service_role;
create function public.bpj_staff_action(p_action text,p_payload jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare actor text=public.bpj_staff_role(); s public.submissions; result jsonb; off public.officials; seq bigint; yr integer=extract(year from now()); num text; begin
 if actor is null then raise exception 'Active staff required' using errcode='42501'; end if;
 if p_action='getSubmissionById' then
  select to_jsonb(x)||jsonb_build_object('letter_type_name',x.letter_type_snapshot->>'name') into result from public.submissions x join public.letter_types t on t.id=x.letter_type_id where x.id::text=p_payload->>'id' or x.tracking_code=p_payload->>'id';
 elsif p_action='getAllSubmissions' then
  select coalesce(jsonb_agg(to_jsonb(x)||jsonb_build_object('letter_type_name',x.letter_type_snapshot->>'name') order by x.created_at desc),'[]') into result from public.submissions x join public.letter_types t on t.id=x.letter_type_id;
 elsif p_action='validateLetterNumber' then
  return jsonb_build_object('success',true,'isDuplicate',exists(select 1 from public.submissions where letter_number_normalized=upper(regexp_replace(p_payload->>'nomorSurat','[[:space:]]','','g')) and id::text is distinct from p_payload->>'currentSubmissionId'));
 elsif p_action='generateLetterNumber' then
  insert into public.letter_counters as c(year,sequence) values(yr,1) on conflict(year) do update set sequence=c.sequence+1 returning sequence into seq;
  num='470 / '||lpad(seq::text,greatest(3,length(seq::text)),'0')||' / '||coalesce(nullif(p_payload->>'kodeInstansi',''),'KEL.CKR')||' / '||(array['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'])[extract(month from now())::integer]||' / '||yr;
  result=jsonb_build_object('nomorSurat',num,'seq',seq,'year',yr);
 elsif p_action in ('updateStatus','verifyAndComplete') then
  if actor not in ('super_admin','verifikator') then raise exception 'Verifier required' using errcode='42501'; end if;
  select * into s from public.submissions where id::text=p_payload->>'id' or tracking_code=p_payload->>'id' for update;
  if s.id is null then raise exception 'Submission not found'; end if;
  if s.status in ('selesai','ditolak') then raise exception 'terminal submission is immutable'; end if;
  if p_payload->>'status'='selesai' then
   select * into off from public.officials where active and (id::text=p_payload->>'pejabatTTD' or name=p_payload->>'pejabatTTD');
   if off.id is null then raise exception 'Active official required'; end if;
   if nullif(trim(p_payload->>'nomorSurat'),'') is null then raise exception 'Letter number required'; end if;
   update public.submissions set status='selesai',letter_number=trim(p_payload->>'nomorSurat'),official_id=off.id,official_name=off.name,verification_notes=p_payload->>'catatanVerifikasi',completed_at=now() where id=s.id returning * into s;
  elsif p_payload->>'status'='ditolak' then
   num=coalesce(nullif(trim(p_payload->>'catatanVerifikasi'),''),nullif(trim(p_payload->>'notes'),''));
   if num is null then raise exception 'Rejection reason required'; end if;
   update public.submissions set status='ditolak',rejection_reason=num where id=s.id returning * into s;
  elsif p_payload->>'status'='diproses' and s.status='pending' then
   update public.submissions set status='diproses',verification_notes=p_payload->>'notes' where id=s.id returning * into s;
  else raise exception 'Invalid transition'; end if;
  result=to_jsonb(s);
 elsif p_action='createWalkInSubmission' then
  -- Use the same server validation and transaction as online submission; never trust browser files.
  result=public.bpj_guest_internal('submit',p_payload);
  update public.submissions set source='walk-in',status='diproses' where id=(result->>'id')::uuid returning * into s;
  if coalesce(p_payload->>'status','diproses')='selesai' then
   result=public.bpj_staff_action('verifyAndComplete',p_payload||jsonb_build_object('id',s.id));
   select * into s from public.submissions where id=s.id;
  end if;
  result=to_jsonb(s);
 elsif p_action in ('saveLetterType','removeLetterType','manageOfficial','manageStaff') then
  if actor<>'super_admin' then raise exception 'Administrator required' using errcode='42501'; end if;
  if p_action='saveLetterType' then
   insert into public.letter_types(id,code,name,description,requirements,active) values(coalesce(nullif(p_payload->>'id','')::uuid,gen_random_uuid()),p_payload->>'code',p_payload->>'name',coalesce(p_payload->>'description',''),coalesce(p_payload->'requirements','[]'),coalesce((p_payload->>'active')::boolean,true)) on conflict(id) do update set code=excluded.code,name=excluded.name,description=excluded.description,requirements=excluded.requirements,active=excluded.active returning to_jsonb(letter_types) into result;
  elsif p_action='removeLetterType' then
   update public.letter_types set active=false where id=(p_payload->>'id')::uuid returning to_jsonb(letter_types) into result;
  elsif p_action='manageOfficial' then
   insert into public.officials(id,name,nip,role,active) values(coalesce(nullif(p_payload->>'id','')::uuid,gen_random_uuid()),p_payload->>'name',p_payload->>'nip',p_payload->>'role',coalesce((p_payload->>'active')::boolean,true)) on conflict(id) do update set name=excluded.name,nip=excluded.nip,role=excluded.role,active=excluded.active returning to_jsonb(officials) into result;
  else
   if (p_payload->>'id')::uuid=auth.uid() then raise exception 'Cannot change own authority'; end if;
   insert into public.staff_profiles(id,name,email,nip,department) select id,p_payload->>'name',email,p_payload->>'nip',coalesce(p_payload->>'department','') from auth.users where id=(p_payload->>'id')::uuid on conflict(id) do update set name=excluded.name,nip=excluded.nip,department=excluded.department;
   insert into public.staff_roles(user_id,role,active) values((p_payload->>'id')::uuid,p_payload->>'role',coalesce((p_payload->>'active')::boolean,true)) on conflict(user_id) do update set role=excluded.role,active=excluded.active;
   result=jsonb_build_object('id',p_payload->>'id');
  end if;
 else raise exception 'Unknown action'; end if;
 if p_action not in ('getSubmissionById','getAllSubmissions','validateLetterNumber') then
  insert into public.audit_logs(actor_id,actor_name,action,target_id,details) select auth.uid(),name,p_action,coalesce(s.id::text,p_payload->>'id'),jsonb_build_object('status',s.status) from public.staff_profiles where id=auth.uid();
 end if;
 return jsonb_build_object('success',true,'data',result);
end $$;
revoke all on function public.bpj_staff_action(text,jsonb) from public,anon;
grant execute on function public.bpj_staff_action(text,jsonb) to authenticated;
create function public.bpj_dashboard() returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if public.bpj_staff_role() is null then raise exception 'Active staff required' using errcode='42501'; end if;
 return jsonb_build_object('success',true,'data',jsonb_build_object('total',(select count(*) from public.submissions),'pending',(select count(*) from public.submissions where status='pending'),'diproses',(select count(*) from public.submissions where status='diproses'),'selesai',(select count(*) from public.submissions where status='selesai'),'ditolak',(select count(*) from public.submissions where status='ditolak')));
end $$;
revoke all on function public.bpj_dashboard() from public,anon;
grant execute on function public.bpj_dashboard() to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('bpj-documents','bpj-documents',false,10485760,array['application/pdf','image/jpeg','image/png']) on conflict(id) do nothing;
create policy bpj_staff_document_read on storage.objects for select to authenticated using(bucket_id='bpj-documents' and public.bpj_staff_role() is not null and exists(select 1 from public.submissions s cross join lateral jsonb_array_elements(s.files) f where f->>'path'=name));
-- No guest storage policy: Edge issues non-upsert signed URLs for server-chosen paths only.




