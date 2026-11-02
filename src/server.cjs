const http=require('node:http');const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');const {Store,merge}=require('./state.cjs');
async function createServer({file,port=17880,desktop=null}={}){
 const store=new Store(file);const token=crypto.randomBytes(32).toString('hex');const clients=new Set();const root=path.join(__dirname,'../public');let origin;
 function broadcast(){const msg='data: '+JSON.stringify(store.state)+'\n\n';for(const res of clients)res.write(msg);}
 async function change(fn){const state=await fn();broadcast();return state;}
 function json(res,code,data){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  if(req.headers.host!==new URL(origin).host){json(res,403,{error:'本地地址不匹配'});return;}
  if((req.headers.origin&&req.headers.origin!==origin)||req.headers['sec-fetch-site']==='cross-site'){json(res,403,{error:'不允许跨站请求'});return;}
  const pathname=new URL(req.url,origin).pathname;
  try{
   if(req.method==='GET'&&pathname==='/api/session')return json(res,200,{token,warning:store.loadWarning});
   if(req.method==='GET'&&pathname==='/api/state')return json(res,200,store.state);
   if(req.method==='GET'&&pathname==='/api/runtime')return json(res,200,{desktop:!!desktop,...(desktop?desktop.info():{}),overlayUrl:origin+'/overlay.html'});
   if(req.method==='GET'&&pathname==='/events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});res.write('data: '+JSON.stringify(store.state)+'\n\n');clients.add(res);const heartbeat=setInterval(()=>res.write(': keepalive\n\n'),20000);req.on('close',()=>{clearInterval(heartbeat);clients.delete(res);});return;}
   if(req.method==='POST'){
    if(req.headers['x-scoreboard-token']!==token)return json(res,403,{error:'请刷新控制面板后重试'});
    let length=0,chunks=[];for await(const chunk of req){length+=chunk.length;if(length>3100000){json(res,413,{error:'配置或图标过大'});return;}chunks.push(chunk);}let body;try{body=JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{return json(res,400,{error:'配置不是有效的 JSON'});}
    if(pathname==='/api/state'){
     const next=merge(store.state,body);const changedDesktop=JSON.stringify([next.shortcuts,next.hotkeysEnabled,next.displayId])!==JSON.stringify([store.state.shortcuts,store.state.hotkeysEnabled,store.state.displayId]);
     if(desktop&&changedDesktop)desktop.configure(next);
     try{return json(res,200,await change(()=>store.commit(next)));}catch(e){if(desktop&&changedDesktop)desktop.configure(store.state);throw e;}
    }
    if(pathname==='/api/action'){if(body.name==='undo'&&desktop){/* undo leaves hotkeys and screen selection unchanged */}return json(res,200,await change(()=>store.action(body.name)));}
    if(pathname==='/api/desktop'&&desktop){await desktop.command(body.name);return json(res,200,{ok:true});}
    return json(res,404,{error:'找不到此操作'});
   }
   if(req.method!=='GET')return json(res,405,{error:'不支持此请求'});
   const routes={'/':'index.html','/index.html':'index.html','/overlay.html':'overlay.html','/control.js':'control.js','/scoreboard.js':'scoreboard.js','/style.css':'style.css','/overlay.css':'overlay.css','/overlay.js':'overlay.js','/assets/template.svg':'assets/template.svg','/assets/game-reference.webp':'assets/game-reference.webp','/assets/ScoreboardCondensed.otf':'assets/ScoreboardCondensed.otf'};
   const filePath=routes[pathname];if(!filePath)return json(res,404,{error:'未找到页面'});
   const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.otf':'font/otf'};
   res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'self'");
   res.writeHead(200,{'Content-Type':types[path.extname(filePath)],'Cache-Control':'no-cache'});fs.createReadStream(path.join(root,filePath)).pipe(res);
  }catch(error){json(res,400,{error:error.message||'操作失败'});}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});origin='http://127.0.0.1:'+server.address().port;
 return {server,store,origin,broadcast,action:async name=>change(()=>store.action(name)),close:()=>new Promise(r=>{for(const client of clients)client.end();server.close(r);})};
}
if(require.main===module){createServer({file:path.join(__dirname,'../.local/state.json'),port:Number(process.env.SCOREBOARD_PORT||17880)}).then(app=>console.log('Control: '+app.origin+'\nOBS: '+app.origin+'/overlay.html')).catch(e=>{console.error(e.message);process.exit(1);});}
module.exports={createServer};
