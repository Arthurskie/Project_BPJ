# Backend operator handoff

## State and deployment boundaries

Source only. No SQL, Edge deployment, Storage operation, Auth operation, or cloud modification was performed. The existing baseline is copied under `reference/baseline-applied.sql` **for comparison only: never replay it**. The additive migration assumes exactly that baseline. Compare the live schema, grants, functions, triggers, and RLS with it before applying a reviewed migration. No production-readiness claim is made.

Attachment lifecycle source is present but remains operationally gated until a real scanner adapter, provider credentials, migrations and Storage policies are verified in staging. Private `application-attachments` bucket has no anonymous/object read policies. Prepare mints random temporary paths, a 15-minute hash-only DB capability, and separate SDK signed-upload token. The signed token can remain valid longer: cleanup records a conservative 3-hour lifetime and never removes objects before 24 hours. Finalize downloads actual bytes, checks actual size/MIME/magic, calls a digest-bound scanner, then copies those exact bytes to a new immutable server-only verified path. This prevents an outstanding signed token from replacing verified content. Submission consumes only ready access-hash/session-bound IDs atomically. Staff read requires current active admin and a 60-second signed read URL. Source inspection is not proof the provider is configured or scanning is effective.
## Required Edge secrets / configuration

Configure secrets through the platform secret manager, never browser env or chat:

- Platform-provided `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- `ALLOWED_ORIGINS`: comma-separated exact browser origins (no trailing slash, no wildcard).
- `TURNSTILE_SECRET_KEY`, `TURNSTILE_HOSTNAMES`: real site secret and exact allowed hostnames. Widget action must be `submit` or `track`. Do not automate CAPTCHA completion.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: real Redis REST endpoint with EVAL support. Limiting is an atomic fixed 60-second window, 10 requests per trusted client identity per route.
- `TRUSTED_CLIENT_IP_HEADER`: **only** a header the deployment gateway overwrites/removes from incoming client requests. Confirm this property on the actual platform. Do not set it to an arbitrary client-controlled header or deploy public intake until confirmed.
- `RATE_LIMIT_HASH_SALT`: independent high entropy secret to pseudonymize limiter keys.
- `SCANNER_PROTOCOL=exact-bytes-v1`, `SCANNER_URL` (trusted HTTPS endpoint), `SCANNER_TOKEN`. This is an explicit operator adapter protocol, not a claim any vendor supports it: POST exact bytes as `application/octet-stream`, bearer auth and `X-Content-SHA256`; return JSON `{verdict:"clean",sha256:"<same digest>"}` only after real malware/content inspection. Unsupported/missing adapter fails closed. Gateway must bound scanner body/response size, reject redirects and supply TLS trust. Validate scanner behavior with real test fixtures before release.
- `SUPABASE_ANON_KEY` for caller-JWT staff read RPC (public key, supplied as Edge config).
- `ATTACHMENT_CLEANUP_SECRET`: independent high entropy job credential. Invoke cleanup-attachments POST with this bearer secret via an operator-managed scheduler. Claims only >24-hour unreferenced expired rows, atomically changes them to deleting so concurrent bind rejects, and deletes via Storage API; retry rows remain deleting. No cloud schedule is installed. Orphan verified objects from process interruption need Storage API reconciliation after >24h and proof no metadata references or live capability; never blindly list-delete.
- `ADMIN_INVITE_REDIRECT_URL`: exact allowlisted frontend invite/recovery landing URL. Configure Supabase Auth redirect allowlist and real SMTP/delivery.

Missing config, network/provider failures and ambiguous provider responses fail closed. No IP, secret, applicant body, or provider diagnostic is logged by these functions. Rate limits deliberately run before human verification; invalid requests consume quota. CORS is not authentication. Bound origins restrict browser responses, not non-browser access.

Deploy public submit/track/upload with JWT verification disabled as in config; they use Turnstile + limiter. Invitation additionally validates the bearer token using Auth getUser and reads the current active admin profile; it never trusts token role metadata. Invitations initially create guest profiles via the baseline trigger, then a service-only RPC verifies inviter is still active and target is a newly created, unconfirmed invite from this request before atomically granting admin and auditing the inviter. Existing user collisions cannot be elevated. A promotion failure can leave a guest invitation; operator must investigate rather than bypass the predicate. Do not promote from user metadata. The baseline first-admin bootstrap remains a separately authorized operator action.

## Frontend contracts

All endpoints are POST JSON and return `{data: ...}` or `{error:{code: ...}}`, with no-store responses. No query-string secrets.

- `submit-application`: `{jenis_surat_id,nama_pemohon,no_hp,email,jawaban,files:[<ready UUID IDs>],session_id:<uuid>,access_secret,idempotency_key,turnstile_token}`. Secret is browser CSPRNG base64url, at least 16 random bytes (22 chars); UUID idempotency key. Keep both and canonical applicant payload in memory only through a retry; never persist PII or secrets. Reusing a key with changed payload/manifest/access hash gives `IDEMPOTENCY_CONFLICT` (409). Successful data contains baseline `{id,kode_permohonan,status}`. Show access secret in receipt separately; there is no recovery mechanism.
- `track-application`: `{kode_permohonan,access_secret,turnstile_token}`. Generic `TRACKING_REFUSED` (404) for invalid lookup. Returns code, status, current type name, dates, explicit `public_note` only. Existing pre-migration applications have no access capability and cannot be publicly tracked.
- `upload-attachment`: prepare `{action:"prepare",access_secret,session_id,name,size,mime,turnstile_token}` (Turnstile action `upload`) returns `{id,capability,bucket,path,token,expires_at}`; use SDK uploadToSignedUrl, then finalize `{action:"finalize",id,capability,access_secret,session_id}` returns `{id,name,size,mime}`. cancel uses same capability fields with action `cancel`. Authenticated read uses `{action:"read",id}`. Never silently drop selected files. Preserve finalized IDs, session and original submission payload in memory across retries; changing IDs changes idempotency binding.
- `invite-admin`: authenticated `{email,nama}`; successful response signals `invited:true`.

Authenticated RPCs: `admin_submit_walkin(p_jenis_surat_id,p_nama_pemohon,p_no_hp,p_email,p_jawaban)` reuses baseline validation and immutable form snapshot atomically, records source `loket`, and uses the real authenticated admin actor. `admin_set_public_note(p_permohonan_id,p_note)` is separate from internal status note. Neither produces an official document. Existing baseline `admin_change_status` retains its workflow enforcement.

## Verification and release gates

`node --test supabase/tests/security.test.mjs` runs source-security assertions only; these are NOT database integration or provider tests. Deno and PostgreSQL/Supabase CLI were unavailable in this authoring environment, so Edge type checking and actual SQL execution are unverified. Run `deno check` for all entrypoints and apply only in an authorized disposable/staging baseline clone first.

Required staging negative cases: anonymous/authenticated denial of private receipt reads and secure RPC calls; inactive/non-admin invitation and walk-in rejection; every illegal status transition; malformed dynamic field data; parallel same-key submissions produce one row, changed payload/access key conflicts; rollback leaves no partial receipt; no tracking PII/internal note; limiter provider outage and concurrent request enforcement; actual spoofed trusted-header attempts; Turnstile hostname/action/replay rejection; origin rejection; SMTP invite acceptance and atomic newly-invited promotion; safe recovery redirects. Do not test CAPTCHA by solving it with tools. Scanner/capability concurrency, signed token lifetime, immutable-copy race, cleanup/bind races and Storage access tests must run before enabling uploads.

Retention: the additive migration retains idempotency receipts indefinitely. Operator must approve application/receipt/audit retention, lawful PII handling, deletion and backup procedures before release. Never delete an idempotency receipt while promising indefinite retries. No destructive cleanup job is installed.


## Additional operator invariants

Before applying attachment migration, inspect **all existing storage.objects policies**, including broad bucket-independent authenticated/anonymous SELECT/INSERT/UPDATE/DELETE policies. Refuse deployment if any grant client access to this bucket. SQL explicitly refuses an existing bucket that is public, has a different size cap, or an unsafe MIME allowlist; it does not silently repair a live bucket. Signed upload tokens must be proven to expire within the recorded conservative three-hour horizon on the deployed Storage version. If not, increase signed_until in reviewed source before deployment. Verify scanner endpoint is HTTPS and redirects are rejected. Storage download and scanner responses still need platform response-size limits as defense in depth.

Walk-in attachments can use the same capability flow then authenticated `admin_submit_walkin_with_files(p_jenis_surat_id,p_nama_pemohon,p_no_hp,p_email,p_jawaban,p_key,p_access_hash,p_payload_hash,p_session_id,p_files)`. The access hash is SHA-256 of the in-memory receipt secret. The p_payload_hash argument is retained for adapter compatibility but deliberately ignored: the database hashes canonical payload, sorted file IDs, access hash, session, real actor and loket source. It cannot trust a client checksum. File IDs remain bound to server-verified bytes and access/session metadata. The ordinary no-file walk-in RPC remains supported. Master saving uses atomic `admin_save_letter_type(p_id,p_kode,p_nama,p_deskripsi,p_is_active,p_fields)`; own-name updates use `admin_update_own_profile(p_nama)`.



## Local implementation verification (2026-11-18)

The frontend is now wired to Supabase only: active catalog and dynamic forms; admin auth/profile gates, invitation and recovery; atomic master/field builder; queue search/filter/pagination, immutable snapshot detail, SQL status/history, explicit public note, audit and dashboard. Public receipts carry a separate browser-generated secret. Walk-in input uses the same form validation and workflow with source `loket`. No official letter printing/generation or local applicant persistence is provided.

Independent static security review found and prompted fixes for cross-layer UUID/Turnstile/envelope mismatches, profile/master persistence, null identity guards, source/actor-bound server idempotency, form snapshot serialization, unsafe existing-bucket settings, immutable verified copies, and ambiguous finalization retry/deletion. This is not an external penetration test or proof of deployed controls. Client retry tests use fake providers; SQL security tests assert source structure rather than executing PostgreSQL.

Frontend configuration is documented in `.env.example`; `.env.local` remains ignored. Uploads default off. Public submission/tracking intentionally fail closed without the required real human verification and provider-backed limiter. Actual service secrets belong only in the platform secret manager.

Known dependency issue: `npm audit fix` applied compatible transitive updates (including Vite 8.3.8), but the current audit still reports 5 high advisories in the picomatch/fdir/tinyglobby/Vite/plugin-react development-tool chain. npm proposes a breaking Vite downgrade with `--force`; it was not applied. Resolve and re-verify tooling before deployment; do not expose the development server to untrusted traffic.

No database migrations, Edge deployments, Auth invitations, Storage writes, commits, or pushes were performed. Deno/PostgreSQL/Supabase CLI runtime checks and browser end-to-end tests were unavailable/not run. All deployment, SMTP, provider, concurrency, permission and retention release gates above remain mandatory.

Final frozen-source verification: `npm test` recursively discovered 98 tests (98 passed, 0 failed); `npm run lint` reported 0 warnings and 0 errors; `npm run build` succeeded with Vite 8.3.8; `git diff --check` returned 0. Verified 2026-11-18 after all authors froze their files. The final verification log is retained in the agent conversation task-317 log; normal Git LF-to-CRLF notices and the machine extra-certificate warning are not test failures. The bundle scan found none of the checked server-secret identifiers or removed demo passwords. This is a limited static bundle scan, not a guarantee of absence of every possible secret.
