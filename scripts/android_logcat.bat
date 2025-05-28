@echo off
setlocal

:: 請將這裡改成你 app 的包名
set PACKAGE_NAME=com.tseng001.robotcoreadv

:: 顯示目前抓取的應用
echo Target package: %PACKAGE_NAME%
echo.

:: 取得該包名的 PID
for /f "delims=" %%A in ('adb shell pidof %PACKAGE_NAME%') do set PID=%%A

:: 判斷是否取得 PID 成功
if "%PID%"=="" (
    echo [錯誤] 找不到應用程式的 PID，請確認 app 是否正在運行。
    pause
    exit /b
)

echo Found PID: %PID%
echo 開始抓取 logcat（按 Ctrl+C 停止）
echo.

:: 顯示該 PID 的 logcat
adb logcat --pid=%PID% -v time

endlocal
