import os,subprocess,time,json,urllib.request,ctypes
from pathlib import Path
from playwright.sync_api import sync_playwright
from websockets.sync.client import connect
root=Path(__file__).resolve().parents[1];env=dict(os.environ,DISPLAY=':99',XDG_CONFIG_HOME=str(root/'artifacts/desktop-profile'))
log=open(root/'artifacts/desktop.log','w')
proc=subprocess.Popen([str(root/'node_modules/electron/dist/electron'),'.','--no-sandbox','--inspect=127.0.0.1:9229','--remote-debugging-port=9222'],cwd=root,env=env,stdout=log,stderr=log)
def get(url):
 with urllib.request.urlopen(url,timeout=2) as r:return json.load(r)
def wait(fn,seconds=20):
 deadline=time.monotonic()+seconds;last=None
 while time.monotonic()<deadline:
  try:
   v=fn()
   if v:return v
  except Exception as e:last=e
  if "page" in globals():page.wait_for_timeout(100)
  else:time.sleep(.1)
 raise AssertionError(str(last or 'timed out'))
try:
 runtime=wait(lambda:get('http://127.0.0.1:17880/api/runtime'));assert runtime['desktop']
 target=wait(lambda:get('http://127.0.0.1:9229/json/list'))[0]
 ws=connect(target['webSocketDebuggerUrl']);seq=0
 def main(expr):
  global seq
  seq+=1;ws.send(json.dumps({'id':seq,'method':'Runtime.evaluate','params':{'expression':expr,'returnByValue':True,'awaitPromise':True}}))
  while True:
   d=json.loads(ws.recv())
   if d.get('id')==seq:
    assert 'exceptionDetails' not in d['result'],d
    return d['result']['result'].get('value')
 assert len(runtime['activeShortcuts'])==7,runtime
 with sync_playwright() as p:
  browser=p.chromium.connect_over_cdp('http://127.0.0.1:9222');context=browser.contexts[0]
  page=wait(lambda:next((p for p in context.pages if p.url=='http://127.0.0.1:17880/'),None))
  page.wait_for_selector('#desktop-toggle:not([disabled])');page.locator('#desktop-toggle').click()
  wait(lambda:get('http://127.0.0.1:17880/api/runtime')['desktopVisible'])
  windows=main("process.mainModule.require('electron').BrowserWindow.getAllWindows().map(w=>({url:w.webContents.getURL(),focusable:w.isFocusable(),top:w.isAlwaysOnTop(),visible:w.isVisible(),bounds:w.getBounds()}))")
  overlay=next(w for w in windows if w['url'].endswith('/overlay.html'));assert overlay['top'] and not overlay['focusable'] and overlay['visible'],overlay
  assert overlay['bounds']=={'x':0,'y':0,'width':1920,'height':70},overlay
  # Another app-like native window underneath the always-on-top overlay.
  main("global.testBg=new (process.mainModule.require('electron').BrowserWindow)({x:0,y:0,width:1920,height:1080,frame:false,webPreferences:{nodeIntegration:false,contextIsolation:true}});testBg.loadURL('data:text/html,<html><body style=\"margin:0\"><button style=\"position:absolute;left:0;top:0;width:1920px;height:70px\" onclick=\"window.clicks=(window.clicks||0)+1\">test</button></body></html>');testBg.show();testBg.focus();true")
  bg=wait(lambda:next((p for p in context.pages if p.url.startswith('data:text/html')),None));bg.wait_for_selector('button')
  x=ctypes.CDLL('libX11.so.6');xt=ctypes.CDLL('libXtst.so.6');x.XOpenDisplay.argtypes=[ctypes.c_char_p];x.XOpenDisplay.restype=ctypes.c_void_p;d=x.XOpenDisplay(b':99');assert d
  x.XStringToKeysym.argtypes=[ctypes.c_char_p];x.XStringToKeysym.restype=ctypes.c_ulong;x.XKeysymToKeycode.argtypes=[ctypes.c_void_p,ctypes.c_ulong];x.XKeysymToKeycode.restype=ctypes.c_ubyte;x.XFlush.argtypes=[ctypes.c_void_p];x.XCloseDisplay.argtypes=[ctypes.c_void_p]
  xt.XTestFakeKeyEvent.argtypes=[ctypes.c_void_p,ctypes.c_uint,ctypes.c_int,ctypes.c_ulong];xt.XTestFakeMotionEvent.argtypes=[ctypes.c_void_p,ctypes.c_int,ctypes.c_int,ctypes.c_int,ctypes.c_ulong];xt.XTestFakeButtonEvent.argtypes=[ctypes.c_void_p,ctypes.c_uint,ctypes.c_int,ctypes.c_ulong]
  def keys(*names):
   codes=[x.XKeysymToKeycode(d,x.XStringToKeysym(k.encode())) for k in names]
   for c in codes:xt.XTestFakeKeyEvent(d,c,1,0)
   for c in reversed(codes):xt.XTestFakeKeyEvent(d,c,0,0)
   x.XFlush(d)
  before=get('http://127.0.0.1:17880/api/state')['left']['score'];keys('Control_L','Alt_L','1');wait(lambda:get('http://127.0.0.1:17880/api/state')['left']['score']==before+1)
  # Disable shortcuts through the controller and prove key no longer mutates state.
  session=get('http://127.0.0.1:17880/api/session')
  def patch(body):
   data=json.dumps(body).encode();req=urllib.request.Request('http://127.0.0.1:17880/api/state',data=data,headers={'Content-Type':'application/json','X-Scoreboard-Token':session['token']});return getrequest(req)
  def getrequest(req):
   with urllib.request.urlopen(req) as r:return json.load(r)
  patch({'hotkeysEnabled':False});assert get('http://127.0.0.1:17880/api/runtime')['activeShortcuts']=={}
  keys('Control_L','Alt_L','1');time.sleep(.3);assert get('http://127.0.0.1:17880/api/state')['left']['score']==before+1
  patch({'hotkeysEnabled':True})
  # Click the topmost overlay area: click must reach the window below.
  xt.XTestFakeMotionEvent(d,0,960,15,0);xt.XTestFakeButtonEvent(d,1,1,0);xt.XTestFakeButtonEvent(d,1,0,0);x.XFlush(d)
  bg.wait_for_function('()=>window.clicks===1');x.XCloseDisplay(d)
  main('testBg.destroy();true')
  # Closing the controller retains native process/service; showControl restores it.
  main("process.mainModule.require('electron').BrowserWindow.getAllWindows().find(w=>w.webContents.getURL()==='http://127.0.0.1:17880/').close();true")
  flags=main("process.mainModule.require('electron').BrowserWindow.getAllWindows().map(w=>({url:w.webContents.getURL(),visible:w.isVisible()}))")
  assert any(w['url']=='http://127.0.0.1:17880/' and not w['visible'] for w in flags)
  assert get('http://127.0.0.1:17880/api/runtime')['desktop']
  print(json.dumps({'desktop':'passed on Linux Xvfb','checks':['native desktop launch','seven global shortcut registrations','score hotkey while another native window focused','pause hotkeys','transparent top-only overlay bounds','always on top','nonfocusable overlay','real mouse click-through to underlying window','close-to-tray service retention'],'windowsGameCompatibility':'not tested'},ensure_ascii=False))
  ws.close()
finally:
 proc.terminate()
 try:proc.wait(timeout=8)
 except subprocess.TimeoutExpired:proc.kill()
 log.close()
