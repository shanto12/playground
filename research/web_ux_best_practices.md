# Restaurant Website Best Practice 2026: Brief for Curry District Builders

**Evidence note.** The search budget ran out mid-task and most hosts are egress-blocked. *(vendor)* = figure from a search-result summary of a vendor survey or roundup; primary study not opened. *(spec)* = standards behaviour I know well but did not re-fetch. Spot-check numbers before quoting them to the owners.

## 1. The data that justifies the design
- **Mobile share.** Roundups put about 59% of restaurant web sessions and about 60% of digital restaurant orders on phones *(vendor)*: https://www.lightspeedhq.com/blog/online-ordering-statistics/ and https://lavu.com/12-mobile-food-ordering-statistics-showing-rise-in-customer-demand/. Across all industries mobile was 64.35% of web traffic in July 2025: https://www.quantumrun.com/consulting/mobile-website-traffic/. Treat it as "roughly 6 in 10"; for the pitch it is 100%, since owners will view on phones.
- **What diners want.** An Owner.com survey of 1,300 US diners *(vendor)*: 80% visit mainly to see the menu, 84% look for photos of menu items, 91% check the website before ordering, and 64% call online ordering the most important feature. https://www.owner.com/blog/restaurant-website-design. Hours, menu and location are the page's job: a stranger should find all three within 5 seconds.
- **Speed.** Google's 2016 study found 53% of mobile visits are abandoned if a page takes over 3 s (dated, but still the standard citation): https://www.thinkwithgoogle.com/_qs/documents/2340/bc22e_The_Need_for_Mobile_Speed_-_FINAL_1.pdf
- **Commissions.** DoorDash and Uber Eats charge 15–30%, with 30% the standard marketplace rate. Grubhub charges 15–25% plus marketing fees. https://www.getsauce.com/post/how-much-does-doordash-cost, https://www.thefoodygram.com/blogs/restaurant-resources/how-much-do-delivery-apps-charge-restaurants, https://opalink.com/learn/restaurant-delivery-commission-fees. One vendor claims the all-in cost can exceed 40%: https://activemenus.com/the-hidden-costs-of-third-party-delivery-what-restaurant-owners-really-pay-and-how-to-calculate-your-true-roi/. Direct ordering pays about 2.9% card processing instead, so $10k/month of delivery saves roughly $1,500–$3,000/month *(vendor)*: https://orderitto.com/blog/third-party-delivery-fees-restaurants. **Design consequence:** every primary CTA goes to Clover. The Uber Eats link is secondary, footer-level. Do not quote Clover's fee; ask the owner.

## 2. Mobile-first layout
- **Sticky bottom bar** with three labelled actions: **Order** (filled, primary), **Call** (`tel:`), **Directions** (`https://www.google.com/maps/dir/?api=1&destination=<address>`). Height is 56–64px plus `env(safe-area-inset-bottom)` (with `viewport-fit=cover`), and body gets matching bottom padding. Show the bar after the hero scrolls out, because the hero already carries Order.
- **Hero.** Brand mark, one-line promise, an "Open now · until 10:00 PM" pill, and an **Order online** button, all inside the first 844px. Compute status in JS with `timeZone: 'America/Chicago'` (not the visitor's clock), handle split lunch/dinner hours ("Closed · Opens 4:30 PM"), and ship a no-JS hours table. `data/business.json` currently has hours and phone unverified (`phone.chosen: null`), so render from that JSON and log placeholders in `docs/OPEN_QUESTIONS.md` (rule 5).
- **Hours** appear in the hero pill and again in the footer, never only in an image. NAP (name, address, phone) is identical everywhere and matches Google Business Profile.
- **Link previews.** Owners will receive the pitch by text. Set `og:image` (1200×630, absolute URL) so iMessage and WhatsApp show a "wow" card.

## 3. Menu UX
- **Category chips:** sticky, horizontal scroll with `scroll-snap`, real `<a href="#section">` anchors, active state via IntersectionObserver plus `aria-current`. Use the seed categories: Curries, Biryani & Pulao, Tandoori & Kababs, Indo-Chinese, Breads, Desserts.
- **Filters** (Veg / spice level / contains nuts or dairy) appear only for attributes the owner's menu actually states. Never infer halal, vegan or gluten-free (rule 5). Never rely on colour alone: a veg/non-veg dot gets a text label, and spice shows as flames plus the word "Medium".
- **Photos vs illustrations.** 84% of diners hunt for dish photos *(vendor)*, but rule 4 bars photos, so use original SVG dish illustrations. Their alt text begins "Illustration of…", and the frames use the final photo aspect ratio (4:3 or 1:1) so real photography drops in with zero layout change. Pitch real photography as the top follow-up.
- **"Popular" badge** only on the seed list (Butter Chicken, Chicken Tikka Masala, Chicken Vindaloo, Garlic Naan, Tandoori Chicken, Chicken Tikka Kabab) and flagged unverified.
- **Prices.** None are verified, so show none. Use "See today's prices on Clover" deep-links per category. In production, keep one menu data file or sync from Clover so the site and ordering never disagree.
- **Build-a-thali.** Build it as a planner (base, 2 curries, bread, dessert, with the plate filling up as an SVG), ending in "Order these on Clover" with the picks as a text summary. Clover cannot be pre-filled, and a thali or combo is not confirmed on the menu, so label it "plan your feast" and add a line to OPEN_QUESTIONS.
- **Allergen language (legally cautious, not legal advice).** Use: *"Our kitchen handles milk, eggs, wheat, soy, peanuts, tree nuts (including cashews and almonds), sesame, fish and shellfish. Cross-contact can occur and we cannot guarantee any dish is free of an allergen. Please tell us about any allergy before ordering."* The nine major US allergens are listed at https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies *(spec)*. Never write "nut-free" or "safe for allergies."

## 4. Local SEO and technical metadata
- **JSON-LD** `Restaurant` (inherits LocalBusiness). Google requires `name` and `address`. It recommends `geo`, `menu`, `openingHoursSpecification`, `priceRange`, `servesCuisine`, `telephone`, `url` and `aggregateRating`: https://developers.google.com/search/docs/appearance/structured-data/local-business. Also add `hasMenu` (a URL is enough, per https://www.ionhospitality.com/2026/09/26/menu-schema-markup/), `acceptsReservations` only if true, and `potentialAction` `OrderAction` pointing to the Clover URL. Use `openingHoursSpecification` with one entry per day-group and split times as two entries. Types are at https://schema.org/Restaurant. **Omit self-published `aggregateRating`**: Google ignores self-serving review stars for LocalBusiness *(spec)*. Include only verified fields.
- **Maps.** For concept builds use a link-out button, not an iframe (rule 3). In production use a click-to-load map facade with `title` and `loading="lazy"`. Add Apple Maps (`maps.apple.com/?daddr=`) as well, for iPhone.
- **Social cards:** `og:title/description/image/url/type=website`, `twitter:card=summary_large_image`, plus `theme-color` for light and dark.
- **Icon set:** `favicon.ico` (32), `icon.svg`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, a maskable 512, and `manifest.webmanifest` *(spec; pattern from https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)*.
- **Indexing.** Concept pages carry `noindex,nofollow` (rule 6). Do **not** `Disallow` them in robots.txt, because crawlers must be able to see the noindex. Skip the sitemap for concepts. A production handoff adds `sitemap.xml` and a robots `Sitemap:` line.

## 5. Performance
- **Core Web Vitals** at the 75th percentile: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (https://web.dev/articles/vitals).
- **Fonts.** Self-host WOFF2, subset to Latin, preload at most 2 critical files with `crossorigin`, and use `font-display: swap` (or `optional` for the display face). Add a `size-adjust` fallback to prevent CLS.
- **Images.** AVIF or WebP with a PNG/JPG fallback via `<picture>`. Always set `width` and `height`. The LCP element gets `fetchpriority="high"` and is **never** lazy-loaded; everything below the fold gets `loading="lazy"`. Prefer inline SVG. Budget: under 2.5 MB per page (rule 7), JS under about 100 KB.
- **Hero video.** None, or a poster plus a muted, short, under 1 MB loop that is dropped on `prefers-reduced-motion` and on Save-Data.

## 6. Accessibility (WCAG 2.2 AA)
- **New in 2.2:** 2.4.11 Focus Not Obscured (AA), 2.5.7 Dragging Movements alternative (AA), 2.5.8 Target Size 24×24 minimum (AA), 3.2.6 Consistent Help (A), 3.3.7 Redundant Entry (A), 3.3.8 Accessible Authentication (AA). Sources: https://tetralogical.com/blog/2023/10/05/whats-new-wcag-2.2/ and https://dequeuniversity.com/resources/wcag-2.2/. Note: one vendor summary mislabels 2.4.11 as AAA; it is AA. 2.4.13 Focus Appearance is AAA.
- **Our bar is stricter than 2.5.8:** tap targets at least 44px (rule 7).
- **Sticky bar and header** must not hide focused elements. Set `scroll-padding-block` to the bar heights.
- **Contrast:** 4.5:1 body text, 3:1 large text and UI. Check cream-on-orange and gold-on-aubergine pairs numerically.
- **Visible focus ring** with at least 3:1 contrast; skip link; `lang="hi"` on Hindi phrases; do not disable zoom.
- **2.2.2:** any marquee or loop over 5 s needs a pause control, and under `prefers-reduced-motion` it renders static. 1.4.2: no audio that autoplays.
- **Legal context.** The DOJ ADA Title II rule (WCAG 2.1 AA, deadlines pushed to April 2027/2028) covers public entities, not restaurants (https://accessible.org/news/doj-extends-ada-title-ii-web-compliance-deadline/); WCAG AA is still the de facto private benchmark.

## 7. Motion that stays at 60fps
Animate only `transform` and `opacity`.
- **Marquee:** CSS `translateX` loop of duplicated content, paused on hover, focus and reduced-motion.
- **Scroll reveals:** IntersectionObserver adding a class, with CSS scroll-driven `animation-timeline: view()` as an `@supports` enhancement.
- **Parallax:** 2 layers maximum, off on touch, no JS scroll handlers.
- **Steam:** 3 SVG paths rising with opacity fades over 4–6 s, started only while in view.
- **Cursor effects** (marigold trail, spotlight): only under `(hover:hover) and (pointer:fine)`; never hide the system cursor. On touch use tap ripples and sticker-press states.

## 8. Conversion extras
- **Catering inquiry (Netlify Forms)**
  - Use `<form name="catering" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/thanks.html">` with a hidden `form-name` input. The form must exist in the static HTML at deploy time. Docs: https://docs.netlify.com/forms/setup/ *(spec)*.
  - Fields: name, `tel`, `email`, event date, headcount, event type, pickup/delivery, dietary notes, message, with `autocomplete` attributes and visible labels.
  - Announce success with `role="status"` if submitted via fetch.
  - **Pitch caveat:** submissions go to the designer's Netlify, so add a "demo form" note. Do not let real customers' inquiries vanish.
- **Reservations and pre-order.** `business.json` lists none, so do not invent them. Offer "Large party? Call us" (`tel:`) and "Order ahead on Clover" only; ask the owner whether Clover scheduled orders are enabled.
- **Social proof.** One line under the hero CTA, using only the seed ratings (Google 4.2, Facebook 4.8, Yelp 4.0 from 120 reviews), each linked to its platform and flagged unverified. Never invent quote text. A second band goes after the menu highlights.
- **Festival banner.** Dismissible, date-driven, `position` that causes no layout shift, with copy limited to verified facts. Diwali falls around Nov 8, 2026 (confirm). Do not invent specials or discounts.

## 9. Most common mistakes (avoid)
- **PDF or image menus** are invisible to search, force pinch-zoom and fail screen readers (https://jvf.com/why-restaurants-should-avoid-pdf-menus/).
- **Hours or phone only in images or the footer**; hours that differ from Google Business Profile; no click-to-call.
- **Autoplay music or video**, and slow hero video.
- **Splash "Enter site" pages**, load-time popups, autoplaying carousels, heavy social-feed embeds.
- **Menu out of sync with ordering**; too many taps to order. More: https://www.tablein.com/blog/restaurant-website-mistakes and https://www.sumydesigns.com/restaurant-website-mistakes/.

## Builder checklist (25 testable items)
1. A visible **Order online** button (Clover URL) sits in the hero within the first 844px at 390px width.
2. A sticky bottom bar shows Order / Call / Directions with text labels, is at least 56px tall, and respects `safe-area-inset-bottom`.
3. Bar buttons are at least 44×44px each; there is no overlap with footer content.
4. The `tel:` number comes from `data/business.json`; if still unverified, it is flagged in OPEN_QUESTIONS.
5. The Directions link opens a Maps destination with the address 11851 FM 423 Ste 200, Little Elm TX 75068.
6. The hero shows an open/closed pill computed in `America/Chicago`, correct for split lunch/dinner hours, with a no-JS hours fallback.
7. Full hours appear in text (not an image) in the footer and on the contact section.
8. NAP is character-identical everywhere and matches `business.json`.
9. The menu is real HTML text; there is no PDF or image menu.
10. A sticky category chip rail with anchor links works with JS disabled.
11. Filters or tags exist only for attributes stated by the menu data; no halal/vegan/gluten-free claims.
12. Spice and veg indicators use text or shape, not colour alone.
13. No price is shown unless marked verified; otherwise "See prices on Clover" links appear.
14. The allergen disclaimer appears on the menu page, with no "free of" claims.
15. Dish illustrations carry "Illustration of…" alt text, and decorative SVG is `aria-hidden`.
16. JSON-LD `Restaurant` validates (name, address, plus only verified fields) with no self-published aggregateRating.
17. Head contains OG tags (absolute `og:image` 1200×630), `twitter:card`, `theme-color`, and the full icon set plus manifest.
18. Every HTML page has `noindex,nofollow` and the concept disclaimer footer; robots.txt does not Disallow.
19. Mobile Lighthouse Performance is 90 or higher; LCP ≤ 2.5 s, CLS ≤ 0.1, with zero layout shift from fonts or banners.
20. Fonts are self-hosted WOFF2, at most 2 preloaded, and use `font-display` with a `size-adjust` fallback.
21. The LCP image has `fetchpriority="high"` and no lazy-loading; all other images have width/height and lazy-load. The page weighs under 2.5 MB.
22. There is no horizontal scroll at 320, 390, 768 and 1280px, and zoom is not disabled.
23. Axe or a manual check shows: text contrast ≥ 4.5:1, UI ≥ 3:1, a visible focus ring, and a skip link; focused elements are never hidden behind sticky bars.
24. Motion uses transform/opacity only, with a pause control on marquees; `prefers-reduced-motion` makes everything static; there is no autoplay audio and no hero video.
25. The catering form works under Netlify Forms (`data-netlify`, honeypot, `form-name`, thanks page, labelled fields, `autocomplete`), with a demo-submission note, and nothing invented (ratings, reservations, thali, prices) appears without an OPEN_QUESTIONS flag.
