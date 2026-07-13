-- /news currently mixes two kinds of content with very different lifespans: dated event
-- announcements (which /events already covers) and evergreen technical articles that stay
-- relevant for years. Without a category there is no way to present them differently, so the
-- evergreen pieces get pushed down the list and read as stale.
--
-- `category` is a presentation concern only — every existing URL stays exactly where it is.
-- No redirects, no hreflang churn.
alter table news add column if not exists category text not null default 'news';
alter table news add column if not exists summary_en text default '';
alter table news add column if not exists summary_es text default '';

-- Question/answer pairs behind the FAQPage JSON-LD on technical guides. Shape:
--   [{ "q_en": "...", "a_en": "...", "q_es": "...", "a_es": "..." }, ...]
-- Kept in the database (not in the page) so answers can be corrected without a redeploy.
alter table news add column if not exists faq jsonb default '[]'::jsonb;

alter table news drop constraint if exists news_category_check;
alter table news add constraint news_category_check check (category in ('news', 'guide'));

-- Reclassify what is already published: the six evergreen explainers become guides, the two
-- event announcements stay as news.
update news set category = 'guide'
where slug in (
  'fibc-jumbo-bag-production-trends',
  'edge-ai-packaging-lines-vision-inspection-predictive-maintenance',
  'water-based-inks-flexographic-printing-sustainable-packaging',
  'mono-material-recyclable-pouches-heat-seal-challenge',
  'eddy-current-separation-guide',
  '3-side-seal-vs-stand-up-zipper-pouch'
);

create index if not exists news_category_published_idx on news (category, published_at desc);
