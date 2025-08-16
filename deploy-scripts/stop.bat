@echo off
echo ==============================================
echo     MDD 시스템 종료 스크립트
echo ==============================================
echo.

echo 1. Node.js 프로세스 종료 중...
taskkill /F /IM node.exe > nul 2>&1
if %errorlevel% == 0 (
    echo API 서버가 종료되었습니다.
) else (
    echo 실행 중인 API 서버가 없습니다.
)

echo.
echo 2. Python HTTP 서버 종료 중...
taskkill /F /IM python.exe > nul 2>&1
if %errorlevel% == 0 (
    echo Admin Portal 서버가 종료되었습니다.
) else (
    echo 실행 중인 Admin Portal 서버가 없습니다.
)

echo.
echo 3. Electron 프로세스 종료 중...
taskkill /F /IM electron.exe > nul 2>&1
if %errorlevel% == 0 (
    echo Viewer 앱이 종료되었습니다.
) else (
    echo 실행 중인 Viewer 앱이 없습니다.
)

echo.
echo ==============================================
echo     MDD 시스템이 종료되었습니다.
echo ==============================================
pause