// Submit all sitemap URLs to IndexNow (Bing / Yandex instant indexing).
// Run AFTER deploy so the key file at https://www.reylong.com/<key>.txt is live.
const KEY = '2ecc62489a557f634869124a7f00090b'
const HOST = 'www.reylong.com'

const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text()
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(m => m[1].trim())
  .filter(u => u.startsWith('http'))

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  }),
})
console.log(`IndexNow: HTTP ${res.status} — submitted ${urlList.length} URLs`)
const text = await res.text()
if (text) console.log(text)
