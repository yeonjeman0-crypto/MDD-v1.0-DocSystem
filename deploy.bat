@echo off
echo ==============================================
echo     MDD v1.0 시스템 배포 스크립트
echo     DORIKO Document Distribution System
echo ==============================================
echo.

:: Set deployment directory
set DEPLOY_DIR=deploy\mdd-system
set API_DIR=%DEPLOY_DIR%\api
set ADMIN_DIR=%DEPLOY_DIR%\admin-portal
set VIEWER_DIR=%DEPLOY_DIR%\viewer

echo 1. 배포 디렉토리 준비 중...
if exist deploy rmdir /s /q deploy
mkdir %DEPLOY_DIR%
mkdir %API_DIR%
mkdir %ADMIN_DIR%
mkdir %VIEWER_DIR%

echo.
echo 2. API 서버 패키징 중...
cd api
call npm run build
if errorlevel 1 (
    echo API 빌드 실패!
    exit /b 1
)
cd ..

:: Copy API files
xcopy api\dist %API_DIR%\dist\ /E /I
xcopy api\package.json %API_DIR%\
xcopy api\package-lock.json %API_DIR%\
xcopy api\nest-cli.json %API_DIR%\
xcopy api\tsconfig.json %API_DIR%\

echo.
echo 3. Admin Portal 패키징 중...
cd admin-portal
call npm run build:prod
if errorlevel 1 (
    echo Admin Portal 빌드 실패!
    exit /b 1
)
cd ..

:: Copy Admin Portal files
xcopy admin-portal\dist %ADMIN_DIR%\dist\ /E /I
xcopy admin-portal\package.json %ADMIN_DIR%\

echo.
echo 4. Viewer 앱 패키징 중...
cd viewer
call npm run build
if errorlevel 1 (
    echo Viewer 빌드 실패!
    exit /b 1
)
cd ..

:: Copy Viewer files
xcopy viewer\dist %VIEWER_DIR%\dist\ /E /I
xcopy viewer\package.json %VIEWER_DIR%\
xcopy viewer\electron.js %VIEWER_DIR%\ 2>nul

echo.
echo 5. 배포 스크립트 생성 중...
copy deploy-scripts\* %DEPLOY_DIR%\

echo.
echo 6. 문서 및 설정 파일 복사 중...
copy README.md %DEPLOY_DIR%\
copy FRONTEND_INTEGRATION.md %DEPLOY_DIR%\
copy .env.example %DEPLOY_DIR%\env-template

echo.
echo ==============================================
echo     배포 완료!
echo     Location: %DEPLOY_DIR%
echo ==============================================
echo.
echo 다음 단계:
echo 1. cd deploy\mdd-system
echo 2. 환경 설정 파일 편집 (env-template 참조)
echo 3. install.bat 실행
echo 4. start.bat 실행
echo.
pause