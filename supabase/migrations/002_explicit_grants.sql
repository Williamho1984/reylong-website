-- Explicit PostgREST role grants for public schema
-- Required for Supabase's new default behavior (enforced Oct 30, 2026):
-- new tables won't be exposed to the Data API without explicit grants.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public read access (enforced by RLS policies in 001_initial_schema.sql)
GRANT SELECT ON products TO anon, authenticated;
GRANT SELECT ON product_media TO anon, authenticated;
GRANT SELECT ON news TO anon, authenticated;
GRANT SELECT ON case_studies TO anon, authenticated;
GRANT SELECT ON events TO anon, authenticated;

-- Inquiry form: anonymous insert only
GRANT INSERT ON inquiries TO anon;
