# MintERP Site

Static product landing page for `minterp.alexiasoft.co`. This is intentionally separate from the ERP application and has no build step or runtime dependencies.

## Preview locally

Open `index.html` in a browser or run:

```sh
python3 -m http.server 8080
```

Then visit <http://127.0.0.1:8080> or the product presentation at <http://127.0.0.1:8080/presentation/>. The directory index also handles `/presentation` through the web server's normal trailing-slash redirect.

## Product presentation

- `presentation/index.html`: 22 Thai sales slides covering the nine product modules, cross-module workflows, pricing, customization and onboarding.
- Reuses landing-page branding, fonts, CSS tokens and sanitized test screenshots; presentation layout and controls live in `assets/css/presentation.css` and `assets/js/presentation.js`. No runtime dependencies or build step.
- Navigate with the arrows, slide selector, Left/Right, PageUp/PageDown, Home/End, or a shareable hash (e.g. `/presentation/#crm`). Form controls retain their native keyboard behavior. Desktop slides fit completely above the controls; small screens scroll without scaling text down. Without JavaScript all slides remain readable.
- Fullscreen is available when supported. Print / PDF prints all slides in A4 landscape; use the browser's background graphics option and disable browser headers/footers for the intended result.
- Product copy was checked against `new-erp/app/Modules/Platform/Services/WorkflowCatalog.php`, current Asset routes, `CRM_SALES_FEATURE_CHECKLIST.md`, `PRODUCTION_MVP_CHECKLIST.md` and `POS_PRODUCTION_INTEGRATION_CHECKLIST.md`. Older core planning checklists lag behind implementation. Sales-to-Production integration is explicitly marked as awaiting UAT; do not remove this note without acceptance evidence.
- Prices come from this site's `index.html`, not the investor pitch. Update both pages together and confirm commercial terms before publishing. First-year subscription examples exclude VAT and out-of-scope work.
- Keep ERP source, credentials and customer data out of this public deck.

Checks (Node.js, no install required):

```sh
node tests/smoke.mjs
node tests/presentation.mjs
```

## Plesk deployment

1. Create the `minterp.alexiasoft.co` subdomain in Plesk and point its document root to this project directory (or its deployed copy).
2. Configure the DNS record for `minterp` to the hosting target and issue an SSL certificate.
3. Upload/publish the static files; no PHP, database, Composer, or Node setup is needed.
4. Verify mobile navigation, mail/phone links, and canonical URL after DNS/SSL are active.
5. Verify the domain in Google Search Console, submit `/sitemap.xml`, and inspect the homepage URL for indexing issues.

Keep the future demo on its own subdomain and deployment, using the ERP source code with a separate database and demo-only credentials/data. Do not place ERP secrets or customer data in this static site.

## Legal pages

`/privacy/` and `/terms/` are static Thai documents linked from the landing-page footer, styled with the existing shared CSS. Privacy covers the public website and inquiries, not the ERP customer's own data policy. It discloses Google Fonts and possible infrastructure logs without claiming analytics or advertising trackers are installed.

The text is a starting draft, not legal advice or a substitute for a service contract. Before publishing, have the responsible business/privacy owner and qualified Thai legal counsel review the company/contact details, lawful bases, actual hosting/email providers, international transfers, retention periods, security practices, and contractual cancellation/refund terms. Update the visible revision dates when changing the documents. No consent banner was added because the current site code has no optional tracking; reassess before adding analytics or advertising.

## Before publishing

- The screen gallery contains captures from the local ERP test environment; company/user labels are anonymized and displayed figures are test data. Refresh or approve them before publication if the data changes.
- Pricing is an initial proposal; confirm hosting, support, implementation margins, license terms, and VAT handling before treating it as a binding quote.
- Replace the separate hero dashboard illustration with an approved, sanitized MintERP screenshot when available; it remains marked as illustrative and uses sample values.
- Confirm product scope, pricing, deployment options, contact details, and final Thai copy with the product owner.
- Add a real demo URL only after the isolated demo environment is ready.
- Add an approved Open Graph image if social sharing needs a branded preview.
