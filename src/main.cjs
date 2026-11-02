const {app,BrowserWindow,screen,globalShortcut,Tray,Menu,nativeImage,dialog,shell}=require('electron');
const path=require('node:path');const {createServer}=require('./server.cjs');const {DEFAULT_SHORTCUTS}=require('./state.cjs');
let controller,overlay,tray,service,quitting=false,desktopVisible=false,activeShortcuts={};
const lock=app.requestSingleInstanceLock();if(!lock){app.quit();}else{app.on('second-instance',()=>showControl());app.whenReady().then(start).catch(e=>{dialog.showErrorBox('记分板启动失败',e.message+'\n如端口 17880 已占用，请关闭占用它的程序后重试。');app.quit();});}
function showControl(){if(controller){controller.show();controller.focus();}}
function displayFor(state){return screen.getAllDisplays().find(d=>d.id===state.displayId)||screen.getPrimaryDisplay();}
function positionOverlay(state){if(!overlay)return;const d=displayFor(state);overlay.setBounds({x:d.bounds.x,y:d.bounds.y,width:d.bounds.width,height:Math.ceil(d.bounds.width*70/1920)});}
function registerKeys(state){
 const previous={...activeShortcuts};globalShortcut.unregisterAll();activeShortcuts={};
 try{if(state.hotkeysEnabled)for(const [action,key] of Object.entries(state.shortcuts)){if(!globalShortcut.register(key,()=>{service.action(action).catch(e=>dialog.showErrorBox('记分失败',e.message));}))throw new Error(`快捷键 ${key} 注册失败，可能被其他软件占用。`);activeShortcuts[action]=key;}}
 catch(error){globalShortcut.unregisterAll();activeShortcuts={};for(const [action,key] of Object.entries(previous)){try{if(globalShortcut.register(key,()=>service.action(action).catch(()=>{})))activeShortcuts[action]=key;}catch{}}throw error;}
}
function setDesktopVisible(value){if(value){const d=displayFor(service.store.state);if(Math.abs(d.bounds.width/d.bounds.height-16/9)>.025)throw new Error('桌面显示层要求 16:9 游戏显示器；此屏幕请改用 OBS 1920×1080 浏览器源。');overlay.setIgnoreMouseEvents(true,{forward:true});overlay.setFocusable(false);positionOverlay(service.store.state);overlay.showInactive();}else overlay.hide();desktopVisible=value;}
async function start(){
 const desktop={info:()=>({desktopVisible,activeShortcuts,displays:screen.getAllDisplays().map(d=>({id:d.id,label:d.label||`显示器 ${d.id}`,width:d.size.width,height:d.size.height,primary:d.id===screen.getPrimaryDisplay().id})),selectedDisplay:displayFor(service.store.state).id}),configure(state){if(desktopVisible){const d=displayFor(state);if(Math.abs(d.bounds.width/d.bounds.height-16/9)>.025)throw new Error('请选择 16:9 显示器，或先关闭桌面显示层。');}registerKeys(state);positionOverlay(state);},async command(name){if(name==='toggleOverlay')setDesktopVisible(!desktopVisible);else if(name==='showControl')showControl();else if(name==='openOverlay')await shell.openExternal(service.origin+'/overlay.html');else if(name==='quit'){quitting=true;app.quit();}else throw new Error('未知桌面操作');}};
 service=await createServer({file:path.join(app.getPath('userData'),'scoreboard.json'),desktop});
 controller=new BrowserWindow({width:1180,height:850,minWidth:900,minHeight:680,title:'RAYSPACE · 铁拳8 记分板',backgroundColor:'#101116',autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});
 controller.loadURL(service.origin);
 overlay=new BrowserWindow({width:1920,height:70,show:false,frame:false,transparent:true,backgroundColor:'#00000000',hasShadow:false,resizable:false,skipTaskbar:true,focusable:false,alwaysOnTop:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}});
 overlay.setAlwaysOnTop(true,'screen-saver');overlay.setIgnoreMouseEvents(true,{forward:true});overlay.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen:true});overlay.loadURL(service.origin+'/overlay.html');positionOverlay(service.store.state);
 for(const win of [controller,overlay]){win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',(event,url)=>{if(new URL(url).origin!==service.origin)event.preventDefault();});}
 const icon=nativeImage.createFromPath(path.join(__dirname,'../public/assets/tray.png'));tray=new Tray(icon);tray.setToolTip('RAYSPACE 铁拳8记分板');tray.setContextMenu(Menu.buildFromTemplate([{label:'打开控制面板',click:showControl},{label:'显示 / 隐藏桌面计分条',click:()=>{try{setDesktopVisible(!desktopVisible);}catch(e){dialog.showErrorBox('显示层',e.message);}}},{type:'separator'},{label:'退出',click:()=>{quitting=true;app.quit();}}]));tray.on('double-click',showControl);
 controller.on('close',e=>{if(!quitting){e.preventDefault();controller.hide();}});
 screen.on('display-metrics-changed',()=>positionOverlay(service.store.state));screen.on('display-removed',()=>{if(desktopVisible){setDesktopVisible(false);showControl();}});
 try{registerKeys(service.store.state);}catch(e){dialog.showMessageBox(controller,{type:'warning',message:e.message,detail:'软件继续运行。请在快捷键设置中更换按键后保存。'});}
}
app.on('activate',showControl);app.on('window-all-closed',()=>{});app.on('before-quit',()=>{quitting=true;globalShortcut.unregisterAll();if(tray)tray.destroy();if(service)service.close();});
