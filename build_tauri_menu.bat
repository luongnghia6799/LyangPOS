@echo off
title LyangPOS - Chon Trinh Dong Goi Ung Dung
chcp 65001 > nul
cls

echo =====================================================================
echo                * LYANGPOS - TRINH DONG GOI UNG DUNG *
echo =====================================================================
echo.
echo   [1] Dong goi voi BACKEND RUST (Khuyen dung - Chay sieu nhanh, nhe, muot)
echo   [2] Dong goi voi BACKEND PYTHON (Ban cu)
echo   [3] DANG BAN CAI DAT LEN GITHUB RELEASE (Khong can build lai)
echo   [4] Thoat
echo.
echo =====================================================================
set /p choice="Nhap lua chon cua ban [1/2/3/4] (Mac dinh la 1): "

if "%choice%"=="" set choice=1
if "%choice%"=="1" goto :build_rust
if "%choice%"=="2" goto :build_python
if "%choice%"=="3" goto :upload_release
if "%choice%"=="4" exit /b 0

:build_rust
call "%~dp0build_tauri_rust.bat"
exit /b %ERRORLEVEL%

:build_python
call "%~dp0build_tauri_python.bat"
exit /b %ERRORLEVEL%

:upload_release
call "%~dp0DANG_RELEASE_GITHUB.bat"
exit /b %ERRORLEVEL%
