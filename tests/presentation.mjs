import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const html = read('presentation/index.html');
const home = read('index.html');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'unique IDs');
assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
for (const [, id] of html.matchAll(/(?:href="#|aria-labelledby=")([^"]+)"/g)) {
  assert.ok(ids.includes(id), `target exists: ${id}`);
}
for (const [, path] of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)/g)) {
  assert.ok(existsSync(new URL(path.slice(1), root)), `asset exists: ${path}`);
}
for (const module of ['Dashboard', 'CRM', 'POS', 'Purchasing', 'WMS', 'Finance', 'Accounting', 'Asset', 'Production']) {
  assert.ok(html.includes(module), `module: ${module}`);
}
for (const [, amount] of html.matchAll(/฿([\d,]+)/g)) {
  if (['78,000', '202,000'].includes(amount)) continue;
  assert.ok(home.includes(`฿${amount}`), `price comes from homepage: ${amount}`);
}
assert.equal(59000 + 19000, 78000);
assert.equal(109000 + 39000 + 39000 + 15000, 202000);
for (const text of ['ไม่รวม VAT', '18%', 'ไม่แก้โค้ดเฉพาะราย', 'รอผู้ใช้ตรวจรับ UAT', 'ไม่สร้าง WO อัตโนมัติ', 'ไม่ปรับยอดสต็อกอัตโนมัติ']) {
  assert.ok(html.includes(text), `scope disclosure: ${text}`);
}
assert.ok(home.includes('href="/presentation/"'));
assert.ok(read('sitemap.xml').includes('https://minterp.alexiasoft.co/presentation/'));
assert.match(read('assets/css/presentation.css'), /@media print[\s\S]*\.slide\[hidden\][\s\S]*display: flex !important/);

// Exercise the actual controller with only the DOM surface it uses, no test dependencies.
class Element {
  constructor(id) {
    this.id = id; this.events = {}; this.hidden = false; this.offsetHeight = 760;
    this.style = { setProperty: (name, value) => { this[name] = value; } };
  }
  addEventListener(name, handler) { this.events[name] = handler; }
  setAttribute(name, value) { this[name] = value; }
  add(option) { (this.options ??= []).push(option); }
  focus() { this.focused = true; }
}
const slides = [...html.matchAll(/<section class="slide[^\"]*" id="([^"]+)" data-title="([^"]+)"/g)]
  .map(([, id, title]) => Object.assign(new Element(id), { dataset: { title } }));
assert.equal(slides.length, 22);
const elements = Object.fromEntries(ids.map(id => [id, new Element(id)]));
const controls = Object.assign(new Element('controls'), { offsetHeight: 80 });
const header = Object.assign(new Element('header'), { offsetHeight: 76 });
const events = {};
let desktop = false;
let hash = '#crm';
let printCalls = 0;
let fullscreenCalls = 0;
const location = {
  get hash() { return hash; },
  set hash(value) { hash = value.startsWith('#') ? value : `#${value}`; events.hashchange(); },
};
const document = {
  querySelectorAll: () => slides,
  querySelector: selector => selector === '.deck-header' ? header : controls,
  fonts: { ready: Promise.resolve() },
  getElementById: id => elements[id],
  body: { classList: { add: name => assert.equal(name, 'deck-ready') } },
  fullscreenEnabled: true,
  fullscreenElement: null,
  addEventListener: (name, handler) => { events[name] = handler; },
  documentElement: { requestFullscreen: async () => { fullscreenCalls++; } },
  exitFullscreen: async () => { fullscreenCalls--; },
};
runInNewContext(read('assets/js/presentation.js'), {
  document, location,
  window: {
    innerHeight: 900,
    matchMedia: () => ({ matches: desktop }),
    addEventListener: (name, handler) => { events[name] = handler; },
    scrollTo: () => {},
    print: () => { printCalls++; },
  },
  Option: function (text, value) { this.text = text; this.value = value; },
});
const active = () => slides.filter(slide => !slide.hidden).map(slide => slide.id);
const key = (name, interactive = false, modifiers = {}) => events.keydown({
  key: name, target: { closest: () => interactive }, preventDefault() {}, ...modifiers,
});
assert.deepEqual(active(), ['crm'], 'deep link restored');
assert.equal(elements['slide-select'].options.length, slides.length);
assert.equal(controls.hidden, false);
desktop = true;
events.resize();
assert.equal(elements.deck['--deck-scale'], 744 / 760, 'desktop fits complete slide above controls');
assert.equal(elements.deck['--deck-top'], '76px');
slides[4].offsetHeight = 600;
events.resize();
assert.equal(elements.deck['--deck-scale'], 1, 'never enlarge a short slide');
assert.equal(elements.deck['--deck-top'], '148px', 'short slides centered');
desktop = false;
key('ArrowRight');
assert.deepEqual(active(), ['sales']);
assert.equal(slides[5].focused, true);
key('ArrowRight', true);
key('ArrowRight', false, { ctrlKey: true });
assert.deepEqual(active(), ['sales'], 'native controls and browser shortcuts untouched');
key('Home');
assert.equal(elements['prev-slide'].disabled, true);
key('ArrowLeft');
assert.deepEqual(active(), ['intro'], 'clamp first slide');
key('End');
assert.deepEqual(active(), ['contact']);
assert.equal(elements['next-slide'].disabled, true);
assert.equal(elements['slide-count'].textContent, '22 / 22');
assert.equal(elements['deck-progress'].value, 22);
key('ArrowRight');
assert.deepEqual(active(), ['contact'], 'clamp last slide');
elements['prev-slide'].events.click();
assert.deepEqual(active(), ['implementation']);
elements['next-slide'].events.click();
assert.deepEqual(active(), ['contact']);
elements['slide-select'].value = 'subscription';
elements['slide-select'].events.change();
assert.deepEqual(active(), ['subscription']);
location.hash = '#crm';
assert.deepEqual(active(), ['crm'], 'hashchange / browser history');
location.hash = '#not-a-slide';
assert.deepEqual(active(), ['intro'], 'unknown hash safely falls back');
elements['print-deck'].events.click();
assert.equal(printCalls, 1);
await elements['fullscreen-deck'].events.click();
assert.equal(fullscreenCalls, 1);
document.fullscreenElement = {};
events.fullscreenchange();
assert.equal(elements['fullscreen-deck']['aria-label'], 'ออกจากเต็มหน้าจอ');
await elements['fullscreen-deck'].events.click();
assert.equal(fullscreenCalls, 0);
document.fullscreenElement = null;
document.documentElement.requestFullscreen = async () => { throw new Error('denied'); };
await elements['fullscreen-deck'].events.click();
assert.match(elements['deck-status'].textContent, /เปิดเต็มหน้าจอไม่ได้/);
console.log('MintERP presentation checks passed: content, navigation, history, keyboard, print and fullscreen');
