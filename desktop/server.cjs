'use strict';
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const DESKTOP_VERSION='0.10.0';
const DEFAULT_PORT=57841;
const MAX_SAVE_BYTES=4*1024*1024;
function isNewer(a,b=DESKTOP_VERSION){const aa=String(a||'0').split('.').map(Number),bb=b.split('.').map(Number);for(let i=0;i<3;i++)if((aa[i]||0)!==(bb[i]||0))return (aa[i]||0)>(bb[i]||0);return false;}
function validateSave(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid save file.');
 if((value.schemaVersion||1)>1||isNewer(value.gameVersion)){const error=new Error('This save needs a newer game version. Its files have been kept.');error.code='NEWER_SAVE';throw error;}
 if(value.format&&value.format!=='lumenwild-save')throw new Error('Not a Lumenwild save.');
 const state=value.format?value.state:value;
 if(!state||!Array.isArray(state.pets)||!state.pets.length||state.pets.length>10000||state.pets.some(p=>!p||typeof p.id!=='string'||typeof p.name!=='string'||!p.name.trim()||!Number.isFinite(p.hp)||p.hp<70||p.hp>160||!Array.isArray(p.moves)))throw new Error('Invalid pet data. Existing saves were kept.');
 return value.format?value:{format:'lumenwild-save',schemaVersion:1,gameVersion:DESKTOP_VERSION,savedAt:new Date().toISOString(),state};
}
async function loadSave(directory){
 const current=path.join(directory,'save.json'),backup=path.join(directory,'save.backup.json');let damaged=false;
 for(const file of [current,backup]){try{const raw=await fs.readFile(file,'utf8');if(Buffer.byteLength(raw)>MAX_SAVE_BYTES)throw new Error('Save is too large.');return {save:validateSave(JSON.parse(raw)),recovered:file===backup};}catch(error){if(error.code==='NEWER_SAVE')throw error;if(error.code!=='ENOENT')damaged=true;}}
 if(damaged)throw new Error('The save and its backup could not be read. They were kept untouched; import a valid backup after repairing or moving them.');
 return {save:null,recovered:false};
}
async function writeSave(directory,value){
 const save=validateSave(value),current=path.join(directory,'save.json'),backup=path.join(directory,'save.backup.json');await fs.mkdir(directory,{recursive:true});
 let old=null;try{const raw=await fs.readFile(current,'utf8');validateSave(JSON.parse(raw));old=raw;}catch(error){if(error.code==='NEWER_SAVE')throw error;}
 if(old!==null){const tempBackup=backup+'.tmp';await fs.writeFile(tempBackup,old,{mode:0o600});await fs.rename(tempBackup,backup);}
 const temp=current+'.tmp';await fs.writeFile(temp,JSON.stringify(save,null,2),{mode:0o600});await fs.rename(temp,current);return save;
}
function jsonResponse(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
async function startDesktopServer({gamePath=path.join(__dirname,'Lumenwild.html'),saveDirectory=path.join(process.env.APPDATA||process.env.XDG_DATA_HOME||path.join(os.homedir(),'.local','share'),'Lumenwild'),port=DEFAULT_PORT}={}){
 await fs.access(gamePath);await fs.mkdir(saveDirectory,{recursive:true});await loadSave(saveDirectory);
 const token=crypto.randomBytes(32).toString('hex'),gameHash=crypto.createHash('sha256').update(await fs.readFile(gamePath)).digest('hex');let origin,queue=Promise.resolve();
 const server=http.createServer(async(req,res)=>{
  try{
   if(req.headers.host!==new URL(origin).host){jsonResponse(res,403,{error:'Local access only.'});return;}
   const pathname=new URL(req.url,origin).pathname;
   res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
   if(req.method==='GET'&&pathname==='/api/health'){jsonResponse(res,200,{app:'lumenwild-desktop',protocol:1,version:DESKTOP_VERSION,gameHash});return;}
   if(req.method==='GET'&&pathname==='/'){
    const {save,recovered}=await loadSave(saveDirectory),bootstrap={token,save,saveDirectory,recovered};const safe=JSON.stringify(bootstrap).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
    const html=(await fs.readFile(gamePath,'utf8')).replace('<head>','<head>\n<script>window.LUMENWILD_DESKTOP='+safe+';</script>');
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});res.end(html);return;
   }
   if(pathname==='/api/save'){
    if(req.headers['x-lumenwild-token']!==token||req.headers.origin&&req.headers.origin!==origin){jsonResponse(res,403,{error:'Save token required.'});return;}
    if(req.method==='GET'){jsonResponse(res,200,(await loadSave(saveDirectory)).save);return;}
    if(req.method!=='POST'||!/^application\/json(?:;|$)/i.test(req.headers['content-type']||'')){jsonResponse(res,400,{error:'Send a JSON save.'});return;}
    const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>MAX_SAVE_BYTES){jsonResponse(res,413,{error:'Save is too large.'});return;}chunks.push(chunk);}
    let data;try{data=validateSave(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch(error){jsonResponse(res,400,{error:error.message});return;}
    queue=queue.catch(()=>{}).then(()=>writeSave(saveDirectory,data));await queue;jsonResponse(res,200,{saved:true});return;
   }
   res.writeHead(404);res.end('Not found');
  }catch(error){jsonResponse(res,500,{error:error.message});}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>{origin='http://127.0.0.1:'+server.address().port;resolve();});});
 return {server,url:origin,saveDirectory,gameHash,version:DESKTOP_VERSION,close:async()=>{await queue.catch(()=>{});await new Promise(resolve=>server.close(resolve));}};
}
async function openGame(url){
 if(process.platform==='win32'){
  const bases=[process.env['ProgramFiles(x86)'],process.env.ProgramFiles,process.env.LOCALAPPDATA].filter(Boolean);
  for(const base of bases){const exe=path.join(base,'Microsoft','Edge','Application','msedge.exe');try{await fs.access(exe);const child=spawn(exe,['--app='+url,'--new-window','--window-size=1440,1000'],{detached:true,stdio:'ignore'});child.on('error',()=>{});child.unref();return;}catch{}}
  const child=spawn('cmd',['/c','start','',url],{detached:true,stdio:'ignore'});child.unref();
 }
}
async function main(){
 if(Number(process.versions.node.split('.')[0])<20)throw new Error('Install Node.js 20 or newer from https://nodejs.org, then launch again.');
 let app;try{app=await startDesktopServer();}catch(error){if(error.code==='EADDRINUSE'){try{const health=await fetch('http://127.0.0.1:'+DEFAULT_PORT+'/api/health').then(r=>r.json()),hash=crypto.createHash('sha256').update(await fs.readFile(path.join(__dirname,'Lumenwild.html'))).digest('hex');if(health.app==='lumenwild-desktop'&&health.version===DESKTOP_VERSION&&health.gameHash===hash){await openGame('http://127.0.0.1:'+DEFAULT_PORT);console.log('The existing Lumenwild launcher is already running.');return;}}catch{}throw new Error('Another launcher is using the game port. Close the previous launcher before opening this version.');}throw error;}
 console.log('Lumenwild '+DESKTOP_VERSION+' desktop launcher\nGame: '+app.url+'\nSave folder: '+app.saveDirectory+'\n\nKeep this launcher open while playing. Close it after the game to stop the local server.\nUpdates replace the game folder; saves stay in your profile.');await openGame(app.url);
 const close=()=>app.close().then(()=>process.exit(0));process.once('SIGINT',close);process.once('SIGTERM',close);
}
module.exports={startDesktopServer,loadSave,writeSave,validateSave};
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
