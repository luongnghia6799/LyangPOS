@echo off
title POSLite - Trinh dong goi ung dung Tauri v2 (Lite Mode)
chcp 65001 > nul
cls

echo =====================================================================
echo    * POSLITE - TIEN TRINH DONG GOI UNG DUNG TAURI LITE *
echo =====================================================================
echo.
echo [*] Buoc 1: Bien dich Backend Rust che do Release...
cd /d "%~dp0backend-rust"
cargo build --release
if %ERRORLEVEL% NEQ 0 goto :error_backend

echo.
echo [*] Buoc 2: Sao chep file bien dich moi vao thu muc Tauri sidecar...
cd /d "%~dp0"
if not exist "%~dp0frontend\src-tauri\bin" mkdir "%~dp0frontend\src-tauri\bin"
if exist "%~dp0backend-rust\target\release\backend-rust.exe" (
    copy /y "%~dp0backend-rust\target\release\backend-rust.exe" "%~dp0frontend\src-tauri\bin\lyang-backend-x86_64-pc-windows-msvc.exe"
) else (
    goto :error_copy
)
if %ERRORLEVEL% NEQ 0 goto :error_copy

echo.
echo [*] Buoc 3: Di chuyen vao thu muc frontend...
cd /d "%~dp0frontend"

echo.
echo [*] Buoc 4: Kiem tra cai dat va cap nhat cac thu vien moi nhat...
if not exist "node_modules" (
    call npm install
)

echo.
echo [*] Buoc 5: Bat dau qua trinh bien dich va dong goi Tauri POSLite...
echo [!] Luu y: Qua trinh nay mat khoang 1-2 phut.
call npm run tauri:build
if %ERRORLEVEL% NEQ 0 goto :error_tauri

echo.
echo =====================================================================
echo    * DONG GOI POSLITE THANH CONG RUC RO! *
echo =====================================================================
echo.
echo [*] File cai dat (.msi / .exe) da duoc tao tai thu muc:
echo     frontend\src-tauri\target\release\bundle\
echo.
echo [>] Dang tu dong mo thu muc chua file cai dat cho ban...
start "" "%~dp0frontend\src-tauri\target\release\bundle"
echo.
echo Chuc cua hang Lyang Nghia gat hai duoc nhieu mua mang boi thu!
echo =====================================================================
pause
exit /b 0

:error_backend
echo.
echo [LOI] Bien dich Backend PyInstaller bi that bai!
pause
exit /b 1

:error_copy
echo.
echo [LOI] Khong the sao chep file backend vao src-tauri\bin!
pause
exit /b 1

:error_tauri
echo.
echo [LOI] Qua trinh dong goi ung dung Tauri POSLite bi that bai!
echo Vui long kiem tra lai nhat ky loi o phia tren.
echo.
pause
exit /b 1
