'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('lumenwildApp',{
 getUpdateStatus:()=>ipcRenderer.invoke('lumenwild:update-status'),
 checkForUpdates:()=>ipcRenderer.invoke('lumenwild:check-update'),
 installUpdate:()=>ipcRenderer.invoke('lumenwild:install-update'),
 onUpdateStatus:callback=>{const handler=(_event,status)=>callback(status);ipcRenderer.on('lumenwild:update-status',handler);return ()=>ipcRenderer.removeListener('lumenwild:update-status',handler);}
});
