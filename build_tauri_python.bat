@echo off
title LyangPOS - Trinh dong goi ung dung Tauri v2
chcp 65001 > nul
cls

echo =====================================================================
echo    * LYANGPOS - TIEN TRINH DONG GOI UNG DUNG TAURI *
echo =====================================================================
echo.
echo [*] Buoc 1: Bien dich Python Backend thanh Sidecar (.exe)...
cd /d "%~dp0"

:: Kiem tra hoac tao moi .venv
if not exist .venv (
    echo [*] Tao moi moi truong ao .venv...
    python -m venv .venv
)

:: Kiem tra xem .venv co hoat dong khong (phong khi bi chuyen may)
.venv\Scripts\python.exe -c "import sys" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [*] Phat hien .venv bi loi hoac khong dung duong dan, dang tao lai...
    rmdir /s /q .venv
    python -m venv .venv
)

call .venv\Scripts\activate

echo [*] Cai dat hoac cap nhat cac thu vien cho Backend...
python -m pip install -r backend/requirements.txt

python -m PyInstaller --clean --noconfirm backend/lyang-backend.spec
if %ERRORLEVEL% NEQ 0 goto :error_backend

echo [*] Buoc 2: Sao chep file bien dich moi vao thu muc Tauri sidecar...
if not exist "%~dp0frontend\src-tauri\bin" mkdir "%~dp0frontend\src-tauri\bin"
if exist "%~dp0dist\lyang-backend.exe" (
    copy /y "%~dp0dist\lyang-backend.exe" "%~dp0frontend\src-tauri\bin\lyang-backend-x86_64-pc-windows-msvc.exe"
) else (
    copy /y "%~dp0backend\dist\lyang-backend.exe" "%~dp0frontend\src-tauri\bin\lyang-backend-x86_64-pc-windows-msvc.exe"
)
if %ERRORLEVEL% NEQ 0 goto :error_copy

echo.
echo [*] Buoc 3: Di chuyen vao thu muc frontend...
cd /d "%~dp0frontend"

echo.
echo [*] Buoc 4: Kiem tra cai dat va cap nhat cac thu vien moi nhat...
call npm install

echo.
echo [*] Buoc 5: Bat dau qua trinh bien dich va dong goi Tauri...
echo [!] Luu y: Qua trinh nay co the mat tu 2-5 phut tuy cau hinh may tinh.
call npm run tauri:build
if %ERRORLEVEL% NEQ 0 goto :error_tauri

echo.
echo [*] Buoc 6: Tu dong tai ban cai dat len GitHub Release (lyangpos_thi)...
call node upload_release.js

echo.
echo =====================================================================
echo    * DONG GOI VA PHAT HANH TAURI THANH CONG RUC RO! *
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
echo [LOI] Qua trinh dong goi ung dung Tauri bi that bai!
echo Vui long kiem tra lai nhat ky loi o phia tren.
echo.
pause
exit /b 1
