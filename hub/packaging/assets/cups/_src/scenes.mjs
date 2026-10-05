// Scene registry → PNG renders + manifest metadata
export const SCENES = [];
for (const dir of ['bazaar', 'royal']) {
  SCENES.push({ name: `chai-cup-hero-${dir}`, module: 'chai-hero', params: { dir } });
}
SCENES.push({ name: '_qa/debug', module: 'debug', params: {} });
