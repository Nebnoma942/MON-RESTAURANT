# Supabase — MON RESTAURANT

The active backend database for V7 is the Supabase project `MON RESTAURANT TEST` (ref `modhavicbacqgfodsxxv`).

The previous V7 migration described an obsolete local/Drizzle schema using integer IDs and tables such as `users`. It was not applied to the active Supabase project and has been removed from the repository to prevent accidental deployment of the wrong schema.

The live schema is represented by `supabase/types/database.types.ts`, generated directly from the active Supabase project.

Runtime business operations use Supabase Auth, PostgreSQL/RLS and the existing public RPC functions (for example `create_order`, `create_restaurant`, `create_dish`, `transition_order`, and `change_restaurant_status`).
