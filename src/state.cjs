const fs = require('node:fs');
const path = require('node:path');
const DEFAULT_SHORTCUTS = {leftPlus:'Control+Alt+1',leftMinus:'Control+Alt+2',rightPlus:'Control+Alt+3',rightMinus:'Control+Alt+4',swap:'Control+Alt+S',undo:'Control+Alt+Z',toggle:'Control+Alt+H'};
function defaults(){return {version:1,left:{id:'NOVA',identity:'CHALLENGER',score:0,icon:''},right:{id:'RYUJIN',identity:'DEFENDING CHAMPION',score:0,icon:''},round:'ROUND 2 POOLS',style:{accent:'#9f2545',text:'#f4f1f5',identity:'#ba3458',background:'#0d0c12',opacity:1},visible:true,shortcuts:{...DEFAULT_SHORTCUTS},hotkeysEnabled:true,displayId:null};}
function fail(message){throw new Error(message);}
function str(v,max,label){if(typeof v!=='string'||v.length>max)fail(`${label}最多 ${max} 个字符`);return v.replace(/[\x00-\x1f]/g,'');}
function icon(v){str(v,1500000,'图标');if(!v)return '';const m=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+=*)$/.exec(v);if(!m)fail('图标仅支持 PNG、JPEG、WebP');const b=Buffer.from(m[2],'base64');if(b.length>1024*1024)fail('图标不能超过 1 MB');const valid=m[1]==='png'? b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):m[1]==='jpeg'?b[0]===255&&b[1]===216&&b[2]===255:b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP';if(!valid)fail('图标格式与文件内容不匹配');return v;}
function merge(current,patch){
 if(!patch||typeof patch!=='object'||Array.isArray(patch))fail('无效配置');const n=structuredClone(current);
 for(const side of ['left','right'])if(patch[side]!==undefined){const p=patch[side];if(!p||typeof p!=='object')fail('无效选手信息');for(const key of ['id','identity'])if(p[key]!==undefined)n[side][key]=str(p[key],key==='id'?32:28,'选手文字');if(p.score!==undefined){if(!Number.isInteger(p.score)||p.score<0||p.score>999)fail('比分应为 0～999 的整数');n[side].score=p.score;}if(p.icon!==undefined)n[side].icon=icon(p.icon);}
 if(patch.round!==undefined)n.round=str(patch.round,40,'赛事标题');
 if(patch.style!==undefined){if(!patch.style||typeof patch.style!=='object')fail('无效样式');for(const key of ['accent','text','identity','background'])if(patch.style[key]!==undefined){if(!/^#[0-9a-f]{6}$/i.test(patch.style[key]))fail('无效颜色');n.style[key]=patch.style[key];}if(patch.style.opacity!==undefined){if(typeof patch.style.opacity!=='number'||!Number.isFinite(patch.style.opacity)||patch.style.opacity<.2||patch.style.opacity>1)fail('透明度范围为 20%～100%');n.style.opacity=patch.style.opacity;}}
 for(const key of ['visible','hotkeysEnabled'])if(patch[key]!==undefined){if(typeof patch[key]!=='boolean')fail('无效开关');n[key]=patch[key];}
 if(patch.shortcuts!==undefined){if(!patch.shortcuts||typeof patch.shortcuts!=='object')fail('无效快捷键');for(const key of Object.keys(DEFAULT_SHORTCUTS))if(patch.shortcuts[key]!==undefined)n.shortcuts[key]=str(patch.shortcuts[key],80,'快捷键');const values=Object.values(n.shortcuts);if(new Set(values.map(v=>v.toLowerCase())).size!==values.length)fail('快捷键不能重复');if(values.some(v=>!v||!/(Control|Ctrl|Alt|Shift|Super|Command)/i.test(v)))fail('每个快捷键至少包含一个修饰键');}
 if(patch.displayId!==undefined){if(patch.displayId!==null&&!Number.isSafeInteger(patch.displayId))fail('无效显示器');n.displayId=patch.displayId;}
 return n;
}
class Store{
 constructor(file){this.file=file;this.history=[];this.state=defaults();this.loadWarning='';if(file&&fs.existsSync(file)){try{this.state=merge(this.state,JSON.parse(fs.readFileSync(file,'utf8')));}catch{const backup=file+'.corrupt-'+Date.now()+'.bak';fs.copyFileSync(file,backup);this.loadWarning='保存的配置无法读取，已载入默认值；原文件已备份为 .bak。';}}}
 commit(next,remember=true){if(JSON.stringify(next)===JSON.stringify(this.state))return this.state;if(this.file){fs.mkdirSync(path.dirname(this.file),{recursive:true});fs.writeFileSync(this.file+'.tmp',JSON.stringify(next,null,2));fs.renameSync(this.file+'.tmp',this.file);}if(remember){this.history.push(structuredClone(this.state));if(this.history.length>50)this.history.shift();}this.state=next;return next;}
 update(patch){return this.commit(merge(this.state,patch));}
 action(name){const n=structuredClone(this.state);const scoreActions={leftPlus:['left',1],leftMinus:['left',-1],rightPlus:['right',1],rightMinus:['right',-1]};if(scoreActions[name]){const [side,delta]=scoreActions[name];n[side].score=Math.max(0,Math.min(999,n[side].score+delta));}else if(name==='swap'){[n.left,n.right]=[n.right,n.left];}else if(name==='reset'){n.left.score=n.right.score=0;}else if(name==='toggle'){n.visible=!n.visible;}else if(name==='undo'){const old=this.history.at(-1);if(!old)return this.state;const restored={...this.state,left:old.left,right:old.right,round:old.round,style:old.style,visible:old.visible};const value=this.commit(restored,false);this.history.pop();return value;}else fail('未知操作');return this.commit(n);}
}
module.exports={Store,defaults,merge,DEFAULT_SHORTCUTS};
