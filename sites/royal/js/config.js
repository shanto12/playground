/*! Curry District · Royal — the ONE place for business facts used at runtime.
   Edit here; js/site.js re-binds every [data-cd] / [data-cd-href] element on every page.
   Status notes come from research/business_verified.json (Oct 2026):
   - phone: "likely" (owner to confirm; never use (972) 787-1320)
   - hours: "likely" (aggregator summaries) — always show hoursCaveat next to the status chip
   Static HTML carries the same values as a no-JS fallback; keep them in sync if you change a value here. */
window.CD_CONFIG = {
  name: 'Curry District',
  tagline: 'Indian Kitchen · Little Elm, TX',
  timeZone: 'America/Chicago',

  phone: { display: '(469) 200-5856', tel: '+14692005856', status: 'likely' },

  address: {
    line1: '11851 FM 423, Suite 200',
    city: 'Little Elm', region: 'TX', zip: '75068',
    oneLine: '11851 FM 423, Suite 200, Little Elm, TX 75068',
    areaLine: 'Little Elm, near Frisco',
    status: 'verified'
  },

  /* days: 0 = Sunday … 6 = Saturday. blocks: 24-hour "HH:MM" open/close pairs (split lunch / dinner). */
  hours: [
    { days: [1, 2, 3, 4], label: 'Mon–Thu', long: 'Monday to Thursday', text: '11:00 AM – 2:30 PM, 4:30 PM – 10:00 PM', blocks: [['11:00', '14:30'], ['16:30', '22:00']] },
    { days: [5, 6],       label: 'Fri–Sat', long: 'Friday and Saturday', text: '11:00 AM – 3:00 PM, 4:30 PM – 10:30 PM', blocks: [['11:00', '15:00'], ['16:30', '22:30']] },
    { days: [0],          label: 'Sun',     long: 'Sunday',              text: '11:00 AM – 3:00 PM, 4:30 PM – 10:00 PM', blocks: [['11:00', '15:00'], ['16:30', '22:00']] }
  ],
  hoursStatus: 'likely',
  hoursCaveat: 'Hours as listed publicly; please call to confirm on holidays.',
  /* copy.json › royal.microcopy.hoursStatus */
  statusText: {
    openNow: 'Open now · until {time}',
    closingSoon: 'Closing at {time}',
    closedNow: 'Closed now · Opens at {time}',
    betweenServices: 'Between services · Dinner from {time}',
    opensLaterToday: 'Opening at {time} today'
  },
  closingSoonMinutes: 30,

  links: {
    order: 'https://curry-district-little-elm.cloveronline.com/',
    uberEats: 'https://www.ubereats.com/store/curry-district/uWXzS9FzRBqEC8dXe5241w',
    doorDash: 'https://www.doordash.com/en-CA/store/curry-district-little-elm-900790/',
    directions: 'https://www.google.com/maps/dir/?api=1&destination=Curry+District%2C+11851+FM+423+Suite+200%2C+Little+Elm%2C+TX+75068',
    appleMaps: 'https://maps.apple.com/?daddr=11851+FM+423+Suite+200,+Little+Elm,+TX+75068&q=Curry+District',
    mapEmbed: 'https://www.google.com/maps?q=11851+FM+423+Suite+200+Little+Elm+TX+75068&output=embed',
    google: 'https://www.google.com/maps/search/?api=1&query=Curry+District+11851+FM+423+Little+Elm+TX',
    yelp: 'https://www.yelp.com/biz/curry-district-little-elm',
    restaurantji: 'https://www.restaurantji.com/tx/little-elm/curry-district-/',
    instagram: 'https://www.instagram.com/currydistrictfrisco/',   /* unverified handle */
    facebook: 'https://www.facebook.com/CurryDistrictFrisco/',
    hub: 'https://curry-district-pitch.netlify.app/'
  },

  /* as listed publicly, Oct 2026 — never add invented quotes */
  ratings: [
    { platform: 'Google', score: '≈4.2', stars: 4.2, count: 'about 1,000 reviews', href: 'google' },
    { platform: 'Uber Eats', score: '≈4.5', stars: 4.5, count: '2,000+ ratings', href: 'uberEats' },
    { platform: 'Restaurantji', score: '4.5', stars: 4.5, count: '479 reviews', href: 'restaurantji' },
    { platform: 'Yelp', score: '4.0', stars: 4.0, count: '120 reviews', href: 'yelp' }
  ],
  ratingsLabel: 'as listed publicly, Oct 2026',

  disclaimer: 'Independent design concept prepared as a proposal — not the official Curry District website.',
  storageKey: 'cd-royal-concept-dismissed'
};
