# Curry District — Brand Glow-Up: your pitch guide  *(private — don't share this file)*

## The three live links (open on your phone)
| What | URL |
|---|---|
| **Pitch hub** (start here) | https://curry-district-pitch.netlify.app/ |
| **Website A · Bazaar** (loud, joyful, colourful) | https://curry-district-bazaar.netlify.app/ |
| **Website B · Royal** (jewel-toned, premium) | https://curry-district-royal.netlify.app/ |

All three are `noindex` (Google won't list them) and every page says *"Independent design concept prepared as a proposal — not the official Curry District website."* Add your own name/phone to the hub by editing `hub/assets/config.js` (studio, phone, email, WhatsApp, calendarLink) and redeploying — buttons stay hidden until filled.

## A 5-minute demo flow on a phone
1. **Hub home** → *What we found* (audit) — start with praise: ≈1,000 Google reviews at ≈4.2, Uber Eats ≈4.5 with 2,000+ ratings. "Your food already has the fans; your look should keep up."
2. **Tap Website A, then B** — let them scroll the menu, tap *Pick your fire*, and see "Open now" update live. Ask: *which one feels like you?* (the Brand Kit page has a 6-question quiz and a "Your pick" saver).
3. **Packaging** — tap a box, then *Spin the bag*. This is the hook: "your food arrives in your brand."
4. **Interiors** — before → after sliders (the room is *illustrative*, say so), wallpaper options, murals and neon.
5. **Top 10** page — let them add ideas to *My plan*; it generates a shareable, price-free plan and a suggested rollout order.
Then ask for the small first step (Google profile + photo day, or stickers + stuffer card). See `PRIVATE_pitch_and_pricing_playbook.md` for pricing tiers, objections and the pitch script.

## What's in the hub (14 areas)
Audit · Benchmarks (how big chains do it) · Brand kit + quiz · Packaging (72 pieces + 3D viewer) · Interiors (wallpaper, paint, murals, neon) · Menu & table design · Google Business makeover · Social kit (80+ posts/stories/covers) · Motion reels (MP4s) · Signage & storefront · Merch & uniforms · Loyalty, catering & print (+ tap-to-stamp demo) · Festival calendar · "Plan your table" planner · **Top 10 ideas**.

## Honest limits (say these out loud — it builds trust)
- Built from **public listings only**; we never saw their logo, photos or analytics. Logos are new concepts.
- **No real photos** — all art is original illustration. A photo shoot is one of the proposals.
- Menu names come from listings; **no prices** are shown (sources conflict); spice levels are estimates.
- Phone/hours/handles are *likely*, not confirmed. Full list: `docs/OPEN_QUESTIONS.md`.
- Catering forms are demo-only: nothing is sent or stored.
- Ask permission before anything is public; take the sites down immediately if they say no.

## Re-deploying (for edits)
```bash
scripts/stage.sh /tmp/cd-dist           # copies the 3 sites without QA/scratch folders
python3 scripts/optimize-stage.py /tmp/cd-dist/hub   # big PNGs -> WebP in the deploy copy only
python3 scripts/check-links.py /tmp/cd-dist          # finds broken links / manifest paths
# then deploy each folder with the Netlify CLI or the Netlify MCP deploy command
```
Site IDs: hub `7ae2047f-3eb8-4e9e-88c1-ea91f753943a`, bazaar `d7e9dcc1-f1a4-449d-afad-3c4845be5e92`, royal `4b5eb1b9-4960-40e0-9792-3500bd38c8df`.

## Source layout
`research/` (14 research reports) · `brand/` (logos, patterns, icons, dish illustrations, hero scenes, fonts, motion kit) · `data/` (business facts, menu.json, copy.json) · `sites/bazaar`, `sites/royal` (static sites) · `hub/` (pitch hub; one folder per area, manifest-driven galleries) · `docs/` (this guide, open questions, private pricing playbook, agent rules).
