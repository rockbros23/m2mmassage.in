# M²M Massage — m2mmassage.com

A luxury, mobile-first static website for a male-to-male massage studio in Mumbai.
Dark charcoal + warm gold palette, serif display type, custom SVG artwork — no build
step, no dependencies, no backend required.

---

## 1. What's included

| File | Purpose |
| --- | --- |
| `index.html` | Home — hero, treatments, process, therapists, pricing, reviews, FAQ |
| `services.html` | Six treatment details, full price table, add-ons, house rules |
| `therapists.html` | Team profiles, vetting standards, therapist matching |
| `booking.html` | Booking request form with WhatsApp hand-off + summary |
| `about.html` | Story, values, hygiene standards, studio space |
| `contact.html` | Contact cards, service-area map, message form |
| `privacy.html` | Privacy policy |
| `terms.html` | Terms, consent and studio policies |
| `404.html` | Friendly not-found page |
| `offline.html` | Offline page used by the installed app |
| `manifest.webmanifest` | Installable-app manifest, icons and shortcuts |
| `sw.js` | Service worker: offline cache and fast repeat visits |
| `assets/css/style.css` | All styling (design tokens at the top) |
| `assets/js/main.js` | Nav, scroll reveals, carousel, FAQ, forms, WhatsApp, PWA install |
| `assets/img/*` | Hero figure, map, social cover, app icons and favicon |
| `robots.txt`, `sitemap.xml` | SEO basics |
| `SEO.md` | SEO maintenance plan and monthly checklist |
| `PWA.md` | Installable-app notes and optional store packaging |
| `tools/seo-audit.js` | Automated SEO / PWA / link / structured-data check |

---

## 2. Preview locally

Double-click `index.html` — it works straight from the file system.
For a local server (recommended before deployment):

```powershell
# from this folder, if Python is installed
python -m http.server 8080

# or with Node.js
npx serve .
```

Then open <http://localhost:8080>.

The installable-app and offline features need `http://localhost` or an HTTPS
domain. Opening the files directly (`file://`) still shows the site, but the
service worker stays inactive. See `PWA.md`.

---

## 3. Make it yours (do this first)

### 3.1 Contact details

These placeholders appear across every page. Use your editor's
**Find & Replace in Files** and replace:

| Find | Replace with |
| --- | --- |
| `+919876543210` | your WhatsApp / phone, digits only with country code |
| `+91 98765 43210` | your display phone number |
| `hello@m2mmassage.com` | your real email |
| `919876543210` (in `assets/js/main.js` → `SITE.whatsapp`) | your WhatsApp number |

Search for `98765` to catch every instance.

### 3.2 Business details

- **City / area** — currently “Bandra West, Mumbai” and Mumbai outcall areas.
  Update the footer, contact page, JSON-LD and `<title>`/meta tags on each page.
- **Hours** — currently 10:00–22:00 daily (top bar, footer, booking sidebar).
- **Prices** — appear in `index.html`, `services.html` and the booking form
  `<option>` labels. Keep them consistent.
- **Therapists** — names, specialties, years and languages live in
  `therapists.html` and the three cards on `index.html`.
- **Domain / canonical URLs** — every page has
  `<link rel="canonical" href="https://m2mmassage.com/...">`, plus `og:url`,
  `og:image` and `sitemap.xml`. If you ever change domain, update those too.

### 3.3 Forms

There is no server. Both forms intentionally **do not send email** — they:

1. Validate the fields in the browser.
2. Show a clean confirmation panel with a summary.
3. Build a pre-filled WhatsApp message and hand off to `wa.me`.

This needs zero hosting setup and converts very well for a local service.

**To receive submissions by email instead**, create a free endpoint at
[Formspree](https://formspree.io) (or similar), then in `booking.html` and
`contact.html` add `action="https://formspree.io/f/YOUR_ID" method="POST"` to the
`<form>` and remove the `data-booking-form` / `data-contact-form` attribute so
`main.js` stops intercepting the submit.

### 3.4 Artwork

- `assets/img/hero-figure.svg` — abstract gold figure in the arch frame.
  Replace with a real photograph by swapping the `<img src>` in `index.html`
  (a portrait crop around 4:5 works best, e.g. `1200×1500`).
- `assets/img/og-cover.png` — the 1200×630 social share image used in the
  `og:image` tags. `og-cover.svg` is the editable source; re-export the PNG if
  you change the branding.
- `assets/img/map.svg` — stylised service-area map on the contact page.

### 3.5 Colours and type

All design tokens are at the top of `assets/css/style.css` under `:root`:

```css
--bg: #08080a;          /* page background */
--gold: #d4af6a;        /* accent */
--text: #f4efe6;        /* body text */
--serif: "Cormorant Garamond", Georgia, serif;
--sans: "Jost", system-ui, sans-serif;
```

Change them once and the whole site follows.

---

## 4. Deploy

The site is fully static — any host works.

**Netlify (easiest):** drag this folder onto <https://app.netlify.com/drop>.
Add `m2mmassage.com` under *Domain settings → Add custom domain*, then point your
registrar's DNS to Netlify (or change nameservers). HTTPS is automatic.

**Vercel:** `vercel` in this folder, or import the Git repo and deploy with the
“Other” framework preset.

**GitHub Pages / Cloudflare Pages / cPanel:** upload the files to the web root.
`index.html` must sit at the root. No `.htaccess` or Node runtime needed.

After going live:

1. Submit `https://m2mmassage.com/sitemap.xml` in Google Search Console.
2. Test the WhatsApp and phone links on a real phone.
3. Run Lighthouse (Chrome DevTools) — expect strong scores; add `width`/`height`
   to any new image you introduce.
4. Replace the sample reviews with real, permissioned ones before launch.

---

## 5. Before you launch (important)

- **This is a therapeutic massage business.** The copy is deliberately clear that
  no sexual services are offered. Keep that language. It protects you legally,
  improves ad-platform approval and filters out the wrong enquiries.
- **Get local advice** on licensing, hygiene and advertising rules for massage
  services in your city/state.
- **Reviews and stats** on the site (`1,200+ sessions`, `4.9/5`, client quotes)
  are placeholders. Replace them with true figures and permissioned quotes.
- **Photos of therapists** are intentionally omitted for privacy. If you add
  photos, get written consent and keep the alt text descriptive.
- **Privacy policy** is a solid starting template, not legal advice. Have it
  reviewed if you collect health information at scale.

---

## 6. Accessibility & performance notes

- Semantic landmarks, skip link, visible focus rings, `aria-current` navigation.
- Forms use native validation plus clear labels and hints.
- `prefers-reduced-motion` is respected (marquee, reveals, seal rotation stop).
- All artwork is inline/local SVG; the only network requests are Google Fonts.
  To go fully self-hosted, download the two font families and add `@font-face`
  rules instead of the `<link>` tags.

## 7. SEO maintenance

Run the automated check after any content, price or contact-detail change:

```powershell
node tools/seo-audit.js
```

It verifies titles, descriptions, H1s, canonicals, social tags, image alt text,
JSON-LD, internal links, sitemap coverage, PWA manifest/icons, the service
worker and `robots.txt`. See `SEO.md` for the monthly checklist, Search Console
setup and local SEO plan.

## 8. Installable mobile app

The site is a PWA. On Android use **Install app**; on iPhone use
**Share -> Add to Home Screen**. It launches full-screen, keeps the main pages
available offline, and needs no app store.

After changing CSS, JS or page content, bump `VERSION` in `sw.js` for a clean
cache refresh. `PWA.md` covers testing, updates and optional Play Store /
App Store packaging.

---

Built for m2mmassage.com. Enjoy the quiet.
