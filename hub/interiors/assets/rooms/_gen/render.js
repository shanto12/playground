/* Rasterise SVG strings → PNG with ONE Chromium instance (project rule: one browser at a time). */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

async function withBrowser(fn) {
  const b = await chromium.launch();
  try { return await fn(b); } finally { await b.close(); }
}

async function svgToPng(browser, svg, outPng, W, H, scale = 1) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  try {
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff}svg{display:block}</style></head><body>${svg}</body></html>`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({ path: outPng, clip: { x: 0, y: 0, width: W, height: H } });
  } finally { await page.close(); }
}

module.exports = { withBrowser, svgToPng };
