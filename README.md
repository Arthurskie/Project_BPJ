# Portal e-Surat

React/Vite interface with Supabase-only catalog, administration, anonymous applications and two-code tracking. There is no local data/auth fallback and no official letter generation.

## Local development

```sh
npm install
npm run dev
npm test
npm run lint
npm run build
```

Copy `.env.example` to `.env.local` and set public frontend configuration. Never add server secrets to a `VITE_` variable. The Turnstile site key is public; server verification, rate limiting and file scanning require separate operator configuration.

See the Supabase implementation handoff in `supabase/README.md` for additive migrations, Edge deployment requirements, release gates, and source-versus-live verification limitations. Baseline reference SQL is not an install migration and must not be replayed on an existing project.

No migrations or Edge Functions are deployed automatically by frontend builds. A successful build is not evidence of database RLS, scanner, SMTP, rate limiter or live end-to-end behavior.
