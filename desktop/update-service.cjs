'use strict';
const {EventEmitter}=require('node:events');
class UpdateService extends EventEmitter{
 constructor({updater,version,enabled,feed}){
  super();this.updater=updater;this.enabled=enabled;this.version=version;this.checkPromise=null;this.listeners=[];
  this.state={phase:enabled?'idle':'unsupported',currentVersion:version,availableVersion:null,percent:0,lastChecked:null,message:enabled?'Updates download in the background and install when you exit.':'Automatic updates are available in the installed Windows game.'};
  if(!enabled)return;
  updater.autoDownload=true;updater.autoInstallOnAppQuit=false;updater.allowDowngrade=false;updater.allowPrerelease=false;updater.setFeedURL(feed);
  const on=(name,handler)=>{updater.on(name,handler);this.listeners.push([name,handler]);};
  on('checking-for-update',()=>{if(this.state.phase!=='ready')this.set({phase:'checking',message:'Checking for a new version…'});});
  on('update-not-available',()=>{if(this.state.phase!=='ready')this.set({phase:'current',lastChecked:new Date().toISOString(),message:'You have the latest published version.'});});
  on('update-available',info=>{this.set({phase:'downloading',availableVersion:String(info.version).slice(0,50),percent:0,lastChecked:new Date().toISOString(),message:'A new version is downloading. Keep playing.'});});
  on('download-progress',progress=>{if(this.state.phase!=='ready')this.set({phase:'downloading',percent:Math.max(0,Math.min(100,Number(progress.percent)||0)),message:'Downloading the update. Your current game can continue.'});});
  on('update-downloaded',info=>{this.set({phase:'ready',availableVersion:String(info.version).slice(0,50),percent:100,message:'Update ready. Restart now, or it will install when you exit.'});});
  on('error',error=>this.failure(error));
 }
 set(values){this.state={...this.state,...values};this.emit('status',this.getState());}
 getState(){return {...this.state};}
 failure(error){if(this.state.phase==='ready')return;const unpublished=/404|not found|no published/i.test(String(error?.message||error));this.set({phase:unpublished?'unpublished':'error',lastChecked:new Date().toISOString(),message:unpublished?'No update release has been published yet. You can keep playing.':'Could not check for updates. You can keep playing offline and try again later.'});}
 check(){
  if(!this.enabled||['ready','downloading'].includes(this.state.phase))return Promise.resolve(this.getState());if(this.checkPromise)return this.checkPromise;
  this.set({phase:'checking',message:'Checking for a new version…'});
  this.checkPromise=Promise.resolve().then(()=>this.updater.checkForUpdates()).catch(error=>this.failure(error)).then(()=>this.getState()).finally(()=>{this.checkPromise=null;});return this.checkPromise;
 }
 start(){if(!this.enabled)return;this.initialTimer=setTimeout(()=>this.check(),8000);this.interval=setInterval(()=>this.check(),4*60*60*1000);this.initialTimer.unref?.();this.interval.unref?.();}
 install(relaunch){if(this.state.phase!=='ready')throw new Error('The update has not finished downloading.');this.updater.quitAndInstall(true,!!relaunch);}
 dispose(){clearTimeout(this.initialTimer);clearInterval(this.interval);for(const [name,handler]of this.listeners)this.updater.removeListener(name,handler);this.listeners=[];}
}
module.exports={UpdateService};
