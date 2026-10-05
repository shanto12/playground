# `data/menu.json`: menu data for both concept sites

`menu.json` is the single source both websites (A · Bazaar, B · Royal) render. It was built from `data/menu.skeleton.json` (107 rows merged from public listing snippets), which is kept unchanged for traceability. **Nothing in it is confirmed by the owners.** Names, diet marks, spice levels, portions and offers are research-based or estimated, so every page that renders the menu must show `meta.disclaimer`.

Version 1.0 · 2026-10-05 · 105 items in 8 zones (2 near-duplicates merged, nothing dropped).

---

## 1. Top-level shape

```jsonc
{
  "_note": "...",          // provenance, not for display
  "meta":  { ... },        // settings, legal copy, zones, scales, collection labels
  "items": [ ... ],        // 105 dishes, in skeleton order (grouped by source, not by zone)
  "collections": { "<id>": ["item-id", ...] },   // curated shortcuts
  "offers": [ ... ]        // cleaned, unverified offers
}
```

`offers_raw` from the skeleton was **dropped on purpose**. It contained happy-hour and BYOB notes that must not be published. The research text is still in the skeleton and in `research/`.

## 2. `meta`

| Field | Type | Notes |
|---|---|---|
| `version`, `updated` | string | |
| `showPrices` | `false` | **Never render prices.** Sources conflict by 25–35%. Keep `false` until the owners confirm the live menu. |
| `disclaimer` | string | Show near any menu listing: *"Menu shown is a design concept built from public listings; dishes, spice levels and prices to be synced with the live menu."* |
| `allergenNote` | string | Show in the menu footer and on any dish detail sheet. |
| `spiceNote` | string | Show next to the spice legend. |
| `spiceScale` | `[{level, label}]` | 0 Not spicy · 1 Mild · 2 Medium · 3 Hot · 4 District Hot. Maps onto the brand's chilli-icon set: 0 = no icon, 1–4 = 1–4 chillies (use the "District Hot" icon for 4). |
| `dietLegend` | `{veg, nonveg, egg}` | Labels for the green-square, red/brown-square and egg marks. |
| `dietNote` | string | Short caveat that diet marks are pending kitchen confirmation. |
| `artKeys` | string[] | The 12 valid illustration keys (see §5). |
| `zones` | array | `{id, name, tagline, tagline_bazaar, tagline_royal, art}`. `tagline` is the neutral original. `art` is the zone's **header** illustration, not a per-dish fallback (see §5). Order = display order. |
| `collections` | array | Labels for the shortcuts: `{id, name, tagline_bazaar, tagline_royal}`. Same ids as the top-level `collections`. |

Zone ids: `starters` (Starters Square), `tandoor` (Tandoor Quarter), `curry` (Curry Quarter), `biryani` (Biryani Boulevard), `indochinese` (Indo-Chinese Alley), `bread` (Bread Bazaar), `sweets` (Sweet Street), `chai` (Chai & Coolers).

## 3. Item schema

| Field | Type | Meaning / render rule |
|---|---|---|
| `id` | string | Stable key, **identical to the skeleton id**. The only exception is `sitaphai-shake`, which keeps its id although the display name is corrected. Don't rename ids, because collections and offers reference them. |
| `name` | string | Clean Title Case display name. Portions and "(Weekend)" moved out to their own fields. |
| `aliases` | string[] | Old or alternate spellings (e.g. "Chana Masala", "Gajar Halwa", "Rabri Jamun"). Use them for search; don't display them. |
| `zone` | zone id | |
| `diet` | `"veg"` \| `"nonveg"` \| `"egg"` | Every value is inferred from the dish type. None is stated by the restaurant. |
| `diet_estimated` | bool | `true` where the skeleton had `null` and the copywriter chose a value (6 items, see §7). |
| `spice` | int 0–4 | **Estimate** for the dish as usually made. |
| `spice_estimated` | `true` | Always true until the owners confirm. Show it, e.g. with a tooltip linking to `meta.spiceNote`. |
| `popular` | bool | Drives the "Fan favourite" badge. True for 8 items only (see §6). |
| `art` | art key \| `null` | Illustration to show with the dish. `null` = no fitting illustration (see §5). |
| `desc_neutral` | string, ≤16 words | Factual definition of the dish as normally made. Use it for alt text, SEO, screen readers and print. |
| `desc_bazaar` | string, ≤14 words | Bazaar voice: loud, playful, light Hinglish. |
| `desc_royal` | string, ≤14 words | Royal voice: sensory and refined. |
| `portion` | string \| `null` | e.g. `"7 pcs"`. Only set where a listing gave a count. |
| `served_with` | `"white rice"` \| `null` | From listings: the veg curries are served with white rice. Non-veg curries are unknown, so `null`. |
| `availability` | string \| `null` | Only `goat-dum-biryani` has a value: `"Weekends only"`. Render it as a small badge. |
| `status` | `"listed"` \| `"unconfirmed"` | `unconfirmed` = the source may be another restaurant or an outdated menu. **Hide these by default**, or show them only with a "to be confirmed" note. They are never used in collections. |
| `merged_from` | string[] | Skeleton ids folded into this item. |
| `tags` | string[] | Research or provenance tags from the skeleton (`fried`, `gongura`, `signature`, `weekend-only`, `single-source`, `generic-description`, …). The skeleton's `popular` tag was removed: use the `popular` boolean instead. Don't render tags as badges, apart from `signature` if a design wants it. |
| `desc_src` | string | Original research snippet. Not for display. |
| `price` | number \| `null` | Exactly as in the skeleton. Not to be displayed while `showPrices` is false. |
| `price_confidence` | `"high"` \| `"medium"` \| `"low"` | Exactly as in the skeleton. |

### Copy rules the descriptions follow (keep to them when editing)
No halal, vegan, gluten-free, organic, "authentic", "family recipe", origin stories, health claims or prices. The copy names no ingredient a dish wouldn't normally contain, and stays generic when unsure. Cardamom is mentioned only where a source mentions it (Rasmalai, Mango Lassi). Hinglish used: *ekdum, chalo, garma-garam, chatpata, masaledaar, dhamaka, zabardast, arre wah, kya baat hai, yaar, thanda/thandi, meetha, mast, bas, ek aur, chai-lo*. Telugu used, and explained: *karam, podi, kodi, vepudu*.

## 4. `collections` and `offers`

**Collections** are object keys mapped to arrays of item ids, in display order. All of them use only `status: "listed"` items.

| id | Size | Rule |
|---|---|---|
| `first-timers` | 8 | Crowd-pleasers, mostly spice 0–2, with veg options included. |
| `fire-lovers` | 12 | Spice 3–4 only, including 2 veg options. |
| `veg-heaven` | 12 | `diet: "veg"` only. |
| `share-the-table` | 9 | Starters, breads and biryani, for 2–4 people. |
| `sweet-finish` | 7 | Sweets plus mango lassi and chai. |

**Offers:** `{id, kind: "deal"|"menu"|"service", title, detail, line_bazaar, line_royal, days, item_ids, also_mentions, source, verified: false}`. They contain only facts from `research/menu_breads_sweets_drinks_offers.md`:
1. `weekend-family-pack`: family biryani and pulav packs come with a free appetizer and dessert, chef's choice.
2. `biryani-combo-tue-wed`: a biryani combo on Tuesdays and Wednesdays. What's included is unknown.
3. `lunch-box`: a Lunch Box section exists online. Contents are unknown.
4. `catering`: outdoor catering and pre-booked large-group platters.

The happy hour, BYOB, kids menu and the third-party "$25.99 for 3 biryanis" are **deliberately omitted**. Every offer is `verified: false`, so mark offers "to be confirmed" in the pitch, and never show `source` publicly.

## 5. Art mapping

Keys: `butter-chicken, biryani, tandoori-platter, garlic-naan, samosa-chutney, paneer-tikka, chilli-chicken, thali, dal-saag, gulab-jamun, mango-lassi-chai, chaat`.

- `biryani`: all 14 biryanis and pulavs (not plain rice).
- `tandoori-platter`: tandoori chicken, chicken tikka, malai chicken, lamb seekh, lamb chop.
- `paneer-tikka`: paneer tikka kabab, malai paneer kabab, paneer tikka masala.
- `butter-chicken`: butter chicken, chicken tikka masala.
- `chilli-chicken`: chilli chicken, chicken manchurian, chicken 65, chicken 555.
- `dal-saag`: dal thadaka, dal makhani, palak paneer, saag chicken.
- `garlic-naan`: garlic, butter, plain and bullet naan. `gulab-jamun`: gulab, kala and rabidi jamun. `mango-lassi-chai`: mango lassi, sweet lassi, mango milkshake, chai. `samosa-chutney`: veg samosa.
- `thali` and `chaat` are used by no dish. No thali or chaat was found on the menu. `thali` is the Curry Quarter's zone header art.
- **61 items are `null` on purpose.** No chicken illustration is placed on a veg dish, and no samosa illustration on pakora. For `null`, render a typographic or pattern tile (zone colour plus diet mark). Don't substitute `zone.art`: for example, the Indo-Chinese zone art is chilli chicken, which would wrongly put chicken on veg dishes.

## 6. Editorial decisions

- **Popular (8):** Butter Chicken, Chicken Tikka Masala, Chicken Vindaloo, Tandoori Chicken, Chicken Tikka Kabab and Garlic Naan come from the sourced `popularDishes`. **Chicken Dum Biryani** was added because biryani is the most-praised category in reviews (7 of 16 summaries) and it is one of the two biryanis sold as a family pack. **Chicken 65 Biryani** was added rather than the Chicken 65 *starter*: the research tags the biryani as popular, and reviews name "Chicken 65 pulav". Nothing in the research singles out the starter. Mango Lassi lost its research "popular" tag to keep the list tight.
- **Merged:** `vegetable-dum-biryani` was merged into `veg-biryani`, and `goat-biryani` into `goat-dum-biryani`. In each case the same dish appeared under two listing names.
- **Renamed:** "Veg Samosa (3 pcs)" became Veg Samosa (portion moved to its own field). "Goat Dum Biryani (Weekend)" became Goat Dum Biryani (availability field). "Plain Rice (Basmati)" became Plain Basmati Rice. "Roti · Chapati (2 pc)" became Roti / Chapati. "Paratha (2 pc)" became Paratha. "Carrot Halwa (Gajar Halwa)" became Carrot Halwa. "Sitaphai Shake" became **Sitaphal Shake** (typo). "Butter Milk" became Buttermilk. "Tea · Chai" became Chai.
- **Regional spellings kept on purpose:** Dal Thadaka, Channa Masala, Kurma (goat and lamb) versus Korma (paneer), Rabidi Jamun, Chikku Shake, Phool Makhna, Rajugaari, Kadai.

## 7. Assumptions that need owner confirmation

1. **Whole menu:** the item list is reconstructed from aggregator snippets, some of which may be stale or from the "Frisco" handle. Ask for the current Clover export or a menu PDF and re-sync names, ids and zones.
2. **Spice levels (all 105):** estimates. The highest (4) are the three Vindaloos, Andhra Goat Curry, Andhra Lamb Curry, Karampodi Chicken and Kodi Vepudu. Chicken Tikka Kabab is rated 3 because reviewers call it "very spicy", and one review says even "Mild" is hot. Also confirm that dishes can be ordered mild, medium or spicy (`meta.spiceNote`).
3. **Diet marks resolved from unknown:** Pakora (veg), Hot & Sour Soup (veg base assumed; it may be chicken or egg), Bullet Naan (veg), Paratha (veg), Ice Cream (veg), Apricot Delight (veg; recipe unknown).
4. **Hidden egg or dairy:** naan dough, Indo-Chinese batters (Gobi 65, Manchurian, chilli dishes), Chicken 65 batter, ice cream and Apricot Delight can contain egg. Confirm so the "veg" mark is accurate for egg-free vegetarians.
5. **Unconfirmed items:** Bullet Naan and Paratha (one snippet, possibly another restaurant), and Lamb Seekh and Lamb Chop Kabab (older listing only, possibly discontinued).
6. **Merges:** confirm that "Goat Biryani" is the weekend Goat Dum Biryani and that "Vegetable Dum Biryani" is the Veg Biryani. Confirm whether Goat Dum Biryani is truly weekends-only.
7. **Missing item:** Chicken 65 Pulav appears in the family-pack listing and in reviews but not in the skeleton. Add it once confirmed. Also missing: the breakfast menu (Idly, Vada, Dosa, Puri), which the official site mentions but which wasn't researched.
8. **Recipe assumptions in the neutral copy:** Chicken Dum Biryani and Goat Dum Biryani (dum-sealed), Tandoori Chicken (bone-in, 6 pcs), Chicken Tikka Kabab and the Malai kababs (boneless, 7 pcs), Goat Pepper Fry (bone-in, from listing), "mutton" in the Gongura pulav (goat assumed), Rogan Goat Curry (a red rogan gravy), Afghani curries (creamy white gravy with black pepper), Kurma/Korma (mild and creamy), Saag Chicken (leafy greens, not specified as spinach), Apricot Delight ("stewed apricots" only), Chai (milk and sugar; no masala claimed).
9. **Served with white rice:** listings say this only for the veg curries. Confirm whether the non-veg curries also come with rice (`served_with` is `null` for them now).
10. **Portions:** Veg Samosa 3, Tandoori Chicken 6, Chicken Tikka, Malai Chicken, Paneer Tikka and Malai Paneer Kabab 7 each, Roti 2, Paratha 2. Gulab Jamun "3 pc" was seen on only one conflicting list, so it was left `null`.
11. **Popular flags:** the 8 above, especially Chicken Dum Biryani and Chicken 65 Biryani, which were inferred from review and family-pack evidence.
12. **Offers (all `verified: false`):** whether the family pack is weekend-only and which packs it covers; the contents of the Tue/Wed biryani combo; the contents and hours of the Lunch Box; catering details. Happy hour stays off every page until the owners define it.
13. **Spellings to confirm:** Sitaphal (source said "Sitaphai"), Chikku, Rabidi, Rajugaari, Channa, Phool Makhna, Dal Thadaka.
14. **Prices:** only 8 rows carry a price (the six high-confidence veg curries, Tandoori Chicken and Chicken Tikka Kabab). Keep `showPrices: false` until the owners confirm the full list.

## 8. Re-validate after any edit

```bash
python3 - <<'EOF'
import json; from collections import Counter
d=json.load(open('data/menu.json')); m=d['meta']; A=set(m['artKeys']); Z={z['id'] for z in m['zones']}
ids=[i['id'] for i in d['items']]; assert len(ids)==len(set(ids)), 'dup ids'
for i in d['items']:
    assert i['zone'] in Z and i['diet'] in ('veg','nonveg','egg') and 0<=i['spice']<=4, i['id']
    assert i['art'] is None or i['art'] in A, i['id']
    for k,n in (('desc_neutral',16),('desc_bazaar',14),('desc_royal',14)): assert len(i[k].split())<=n, (i['id'],k)
for c,l in d['collections'].items(): assert all(x in ids for x in l), c
assert m['showPrices'] is False and all(o['verified'] is False for o in d['offers'])
print('OK', len(ids), 'items')
EOF
```
