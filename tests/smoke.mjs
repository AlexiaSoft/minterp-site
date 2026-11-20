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
assert.match(html, /name="description"\s+content="[^"]+"/);
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
assert.ok(ids.has('subscription-pricing') && ids.has('license-pricing'), 'subscription and license use separate pricing sections');
assert.ok(ids.has('production-expertise'), 'production expertise has a dedicated section');
assert.equal([...html.matchAll(/class="package-summary"/g)].length, 2, 'each pricing section has a ready-package summary');
assert.equal([...html.matchAll(/class="budget-group budget-group-/g)].length, 2, 'total budget separates subscription and license');
assert.equal(320000 + 60000 + 20000 + 59000, 459000, 'Core managed-cloud first-year total');
assert.equal((320000 * 0.18) + 59000, 116600, 'Core MA and managed-cloud renewal total');
assert.equal(520000 + 100000 + 20000 + 79000, 719000, 'Business managed-cloud first-year total');
assert.equal((520000 * 0.18) + 79000, 172600, 'Business MA and managed-cloud renewal total');
assert.ok(localAssets.every((path) => existsSync(new URL(`../${path}`, import.meta.url))), 'all local assets exist');
assert.match(html, /class="hero-screen-link"[^>]+dashboard\.png/);
assert.match(html, /หน้าจอจริง · ข้อมูลตัวอย่าง/);
assert.equal([...html.matchAll(/class="why-grid"|class="audience-grid"/g)].length, 2, 'landing explains differentiation and audience fit');
assert.match(html, /ประสบการณ์ระบบในธุรกิจผลิตและแปรรูปโลหะจริง/);
assert.equal([...html.matchAll(/class="production-flow"/g)].length, 1, 'production expertise explains one end-to-end costing flow');
for (const module of ['Dashboard', 'CRM', 'POS', 'จัดซื้อ', 'WMS', 'Finance', 'Accounting', 'Asset', 'Production']) {
  assert.ok(html.includes(module), `landing page includes ${module}`);
}
assert.equal([...html.matchAll(/class="feature-card(?: feature-card-highlight)? reveal"/g)].length, 9, 'all nine product modules are described');
for (const price of ['Subscription', 'Perpetual License', '฿5,900', '฿59,000', '฿10,900', '฿109,000', '฿3,900', '฿39,000', '฿320,000', '฿520,000', '฿150,000', '฿200', '฿2,000', '฿900', '฿9,000', '฿30,000', '฿500', '฿15,000', '฿5,000', '฿7,900', '฿79,000', '฿78,000', '฿148,000', '฿202,000', '฿380,000', '฿57,600', '฿560,000', '฿84,600', '฿620,000', '฿93,600', '฿800,000', '฿120,600', '฿459,000', '฿639,000', '฿116,600', '฿143,600', '฿719,000', '฿172,600', '฿899,000', '฿199,600', '฿50,000', '฿40,000', '฿10,000', '฿27,000', '฿5,400', '฿7,200', '฿1,800', 'ผู้ใช้ 8 บัญชี', 'ผู้ใช้ 10 บัญชี', 'ผู้ใช้ 30 บัญชี', 'คลังสินค้า 3 แห่งรวม', 'คลังสินค้า 15 แห่งรวม', 'Expansion Pack', 'AWS S3 100 GB', '200 GB', 'MA + Managed Cloud', 'SUBSCRIPTION BUDGET', 'LICENSE BUDGET', 'Server ลูกค้า', 'ข้อมูลที่บันทึกใน MintERP เป็นข้อมูลของลูกค้า', 'คลังสินค้า 2 แห่งรวม', 'คลังสินค้า 6 แห่งรวม', 'Cloud Hosting', 'Managed Cloud', 'วัน/เวลาทำการ', 'คำถามการใช้งานและตรวจสอบปัญหาระบบ', '18%', 'ไม่จำเป็น MA เป็นบริการเลือกต่ออายุ', 'MintERP ต่างจากโปรแกรมบัญชีออนไลน์ทั่วไปอย่างไร']) {
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
