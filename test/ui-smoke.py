from playwright.sync_api import sync_playwright
from PIL import Image
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1];out=root/'artifacts';out.mkdir(exist_ok=True)
icon=out/'test-logo.png';Image.new('RGBA',(48,48),(220,40,90,255)).save(icon)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1280,'height':1000},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:17880');page.wait_for_selector('#preview-overlay svg');page.wait_for_function("()=>document.querySelector('#connection').textContent==='本机已连接'")
 session=page.request.get('http://127.0.0.1:17880/api/session').json();headers={'X-Scoreboard-Token':session['token']}
 def patch(data):
  r=page.request.post('http://127.0.0.1:17880/api/state',data=data,headers=headers);assert r.ok,r.text()
 patch({'left':{'id':'NOVA','identity':'CHALLENGER','score':0,'icon':''},'right':{'id':'RYUJIN','identity':'DEFENDING CHAMPION','score':0,'icon':''},'visible':True})
 page.locator('[data-field="left.id"]').fill('选手甲');page.locator('[data-field="left.identity"]').fill('挑战者')
 page.locator('[data-action="leftPlus"]').click();page.wait_for_function("()=>document.querySelector('#left-score').value==='1'")
 page.wait_for_function("()=>document.querySelector('#preview-overlay #left-player').textContent.includes('选手甲')")
 overlay=browser.new_page(viewport={'width':1920,'height':1080})
 overlay.goto('http://127.0.0.1:17880/overlay.html');overlay.wait_for_selector('svg');overlay.wait_for_function("()=>document.querySelector('#left-player').textContent.includes('选手甲')")
 page.locator('[data-icon="left"]').set_input_files(icon);page.wait_for_function("()=>document.querySelector('#left-player image').getAttribute('href').startsWith('data:image/png')")
 page.locator('[data-action="swap"]').click();page.wait_for_function("()=>document.querySelector('[data-field=\"right.id\"]').value==='选手甲'")
 overlay.wait_for_function("()=>document.querySelector('#right-player').textContent.includes('选手甲')")
 assert overlay.locator('#right-player image').get_attribute('href').startswith('data:image/png')
 page.locator('[data-action="undo"]').click();page.wait_for_function("()=>document.querySelector('[data-field=\"left.id\"]').value==='选手甲'")
 page.locator('#visible').uncheck();overlay.wait_for_function("()=>document.querySelector('svg').style.visibility==='hidden'")
 page.locator('#visible').check();overlay.wait_for_function("()=>document.querySelector('svg').style.visibility==='visible'")
 patch({'left':{'id':'<b>LONG NAME WITH A LOT OF TEXT</b>'[:32],'identity':'这是用于验证身份区域不会越界的长标题','score':999}})
 overlay.wait_for_function("()=>document.querySelector('#left-player').textContent.includes('LONG NAME')")
 assert overlay.locator('#left-player b').count()==0
 boxes=overlay.locator('#left-player text').evaluate_all('(els)=>els.map(e=>{let b=e.getBBox();return {x:b.x,right:b.x+b.width,y:b.y,bottom:b.y+b.height}})')
 assert boxes[2]['right']<=630,boxes
 assert boxes[1]['right']<=449,boxes
 # Restore showcase defaults and verify transparent safe regions from rendered alpha.
 patch({'left':{'id':'NOVA','identity':'CHALLENGER','score':2,'icon':''},'right':{'id':'RYUJIN','identity':'DEFENDING CHAMPION','score':1,'icon':''},'round':'ROUND 2 POOLS','style':{'accent':'#9f2545','text':'#f4f1f5','identity':'#ba3458','background':'#0d0c12','opacity':1},'visible':True})
 overlay.wait_for_function("()=>document.querySelector('#left-player').textContent.includes('NOVA')")
 overlay.screenshot(path=str(out/'overlay-transparent.png'),omit_background=True)
 alpha=Image.open(out/'overlay-transparent.png').convert('RGBA').getchannel('A')
 for name,box in {'left lamps':(721,38,819,70),'right lamps':(1100,38,1197,70),'timer':(895,33,1025,135),'health and game':(0,70,1920,1080)}.items():assert alpha.crop(box).getbbox() is None,name
 page.wait_for_function("()=>!document.querySelector('#toast').classList.contains('show')")
 page.screenshot(path=str(out/'control-panel.png'),full_page=True)
 # Composite only for an accurate native 1080p output preview.
 background=Image.open(root/'public/assets/game-reference.png').convert('RGBA');Image.alpha_composite(background,Image.open(out/'overlay-transparent.png').convert('RGBA')).convert('RGB').save(out/'broadcast-preview.png')
 assert not errors,errors
 browser.close()
 print(json.dumps({'ui':'passed','checks':['edit ID / identity','add score','replace logo','swap full information','undo','show / hide','separate OBS SSE sync','safe text rendering','long-label bounds','native HUD alpha clear','1920x1080 output'],'consoleErrors':errors},ensure_ascii=False))
