# SEO audit scripts

Three crawlers that re-derive Ahrefs Site Audit findings from the live site,
so a finding can be confirmed and a fix can be proven rather than assumed.

They exist because reading an Ahrefs summary is not the same as measuring the
site: on 2026-07-31 a batch of work was started from a guess about what
"26 warnings" contained, and the guess was wrong. Run these instead.

All three take a `SITE` environment variable and default to production:

```bash
node scripts/seo-audit/inlinks.mjs                      # against production
SITE=http://localhost:4321 node scripts/seo-audit/inlinks.mjs   # against a dev server
```

Each starts from `/sitemap.xml`, so a page missing from the sitemap is invisible
to them.

## inlinks.mjs

Builds a reverse index of internal links and ranks every page by how many
*distinct* pages link to it. Separates nav/footer chrome from body links and
skips `rel="nofollow"`, which is what Ahrefs counts.

Use for: `Page has only one dofollow incoming internal link`, orphan pages,
and checking that a new page is actually reachable.

## audit-onpage.mjs

Measures title and meta description length, word count, alt text, H1s,
hreflang/lang pairing, canonical targets, mixed content, and the status code of
every distinct internal link target.

Use for: `Title too long/short`, `Meta description too long/short`,
`Low word count`, `Page has links to redirect`, broken internal links.

**Entity decoding matters here.** Astro emits `&#34;` for a quote inside an
attribute. Counting that as 5 characters instead of 1 invents "description too
long" findings that do not exist — the decoder handles numeric entities for
exactly this reason.

## audit-schema-perf.mjs

Parses every JSON-LD block and checks it against Google's required and
recommended fields per type, then times each page and its subresources.

Use for: `Structured data has Google rich results validation error`,
`Slow page`, and finding oversized images.

Its rules are stricter than Ahrefs — it will report Article `image` and
Organization `logo` gaps that Ahrefs does not flag. Treat extra findings as
worth knowing about, not as Ahrefs failures.

## What these cannot tell you

Ahrefs crawls from outside Taiwan, so its timings are worse than these. It also
reports issue types these scripts do not cover (302/3XX redirects, image and
CSS redirects, `Robots.txt changed`). When a number here disagrees with Ahrefs,
export the URL list from the Ahrefs issue rather than assuming either side.
