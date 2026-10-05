// Composites built from the rendered kit: 3×4 feed grid in a neutral phone frame,
// and the 4-week "feed rhythm" board (from research/social_gbp_playbook.md §C).
const L = require('./lib');
const { C, icon, logo, page, furl, KIT } = L;

const img = f => furl(KIT + '/' + f);
// checkerboard: bright / dark alternating (newest top-left)
const GRID = [
  ['post-01-hero-dish.png', 0], ['post-06-order-online.png', 0], ['post-04-daily-special.png', 0],
  ['motion-01-steam.jpg', 1], ['post-05-ratings.png', 0], ['post-03-spice-meter.png', 0],
  ['post-07-catering.png', 0], ['post-08-did-you-know-dum.png', 0], ['post-09-staff-pick.png', 0],
  ['post-02-zone-biryani-boulevard.png', 0], ['motion-02-spice-burst.jpg', 1], ['motion-03-special-wipe.jpg', 1],
];
const HLS = [['menu', 'Menu'], ['biryani', 'Biryani'], ['tandoor', 'Tandoor'], ['curry', 'Curry'], ['sweets', 'Sweets'], ['catering', 'Catering']];

const SW = 948; // screen width
const grid = {
  id: 'grid-preview-phone', file: 'grid-preview-phone', w: 1200, h: 2560, type: 'image', stage: 3, tags: ['grid'],
  title: 'Feed grid · 12 posts in a phone',
  caption: 'The 9 posts plus 3 motion posters, cropped to the 3:4 profile grid: bright and dark tiles alternate into one colourful checkerboard.',
  html: () => page({ w: 1200, h: 2560, bg: C.cream, title: 'Feed grid preview', css: `
    .bgp{position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,#FFE7B8,${C.cream} 70%)}
    .ttl{position:absolute;left:0;right:0;top:40px;text-align:center}
    .ttl h1{font-size:64px;color:${C.ink}} .ttl p{font-size:28px;font-weight:700;color:${C.muted};margin-top:10px}
    .ph{position:absolute;left:${(1200 - SW - 52) / 2}px;top:210px;width:${SW + 52}px;height:2300px;background:#16131F;border-radius:120px;box-shadow:0 0 0 6px #3B3550,24px 30px 0 rgba(29,17,71,.18)}
    .scr{position:absolute;left:26px;top:26px;width:${SW}px;height:2248px;background:#fff;border-radius:96px;overflow:hidden;font-family:'DM Sans',sans-serif;color:#17151F}
    .notch{position:absolute;left:50%;top:22px;width:170px;height:48px;border-radius:30px;background:#16131F;transform:translateX(-50%)}
    .sb{height:96px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 70px 14px;font-weight:700;font-size:28px}
    .sb i{display:inline-block;width:46px;height:22px;border:3px solid #17151F;border-radius:6px;position:relative;vertical-align:-3px;margin-left:12px}
    .sb i::after{content:"";position:absolute;inset:3px 8px 3px 3px;background:#17151F;border-radius:2px}
    .sb b{display:inline-block;width:8px;margin-left:5px;background:#17151F;border-radius:2px;vertical-align:bottom}
    .ab{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 34px;font-weight:800;font-size:32px}
    .ab .dots{letter-spacing:3px;font-size:34px}
    .pr{display:flex;gap:30px;align-items:center;padding:6px 34px 18px}
    .pr img{width:132px;height:132px;border-radius:50%;border:3px solid #E3DFEA}
    .pr .n{font-weight:800;font-size:31px} .pr .b{font-size:24px;color:#4A4658;margin-top:4px;line-height:1.3}
    .pr .lk{font-size:24px;color:#2F5FD0;font-weight:700;margin-top:2px}
    .btns{display:flex;gap:12px;padding:0 34px 20px}
    .btns span{flex:1;height:58px;border-radius:14px;background:#EFEDF3;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:24px}
    .hls{display:flex;gap:26px;padding:4px 34px 20px;overflow:hidden}
    .hl{display:flex;flex-direction:column;align-items:center;gap:8px;flex:none}
    .hl div{width:112px;height:112px;border-radius:50%;border:3px solid #D9D6E3;padding:5px}
    .hl div span{display:block;width:100%;height:100%;border-radius:50%;background-size:100% auto;background-position:50% 50%}
    .hl em{font-style:normal;font-size:21px;font-weight:600}
    .tabs{height:62px;display:flex;border-top:2px solid #EFEDF3}
    .tabs span{flex:1;display:flex;align-items:center;justify-content:center}
    .tabs span.on{border-bottom:3px solid #17151F}
    .g{display:grid;grid-template-columns:repeat(3,1fr);gap:3px}
    .c{position:relative;aspect-ratio:3/4;overflow:hidden;background:#ddd}
    .c img{width:100%;height:100%;object-fit:cover;object-position:50% 50%;display:block}
    .c .pl{position:absolute;right:12px;top:12px;width:40px;height:40px}
    .lbl{position:absolute;left:0;right:0;bottom:-2px;text-align:center}
  `, body: `<div class="bgp"></div>
    <div class="ttl"><h1 class="disp">One feed, one festival</h1><p>12 tiles · 3:4 profile-grid crop · bright and dark alternate like a checkerboard</p></div>
    <div class="ph"><div class="scr"><div class="notch"></div>
      <div class="sb"><span>9:41</span><span><b style="height:10px"></b><b style="height:15px"></b><b style="height:20px"></b><i></i></span></div>
      <div class="ab"><span>&lsaquo;</span><span>Curry District</span><span class="dots">&middot;&middot;&middot;</span></div>
      <div class="pr"><img src="${img('avatar-profile-1080.png')}" alt=""><div><div class="n">Curry District</div><div class="b">Indian Kitchen · Little Elm, TX<br>Biryani · tandoor · curries · Indo-Chinese</div><div class="lk">ordering link</div></div></div>
      <div class="btns"><span>Follow</span><span>Message</span><span>Directions</span></div>
      <div class="hls">${HLS.map(([k, l], i) => `<div class="hl"><div><span style="background-image:url(${img(`highlight-${String(i + 1).padStart(2, '0')}-${k}.png`)})"></span></div><em>${l}</em></div>`).join('')}</div>
      <div class="tabs"><span class="on"><svg width="34" height="34" viewBox="0 0 34 34"><g fill="none" stroke="#17151F" stroke-width="3"><rect x="3" y="3" width="28" height="28" rx="4"/><path d="M12.3 3v28M21.7 3v28M3 12.3h28M3 21.7h28"/></g></svg></span><span><svg width="34" height="34" viewBox="0 0 34 34"><g fill="none" stroke="#9A96A8" stroke-width="3"><rect x="3" y="3" width="28" height="28" rx="7"/><path d="M14 11.5v11l9-5.5z" fill="#9A96A8"/></g></svg></span><span><svg width="34" height="34" viewBox="0 0 34 34"><g fill="none" stroke="#9A96A8" stroke-width="3"><circle cx="17" cy="12" r="6"/><path d="M5 31c1-7 6-11 12-11s11 4 12 11"/></g></svg></span></div>
      <div class="g">${GRID.map(([f, vid]) => `<div class="c"><img src="${img(f)}" alt="">${vid ? `<svg class="pl" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="rgba(0,0,0,.45)"/><path d="M16 12v16l12-8z" fill="#fff"/></svg>` : ''}</div>`).join('')}</div>
    </div></div>` })
};

// ── Feed rhythm board ──
const T = { reel: ['Reel', C.rani], story: ['Story', C.marigold], post: ['Post', C.peacock], gbp: ['GBP', C.cilantro], video: ['TikTok', C.sky], event: ['Event', C.saffron] };
// [day, type, platform, idea, asset or null, shoot-icon, note]
const PLAN = [
  [1, 'reel', 'IG+FB', 'Steam pull + naan tear', 'motion-01-steam.jpg'],
  [2, 'gbp', 'GBP', 'New photos, same fire', 'gbp-post-01-biryani.png'],
  [3, 'story', 'IG', 'Spice poll', 'story-01-spice-poll.png'],
  [4, 'video', 'TikTok', 'Tandoori sizzle', null, 'tandoor-oven'],
  [5, 'post', 'IG', 'First-timer picks', 'post-01-hero-dish.png'],
  [6, 'reel', 'IG+FB', 'Chef hands: dough', null, 'naan'],
  [7, 'story', 'IG+FB', 'Sunday is for sharing', 'story-04-chai-ask-us.png'],
  [8, 'gbp', 'GBP+IG', 'Today’s special (still + loop)', ['post-04-daily-special.png', 'motion-03-special-wipe.jpg'], null, 'swap'],
  [9, 'reel', 'IG+FB', 'Dussehra greeting', null, 'calendar', 'verify date'],
  [10, 'video', 'TikTok', 'Spice challenge ep. 1', 'motion-02-spice-burst.jpg'],
  [11, 'post', 'IG', 'Zone feature: Biryani Blvd', 'post-02-zone-biryani-boulevard.png', null, 'swap'],
  [12, 'reel', 'IG', 'Three naans, three tears', null, 'naan'],
  [13, 'post', 'IG+FB', 'Staff feature #1', 'post-09-staff-pick.png'],
  [14, 'story', 'IG+GBP', 'Review QR launch (no incentives)', 'post-05-ratings.png'],
  [15, 'story', 'IG', 'Guest repost', 'story-02-guest-repost.png'],
  [16, 'event', 'FB+GBP', 'Diwali event page', null, 'calendar', 'verify date'],
  [17, 'video', 'TikTok', 'Menu words, decoded', 'post-08-did-you-know-dum.png'],
  [18, 'reel', 'IG', 'Tandoor flame close-up', null, 'tandoor-oven'],
  [19, 'post', 'IG', 'Spice cabinet 101', 'post-03-spice-meter.png'],
  [20, 'reel', 'IG+FB', 'Trick or heat?', null, 'chili'],
  [21, 'gbp', 'GBP', 'Order ahead for Diwali', 'post-06-order-online.png'],
  [22, 'reel', 'IG', 'Creator tasting (#ad)', null, 'heart'],
  [23, 'video', 'TikTok', 'Dessert pour (if on menu)', null, 'gulab-jamun'],
  [24, 'story', 'IG', 'Diwali countdown', null, 'calendar', 'verify date'],
  [25, 'post', 'IG', 'Family spread', 'post-07-catering.png'],
  [26, 'reel', 'IG+FB', 'Lights on: time-lapse', null, 'star'],
  [27, 'story', 'FB+IG', 'See you tomorrow', 'story-03-visit.png'],
  [28, 'reel', 'All', 'Diwali greeting', null, 'star', 'verify date'],
];
const START = new Date(Date.UTC(2026, 9, 12)); // Day 1 = Mon Oct 12, 2026
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayDate = d => { const x = new Date(START.getTime() + (d - 1) * 864e5); return [MON[x.getUTCMonth()], x.getUTCDate()]; };
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const rhythm = {
  id: 'feed-rhythm-board', file: 'feed-rhythm-board', w: 1080, h: 2440, type: 'image', stage: 3, tags: ['grid'],
  title: 'Feed rhythm · 4-week plan',
  caption: 'The playbook’s 30-day calendar (weeks 1–4) mapped to kit pieces: colour = format, thumbnail = ready-made asset, icon = real footage to shoot.',
  html: () => page({ w: 1080, h: 2440, bg: C.cream, title: 'Feed rhythm board', css: `
    .hd{position:absolute;left:48px;right:48px;top:44px}
    .hd h1{font-size:96px;color:${C.ink};line-height:.95}
    .hd h1 span{color:${C.rani}}
    .hd p{font-size:30px;font-weight:700;color:${C.muted};margin-top:14px;line-height:1.3}
    .wk{position:absolute;top:322px;display:flex;flex-direction:column;align-items:center;justify-content:center;height:64px;background:${C.ink};color:${C.cream};border-radius:16px;font-weight:800;font-size:25px;letter-spacing:.04em;text-transform:uppercase;line-height:1.05}
    .wk small{font-size:19px;font-weight:600;letter-spacing:.02em;opacity:.8;text-transform:none}
    .dw{position:absolute;left:30px;width:88px;font-family:'Bowlby One';text-transform:uppercase;font-size:30px;color:${C.ink};text-align:center}
    .cell{position:absolute;width:224px;height:246px;background:#fff;border:5px solid ${C.ink};border-radius:20px;box-shadow:7px 7px 0 var(--c);overflow:hidden}
    .cell .top{display:flex;align-items:center;justify-content:space-between;height:46px;padding:0 10px 0 12px;background:var(--c);border-bottom:4px solid ${C.ink}}
    .cell .dt{font-family:'Bowlby One';font-size:25px;color:var(--t);white-space:nowrap}
    .cell .fm{font-weight:800;font-size:18px;letter-spacing:.06em;text-transform:uppercase;color:var(--t);white-space:nowrap}
    .cell .mid{height:124px;display:flex;align-items:center;justify-content:center;gap:8px;padding-top:6px}
    .cell .mid img{height:114px;width:auto;border-radius:6px;border:3px solid ${C.ink};display:block}
    .cell .shoot{width:118px;height:118px;border-radius:50%;background:${C.cream};border:4px dashed ${C.ink};display:flex;align-items:center;justify-content:center}
    .cell .id{padding:2px 8px 0;font-weight:700;font-size:18px;flex-direction:column;line-height:1.15;color:${C.ink};text-align:center;height:62px;display:flex;align-items:center;justify-content:center}
    .cell .flag{position:absolute;right:6px;top:52px;background:${C.ink};color:${C.cream};font-weight:800;font-size:14px;letter-spacing:.05em;text-transform:uppercase;padding:3px 8px;border-radius:999px}
    .lg{position:absolute;left:40px;right:30px;top:2228px;display:flex;flex-wrap:nowrap;gap:12px}
    .lg span{display:inline-flex;align-items:center;gap:8px;border:4px solid ${C.ink};border-radius:999px;padding:5px 14px 5px 6px;font-weight:800;font-size:23px;background:#fff;white-space:nowrap}
    .lg i{width:26px;height:26px;border-radius:50%;border:3px solid ${C.ink}}
    .nt{position:absolute;left:44px;right:44px;top:2302px;font-size:23px;font-weight:600;color:${C.muted};line-height:1.3}
  `, body: (() => {
    const X0 = 136, CW = 224, GX = 16, Y0 = 410, RH = 258;
    let h = `<div class="hd"><h1 class="disp">Feed <span>rhythm</span></h1><p>4 weeks from the playbook calendar, Mon Oct 12 to Sun Nov 8, 2026. Each day shows the kit piece that serves it, or the footage to shoot.</p></div>`;
    for (let w = 0; w < 4; w++) { const [m1, d1] = dayDate(w * 7 + 1), [m2, d2] = dayDate(w * 7 + 7); h += `<div class="wk" style="left:${X0 + w * (CW + GX)}px;width:${CW}px">Week ${w + 1}<small>${m1} ${d1} – ${m2 === m1 ? '' : m2 + ' '}${d2}</small></div>`; }
    DOW.forEach((d, r) => { h += `<div class="dw" style="top:${Y0 + r * RH + 100}px">${d}</div>`; });
    for (const [day, ty, plat, idea, asset, sh, flag] of PLAN) {
      const w = Math.floor((day - 1) / 7), r = (day - 1) % 7; const [mo, dd] = dayDate(day);
      const [lab, col] = T[ty]; const txt = (col === C.marigold || col === C.cilantro || col === C.peacock || col === C.saffron) ? C.ink : C.cream;
      const mid = asset ? [].concat(asset).map(a => `<img src="${img(a)}" alt="">`).join('') : `<div class="shoot">${icon(sh, { style: 'width:78px;height:78px' })}</div>`;
      h += `<div class="cell" style="left:${X0 + w * (CW + GX)}px;top:${Y0 + r * RH}px;--c:${col};--t:${txt}"><div class="top"><span class="dt">${mo} ${dd}</span><span class="fm">${lab}</span></div>${flag ? `<span class="flag">${flag}</span>` : ''}<div class="mid">${mid}</div><div class="id"><b style="font-size:14px;letter-spacing:.06em;color:${C.muted}">${plat.toUpperCase()}</b>${idea}</div></div>`;
    }
    h += `<div class="lg">${Object.values(T).map(([l, c]) => `<span><i style="background:${c}"></i>${l}</span>`).join('')}<span><i style="background:${C.cream};border-style:dashed"></i>Shoot</span></div>`;
    h += `<p class="nt">Thumbnail = ready-made kit asset. Dashed icon = real footage to shoot. “Swap” = kit piece replacing a calendar idea that needs an unverified fact (happy hour, prices). Festival dates: verify before scheduling.</p>`;
    return h;
  })() })
};

module.exports = [grid, rhythm];
