# Curry District copy bank: how to use `data/copy.json`

The ready-to-use copy for both brand directions. The two website leads and the pitch hub pull from it. Everything in it is written to the truth rules in `docs/AGENT_RULES.md`, and validated with python3: JSON parses, word limits hold, banned terms are absent and SEO titles are unique.

## Structure

```
_meta        sources, rules, word limits, status legend
shared       facts (address, phone, hours, links, menu zones), conceptDisclaimer, ratings
bazaar       A · BAZAAR voice (playful, loud, light Hinglish)
royal        B · ROYAL voice (warm, sensory, confident)
hindiBits    10 phrases for the Bazaar voice, with usage rules
devanagari   करी डिस्ट्रिक्ट accent, with spelling and font notes
```

Both `bazaar` and `royal` have the same keys: `voice` (do/don't), `heroHeadlines` (8, ≤8 words), `heroSubs` (6, ≤22 words), `taglines` (8), `ctas`, `sectionIntros` (menu, story, catering, visit, reviews, gallery, order, faq; each has a headline and a 28–45-word body), `aboutStory`, `cateringCopy`, `visitCopy`, `faq` (8), `microcopy`, `seo` (home, menu, catering, visit), `socialCaptions` (12) and `reviewThemes`.

## Rules for using it

1. **Use one voice per site.** Don't mix Bazaar and Royal lines on the same page. The pitch hub can show both side by side as long as each is labelled.
2. **Taglines.** Each voice includes the exact utility line `Indian Kitchen · Little Elm, TX`. Use it for headers, footers and favicon lockups.
3. **What each CTA group is for:**

   | Group | Use it for | Link it to |
   |---|---|---|
   | `primary` | Main hero button | `shared.facts.links.orderOnline` (Clover pickup) |
   | `secondary` | Second hero button | The menu |
   | `ordering` | Order section and delivery-app row | Clover, Uber Eats, DoorDash |
   | `call` | Call buttons | `tel:` + `shared.facts.phone.tel` |
   | `directions` | Directions buttons | `shared.facts.links.directions` |
   | `catering` | Catering buttons | Catering form or call |

   Pick one variant per button. Never put a Hindi phrase on a button by itself.
4. **Hours status.** The strings in `microcopy.hoursStatus` use a `{time}` placeholder. The restaurant runs two services a day, so the closed gap between lunch and dinner gets `betweenServices`, not `closedNow`. The time blocks to compute from are in `shared.facts.hours[].blocks` (24-hour clock, America/Chicago). The hours are only *likely*, so always show `hoursCaveat` next to the open/closed badge.
5. **Reviews.** `reviewThemes.bullets` are paraphrases and every one is marked `verbatim:false`. Never style them as quotes: no quotation marks, no names, no star icons beside them. Show `disclaimer` underneath. Each rating carries the label "as listed publicly in Oct 2026", and that label must stay visible. The Google figure is inferred (≈4.2, about 1,000 reviews) because it was read from Restaurant Guru.
6. **FAQ.** Each answer has a `factStatus` and a `basis`. Answers to unverified topics (halal, buffet/happy hour, capacity) start with "Please call us to confirm". Don't change that wording.
7. **About story.** `aboutStory.placeholder_for_owner_story` is `true`. Render `ownerStorySlot` only on the pitch hub, as a visible "owner story goes here" callout. Never render it on a site page as if it were real copy.
8. **Footer.** Every page must carry `shared.conceptDisclaimer`. `microcopy.footer.cookieLine` is a playful extra line. It is accurate only if the site really sets no cookies.
9. **Hindi.** Follow `hindiBits.rules`: one phrase per screen at most, an English gloss the first time it appears, `lang="hi-Latn"` on Romanized spans and `lang="hi"` on Devanagari spans. Bazaar only; Royal is English-only.
10. **Glyphs and fonts.** The brand font files are **Latin-only subsets**:
    - **Devanagari** won't render in brand fonts. To use the Devanagari accent, vendor a Devanagari face (OFL) through npm `@fontsource`, e.g. Yatra One or Rozha One for display, or Noto Sans Devanagari for text. Subset it to the glyphs you need.
    - **≈ (in the Google rating) and emoji** fall back to system fonts.
    - **Arrows (→).** I avoided them because they fall outside the subset.
11. **Typography and spelling.** Curly quotes and apostrophes are already applied. Spelling is **US** (flavor, neighborhood, favorite), which suits a Texas audience. `BRAND.md` and the menu-skeleton zone taglines use UK spelling (flavour, favourites), so align them before launch.
12. **SEO.** All eight titles are unique and contain "Indian Restaurant Little Elm TX". Concept pages must still carry `noindex,nofollow` (Rule 6).
13. **Social.** Captions use 0–2 emoji (Bazaar) or 0–1 (Royal), plus 4–5 hashtags. Read any `factCheck` note before posting. The Diwali captions need a verified date. Gulab Jamun is listed at medium confidence.

## Guardrails applied (don't undo them)
- **Claims:** no halal, vegan, gluten-free, "authentic", "traditional", family-recipe, award or "best" claims. The Nextdoor "Neighborhood Favorite" badge is not used.
- **Prices and offers:** no prices, happy hour, buffet, specials or Weekend Family Pack offer anywhere outside the call-to-confirm FAQ.
- **Drinks:** no alcohol or BYOB mention.
- **Ingredients:** no claims beyond what a dish's name implies. For example, there is no saffron or cardamom because the recipes are unknown.
- **Hours:** stated only as the publicly listed (likely) hours, always with a call-to-confirm caveat. No "open daily" or "open late" promises.
- **Scarcity:** no "selling out", "today only" or "limited" lines.
- **Unconfirmed details:** "counter service" and "ample parking" are *likely* facts. Neither voice mentions Goat Dum Biryani, which may be weekend-only.

## Open questions for the owners
1. **Owner story.** Who cooks, where the dishes come from, how Curry District began. This fills `aboutStory.ownerStorySlot`.
2. **Phone.** Is (469) 200-5856 the primary line? (469) 200-5944 is secondary. Retire (972) 787-1320.
3. **Hours.** Confirm them. Yelp shows Saturday straight through and Sunday closing at 9:30.
4. **Unverified details.** Halal status, a lunch buffet, happy hour and what it includes (a 4 PM start conflicts with the 4:30 PM dinner reopen), seating capacity and large-party policy, and the BYOB policy.
5. **Dine-in style.** Is it still counter service? Several lines say "order at the counter".
6. **Catering.** Pickup, delivery or setup? How much notice is needed? What platter formats are available? The copy is deliberately generic.
7. **Family packs.** Are the family-size biryani/pulav packs and the weekend free appetizer and dessert offer current? Reviews love them, but the copy mentions them only in `reviewThemes`.
8. **Instagram handle.** Is `@currydistrictfrisco` correct, and should "Frisco" stay in the handles when the address is Little Elm? The copy uses "Little Elm, near Frisco".
9. **Language.** The kitchen leans Telugu/Andhra. Would the owners like a few Telugu phrases alongside, or instead of, the Hindi bits? A native speaker should sign off on all phrases before print.
10. **Review fragments.** Four quote fragments appear in `research/reviews_sentiment.md`, unattributed. They are not used. To use real testimonials, pull them from Google or Yelp with the reviewer's name and date.
11. **Grubhub.** The copy names Grubhub as a delivery option, but there is no Grubhub link. Add the link or drop the mention.
