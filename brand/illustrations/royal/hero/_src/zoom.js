// usage: node _src/zoom.js file.svg W H out.png x y w h [scale]
const path=require('path');const { chromium } = require('/opt/node-tools/node_modules/playwright');
const [file,W,H,out,x,y,w,h,sc]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();try{const p=await b.newPage({viewport:{width:+W,height:+H},deviceScaleFactor:+(sc||2)});
await p.goto('file://'+path.resolve(file));await p.waitForTimeout(400);
await p.screenshot({path:out,clip:{x:+x,y:+y,width:+w,height:+h}});}finally{await b.close();}})();
