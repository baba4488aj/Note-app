'use strict';
const fs=require('node:fs/promises');const path=require('node:path');const {loadSave}=require('./server.cjs');
async function backupBeforeUpdate(directory,version){
 if(!/^\d+\.\d+\.\d+$/.test(version))throw new Error('Invalid update version.');
 const {save}=await loadSave(directory);if(!save)return null;
 const target=path.join(directory,'save.before-update-'+version+'.json'),temp=target+'.tmp';await fs.writeFile(temp,JSON.stringify(save,null,2),{mode:0o600});await fs.rename(temp,target);
 const backups=(await fs.readdir(directory)).filter(f=>/^save\.before-update-[\d.]+\.json$/.test(f)),dated=await Promise.all(backups.map(async file=>({file,time:(await fs.stat(path.join(directory,file))).mtimeMs})));dated.sort((a,b)=>b.time-a.time);for(const old of dated.slice(3))await fs.unlink(path.join(directory,old.file));return target;
}
async function finishSession({flush,backup,close,install,quit,updating,relaunch}){await flush();if(updating){await backup();install(relaunch);}else{await close();quit();}}
module.exports={backupBeforeUpdate,finishSession};
