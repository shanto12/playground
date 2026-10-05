// Scene registry → PNG renders
export const SCENES = [];
for (const dir of ['bazaar', 'royal']) {
  SCENES.push({ name: `chai-cup-hero-${dir}`, module: 'chai-hero', params: { dir } });
  SCENES.push({ name: `lassi-cup-hero-${dir}`, module: 'hero', params: { dir, item: 'lassi' } });
  SCENES.push({ name: `party-trays-hero-${dir}`, module: 'hero', params: { dir, item: 'trays' } });
  SCENES.push({ name: `district-lunchbox-hero-${dir}`, module: 'hero', params: { dir, item: 'lunch' } });
  SCENES.push({ name: `box-lunch-carton-hero-${dir}`, module: 'hero', params: { dir, item: 'carton' } });
  SCENES.push({ name: `party-table-flatlay-${dir}`, module: 'flatlay', params: { dir } });
}
