#!/bin/bash

echo "=============================================="
echo "     MDD 시스템 설치 스크립트"
echo "=============================================="
echo

echo "1. API 서버 의존성 설치 중..."
cd api
npm ci --only=production
if [ $? -ne 0 ]; then
    echo "API 의존성 설치 실패!"
    exit 1
fi
cd ..

echo
echo "2. 데이터베이스 디렉토리 생성 중..."
mkdir -p data logs uploads

echo
echo "3. 환경 설정 파일 확인 중..."
if [ ! -f .env ]; then
    echo "환경 설정 파일이 없습니다!"
    echo "env-template을 참고하여 .env 파일을 생성하세요."
    echo "cp env-template .env"
    echo "nano .env  # 또는 vi .env로 편집"
    exit 1
fi

echo
echo "4. 데이터베이스 초기화 중..."
cd api
npm run typeorm migration:run 2>/dev/null || true
cd ..

echo
echo "5. 권한 설정 중..."
chmod +x start.sh stop.sh
chmod 755 data logs uploads

echo
echo "=============================================="
echo "     설치 완료!"
echo "=============================================="
echo
echo "다음으로 ./start.sh를 실행하여 시스템을 시작하세요."