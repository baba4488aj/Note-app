const feed=require('./desktop/release-config.json');
module.exports={
 appId:'com.lumenwild.game',productName:'Lumenwild',copyright:'Copyright © Lumenwild contributors',
 directories:{output:'release',buildResources:'desktop/assets'},asar:true,
 files:['desktop/electron-main.cjs','desktop/preload.cjs','desktop/update-service.cjs','desktop/server.cjs','desktop/save-lifecycle.cjs','desktop/release-config.json','desktop/game/**','desktop/assets/**','package.json'],
 win:{target:[{target:'nsis',arch:['x64']}],icon:'desktop/assets/icon.ico',artifactName:'Lumenwild-Setup-${version}-${arch}.${ext}',signExecutable:false},
 nsis:{oneClick:false,perMachine:false,allowElevation:true,allowToChangeInstallationDirectory:true,createDesktopShortcut:true,createStartMenuShortcut:true,shortcutName:'Lumenwild',uninstallDisplayName:'Lumenwild',deleteAppDataOnUninstall:false,runAfterFinish:true,differentialPackage:true,installerIcon:'desktop/assets/icon.ico',uninstallerIcon:'desktop/assets/icon.ico'},
 publish:[feed]
};
