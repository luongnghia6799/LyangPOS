@echo off
title LyangPOS - Dang Ban Cai Dat NSIS Len GitHub Release
chcp 65001 > nul
cls

echo =====================================================================
echo    * DANG TAI BAN CAI DAT NSIS LEN GITHUB RELEASE *
echo    * Repository: luongnghia6799/LyangPOS
echo =====================================================================
echo.

cd /d "%~dp0frontend"

:: Kiem tra node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Khong tim thay Node.js trong he thong!
    pause
    exit /b 1
)

:: Kiem tra file cai dat NSIS truoc khi upload
if not exist "%~dp0frontend\src-tauri\target\release\bundle\nsis" (
    echo [!] Khong tim thay thu muc bundle NSIS!
    echo [*] Dang tien hanh dong goi ban cai dat moi...
    call npm run tauri:build
)

echo [*] Bat dau qua trinh upload len GitHub Release...
node upload_release.js

echo.
echo =====================================================================
pause
exit /b 0
