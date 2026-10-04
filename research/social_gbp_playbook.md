# Curry District — Google Business Profile + Social Playbook (Oct 2026)

**Read first (limits of this research).** The session WebSearch cap (200) ran out after 8 queries, and WebFetch is blocked for Google, Meta, FTC and most blogs. So: **[S]** = seen in a search-result summary (secondary source, URL given); **[K]** = model knowledge, not re-checked, verify in-app before presenting. Confidence: **H / M / L**. Business facts (hours, phones, happy hour, ratings) are `verified:false` in `data/business.json`, so treat them as placeholders. Per Rule 5, no prices, awards, review quotes or halal/vegan/gluten-free claims appear here.

---
## A. GOOGLE BUSINESS PROFILE (GBP)

**1. Categories.** Primary: **Indian restaurant** [S, H] ([lobstr](https://www.lobstr.io/blog/google-business-categories)). Max 1 primary + 9 secondary [S, H]; use only 3–5 true ones. Candidates: North Indian restaurant [S], Biryani restaurant [S], Tandoori restaurant [K, M], Takeout restaurant [K, M]. Add Chinese restaurant only if Indo-Chinese is a real menu section. Add Caterer only if catering is offered. Pick exact names from the dashboard dropdown, as they change [M]. Do NOT add "Halal" unless the owners confirm it.

**2. Attributes / Highlights** (set each only if true) [S: [replyonthefly](https://www.replyonthefly.com/blog/google-business-profile-attributes)]. Dine-in, Takeout, Delivery; Lunch/Dinner/Dessert; Family-friendly, Good for groups; payments; parking and wheelchair access; Happy hour (hours unverified). "Vegetarian options" is a safe candidate, but it needs owner confirmation. Highlights are generated from attributes and cannot be typed in [M]. Description: 750-character cap, first ~250 characters show [M]. Lead with "Indian restaurant in Little Elm, TX" plus 3 verified dishes (Butter Chicken, Tikka Masala, Garlic Naan).

**3. Photos.**
- **Specs** [S, M-H: Google Help 6103862, blocked, via secondary]: JPG/PNG, 10 KB–5 MB, 720×720 recommended, 250×250 minimum, in focus, well lit, no heavy filters or stock. Videos: ≤30 s, ≤75 MB [K, M]. Logo 720×720 square; cover 16:9 (~1024×576) [S, M: [postfa](https://postfa.st/sizes/google-business-profile/cover)]; post/product images 1200×900 (4:3) [S, M: [recurpost](https://recurpost.com/schedule-google-business-profile-posts/google-business-profile-post-image-size/)]. Export at 1600 px and keep the subject centred, because Google crops.
- **Owner categories:** Cover, Logo, Exterior, Interior, Food & drink, Menu, Team, At work, Common area [K, M]. Tag correctly.
- **Volume/cadence:** launch with 25–30 photos (menu items, interior, exterior, team) [S, L-M: [malou](https://www.malou.io/en-us/blog/google-business-profile-restaurants)]. Then 4–8 per month [S, L-M: [thestacc](https://thestacc.com/blog/gbp-photos-guide/)], plus a short video monthly. Add seasonal sets (Diwali). Menu photos are reported as the most-viewed type [S, L].
- **Impact.** Google's line, widely quoted: businesses with photos get **"42% more requests for driving directions" and "35% more click-throughs to their websites"** than those without [S, M: [mediagistic](https://www.mediagistic.com/seo/google-photo-insights-more-photos-more-clicks), [respondelligent](https://respondelligent.com/en/google-my-business-photos/), [semrush](https://www.semrush.com/blog/google-business-profile-optimization)]. Every source attributes it to Google, but I could not open the original Google page. It is old, comparative (any photos vs none), and not about quality. Pitch it as "Google's own figure", never as a promise. Low-confidence claims, do not quote to owners: top-3 Maps restaurants average 250+ photos; weekly posters get 5x actions [S, L: [restaurantvelocity](https://restaurantvelocity.com/blog/google-business-profile-restaurant/)].

**4. Menu, Products, Order button, UTM.**
- Fill the in-profile **Menu** (sections, items, descriptions, item photos, dietary tags only if true). Prices only after the owner confirms [K, M]. Use **Products** for combos or festival boxes [K, M].
- **Order online:** put the direct Clover URL (`https://curry-district-little-elm.cloveronline.com/`, unverified in the data file) as the primary order link, with Uber Eats secondary. Dashboard path: Edit profile → Business info → ordering/menu links [K, L-M; UI moves].
- **UTM pattern** [H, standard]. Website: `?utm_source=google&utm_medium=organic&utm_campaign=gbp_profile`. Order: `…&utm_campaign=gbp_order`. Posts: `&utm_campaign=gbp_post&utm_content=<slug>`. Instagram bio: `utm_source=instagram&utm_medium=social&utm_campaign=bio`. Clover or Uber Eats may drop UTMs [L]. Safer: link to an own-site `/order` page (GA4 reads the UTM), then forward to Clover.

**5. Posts, hours, special hours.** Post weekly [K, M]. Types: Update, Offer (needs title and dates), Event (needs dates). Buttons: Order online, Call, Learn more. Offers are fine, but never tie one to leaving a review. Keywords go in naturally, such as "Indian food in Little Elm". **Hours:** set regular hours plus **More hours** (Happy hour, Takeout, Delivery, Kitchen) [K, M]. Add **Special hours** for Diwali (Sun **Nov 8, 2026** [K, M, verify]), Thanksgiving (Nov 26), Christmas and New Year, a month ahead. Wrong hours are the top cause of bad reviews.

**6. Q&A and messaging.** GBP chat/Business Messages was retired mid-2024 [K, M]. Google has been replacing the Maps Q&A box with AI-generated answers [K, **L**, check whether the box still shows]. If Q&A is live, the owner may post and answer 6–8 real FAQs: spice levels, vegetarian options, parking in Suite 200, online ordering, group seating, happy hour [verify each answer]. If not, put the same FAQs in the description, menu descriptions and website.

**7. Reviews (policy-safe).**
- **Rules** [S, M-H: [threechaptermedia](https://www.threechaptermedia.com/blog/google-review-policy-2026), [launchcodex](https://launchcodex.com/blog/seo-geo-ai/google-business-profile-review-policy-update/), [sterlingsky](https://www.sterlingsky.ca/review-gating-is-now-against-the-google-my-business-guidelines/)]. No incentives of any kind (discounts, freebies, contest entries). No gating (do not ask only happy customers, or route unhappy ones elsewhere). No on-site shared kiosks or pressure. No scripted text. April 2026 update: no staff review quotas, and no soliciting reviews that name staff. Google is retroactively removing violators.
- **Link/QR:** GBP dashboard → Get more reviews → copy `https://g.page/r/<ID>/review`, or `https://search.google.com/local/writereview?placeid=<PLACE_ID>` [S, H: [wiremo](https://wiremo.co/blog/how-to-get-your-google-review-link/)]. Put the QR on receipts, bag stickers and table tents, opening in the guest's own phone. Use an own-domain short link (`currydistrict.net/review`) that redirects straight to Google, with no "how was it?" screen. Ask every guest equally.
- **Ask copy (no incentive):** "Enjoyed your meal? A Google review helps neighbours find us. Honest feedback welcome."
- **Reply templates** (reply within 48 h, personalise, no personal data):
  - 5 stars: "Thank you, [Name]! So glad the [dish] hit the spot. See you back in Little Elm soon."
  - 4 stars: "Thanks, [Name]. Glad you enjoyed it. We'd love to hear what would make it a 5 next time."
  - 3 stars: "Thank you for the honest feedback. [Specific issue] isn't our standard. Please email [address] so we can make it right."
  - 1–2 stars, food/service: "We're sorry, [Name]. This isn't the experience we want. Please call [phone] and ask for the manager. We'll look into it."
  - Spice mismatch: "Thanks for telling us. You can always ask for mild, medium or hot, and we'll tune it next visit."
  - Delivery problem: "Sorry the order arrived that way. Please share the order details at [contact] so we can follow up with the delivery partner."
  - Never offer a refund or freebie in return for changing or removing a review.

**8. Local SEO terms.** Use in description, posts, replies and website, never in the business name. Little Elm: "Indian restaurant Little Elm TX", "butter chicken Little Elm", "biryani Little Elm", "Indian takeout Little Elm". Frisco: "Indian food near Frisco", "Indo-Chinese Frisco". The Colony: "tandoori near The Colony". Prosper: "Indian restaurant near Prosper". Lakewood Village: "Indian delivery Lakewood Village". Also DFW terms ("best naan DFW", "North Texas Indian food") and "near FM 423 / Lake Lewisville". Keep name, address and phone identical everywhere. The three candidate phones and the IG handle `currydistrictfrisco` need an owner decision.

---
## B. INSTAGRAM / FACEBOOK / TIKTOK [all K, M unless marked]

**Pillars.** (1) Steam & fire: steam pull, tandoor flame, sizzle ASMR. (2) Pull & tear: naan tear, dip, butter drip. (3) Chef hands: dough, tadka, plating. (4) Spice-level challenge: mild → Texas-hot → vindaloo dare. (5) "What $X gets you": combos, with prices only once verified. (6) Festival days: Dussehra, Diwali, Thanksgiving "curry feast". (7) Staff features: name, role, favourite dish. (8) Customer UGC and Little Elm life: reposts with permission and credit.

**Reels formats:** 7–15 s loopable macro; text hook in the first 1.5 s; POV "ordering for the table"; one dish three ways; ingredient → plate time-lapse; reaction to spice level; "menu decoded" carousels (save-bait). Spec: 1080×1920. The profile grid now previews 3:4, so keep the hero subject centred [M]. Use original audio (sizzle) because business accounts have limited music rights [M-H].

**Cadence (starter, owner-capacity based):** IG 3 Reels + 1 carousel + 4–7 Story frames per week. FB mirrors IG, plus Events. TikTok 3 per week, repurposed. GBP 1 post per week. Batch-shoot every second week.

**Caption formula:** Hook (≤8 words) → one sensory detail → where/when (Little Elm, FM 423) → one CTA (order, tag, save) → 3–5 hashtags. Use keywords in the text, since IG search and Google index captions [M]. Add alt text.

**Hashtags (3–5 per post; Instagram reportedly caps at 5, verify [L-M]).** Local: #LittleElmEats #LittleElmTX #FriscoEats #TheColonyTX #ProsperTX #DFWFoodie #DFWEats #NorthTexasEats. Food: #IndianFoodDFW #ButterChicken #BiryaniLovers #NaanLove #TandooriNights #IndoChinese #DesiFoodie. Brand: #CurryDistrict. Festival: #Diwali2026. Volumes not checked.

**Collabs.** I could not verify named DFW creators, so none are listed. Method: find 2k–30k-follower local creators via the location pages for Little Elm and Frisco, and via #DFWFoodie. Offer a hosted tasting and use IG Collab posts. Free meals are a "material connection", so require #ad or the Paid Partnership label [H: [FTC Disclosures 101](https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers), URL from memory]. Also approach local Facebook community groups, UNT and UTD desi student groups, and the Little Elm Chamber.

**Giveaways.** Include official rules, a "no purchase necessary" route, a random draw, and a Meta release/non-sponsorship line [M: Meta Promotion Guidelines]. On Facebook, do not make personal-timeline sharing or friend tagging an entry method [M]. Never reward Google reviews with entries. Keep prizes small, and ask counsel about Texas rules (not legal advice) [L]. FTC's 2024 fake-reviews rule also bans paying for reviews [H, URL unchecked].

**Ads (start after the listing and photos are fixed).** Meta: boost the best-performing Reel, 3–5 mile radius around 75068 plus Frisco/The Colony, ~$5–8/day for 7 days, CTA "Order Now" or "Get Directions" (assumption, not a benchmark). Google Ads: Search or Performance Max with store goals, linked to GBP; track calls and directions [M, UI names change].

**KPIs (monthly).** GBP: calls, direction requests, website and order clicks (UTM), photo views, new reviews (target 8–12/mo, my assumption), average rating, reply rate (100% in 48 h). Social: reach, 3-s hold rate, saves+shares per reach, profile visits, link taps, UGC tags, orders attributed by UTM.

---
## C. 30-DAY STARTER CALENDAR (Day 1 = Mon Oct 12, 2026; Diwali Day 28 [M, verify dates])

| Day | Platform | Format | Idea | Caption seed |
|---|---|---|---|---|
| 1 | IG+FB | Reel | Butter chicken steam pull + naan tear | "Pull. Dip. Repeat." |
| 2 | GBP | Photos + Update | Upload 8 new hero photos; "fresh look" post | "New photos, same fire. Order or dine in." |
| 3 | IG | Story poll | Mild / Medium / Texas-hot? | "Where do you land?" |
| 4 | TikTok | Video | Tandoori platter sizzle ASMR, 12 s | "Sound on." |
| 5 | IG | Carousel | First-timer picks (verified dishes only) | "Order like a regular." |
| 6 | IG+FB | Reel | Chef hands: dough roll and tadka | "Made by hand, every night." |
| 7 | IG+FB | Story | Sunday table for four | "Sunday is for sharing." |
| 8 | GBP | Offer/Update | Weekday happy hour 4–7 [verify] | "Weekdays, 4–7. Little Elm." |
| 9 | IG+FB | Reel | Dussehra greeting + kitchen B-roll | "Happy Dussehra from our kitchen." |
| 10 | TikTok | Video | Spice challenge ep. 1: vindaloo | "Rate it 1–5. Don't lie." |
| 11 | IG | Carousel | What $__ gets you (verified prices) | "Dinner for two, sorted." |
| 12 | IG | Reel | Three naans, three tears | "Which tear are you?" |
| 13 | IG+FB | Photo | Staff feature #1 (needs owner facts) | "Meet [Name], our [role]." |
| 14 | IG+GBP | Story + QR | Launch table-tent review QR | "Tell your neighbours what you thought." |
| 15 | IG | Story/Reel | First customer UGC repost (with permission) | "Thanks for tagging us." |
| 16 | FB+GBP | Event | Diwali dinner/week event page | "Diwali at Curry District." |
| 17 | TikTok | Video | Tikka vs tandoori vs masala explained | "Menu words, decoded." |
| 18 | IG | Reel | Tandoor flame close-up | "This is where the magic happens." |
| 19 | IG | Carousel | Spice cabinet 101 | "Save this for your kitchen." |
| 20 | IG+FB | Reel | Halloween "Trick or heat?" vindaloo dare | "Brave enough?" |
| 21 | GBP | Update | Diwali hours + order online; set special hours | "Order ahead for Diwali." |
| 22 | IG | Collab Reel | Creator tasting #1 (disclosed) | "Hosted by us. Verdict by them." |
| 23 | TikTok | Video | Dessert syrup pour (if on menu) | "Save room." |
| 24 | IG | Story series | Diwali countdown, decor setup | "Lights going up." |
| 25 | IG | Carousel | Diwali family spread | "Order for the whole family." |
| 26 | IG+FB | Reel | Dining-room lights-on time-lapse | "Lights on." |
| 27 | FB+IG | Story | "Tomorrow" reminder | "See you tomorrow." |
| 28 | All | Reel + GBP | Diwali greeting: team and feast | "Happy Diwali from Little Elm." |
| 29 | GBP+IG | Photos + replies | Upload 6 festival photos; answer every review | "Thank you, Little Elm." |
| 30 | IG | Carousel | Month recap + Thanksgiving curry feast tease | "What's next." |

## C2. PHOTOGRAPHER SHOT LIST (25)
**Defaults:** daylight or 5,200–5,600 K, white-balance locked, no mixed lighting. Light the dish from back-left at 10 o'clock for steam and texture, with a white bounce front-right. Overheads use soft top light. Shoot the real dish as served, with no fake props. Palette props (marigold, rani, teal, indigo cloth, brass, steel katoris), no sacred symbols. Shoot 4:5, 1:1 and 9:16 safe. Include a few 10–15 s vertical clips of the steam pull, naan tear and sizzle.

| # | Shot | Surface / props / light |
|---|---|---|
| 1 | Feast overhead (6 dishes) | Indigo board, marigold cloth; soft top light |
| 2 | Butter chicken + naan dip, steam | Dark slate, steel katori; backlight |
| 3 | Naan tear, buttery pull | Hands, wood board; side light, macro |
| 4 | Tandoor mouth, skewers | Dim room, flame glow; tripod 1/60 |
| 5 | Tandoori chicken on sizzle plate | Black slate, lime; rim light |
| 6 | Biryani handi lid-lift | Brass handi, steam; backlight 3/4 |
| 7 | Tikka kabab skewer macro | Onion rings, lime; side light |
| 8 | Vindaloo, chilli garnish | Teal plate on cream; side light |
| 9 | Tikka masala cream swirl | Pour shot; window light left |
| 10 | Indo-Chinese wok toss (if on menu) | Dark bg; fast shutter, back light |
| 11 | Dessert syrup pour (verify menu) | Pink glaze, brass spoon; soft side |
| 12 | Chai / lassi, condensation | Terrazzo; backlight |
| 13 | Whole-spice flat lay | Block-print cloth; top light |
| 14 | Chef hands rolling dough | Flour dust; back light |
| 15 | Tadka sizzle (cumin in oil) | Pan close-up; low-angle side light |
| 16 | Chef portrait at the pass | 35 mm; window light |
| 17 | Team at entrance | Menu in hand; open shade, GBP "Team" |
| 18 | Server presenting platters | Shallow depth; ambient + bounce |
| 19 | Exterior, golden hour | Straight-on sign, Suite 200 entrance cue |
| 20 | Exterior, dusk/blue hour | Lit sign, FM 423 context |
| 21 | Interior wide x2 | 24 mm, tripod, lights on |
| 22 | Table setting detail | Napkin, glasses; soft side |
| 23 | Menu pages flat | Straight-on, no glare; GBP "Menu" |
| 24 | Family sharing, hands reaching | Real guests, signed release |
| 25 | Takeout bag + order on counter | Brand packaging; window light |

**Delivery:** sRGB JPG, ≥2,000 px long edge, plus 1:1 crops at 1,600 px under 5 MB for GBP. Consistent file names (`curry-district-little-elm-butter-chicken-01.jpg`).

---
## Open questions (owner/orchestrator to resolve; not edited into `docs/OPEN_QUESTIONS.md` because of Rule 1)
Confirm hours; one canonical phone; real IG handle (data says `currydistrictfrisco`); happy hour; Indo-Chinese and dessert items; halal/vegetarian claims; catering; Place ID and `g.page` review link; prices to publish.
