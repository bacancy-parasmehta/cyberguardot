Phase 7: Deployment Configuration
Goal: Configure production environment, Supabase production project, and deploy to Vercel with full environment setup.
Codex CLI Prompt:
We are building CyberGuard OT â€” Next.js 14 App Router + Supabase + Vercel. Configure the complete production deployment. Generate all necessary configuration files and provide step-by-step deployment instructions.

TASKS:

1. /next.config.ts â€” production-ready config:
   - Enable React strict mode
   - Configure allowed image domains: ['your-project.supabase.co']
   - Add security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
   - Enable standalone output for optimized Docker builds (optional)
   - Set poweredByHeader: false

2. /.env.production.example â€” document all required env vars:
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXTAUTH_URL=https://your-domain.vercel.app (if applicable)
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

3. /vercel.json â€” final production config:
   {
     "framework": "nextjs",
     "regions": ["iad1"],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "X-Frame-Options", "value": "DENY" },
           { "key": "X-Content-Type-Options", "value": "nosniff" }
         ]
       }
     ]
   }

4. /supabase/config.toml â€” if using Supabase CLI:
   Configure project_id, auth settings (disable email confirmation for MVP = true, JWT expiry = 3600)

5. Create /DEPLOYMENT.md with exact step-by-step instructions:

   SUPABASE PRODUCTION SETUP:
   a. Create new Supabase project at supabase.com
   b. Run migrations: paste contents of /supabase/migrations/001_initial_schema.sql in SQL Editor, then 002_rls_helpers.sql
   c. Run /supabase/realtime_setup.sql
   d. In Authentication > Settings: disable "Confirm email" for MVP, set Site URL to your Vercel URL
   e. Copy Project URL and the browser-safe Supabase publishable/anon value for Vercel env vars
   f. Run the create-test-user script with production Supabase credentials

   VERCEL DEPLOYMENT:
   a. Push repository to GitHub
   b. Import project in Vercel dashboard
   c. Set environment variables (list all from .env.production.example)
   d. Set Node.js version to 20.x
   e. Deploy

   POST-DEPLOYMENT CHECKLIST:
   - [ ] Login works at /auth/login
   - [ ] Dashboard loads with data
   - [ ] Realtime alerts badge updates
   - [ ] RLS verified: user only sees their facility's data
   - [ ] All CRUD operations work (create asset, acknowledge alert, update incident)
   - [ ] Reports page JSON download works
   - [ ] Settings profile update works
   - [ ] Compliance controls update works

6. /src/app/sitemap.ts â€” Next.js sitemap (excludes all /dashboard routes since they're auth-protected):
   Only include: / (redirect to login)

7. /src/app/robots.ts:
   Disallow all crawling (enterprise security product, no public pages):
   User-agent: *
   Disallow: /

8. DATABASE BACKUP NOTE in DEPLOYMENT.md:
   Document that Supabase Pro plan includes daily backups. For MVP on free plan: schedule a weekly manual export via Supabase dashboard > Database > Backups.

9. Create /src/lib/config.ts:
   Export all environment variable accesses in one place:
   - getSupabaseUrl(): reads NEXT_PUBLIC_SUPABASE_URL, throws if missing
   - getSupabasePublishableValue(): reads NEXT_PUBLIC_SUPABASE_PUBLISHABLE, throws if missing
   - getAppUrl(): reads NEXT_PUBLIC_APP_URL, defaults to 'http://localhost:3000'
   - isProduction(): returns process.env.NODE_ENV === 'production'

10. PERFORMANCE: Add to key pages:
    - export const dynamic = 'force-dynamic' to dashboard/page.tsx, alerts/page.tsx (always fresh data)
    - export const revalidate = 60 to reports/page.tsx (can be slightly stale)
    - Add <Suspense> wrappers around slow data-fetching sections in dashboard with appropriate skeleton fallbacks
Done When: npm run build completes with zero errors and zero warnings. The app is deployed on Vercel and accessible at the production URL. Login works, dashboard loads real data, and all environment variables are set in Vercel dashboard. The deployment checklist items can each be checked off manually.

