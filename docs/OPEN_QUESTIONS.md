# Open questions & things to confirm with the Curry District owners

Everything in the concept sites and hub is built from **public search snippets only** (the restaurant's own site, Yelp, Google and similar pages were blocked in the build environment, and the session's web-search quota ran out). Nothing below was confirmed by the owners. Do not print, launch or publish any of it as fact until it is.

## 1. Facts that must be confirmed before any real use
| Item | What we used | Status |
|---|---|---|
| Primary phone | (469) 200-5856 | *Likely.* (469) 200-5944 appears as a second line; (972) 787-1320 appears only on a delivery-aggregator page and is probably stale. Call all three. |
| Opening hours | Mon–Thu 11–2:30 & 4:30–10; Fri–Sat 11–3 & 4:30–10:30; Sun 11–3 & 4:30–10 | *Likely* (matches several listings; one lists simpler hours). The sites compute "Open now" from these in Central Time. |
| Address | 11851 FM 423, Suite 200, Little Elm, TX 75068 | Verified across listings. Variants exist ("FM-423", no suite). |
| Instagram / Facebook | @currydistrictfrisco / CurryDistrictFrisco | Handle is *inferred* from the Facebook URL. "Frisco" in handles vs "Little Elm" in the address needs the owners' explanation. Note **Desi District** (1630 FM 423) is a different restaurant. |
| Online ordering | Clover link `curry-district-little-elm.cloveronline.com` (a second `gotoeat` site also exists) | Pick one primary ordering link. |
| Ratings shown | Google ≈4.2 (≈1,000 reviews, inferred), Uber Eats ≈4.5 (2,000+), Restaurantji 4.5 (479), Yelp 4.0 (120) | *As listed publicly, Oct 2026.* Never shown as quotes. |
| Not stated anywhere | happy hour, halal status, buffet, seating capacity, patio, BYOB policy, reservations, opening date, owner/chef story | **Left out** of the sites. Pages say "please call to confirm". |

## 2. Menu
- 105 items merged from aggregator snippets; **prices are never shown** (sources disagreed by 25–35%: older listings vs delivery-app mark-ups). Get the live Clover menu / a photo of the printed menu.
- Four items are marked *unconfirmed* and hidden: Bullet Naan, Paratha, Lamb Seekh Kabab, Lamb Chop Kabab.
- **Spice levels are our estimates** (flagged on the sites). The kitchen should set real ones.
- Dish descriptions are generic "what the dish normally is" copy — owners should rewrite in their voice.
- Cuisine lean (Andhra / Hyderabadi + North Indian tandoor + Indo-Chinese) is **inferred from dish names**, not stated by the owners.
- Thali / "plan your table" and the *District* zone names (Biryani Boulevard etc.) are concept ideas, not their current menu structure.

## 3. Photography
- **No real photos exist in this concept.** Every visual is an original illustration or vector mockup. No licence-safe food photos could be downloaded in the build environment. A professional shoot is one of the proposals (shot list in `hub/gbp/`).
- Any AI-generated image must be labelled "illustrative concept imagery"; none are used on the live sites.

## 4. Design/legal cautions
- This is **spec work shown on independent concept sites**. Every page carries "Independent design concept prepared as a proposal — not the official Curry District website" and `noindex`. Get the owners' written permission before anything is made public, and take the sites down if they ask.
- The restaurant's real logo, photos and brand colours were **not seen**, so the logos are *new concepts* (Bazaar: bowl-sun in a bazaar gate; Royal: arch + handi).
- The catering forms on both sites are **demo-only**: they validate and show a demo confirmation. Nothing is sent or stored.
- All QR codes in mockups are **non-scannable samples** (the storefront decal sample points at the pitch hub). Replace with a real Google-review link / ordering link.
- Hindi/Hinglish phrases and the Devanagari accent were checked by the writer only — have a native speaker confirm before print. Festival creatives (Diwali, Eid, etc.) should be reviewed by community members before use; festival dates are month-level and approximate.
- The "photos get +42% direction requests / +35% website clicks" figure is attributed to Google in secondary sources; **the original page was not verified**.

## 5. Print & production notes
- Dielines and dimensions are **indicative** — get the supplier's own template (pail, clamshell, tub, bag, sleeve).
- Printed text inside food-contact surfaces (e.g. clamshell lid) needs food-safe inks or an insert card.
- Costs shown (print, wallpaper, neon, signage, merch) come from web snippets or are estimates — they are **not quotes**. Designer fees are intentionally absent from the hub (see the private playbook).
- Signage: landlord sign criteria and City of Little Elm sign permit rules (A-frame size caps etc.) were found in a general PDF and must be re-checked.
- Take-home jars (chili oil, masala tin): ingredients, weights and allergens are placeholders; check Texas cottage-food / DSHS rules before any sale.
- Texas: no statewide foam-container ban was found, and none for Little Elm, but verify.

## 6. Product/engineering follow-ups
- Replace sample owner story on the Story pages (marked *sample copy*).
- Wire real ordering, analytics, and a real catering-inquiry form (Netlify Forms or the restaurant's tool) if the concept becomes the live site.
- Both sites are static HTML/CSS/JS; menu pages are pre-rendered from `data/menu.json` via `node sites/<name>/scripts/build-menu.js`.
- Contact buttons on the hub are hidden until `hub/assets/config.js` is filled in (studio name, phone, email, WhatsApp, calendar link).
