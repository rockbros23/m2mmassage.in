# SEO Maintenance - m2mmassage.com

This file is the working SEO plan for the site. Run the automated check after any
content, pricing or contact-detail change.

```powershell
cd D:\Gay_app\M2Mmassage.com
node tools/seo-audit.js
```

The audit checks page titles, meta descriptions, H1s, canonicals, Open Graph /
Twitter tags, image alt text, JSON-LD, internal links, sitemap coverage and
`robots.txt`. It exits with code `1` if a blocking error is found, so it can be
run before every deployment.

---

## 1. Current baseline

| Item | Status |
| --- | --- |
| Unique title + description on every indexable page | Done |
| Canonical URLs | Done |
| Open Graph + Twitter cards | Done |
| Mobile-friendly, responsive layout | Done |
| One H1 per page + semantic headings | Done |
| Image alt text | Done |
| LocalBusiness + WebSite + FAQPage JSON-LD | Done (`index.html`) |
| Service ItemList JSON-LD | Done (`services.html`) |
| XML sitemap + robots.txt | Done |
| Installable PWA (manifest, icons, offline page) | Done |
| Privacy and terms pages | Deliberately `noindex` |
| Google Search Console | **Not connected yet** |
| Google Business Profile | **Not created yet** |
| Real reviews / stats | **Placeholders - replace before launch** |

The legal pages are `noindex` on purpose: they are trust pages, not search
landing pages. The 404 and offline pages are also `noindex`. The app manifest and
service worker do not affect indexing; they improve mobile experience and Core
Web Vitals.

---

## 2. Before launch (one-time)

1. **Replace every placeholder.** Search for `98765`, `hello@m2mmassage.com`,
   `Bandra West` and `1,200+`.
2. **Confirm the domain.** Every canonical, `og:url` and sitemap entry uses
   `https://m2mmassage.com/`. If the final domain differs, update all of them
   together.
3. **Verify the phone and WhatsApp number** on a real phone.
4. **Add real permissioned reviews.** Keep the wording honest and specific.
5. **Create a Google Business Profile** (see section 4).
6. **Submit the sitemap** in Google Search Console and Bing Webmaster Tools.

### Google Search Console

1. Go to <https://search.google.com/search-console>.
2. Add a **Domain** property for `m2mmassage.com`.
3. Verify with the DNS TXT record from your domain registrar.
4. Submit `https://m2mmassage.com/sitemap.xml`.
5. Use **URL Inspection** on the homepage, services page and booking page.
6. Check **Pages** and **Core Web Vitals** monthly.

### Bing Webmaster Tools

1. Go to <https://www.bing.com/webmasters>.
2. Import the site from Google Search Console (easiest) or verify by DNS.
3. Submit the same sitemap.

---

## 3. Monthly routine (15 minutes)

- [ ] Run `node tools/seo-audit.js` and fix any errors.
- [ ] Open Google Search Console -> **Pages**: check new "Not indexed" reasons.
- [ ] Check **Performance**: which queries and pages are growing or slipping.
- [ ] Check **Core Web Vitals** for mobile issues.
- [ ] Search Google for `site:m2mmassage.com` and confirm the expected pages appear.
- [ ] Check that phone, WhatsApp, email, prices and hours are still correct.
- [ ] Ask two recent clients for a review (with permission).
- [ ] Update `sitemap.xml` `<lastmod>` dates after meaningful content changes.
- [ ] Test the booking and contact forms on a real phone.

## 4. Local SEO (highest impact for a massage studio)

1. **Google Business Profile**
   - Category: *Massage spa* (primary), *Sports massage therapist* (secondary).
   - Service-area business: hide the street address if clients do not visit a
     walk-in studio; list the Mumbai areas served.
   - Add real photos of the studio, not stock photos.
   - Add services with the same names and starting prices as `services.html`.
   - Post a short update every 2-4 weeks (new treatment, holiday hours, aftercare tip).
2. **NAP consistency** - name, address and phone must match exactly on the site,
   Google Business Profile, Bing Places, Apple Business Connect and any directories.
3. **Reviews** - reply to every review, never argue publicly, never offer discounts
   for reviews. Ask in person after a good session.
4. **Local citations** - a small number of relevant, legitimate directories is
   better than dozens of spam listings.
5. **Landing pages** - if you serve distinct areas, create genuinely useful pages
   (for example "male-to-male massage in Bandra") only when you have unique content
   for each. Do not duplicate the same page with a different suburb name.

## 5. Content plan (optional, 1-2 posts a month)

Search-friendly topics that match the therapeutic positioning:

- What to expect at your first male-to-male massage
- Deep tissue vs. Swedish: how to choose
- Massage after gym: timing, pressure and recovery
- How professional draping and consent work in a massage session
- Desk-worker shoulder routine: 5 stretches between sessions
- Hot stone vs. deep tissue for stiff hips
- How to prepare for an outcall massage at home or a hotel

Keep every article factual, professional and consistent with the 18+ therapeutic
policy. Avoid explicit or suggestive language - it harms ad approval, payment
processing and search quality.

## 6. When content changes

After editing any page:

1. Run `node tools/seo-audit.js`.
2. If you changed a page's purpose, update its `<title>`, meta description,
   canonical and `og:url`.
3. If you added/removed an indexable page, update `sitemap.xml`.
4. If you changed prices, update the visible table, booking form options and the
   `Service` JSON-LD in `services.html`.
5. If you changed the business name, address or phone, update the LocalBusiness
   JSON-LD in `index.html` too.
6. Re-test on mobile.

## 7. Domain migration checklist

If the domain ever changes:

- Update every `<link rel="canonical">`, `og:url`, `og:image` and Twitter image URL.
- Update `sitemap.xml` and the `Sitemap:` line in `robots.txt`.
- Update the LocalBusiness / WebSite JSON-LD URLs.
- Keep the old domain live with 301 redirects for at least 12 months.
- Add the new domain to Search Console and submit the new sitemap.
- Do not run both domains with identical content long-term.

---

## 8. Notes and limits

- SEO rankings cannot be guaranteed. This setup covers technical hygiene, clear
  intent and local discoverability; reviews, photos and genuine service quality
  do the rest.
- The site has no analytics or cookie banner. If you add analytics later, update
  `privacy.html` and use a consent-friendly setup.
- Reviews and session counts on the site are sample content. Replace them with
  true, permissioned figures before launch.
