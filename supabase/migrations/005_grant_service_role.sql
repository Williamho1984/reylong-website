-- Codifies a grant that has only ever existed as a one-off command run by hand in the
-- Supabase SQL Editor against production. It was never captured in a migration, so replaying
-- 001-004 on a fresh database (a new project, a preview branch, or `supabase db reset`) would
-- recreate products/product_media/news/case_studies/events/inquiries without it — every seed
-- script in scripts/ authenticates as service_role, so all of them would fail with "permission
-- denied" the moment anyone rebuilds the schema from migrations alone instead of copying
-- production. 004_ai_crawler_hits.sql already grants service_role inline for the table it
-- creates; this backfills the same for the six tables 001 created before that pattern existed.
--
-- GRANT is idempotent, so running this against production (where it already applies) is a
-- no-op — this is purely about making the migration history reproduce what is actually live.
grant select, insert, update, delete on products to service_role;
grant select, insert, update, delete on product_media to service_role;
grant select, insert, update, delete on news to service_role;
grant select, insert, update, delete on case_studies to service_role;
grant select, insert, update, delete on events to service_role;
grant select, insert, update, delete on inquiries to service_role;
