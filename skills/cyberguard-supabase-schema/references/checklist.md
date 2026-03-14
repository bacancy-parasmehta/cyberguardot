# Schema Checklist

- SQL migrations define enums before tables.
- RLS is enabled on all scoped tables.
- Helper SQL functions are separated from the main migration when practical.
- TypeScript interfaces and union types mirror database columns and enums.

