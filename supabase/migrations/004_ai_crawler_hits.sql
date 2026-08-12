-- Records visits by AI crawlers, which nothing on this site could see before.
--
-- Ahrefs Web Analytics runs as client-side JavaScript and crawlers do not execute
-- JavaScript, so every fetch by GPTBot, OAI-SearchBot, PerplexityBot or ClaudeBot
-- has been invisible. That left the cheapest AEO question unanswerable: whether the
-- engines read these pages at all, which pages, and whether publishing changed it.
-- Unlike asking the engines questions by hand, this is deterministic and free.
--
-- `kind` is the part worth reading:
--   user      someone's assistant fetched this page while answering them, live
--   search    the engine's retrieval index
--   training  a corpus crawl, which says nothing about being cited today
--
-- It cannot see Gemini or AI Overviews: those are served from the ordinary Google
-- index and crawl as Googlebot, so they are indistinguishable from normal search
-- crawling. See src/lib/ai-crawlers.ts.
create table if not exists ai_crawler_hits (
  id bigserial primary key,
  hit_at timestamptz not null default now(),
  bot text not null,
  kind text not null,
  path text not null,
  status integer,
  cache text,
  -- Cloudflare's verified-bot flag when the runtime exposes it. A User-Agent is
  -- self-declared, so without this a count is only ever an upper bound.
  verified boolean,
  user_agent text
);

alter table ai_crawler_hits drop constraint if exists ai_crawler_hits_kind_check;
alter table ai_crawler_hits add constraint ai_crawler_hits_kind_check
  check (kind in ('user', 'search', 'training'));

-- Every query against this table is "which bots hit what, over some window", so
-- lead with time.
create index if not exists ai_crawler_hits_at_idx on ai_crawler_hits (hit_at desc);
create index if not exists ai_crawler_hits_bot_at_idx on ai_crawler_hits (bot, hit_at desc);
create index if not exists ai_crawler_hits_path_at_idx on ai_crawler_hits (path, hit_at desc);

alter table ai_crawler_hits enable row level security;

-- The middleware writes with the publishable key, so anon needs insert — and only
-- insert. Nothing public may read the log back: it is operational data, and a
-- readable table would hand anyone a live map of which pages the AI engines favour.
drop policy if exists "anon can record crawler hits" on ai_crawler_hits;
create policy "anon can record crawler hits" on ai_crawler_hits
  for insert to anon with check (true);

grant insert on ai_crawler_hits to anon;
grant usage, select on sequence ai_crawler_hits_id_seq to anon;
grant select, insert, update, delete on ai_crawler_hits to service_role;
grant usage, select on sequence ai_crawler_hits_id_seq to service_role;
