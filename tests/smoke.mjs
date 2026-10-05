import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../robots.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
const localAssets = [...html.matchAll(/(?:src|href)="(assets\/[^"?#]+)/g)].map((match) => match[1]);

assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'one page H1');
assert.match(html, /<title>MintERP ระบบ ERP สำหรับธุรกิจไทย/);
assert.match(html, /name="description" content="[^"]+"/);
assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1, 'one canonical URL');
assert.match(html, /property="og:title"/);
assert.match(robots, /Allow: \/[\s\S]*Sitemap: https:\/\/minterp\.alexiasoft\.co\/sitemap\.xml/);
assert.match(sitemap, /<loc>https:\/\/minterp\.alexiasoft\.co\//);
const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
assert.equal(jsonLd.length, 1, 'one structured data block');
const schemaTypes = JSON.parse(jsonLd[0][1])['@graph'].map((entry) => entry['@type']);
for (const type of ['Organization', 'WebSite', 'SoftwareApplication']) assert.ok(schemaTypes.includes(type), `structured data includes ${type}`);
assert.ok(ids.size > 8, 'page sections have navigation targets');
assert.ok(anchors.every((id) => ids.has(id)), 'all in-page links have targets');
assert.ok(localAssets.every((path) => existsSync(new URL(`../${path}`, import.meta.url))), 'all local assets exist');
assert.match(html, /ตัวอย่างข้อมูลสมมติ|ข้อมูลสมมติ/);
for (const module of ['Dashboard', 'CRM', 'POS', 'จัดซื้อ', 'WMS', 'Finance', 'Accounting', 'Asset', 'Production']) {
  assert.ok(html.includes(module), `landing page includes ${module}`);
}
assert.equal([...html.matchAll(/class="feature-card(?: feature-card-highlight)? reveal"/g)].length, 9, 'all nine product modules are described');
for (const price of ['Subscription', 'License + Customize', '฿5,900', '฿59,000', '฿10,900', '฿109,000', '฿3,900', '฿39,000', '฿320,000', '฿520,000', '฿150,000', '฿200', '฿2,000', '฿900', '฿9,000', '฿8,000', '฿30,000', '฿500', '฿15,000', '฿5,000', 'คลังสินค้า 2 แห่งรวม', 'คลังสินค้า 6 แห่งรวม', 'Cloud Hosting', 'วัน/เวลาทำการ', 'คำถามการใช้งานและตรวจสอบปัญหาระบบ', '18%']) {
  assert.ok(html.includes(price), `pricing page includes ${price}`);
}
for (const [route, title] of [['privacy', 'นโยบายความเป็นส่วนตัว'], ['terms', 'ข้อตกลงและเงื่อนไข']]) {
  const page = readFileSync(new URL(`../${route}/index.html`, import.meta.url), 'utf8');
  assert.ok(html.includes(`href="/${route}/">${title}</a>`), `landing links to ${route}`);
  assert.ok(sitemap.includes(`<loc>https://minterp.alexiasoft.co/${route}/</loc>`));
  assert.ok(page.includes(`<title>${title} | MintERP by AlexiaSoft</title>`));
  assert.ok(page.includes(`rel="canonical" href="https://minterp.alexiasoft.co/${route}/"`));
  assert.equal([...page.matchAll(/<h1\b/g)].length, 1, `${route}: one H1`);
  const pageIds = [...page.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(pageIds).size, pageIds.length, `${route}: unique IDs`);
  assert.ok(pageIds.includes('year'), `${route}: shared script has its year target`);
  for (const [, id] of page.matchAll(/href="#([^"]+)"/g)) assert.ok(pageIds.includes(id), `${route}: anchor ${id}`);
  for (const [, asset] of page.matchAll(/(?:src|href)="\/(assets\/[^"?#]+)/g)) {
    assert.ok(existsSync(new URL(`../${asset}`, import.meta.url)), `${route}: asset ${asset}`);
  }
  assert.ok(page.includes('href="/privacy/"') && page.includes('href="/terms/"'), 'legal pages cross-link');
  assert.ok(page.includes('mailto:sale@alexiasoft.co'), `${route}: contact channel`);
}
console.log('MintERP landing and legal-page smoke checks passed');
