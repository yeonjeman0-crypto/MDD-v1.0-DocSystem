@echo off
echo ==============================================
echo     MDD 시스템 설치 스크립트
echo ==============================================
echo.

echo 1. API 서버 의존성 설치 중...
cd api
call npm ci --only=production
if errorlevel 1 (
    echo API 의존성 설치 실패!
    exit /b 1
)
cd ..

echo.
echo 2. 데이터베이스 디렉토리 생성 중...
if not exist data mkdir data
if not exist logs mkdir logs
if not exist uploads mkdir uploads

echo.
echo 3. 환경 설정 파일 확인 중...
if not exist .env (
    echo 환경 설정 파일이 없습니다!
    echo env-template을 참고하여 .env 파일을 생성하세요.
    pause
    exit /b 1
)

echo.
echo 4. 데이터베이스 초기화 중...
cd api
call npm run typeorm migration:run 2>nul
cd ..

echo.
echo ==============================================
echo     설치 완료!
echo ==============================================
echo.
echo 다음으로 start.bat을 실행하여 시스템을 시작하세요.
pause