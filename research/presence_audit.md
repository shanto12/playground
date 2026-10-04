# Curry District — Online Presence Audit

**As of 2026-10-04.** Method: WebSearch result text only. Every direct fetch (currydistrict.net, Allmenus, Wheree, Nextdoor) returned EGRESS_BLOCKED, and the shared WebSearch budget (200/session) ran out after about 14 queries from this agent. No page was seen visually, so every design judgement is **inferred**. Flags: **verified** = verbatim in a result title or URL, **likely** = repeated in result summaries, **unverified** = single or no source. Result summaries are model-written, so "likely" is not "certain".

## 1. Presence inventory

| Channel | What was found | Flag |
|---|---|---|
| Website `currydistrict.net` | Indexed pages: `/`, `/about.html`, `/contact.html`, `/catering.html`, `/doordelivery.html` (plus `menu.html`, per brief). Every page title is just "Curry District", and the delivery page is "Curry District\| Door Delivery". | verified |
| Online ordering | `curry-district-little-elm.cloveronline.com` (Clover, from brief). A second platform also exists: `currydistrict.gotoeat.net`. | verified (gotoeat URL) |
| Yelp | 4.0 stars, 120 reviews, 45 photos (title "Updated September 2026"). | verified |
| Restaurantji | 479 reviews, 52 photos; 4.5 stars per summary. | verified / likely |
| Restaurant Guru | 4.2 stars, 1,021 reviews. This site usually mirrors Google, so Google is probably ~4.2 with ~1,000 reviews. | likely (inferred) |
| Facebook `/CurryDistrictFrisco/` | 1,164 followers, 179 check-ins, 4.8 from only 14 ratings. | likely |
| Instagram `@currydistrictfrisco` | Never surfaced in any result. The handle matches the Facebook vanity URL, so it is probably the same business. Followers and content are unknown. | unverified |
| Tripadvisor `d25509526` | Listing exists with **0 reviews**, so it is probably unclaimed. | likely |
| Delivery apps | Uber Eats (`uWXzS9FzRBqEC8dXe5241w`, about 4.5 stars, 2,000+ ratings per summary). Postmates uses the same ID (Uber-owned). DoorDash and Caviar share `curry-district-little-elm-900790`. Grubhub is named on the site, and Allmenus (a Grubhub property) carries a page. | likely |
| Other aggregators | Atly, Nextdoor ("Neighborhood Favorite" 2023 and 2024), Apple Maps, Snapchat place, Zmenu, Sirved, Menupix, Wheree, SinglePlatform menu feed, Giftly gift cards, Sulekha (caterer), dfwindia.com. | verified (URLs) |
| Google Business Profile | Not visible. See the scorecard. | unverified |

## 2. Facts resolved

**Phone verdict: use (469) 200-5856 as primary** (likely).
- (469) 200-5856 appears on the site's door-delivery and contact copy, on the catering and Sulekha-style listings, and first in most aggregator summaries.
- (469) 200-5944 is a second line, surfaced on the Uber Eats listing. Keep it as secondary.
- (972) 787-1320 is verbatim only in the **Allmenus** title ("Curry District menu - Little Elm TX 75068 - (972) 787-1320"). No result ties it to the website, Yelp, or any other source. It is probably a legacy or Grubhub-provisioned number. Do not publish it.
- Confirm by calling all three, and check the Google and Yelp number fields (not visible to us).

**Address:** 11851 FM 423, Suite 200, Little Elm, TX 75068 (verified).

**Hours** (likely): Mon–Thu 11:00–2:30 and 4:30–10:00. Fri–Sat 11:00–3:00 and 4:30–10:30. Sun 11:00–3:00 and 4:30–10:00. This matches `data/business.json`. A "weekday 4–7 PM happy hour" appeared in **no** result, so treat it as **unverified** and don't use it.

**Second location or relocation:** none found (likely). "Frisco" appears only in the Facebook and Instagram handle and in site copy ("Curry District in Frisco…", "outdoor catering in Frisco"), which reads as a market-area label. Beware **Desi District Little Elm**, a different Indian restaurant at 1630 FM 423, Frisco, (469) 895-5733 (Yelp). The similar name is a search-confusion risk. Any relation is unverified.

**Opening date:** unverified. The Snapchat place ID decodes to **~1 May 2023** (inferred from a timestamp), and Nextdoor's 2023 and 2024 "Neighborhood Favorite" badges show it was operating by then. So it opened in or before spring 2023.

**Owner, chef, founding story:** not found. The about page was not retrievable. This is a gap.

**Cuisine** (likely, inferred from dishes):
- Telugu/Andhra and Hyderabad leaning: Gongura Mutton Pulav, Karampodi Chicken, Chicken 555, Goat Dum Biryani.
- North Indian tandoor and curries: Butter Chicken, Tikka Masala, Vindaloo.
- Indo-Chinese: Gobi Manchurian, Chilli Paneer.
- The catering page says "North Indian and South Indian".
- DoorDash-style tags add "American / Asian".

**BYOB / alcohol:** listings say BYOB, with "bring your own beer on weekends" (likely). No alcohol licence was found. **Halal:** no evidence, so make **no** halal claim (unverified). **Buffet:** no evidence (unverified). **Seating capacity:** not found. **Dining style:** self-service or counter, per a Yelp summary (likely). "Ample parking" was listed (likely).

**Prices** (from Allmenus, undated and probably stale, so not verified): Chicken Dum Biryani $10.99, Butter Chicken $11.49, Goat Curry $13.49, Chicken 65 $8.49. Do not use them in designs.

## 3. NAP and brand-consistency issues
1. **Three phone numbers**, as above. The 972 number sits on the Grubhub-family listing.
2. **Address formats** vary: "FM-423, Suite #200", "FM 423 #200", "FM423" with no suite (Allmenus). Wheree files it under "Denton County".
3. **"Frisco" vs Little Elm:** the Facebook and Instagram handle and site copy say Frisco, while every address says Little Elm.
4. **Two emails:** `currydistrict@gmail.com` and `info@currydistrict.net`.
5. **Three conflicting blurbs.** All three read as template boilerplate with typos ("amability", "hospitability").
   - "traditional food house… specialized for our local community"
   - "shared dining… small plates"
   - "flavoursome international recipes… homestyle cooking"
6. **Category drift:** "Indian" vs "Indian / American / Asian fusion".
7. **Ordering sprawl:** Clover, gotoeat, Uber Eats, DoorDash, Grubhub, Postmates, Caviar. Review counts are fragmented (Tripadvisor 0, Facebook 14, Yelp 120, Restaurantji 479, Guru ~1,021).
8. **Generic page titles** ("Curry District" on every page, with no city or cuisine) hurt local SEO.

## 4. Scorecard (0–10; all design scores inferred)

| Dimension | Score | Evidence | Confidence |
|---|---|---|---|
| Website visual appeal | **3** | Owner calls it dull. Static `.html` multi-page structure suggests an off-the-shelf template. Copy is boilerplate and typo-ridden. Nothing was seen visually. | Low–med |
| Mobile UX | **4** | Separate static pages, and ordering on a different domain (Clover). Responsiveness is unknown. | Low |
| Photo quality | **4** | Owner says dull. Yelp (45) and Restaurantji (52) photos are mostly user-submitted. No pro imagery was seen. | Low |
| Brand consistency | **3** | Items 3, 5 and 6 above, plus no unified palette or voice across channels. | Medium |
| Social activity | **3** | Facebook: 1,164 followers and 14 ratings, with no post dates seen. Instagram unverified. | Low–med |
| GBP completeness | **6** | Hours, phone, website, BYOB and parking propagate widely, and review volume is strong (inferred ~4.2 on ~1,000). Photos, posts, menu and products were not seen. | Low |

## 5. Gaps for the next pass
Google Business Profile photo and post audit, Instagram bio and cadence, the about-page founding story, the Clover ordering page, the true primary phone, and whether Yelp and Google carry the 5856 number.

Sources: https://currydistrict.net/ · /contact.html · /catering.html · /doordelivery.html · /about.html · https://www.yelp.com/biz/curry-district-little-elm · https://www.restaurantji.com/tx/little-elm/curry-district-/ · https://restaurantguru.com/Curry-District-Little-Elm · https://www.allmenus.com/tx/little-elm/815011-curry-district/menu/ · https://www.facebook.com/CurryDistrictFrisco/ · https://www.tripadvisor.com/Restaurant_Review-g56175-d25509526-Reviews-Curry_District-Little_Elm_Texas.html · https://www.ubereats.com/store/curry-district/uWXzS9FzRBqEC8dXe5241w · https://www.doordash.com/en-CA/store/curry-district-little-elm-900790/ · https://nextdoor.com/pages/curry-district-little-elm-tx/ · https://www.atly.com/location/CurryDistrict · https://currydistrict.gotoeat.net/ · https://curry-district.wheree.com/ · https://www.snapchat.com/place/curry-district/83135df2-e7d3-11ed-8339-d73af9f0c002 · https://www.yelp.com/biz/desi-district-little-elm-frisco

## Quick wins
1. Lock one primary phone, (469) 200-5856, and ask Grubhub and Allmenus to remove (972) 787-1320.
2. Claim the Tripadvisor listing and add photos. It currently has zero reviews.
3. Replace the Google Business Profile cover and 10 or more gallery photos with bright, saturated shots of marigold-lit dishes.
4. Rewrite the site's three blurbs into one confident line. Fix the typos and drop "shared dining" and "international".
5. Give every page a unique title carrying "Indian Restaurant Little Elm TX" plus the dish or page name.
6. Clarify "Frisco" vs Little Elm. Use "Little Elm (near Frisco)" everywhere and keep the Facebook and Instagram handles as they are.
7. Collapse ordering to one primary "Order" button (Clover) with a single delivery-apps row. Retire or redirect gotoeat.
8. Standardise the address ("11851 FM 423, Suite 200") and a single email across all listings.
9. Launch a weekly Instagram and Facebook rhythm of colourful dish reels, a biryani-day post and a BYOB-weekend post. Verify the Instagram handle first.
10. Ask owners to confirm and publish the facts we couldn't verify (founder story, halal status, buffet, capacity, happy hour) and add them to the About page and Google attributes.
