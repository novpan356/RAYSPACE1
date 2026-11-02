@echo off
setlocal
chcp 65001 >nul
set "RS_BUNDLE_DIR=%~dp0"
set "RS_ARCHIVE=%RS_BUNDLE_DIR%RAYSPACE-Scoreboard-1.0.0-Windows-x64.zip"
if not exist "%RS_BUNDLE_DIR%RAYSPACE-Windows-x64.zip.part01" goto missing
if not exist "%RS_BUNDLE_DIR%RAYSPACE-Windows-x64.zip.part02" goto missing
if not exist "%RS_BUNDLE_DIR%RAYSPACE-Windows-x64.zip.part03" goto missing
if not exist "%RS_BUNDLE_DIR%RAYSPACE-Windows-x64.zip.part04" goto missing
if exist "%RS_ARCHIVE%" goto verify
echo [1/3] 正在合并安装包，请稍候...
copy /b "%RS_BUNDLE_DIR%RAYSPACE-Windows-x64.zip.part01"+"%RS_BUNDLE_DIR%RAYSPACE-Windows-x64.zip.part02"+"%RS_BUNDLE_DIR%RAYSPACE-Windows-x64.zip.part03"+"%RS_BUNDLE_DIR%RAYSPACE-Windows-x64.zip.part04" "%RS_ARCHIVE%" >nul
if errorlevel 1 goto failed
:verify
echo [2/3] 正在验证 SHA-256 并解压，请稍候...
powershell.exe -NoLogo -NoProfile -Command "$ErrorActionPreference='Stop'; $zip=$env:RS_ARCHIVE; $expected='13c658e81f747f53aedccf45a7f4739527d675f2f1a6a1c2417e34e1061c18eb'; if ((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash -ne $expected) { throw '校验失败：文件不完整或已被修改。请重新下载完整仓库 ZIP。' }; $dest=Join-Path $env:RS_BUNDLE_DIR ('RAYSPACE-1.0.0-'+[DateTime]::Now.ToString('yyyyMMdd-HHmmssfff')); Expand-Archive -LiteralPath $zip -DestinationPath $dest; Write-Host '[3/3] 校验通过，正在启动记分板...'; Start-Process -FilePath (Join-Path $dest 'RAYSPACE Scoreboard.exe') -WorkingDirectory $dest; Write-Host ('软件目录：'+$dest)"
if errorlevel 1 goto failed
echo 完成。以后可直接从上方软件目录运行 RAYSPACE Scoreboard.exe。
pause
exit /b 0
:missing
echo 缺少安装包分片。请使用 GitHub 的 Code - Download ZIP 下载整个仓库并完整解压。
pause
exit /b 1
:failed
echo 操作失败，未继续启动。请检查上方错误；不要运行未通过校验的文件。
echo 如果合并后的 ZIP 已损坏，可只删除 windows-download 中生成的完整 ZIP 后重新运行此脚本。
pause
exit /b 1
