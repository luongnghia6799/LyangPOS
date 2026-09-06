!macro NSIS_HOOK_PREINSTALL
    nsExec::Exec 'taskkill /F /IM lyang-backend-x86_64-pc-windows-msvc.exe'
    nsExec::Exec 'taskkill /F /IM LyangPOS.exe'
    nsExec::Exec 'taskkill /F /IM app.exe'
    nsExec::Exec 'taskkill /F /IM lyang-backend.exe'
!macroend

!macro NSIS_HOOK_PREUNINSTALL
    nsExec::Exec 'taskkill /F /IM lyang-backend-x86_64-pc-windows-msvc.exe'
    nsExec::Exec 'taskkill /F /IM LyangPOS.exe'
    nsExec::Exec 'taskkill /F /IM app.exe'
    nsExec::Exec 'taskkill /F /IM lyang-backend.exe'
    nsExec::Exec 'cmd /c rmdir /s /q "$LOCALAPPDATA\com.lyangpos.app\EBWebView"'
!macroend

