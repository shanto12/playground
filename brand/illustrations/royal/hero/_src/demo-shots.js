// usage: node _src/demo-shots.js tag  (expects http server on :27413 serving the hero folder)
const path=require('path');const { chromium } = require('/opt/node-tools/node_modules/playwright');
const DIR=path.resolve(__dirname,'..'); const tag=process.argv[2]||'d';
(async()=>{const b=await chromium.launch();try{
 for (const [w,h,dpr,name] of [[390,844,2,'m'],[1280,800,1,'dt']]) {
  const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:dpr});
  await p.goto('http://127.0.0.1:27413/index.html'); await p.waitForTimeout(1200);
  const H=await p.evaluate(()=>document.documentElement.scrollHeight);
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth);
  console.log(name,'scrollHeight',H,'scrollWidth',sw,'viewport',w);
  let i=0; for(let y=0;y<H && i<8;y+=h, i++){ await p.evaluate(yy=>window.scrollTo(0,yy),y); await p.waitForTimeout(700);
    await p.screenshot({path:path.join(DIR,`_qa/${tag}-${name}-${i}.png`)}); }
  await p.close(); }
}finally{await b.close();}})();
