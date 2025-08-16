#!/bin/bash

echo "=============================================="
echo "     MDD v1.0 시스템 배포 스크립트"
echo "     DORIKO Document Distribution System"
echo "=============================================="
echo

# Set deployment directory
DEPLOY_DIR="deploy/mdd-system"
API_DIR="$DEPLOY_DIR/api"
ADMIN_DIR="$DEPLOY_DIR/admin-portal"
VIEWER_DIR="$DEPLOY_DIR/viewer"

echo "1. 배포 디렉토리 준비 중..."
rm -rf deploy
mkdir -p "$DEPLOY_DIR"
mkdir -p "$API_DIR"
mkdir -p "$ADMIN_DIR"
mkdir -p "$VIEWER_DIR"

echo
echo "2. API 서버 패키징 중..."
cd api
npm run build
if [ $? -ne 0 ]; then
    echo "API 빌드 실패!"
    exit 1
fi
cd ..

# Copy API files
cp -r api/dist "$API_DIR/"
cp api/package.json "$API_DIR/"
cp api/package-lock.json "$API_DIR/"
cp api/nest-cli.json "$API_DIR/"
cp api/tsconfig.json "$API_DIR/"

echo
echo "3. Admin Portal 패키징 중..."
cd admin-portal
npm run build:prod
if [ $? -ne 0 ]; then
    echo "Admin Portal 빌드 실패!"
    exit 1
fi
cd ..

# Copy Admin Portal files
cp -r admin-portal/dist "$ADMIN_DIR/"
cp admin-portal/package.json "$ADMIN_DIR/"

echo
echo "4. Viewer 앱 패키징 중..."
cd viewer
npm run build
if [ $? -ne 0 ]; then
    echo "Viewer 빌드 실패!"
    exit 1
fi
cd ..

# Copy Viewer files
cp -r viewer/dist "$VIEWER_DIR/"
cp viewer/package.json "$VIEWER_DIR/"
[ -f viewer/electron.js ] && cp viewer/electron.js "$VIEWER_DIR/"

echo
echo "5. 배포 스크립트 생성 중..."
cp deploy-scripts-linux/* "$DEPLOY_DIR/" 2>/dev/null || true

echo
echo "6. 문서 및 설정 파일 복사 중..."
cp README.md "$DEPLOY_DIR/"
cp FRONTEND_INTEGRATION.md "$DEPLOY_DIR/"
cp .env.example "$DEPLOY_DIR/env-template"

echo
echo "=============================================="
echo "     배포 완료!"
echo "     Location: $DEPLOY_DIR"
echo "=============================================="
echo
echo "다음 단계:"
echo "1. cd deploy/mdd-system"
echo "2. 환경 설정 파일 편집 (env-template 참조)"
echo "3. ./install.sh 실행"
echo "4. ./start.sh 실행"
echo