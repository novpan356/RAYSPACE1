const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');const {execFile}=require('node:child_process');const {promisify}=require('node:util');const {getPath7za}=require('app-builder-lib/out/toolsets/7zip.js');
const run=promisify(execFile);const root=path.resolve(__dirname,'..');const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function walk(dir,prefix=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name),path.join(prefix,e.name)):[path.join(prefix,e.name)]);}
async function main(){
 const version=require('../package.json').version;const installer=path.join(root,'release',`RAYSPACE-Scoreboard-Setup-${version}.exe`);const bytes=fs.statSync(installer).size;
 if(bytes<10000000)throw new Error('Installer is incomplete');if(bytes>=100*1024*1024)throw new Error('Installer exceeds GitHub single-file limit');
 const sevenZip=await getPath7za();const dir=path.join(root,'artifacts','installer-extract-'+Date.now());
 await run(sevenZip,['t',installer],{timeout:120000,maxBuffer:4*1024*1024});await run(sevenZip,['x','-y','-o'+dir,installer],{timeout:120000,maxBuffer:4*1024*1024});
 const payloads=walk(dir).filter(p=>p.endsWith('.7z'));if(payloads.length!==1)throw new Error('Expected one embedded application payload');
 const payload=path.join(dir,payloads[0]);await run(sevenZip,['t',payload],{timeout:120000,maxBuffer:4*1024*1024});const app=path.join(dir,'app');await run(sevenZip,['x','-y','-o'+app,payload],{timeout:120000,maxBuffer:4*1024*1024});
 const source=path.join(root,'release','win-unpacked');const files=walk(source);for(const file of files){const actual=path.join(app,file);if(!fs.existsSync(actual)||hash(path.join(source,file))!==hash(actual))throw new Error('Embedded application content differs: '+file);}
 const uninstallers=walk(dir).filter(p=>/uninstall.*\.exe$/i.test(path.basename(p)));if(!uninstallers.length)throw new Error('Embedded uninstaller not found');
 const report={version,installerBytes:bytes,sha256:hash(installer),nsisArchiveCRC:'passed',embeddedPayloadCRC:'passed',embeddedFilesMatched:files.length,embeddedUninstallers:uninstallers,windowsInstallExecuted:false};
 fs.writeFileSync(path.join(root,'artifacts','installer-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}
main().catch(error=>{console.error(error.message);if(error.stdout)console.error(error.stdout);if(error.stderr)console.error(error.stderr);process.exit(1);});
