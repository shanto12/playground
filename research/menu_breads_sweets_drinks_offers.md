# Curry District: breads, rice, desserts, drinks and offers (research summary)

Researched 2026-10-04. Data file: `menu_breads_sweets_drinks_offers.json`.

**Method limits.** Every direct page fetch was blocked by the egress proxy, and the session WebSearch budget (200) ran out after about 20 targeted queries. All findings are AI-summarised search snippets. No price reached "high" confidence.

## Found

| Category | Item | Price seen | Confidence |
|---|---|---|---|
| Breads | Garlic Naan | $3.49 (a $3.75 listing also seen, probably delivery) | medium |
| Breads | Butter Naan | $2.79 (alt $2.99) | medium |
| Breads | Plain Naan | $1.99 (alt $2.49) | medium |
| Breads | Roti / Chapati (2) | $1.99 | low |
| Breads | Bullet Naan, Paratha (2) | $3.75 / $4.99, possibly another restaurant | low, price null |
| Rice | Plain Rice (Basmati) | $1.99 | low |
| Rice | Family Packs: Chicken Dum Biryani and Chicken 65 Biryani | $47.79 each | low |
| Rice | Family Pack: Chicken 65 Pulav | $42.99 | low |
| Rice | Fried Rice (Indo-Chinese) | variants and prices unknown | medium |
| Desserts | Gulab Jamun, Rasmalai, Carrot Halwa | two conflicting lists ($2.99 to $3.99 vs $4.99), price null | medium |
| Desserts | Rice Kheer, Ice Cream | $2.99 on one list | low |
| Desserts | Rabidi Jamun, Kala Jamun, Apricot Delight | $4.99, $5.99, $5.99 on one list | low |
| Beverages | Mango Lassi | $2.99 / $3.99 / $4.99 (conflict), price null | medium |
| Beverages | Sweet Lassi, Mango Milkshake, Chikku Shake, Sitaphai Shake, Badam Milk, Butter Milk | names only | low |
| Beverages | Tea / Chai (Hot Beverages) | unknown | medium |

Biryanis and pulavs are listed in the JSON only as cross-reference, with prices null because the seen values look stale or delivery-app based.

## Offers

- **Weekend Family Pack:** family biryani and pulav packs come with a free appetizer and dessert, chef's choice. This is confirmed on the official site category summary; the prices above come from one delivery listing.
- **Biryani's Combo Offer:** Tuesday and Wednesday only (DoorDash). A third-party page lists "Wednesday Special: any 3 biryanis $25.99" (one source, not cross-checked).
- **Lunch:** a "Lunch Box" section exists on DoorDash with no contents or price. No lunch buffet or thali found.
- **Catering:** a catering page exists on the official site (unreadable). Sulekha describes outdoor catering and pre-booked large-group platters, but no tray prices.
- **Happy hour:** weekdays 4 to 7 PM (Atly, business.json). What is discounted was not found, and the 4 PM start conflicts with dinner service reopening at 4:30 PM. Treat as unverified.
- **Kids menu:** not found.
- **Delivery:** Uber Eats, DoorDash (Caviar mirror, legacy Postmates link) and Clover online ordering. Minimum order and fees were not found. A BYOB-on-weekends mention is unverified and low confidence.

## Not found (left null, nothing invented)

Sodas and bottled drinks, salt lassi, other lassi flavours, current dessert prices, happy-hour discounts, catering price list, kids menu, delivery fees.

## Caveats

- The Instagram and Facebook handles say "CurryDistrictFrisco", so some aggregator data may come from a sister location or an older menu, which could explain the dessert and lassi price conflicts.
- Diet labels are inferred from the dish type. Make no halal, vegan or gluten-free claims.
- Suggested next step: get the current menu PDF from the owners.
