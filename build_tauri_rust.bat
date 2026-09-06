@echo off
title LyangPOS - Dong Goi Ung Dung Voi Backend Rust
chcp 65001 > nul
cls

echo =====================================================================
echo    * LYANGPOS - TIEN TRINH DONG GOI UNG DUNG (RUST BACKEND + TAURI) *
echo =====================================================================
echo.

:: 1. Kiem tra thu muc goc
cd /d "%~dp0"

:: 2. Kiem tra Cargo (Rust)
echo [*] Kiem tra moi truong Rust (cargo)...
where cargo >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Khong tim thay Rust/Cargo trong he thong! Vui long cai dat Rust truoc.
    pause
    exit /b 1
)

:: 3. Kiem tra Node.js / npm
echo [*] Kiem tra moi truong Node.js (npm)...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [LOI] Khong tim thay Node.js/npm trong he thong!
    pause
    exit /b 1
)

echo.
echo [*] Buoc 1: Bien dich Backend Rust che do Release (sieu nhanh va nhe)...
cd /d "%~dp0backend-rust"
cargo build --release
if %ERRORLEVEL% NEQ 0 goto :error_backend

echo.
echo [*] Buoc 2: Sao chep file binary backend-rust vao thu muc Tauri Sidecar...
cd /d "%~dp0"
if not exist "%~dp0frontend\src-tauri\bin" mkdir "%~dp0frontend\src-tauri\bin"

if exist "%~dp0backend-rust\target\release\backend-rust.exe" (
    copy /y "%~dp0backend-rust\target\release\backend-rust.exe" "%~dp0frontend\src-tauri\bin\lyang-backend-x86_64-pc-windows-msvc.exe"
) else (
    echo [LOI] Khong tim thay file backend-rust.exe sau khi bien dich!
    goto :error_copy
)
if %ERRORLEVEL% NEQ 0 goto :error_copy

echo [*] Sao chep Sidecar thanh cong: lyang-backend-x86_64-pc-windows-msvc.exe

echo.
echo [*] Buoc 3: Di chuyen vao thu muc Frontend va kiem tra thu vien...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo [*] Dang cai dat dependencies frontend...
    call npm install
)

echo.
echo [*] Buoc 4: Bat dau qua trinh build frontend va dong goi Tauri (.msi / .exe)...
echo [!] Qua trinh dong goi Tauri dang chay...
call npm run tauri:build
if %ERRORLEVEL% NEQ 0 goto :error_tauri

echo.
echo =====================================================================
echo    * DONG GOI TAURI VOI RUST BACKEND THANH CONG RUC RO! *
echo =====================================================================
echo.
echo [*] File cai dat da duoc tao tai:
echo     frontend\src-tauri\target\release\bundle\nsis\
echo.
echo [>] Dang mo thu muc chua file cai dat cho ban...
start "" "%~dp0frontend\src-tauri\target\release\bundle\nsis"
echo.

set /p UPLOAD_CHOICE="[?] Ban co muon DANG BAN CAI DAT LEN GITHUB RELEASE ngay bay gio? (y/n) [y]: "
if /i "%UPLOAD_CHOICE%"=="n" goto :finish

echo.
echo [*] Dang tien hanh dang len GitHub Release...
cd /d "%~dp0frontend"
node upload_release.js

:finish
echo.
echo =====================================================================
pause
exit /b 0

:error_backend
echo.
echo [LOI] Bien dich Backend Rust bi that bai! Vui long kiem tra loi phia tren.
pause
exit /b 1

:error_copy
echo.
echo [LOI] Khong the sao chep file binary backend-rust vao src-tauri\bin!
pause
exit /b 1

:error_tauri
echo.
echo [LOI] Qua trinh dong goi ung dung Tauri bi that bai!
echo Vui long kiem tra lai nhat ky loi o phia tren.
echo.
pause
exit /b 1
