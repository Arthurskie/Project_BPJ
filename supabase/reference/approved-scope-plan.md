# Approved reconstructed scope and execution plan

User approved implementation and reconstruction from PRD V2 plus chat decisions on 2026-11-18. Read prd-v2.md and baseline.sql fully. Existing UI remains; do not recreate docs directory. Baseline SQL already applied per user; never replay/drop. Project gavwozjprmmrlzzreuyx only. No cloud writes/commits/push without separate authorization.

## Scope
Supabase-only; remove active local data/auth fallbacks and plaintext demo credentials. Active admin role checked from profiles; public guests need no Auth. Master jenis_surat and dynamic fields builder as baseline. Queue real search/filter/pagination, detail immutable snapshot answers, SQL status workflow menunggu -> diproses/ditolak; diproses -> disetujui/ditolak; disetujui -> selesai. Audit DB-owned. Invites/recovery admin only.

Extend PRD with public tracking: request code plus separate browser CSPRNG access secret (>=128-bit), hash only on server private table; minimal status/type/dates and explicit public note only. No applicant PII, private/internal notes or attachment read. POST body, never secrets in URLs/logs/analytics. Generic refusal; provider-backed rate limit and real human Turnstile, fail closed when unavailable. Secret shown on successful receipt, no assumed recovery. Preserve retry in memory with idempotency bound to canonical payload + file manifest + access hash; reject reuse with changed content; never trust client checksum as validation. Store neither plaintext access secret nor applicant body in audit.

Upload: up to 5 files each <=10 MiB PDF/JPEG/PNG; private bucket, no anonymous SELECT/list or arbitrary paths. Server-created temporary paths, bounded capability TTL and single-use database finalization. SDK signed upload token separate from database capability. Validate actual object size/type and intended session at finalize. Quarantine/content inspection gate; do not pretend malware scanning exists. Staff cannot read unverified uploads. Cancellation/expiration must respect signed URL lifetime; operator cleanup >24h only unreferenced/no live capability using Storage API. If secure provider/scanner missing feature remains clearly unavailable, never bypass gate.

Admin walk-in uses same type/fields validation, source loket, initial menunggu, same approval workflow; no fabricated auth identity/citizen account. Dedicated authenticated RPC validates active admin and writes history/audit atomically. Admin-only private file viewing via short-lived signed URLs after scan approval. Public/loket receipts no official document generation.

## Phases
1. Inspect git/package/routes/services/UI, baseline checks. Test expected adapters/validators failing first. Install Supabase SDK per execution rules, public env config root URL/key, ignored local config updates only. Input folder is temporary untracked do not commit it.
2. Supabase client + sanitized error taxonomy; Auth session/profile/guards, login invite recovery, no public signup role selector; tests negative role/access.
3. Master CRUD and dynamic builder, correct column names, inactive default; type use FK error actionable. Tests dynamic types/values.
4. SQL baseline review; additive migration sources only for extensions (private tracking/idempotency/capabilities/attachments/source/public note, RPC), Edge submit/track/upload/invite source. Security reviewer check grants/search paths/transaction locks/rate boundaries and retry binding. No assumed live schema equality, documented operator diff before apply.
5. Guest dynamic form plus actual human Turnstile wrapper/config states, file workflow/receipt, tracking; admin walkin shared renderer; no PII storage browser fallback. Submission failures safe actionable codes.
6. Admin queue/detail/status/history/dashboard/audit/profile/admin-management minimal existing patterns. No UI redesign, no official PDF/print/storage fake action.
7. Independent review, fixes, recursive tests (not only npm domain glob), lint build, available Edge check and SQL static tests. No CAPTCHA automation (mock verification in tests only), no fake live evidence. Document unapplied migrations/functions/secrets/SMTP/origins/rate provider/scanner/retention and required negative/E2E staging tests.

## Operational blockers
Need public Turnstile site key and operator-managed secret, exact local/production origins, authorized deployment access, real rate limiter/scanner integration. Never request server secrets/passwords in chat. SQL not executed by agent; cloud connectivity unknown until actual sanctioned checks. Do not claim production ready/source complete if partial features remain.
