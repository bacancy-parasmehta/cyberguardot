Phase 1: Project Scaffolding & Environment Setup
Goal: Bootstrap the Next.js App Router project with Supabase and Vercel configuration wired up end-to-end.
Codex CLI Prompt:
Create a new Next.js 14 project using the App Router (not Pages Router) called "cyberguard-ot". Use TypeScript, Tailwind CSS, and ESLint. Do the following exactly:

1. Run: npx create-next-app@latest cyberguard-ot --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

2. Install dependencies:
   - @supabase/supabase-js
   - @supabase/ssr
   - @supabase/auth-ui-react
   - @supabase/auth-ui-shared
   - recharts
   - lucide-react
   - clsx
   - tailwind-merge
   - zod
   - react-hook-form
   - @hookform/resolvers
   - date-fns
   - sonner (for toast notifications)

3. Create the following folder structure inside /src:
   /app
     /auth
       /login/page.tsx
       /callback/route.ts
     /(dashboard)
       /layout.tsx
       /page.tsx (redirect to /dashboard)
       /dashboard/page.tsx
       /assets/page.tsx
       /vulnerabilities/page.tsx
       /threats/page.tsx
       /incidents/page.tsx
       /alerts/page.tsx
       /compliance/page.tsx
       /reports/page.tsx
       /settings/page.tsx
   /components
     /ui/
     /layout/
     /dashboard/
     /assets/
     /alerts/
     /incidents/
   /lib
     /supabase/
       client.ts
       server.ts
       middleware.ts
     /utils.ts
     /constants.ts
   /types
     /index.ts
   /hooks/

4. Create /src/lib/supabase/client.ts:
   - Export createBrowserClient from @supabase/ssr using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

5. Create /src/lib/supabase/server.ts:
   - Export createServerClient using cookies() from next/headers (server-side Supabase client)

6. Create /src/middleware.ts:
   - Use @supabase/ssr to refresh sessions on every request
   - Protect all routes under /(dashboard) — redirect unauthenticated users to /auth/login
   - Allow /auth/* routes publicly

7. Create .env.local with these placeholder keys:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

8. Create vercel.json at root:
   {
     "framework": "nextjs",
     "buildCommand": "next build",
     "devCommand": "next dev",
     "installCommand": "npm install"
   }

9. Create /src/lib/utils.ts exporting a cn() function using clsx + tailwind-merge.

10. Create /src/types/index.ts with empty export placeholder — we will populate this in Phase 2.

11. Update tailwind.config.ts to include a dark mode class strategy and extend colors with a custom palette:
    primary: #0ea5e9 (sky-500)
    danger: #ef4444 (red-500)
    warning: #f59e0b (amber-500)
    success: #22c55e (green-500)
    surface: #0f172a (slate-900)

12. Update /app/layout.tsx to use a dark background (bg-slate-950), import Sonner <Toaster /> component, and set metadata title to "CyberGuard OT".
Done When: npm run dev starts without errors, the folder structure is in place, middleware file exists and TypeScript compiles cleanly with npm run build (pages can be empty shell exports for now).