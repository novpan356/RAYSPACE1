const fs=require('node:fs/promises');
const path=require('node:path');
const {build,Platform,Arch}=require('electron-builder');
// electron-builder's own strict PE/NSIS reader is platform-independent. Upstream uses it
// on macOS. Use the same checked parser on Linux instead of executing the intermediate
// Windows program in Wine; all installer templates and signing decisions remain upstream.
if(process.platform==='linux'){
 const builderVersion=require('app-builder-lib/package.json').version;
 if(builderVersion!=='26.18.0')throw new Error('Review NSIS extraction adapter before upgrading app-builder-lib');
 const {NsisTarget}=require('app-builder-lib/out/targets/nsis/NsisTarget.js');
 const {UninstallerReader,nsisTemplatesDir}=require('app-builder-lib/out/targets/nsis/nsisUtil.js');
 NsisTarget.prototype.computeScriptAndSignUninstaller=async function(defines,commands,installerPath,sharedHeader,archs){
  if(this.options.script)throw new Error('Custom NSIS scripts are not supported by this adapter');
  const script=await fs.readFile(path.join(nsisTemplatesDir,'installer.nsi'),'utf8');
  const out=path.join(this.outDir,path.basename(installerPath,'exe')+'__uninstaller.exe');
  defines.BUILD_UNINSTALLER=null;
  defines.UNINSTALLER_OUT_FILE=path.win32.join('Z:',out);
  await this.executeMakensis(defines,commands,sharedHeader+await this.computeFinalScript(script,false,archs));
  await UninstallerReader.exec(installerPath,out);
  await this.packager.signIf(out);
  delete defines.BUILD_UNINSTALLER;
  defines.UNINSTALLER_OUT_FILE=out;
  return {script,isCustomScript:false};
 };
}
build({targets:Platform.WINDOWS.createTarget(['nsis'],Arch.x64),publish:'never'}).catch(e=>{console.error(e);process.exitCode=1;});
