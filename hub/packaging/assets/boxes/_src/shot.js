// usage: node shot.js <html> <out.png> <w> <h> [dpr] [fullPage]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async()=>{
  const [,,html,out,w,h,dpr,full]=process.argv;
  const b=await chromium.launch();
  try{
    const p=await b.newPage({viewport:{width:+w,height:+h},deviceScaleFactor:+(dpr||1)});
    await p.goto('file://'+require('path').resolve(html));
    await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(400);
    await p.screenshot({path:out,fullPage:full==='1',omitBackground:false});
  } finally { await b.close(); }
})();
