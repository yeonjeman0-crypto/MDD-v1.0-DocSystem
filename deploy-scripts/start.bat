@echo off
echo ==============================================
echo     MDD 시스템 시작 스크립트
echo ==============================================
echo.

:: Check if API is already running
tasklist /FI "IMAGENAME eq node.exe" | find /I "node.exe" > nul
if %errorlevel% == 0 (
    echo 이미 실행 중인 Node.js 프로세스가 있습니다.
    echo 기존 프로세스를 종료하고 다시 시작하시겠습니까? (Y/N)
    set /p choice=
    if /i "%choice%"=="Y" (
        taskkill /F /IM node.exe > nul 2>&1
        timeout /t 2 > nul
    )
)

echo 1. API 서버 시작 중...
cd api
start "MDD API Server" cmd /c "npm run start:prod && pause"
timeout /t 3 > nul
cd ..

echo.
echo 2. 웹 서버 시작 중 (Admin Portal)...
start "MDD Admin Portal" cmd /c "cd admin-portal && python -m http.server 3000 --directory dist && pause"

echo.
echo 3. 브라우저에서 Admin Portal 열기...
timeout /t 2 > nul
start http://localhost:3000

echo.
echo ==============================================
echo     MDD 시스템이 시작되었습니다!
echo ==============================================
echo.
echo 서비스 접속:
echo - Admin Portal: http://localhost:3000
echo - API Server: http://localhost:4000
echo.
echo 서비스 종료:
echo - stop.bat을 실행하거나
echo - 각 터미널 창을 닫으세요
echo.
pause