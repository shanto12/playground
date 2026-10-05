/* Curry District · Bazaar concept — THE single source for business facts used by the page scripts.
   Change the phone / hours / links HERE. (Static HTML carries the same values as a no-JS fallback;
   site.js overwrites every [data-cfg] element from this object on load.)
   Status: phone + hours are "likely" (research/business_verified.json) — owner to confirm. */
window.CD_CONFIG = {
  name: 'Curry District',
  tagline: 'Indian Kitchen · Little Elm, TX',
  site: 'https://curry-district-bazaar.netlify.app/',
  hub: 'https://curry-district-pitch.netlify.app/',
  timeZone: 'America/Chicago',

  phone: { display: '(469) 200-5856', tel: '+14692005856', status: 'likely' },

  address: {
    line1: '11851 FM 423, Suite 200', city: 'Little Elm', state: 'TX', zip: '75068',
    oneLine: '11851 FM 423, Suite 200, Little Elm, TX 75068', area: 'Little Elm, near Frisco',
    geo: null /* not verified — leave null */
  },

  /* day numbers: 0 = Sun … 6 = Sat. blocks are 24h "HH:MM" in America/Chicago. */
  hours: [
    { label: 'Mon–Thu', long: 'Monday to Thursday', days: [1, 2, 3, 4], blocks: [['11:00', '14:30'], ['16:30', '22:00']] },
    { label: 'Fri–Sat', long: 'Friday and Saturday', days: [5, 6], blocks: [['11:00', '15:00'], ['16:30', '22:30']] },
    { label: 'Sun', long: 'Sunday', days: [0], blocks: [['11:00', '15:00'], ['16:30', '22:00']] }
  ],
  hoursStatus: 'likely',
  closingSoonMinutes: 45,

  links: {
    order: 'https://curry-district-little-elm.cloveronline.com/',
    uberEats: 'https://www.ubereats.com/store/curry-district/uWXzS9FzRBqEC8dXe5241w',
    doorDash: 'https://www.doordash.com/store/curry-district-little-elm-900790/',
    directions: 'https://www.google.com/maps/dir/?api=1&destination=11851+FM+423+Suite+200+Little+Elm+TX+75068',
    appleMaps: 'https://maps.apple.com/?daddr=11851+FM+423+Suite+200,Little+Elm,TX+75068',
    mapEmbed: 'https://www.google.com/maps?q=11851+FM+423+Suite+200+Little+Elm+TX+75068&output=embed',
    instagram: 'https://www.instagram.com/currydistrictfrisco/',
    facebook: 'https://www.facebook.com/CurryDistrictFrisco/',
    yelp: 'https://www.yelp.com/biz/curry-district-little-elm',
    restaurantji: 'https://www.restaurantji.com/tx/little-elm/curry-district-/',
    googleSearch: 'https://www.google.com/maps/search/?api=1&query=Curry+District+11851+FM+423+Suite+200+Little+Elm+TX+75068'
  },

  /* copy for the open/closed chip (data/copy.json → bazaar.microcopy.hoursStatus) */
  statusCopy: {
    openNow: 'Open now · kitchen’s cooking till {time}',
    closingSoon: 'Kitchen closes at {time}',
    closedNow: 'Closed right now · back at {time}',
    betweenServices: 'Lunch is done · dinner starts at {time}',
    opensLaterToday: 'Opens at {time} today',
    caveat: 'Hours as listed publicly. Call to confirm on holidays.'
  },

  /* ratings as listed publicly (Oct 2026). Never add aggregateRating to JSON-LD. */
  ratings: [
    { platform: 'Google', score: 4.2, approx: true, count: 'about 1,000 reviews' },
    { platform: 'Uber Eats', score: 4.5, approx: true, count: '2,000+ ratings' },
    { platform: 'Restaurantji', score: 4.5, approx: false, count: '479 reviews' },
    { platform: 'Yelp', score: 4.0, approx: false, count: '120 reviews' }
  ],
  ratingsLabel: 'as listed publicly, Oct 2026',

  disclaimer: 'Independent design concept prepared as a proposal — not the official Curry District website.'
};
