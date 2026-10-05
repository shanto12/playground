// One browser, sequential shots. usage: node render_many.js jobs.json
const http=require('http'),fs=require('fs'),path=require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const types={'.html':'text/html','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2','.json':'application/json'};
(async()=>{
  const jobs=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const only=process.argv[3]?new RegExp(process.argv[3]):null;
  const srv=http.createServer((q,r)=>{const f=decodeURIComponent(q.url.split('?')[0]);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});r.end(d);});});
  await new Promise(res=>srv.listen(0,'127.0.0.1',res)); const port=srv.address().port;
  const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  try{
    for(const j of jobs){
      if(only && !only.test(j.out)) continue;
      const t0=Date.now();
      const p=await b.newPage({viewport:{width:j.w,height:j.h},deviceScaleFactor:j.dpr||2});
      p.on('pageerror',e=>console.log('[pageerror]',j.out,e.message));
      p.on('console',m=>{if(m.type()==='error')console.log('[console]',j.out,m.text());});
      try{ await p.goto(`http://127.0.0.1:${port}${j.html}`,{waitUntil:'domcontentloaded',timeout:180000}); }catch(e){console.log('GOTO FAIL',j.out,e.message.split('\n')[0]); await p.close(); continue;}
      try{ await p.waitForSelector('#done',{timeout:240000,state:'attached'}); }catch(e){console.log('TIMEOUT',j.out);}
      await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(150);
      await p.screenshot({path:j.out});
      await p.close();
      console.log('ok',path.basename(j.out),((Date.now()-t0)/1000).toFixed(1)+'s');
    }
  } finally { await b.close(); srv.close(); }
})();
