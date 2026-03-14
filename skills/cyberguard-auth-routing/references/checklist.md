# Auth Checklist

- Login, callback, and logout paths are clearly separated.
- Middleware refreshes sessions and gates dashboard routes.
- Shared auth helpers expose current user, role, and sign-out behavior.
- Sidebar and header consume auth state without duplicating Supabase calls.

