'use strict';
const {app,BrowserWindow,Menu,dialog,ipcMain}=require('electron');
const {autoUpdater}=require('electron-updater');
const path=require('node:path');
const {startDesktopServer}=require('./server.cjs');
const {backupBeforeUpdate,finishSession}=require('./save-lifecycle.cjs');
const {UpdateService}=require('./update-service.cjs');
const feed=require('./release-config.json');
app.setName('Lumenwild');
// Keep the exact save directory used by the earlier Node/Edge desktop launcher.
app.setPath('userData',path.join(app.getPath('appData'),'Lumenwild'));
let mainWindow,desktopServer,updates,closing=false,quitPromise=null;
const single=app.requestSingleInstanceLock();
if(!single){app.quit();}else{
 app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.show();mainWindow.focus();}});
 app.whenReady().then(start).catch(error=>{dialog.showErrorBox('Lumenwild could not start',error.message+'\nYour existing save files have been kept.');closing=true;app.quit();});
}
function validSender(event){if(!mainWindow||event.sender!==mainWindow.webContents||event.senderFrame!==mainWindow.webContents.mainFrame||new URL(event.senderFrame.url).origin!==desktopServer.url)throw new Error('This request is only available inside Lumenwild.');}
async function quitSafely(relaunch=false){
 if(closing)return;if(quitPromise)return quitPromise;
 quitPromise=(async()=>{
  try{
   if(mainWindow&&!mainWindow.isDestroyed())mainWindow.setEnabled(false);
   if(mainWindow&&!mainWindow.isDestroyed()&&!mainWindow.webContents.isLoadingMainFrame()){
    let timer;try{await Promise.race([mainWindow.webContents.executeJavaScript('window.LUMENWILD_FLUSH_SAVE ? window.LUMENWILD_FLUSH_SAVE() : Promise.resolve()'),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Saving is taking longer than expected. Please try exiting again.')),18000);})]);}finally{clearTimeout(timer);}
   }
   const install=updates?.getState().phase==='ready';
   await finishSession({flush:async()=>{},backup:()=>backupBeforeUpdate(app.getPath('userData'),app.getVersion()),close:()=>desktopServer?.close(),install:restart=>{closing=true;updates.install(restart);},quit:()=>{closing=true;updates?.dispose();app.quit();},updating:install,relaunch});
  }catch(error){closing=false;quitPromise=null;if(mainWindow&&!mainWindow.isDestroyed())mainWindow.setEnabled(true);await dialog.showMessageBox(mainWindow,{type:'error',title:'Your game is still open',message:'Lumenwild could not finish saving.',detail:error.message+'\nExport a backup from Saves before trying again.',buttons:['Keep playing']});}
 })();return quitPromise;
}
async function start(){
 try{const old=await fetch('http://127.0.0.1:57841/api/health',{signal:AbortSignal.timeout(700)}).then(r=>r.json());if(old.app==='lumenwild-desktop')throw Object.assign(new Error('Close the older Start-Lumenwild.cmd launcher before opening the installed game. Both versions use the same save.'),{code:'OLD_LAUNCHER'});}catch(error){if(error.code==='OLD_LAUNCHER')throw error;}
 desktopServer=await startDesktopServer({gamePath:path.join(__dirname,'game','Lumenwild.html'),saveDirectory:app.getPath('userData'),port:0});
 updates=new UpdateService({updater:autoUpdater,version:app.getVersion(),enabled:app.isPackaged&&process.platform==='win32',feed});
 mainWindow=new BrowserWindow({width:1440,height:1000,minWidth:640,minHeight:600,title:'Lumenwild',backgroundColor:'#14121d',icon:path.join(__dirname,'assets','icon.png'),show:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});
 mainWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 mainWindow.webContents.on('will-navigate',(event,url)=>{if(new URL(url).origin!==desktopServer.url)event.preventDefault();});
 mainWindow.webContents.session.setPermissionRequestHandler((_webContents,_permission,callback)=>callback(false));
 mainWindow.on('close',event=>{if(!closing){event.preventDefault();quitSafely(false);}});
 mainWindow.on('page-title-updated',event=>event.preventDefault());mainWindow.once('ready-to-show',()=>mainWindow.show());
 updates.on('status',status=>{if(!mainWindow.isDestroyed())mainWindow.webContents.send('lumenwild:update-status',status);});
 ipcMain.handle('lumenwild:update-status',event=>{validSender(event);return updates.getState();});
 ipcMain.handle('lumenwild:check-update',event=>{validSender(event);return updates.check();});
 ipcMain.handle('lumenwild:install-update',event=>{validSender(event);if(updates.getState().phase!=='ready')throw new Error('The update is not ready yet.');void quitSafely(true);return {accepted:true};});
 Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'Game',submenu:[{label:'Check for updates',click:()=>updates.check()},{type:'separator'},{label:'Exit',accelerator:'Alt+F4',click:()=>quitSafely(false)}]},{label:'View',submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{type:'separator'},{role:'togglefullscreen'}]},{label:'Help',submenu:[{label:'About Lumenwild',click:()=>dialog.showMessageBox(mainWindow,{type:'info',title:'Lumenwild',message:'Lumenwild '+app.getVersion(),detail:'An original creature adventure. Your save stays on this PC across updates.'})}]}]));
 await mainWindow.loadURL(desktopServer.url);updates.start();
}
app.on('before-quit',event=>{if(!closing){event.preventDefault();quitSafely(false);}});
app.on('window-all-closed',()=>{if(closing)app.quit();});
