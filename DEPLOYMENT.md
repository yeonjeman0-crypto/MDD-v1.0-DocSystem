# MDD v1.0 시스템 배포 가이드
**DORIKO Maritime Document Distribution System**

## 🚀 배포 개요

MDD v1.0 시스템은 해상 문서 배포를 위한 통합 플랫폼으로, 다음 구성요소로 이루어져 있습니다:

- **API Server**: NestJS 기반 백엔드 서버
- **Admin Portal**: React 기반 관리자 웹 인터페이스
- **Viewer App**: Electron 기반 선박 문서 뷰어

## 📋 시스템 요구사항

### 최소 사양
- **OS**: Windows 10/11, Linux, macOS
- **Node.js**: 18.x 이상
- **RAM**: 4GB 이상
- **Storage**: 10GB 여유 공간
- **Network**: 인터넷 연결 (배포 시)

### 권장 사양
- **RAM**: 8GB 이상
- **CPU**: 4 Core 이상
- **Storage**: SSD 20GB 이상

## 🛠️ 자동 배포 (권장)

### 1단계: 프로젝트 다운로드
```bash
git clone <repository-url>
cd MDD-v1.0-DocSystem
```

### 2단계: 의존성 설치
```bash
npm install
cd api && npm install && cd ..
cd admin-portal && npm install && cd ..
cd viewer && npm install && cd ..
```

### 3단계: 자동 배포 실행
```bash
# Windows
deploy.bat

# Linux/macOS
chmod +x deploy.sh && ./deploy.sh
```

### 4단계: 배포된 시스템 설치
```bash
cd deploy/mdd-system

# 환경 설정
copy env-template .env
# .env 파일을 편집하여 환경에 맞게 설정

# 설치 실행
install.bat  # Windows
# 또는 ./install.sh  # Linux/macOS
```

### 5단계: 시스템 시작
```bash
start.bat  # Windows
# 또는 ./start.sh  # Linux/macOS
```

## 🔧 수동 배포

### 1. API 서버 배포
```bash
cd api
npm run build
npm ci --only=production

# 환경 설정
cp .env.example .env
# .env 파일 편집

# 프로덕션 실행
npm run start:prod
```

### 2. Admin Portal 배포
```bash
cd admin-portal
npm run build:prod

# 정적 파일 서빙 (예: nginx, apache, 또는 간단한 HTTP 서버)
npx serve -s dist -l 3000
```

### 3. Viewer App 배포
```bash
cd viewer
npm run build

# Electron 실행파일 생성
npm run dist
```

## 🐳 Docker 배포 (선택사항)

### Dockerfile 예시
```dockerfile
# API Server
FROM node:18-alpine
WORKDIR /app
COPY api/package*.json ./
RUN npm ci --only=production
COPY api/dist ./dist
EXPOSE 4000
CMD ["npm", "run", "start:prod"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: ./api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
  
  admin:
    image: nginx:alpine
    ports:
      - "3000:80"
    volumes:
      - ./admin-portal/dist:/usr/share/nginx/html
```

## 🔐 보안 설정

### 1. 환경 변수 설정
```bash
# 강력한 JWT 시크릿 설정
JWT_SECRET=your-very-long-and-random-secret-key

# BCRYPT 라운드 설정 (보안 강화)
BCRYPT_ROUNDS=12

# CORS 도메인 제한
CORS_ORIGIN=https://your-domain.com
```

### 2. 방화벽 설정
```bash
# API 포트만 개방
sudo ufw allow 4000/tcp
sudo ufw allow 3000/tcp
```

### 3. SSL/TLS 설정 (권장)
- Let's Encrypt 또는 상용 SSL 인증서 사용
- Nginx/Apache 프록시 설정
- HTTPS 리다이렉션 설정

## 📊 모니터링 설정

### 1. 로그 관리
```bash
# PM2 사용 (권장)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 logs
pm2 monit
```

### 2. 상태 모니터링
- `/health` 엔드포인트 활용
- Prometheus + Grafana (선택사항)
- 디스크 용량 모니터링

## 🔄 업데이트 프로세스

### 1. 백업
```bash
# 데이터베이스 백업
cp data/mdd.db data/mdd.db.backup

# 업로드 파일 백업
tar -czf uploads_backup.tar.gz uploads/
```

### 2. 업데이트 실행
```bash
# 서비스 중지
stop.bat

# 새 버전 배포
git pull
deploy.bat

# 서비스 재시작
cd deploy/mdd-system
start.bat
```

## 🚨 트러블슈팅

### 자주 발생하는 문제

#### 1. 포트 충돌
```bash
# 포트 사용 확인
netstat -tulpn | grep :4000

# 프로세스 종료
pkill -f node
```

#### 2. 의존성 오류
```bash
# 캐시 정리
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 3. 데이터베이스 연결 실패
- `.env` 파일의 데이터베이스 설정 확인
- 데이터베이스 서비스 상태 확인
- 권한 문제 확인

#### 4. 빌드 실패
```bash
# TypeScript 타입 확인
npm run build 2>&1 | grep error

# 의존성 버전 확인
npm audit
npm update
```

## 📞 지원

### 로그 파일 위치
- API 로그: `logs/api.log`
- 에러 로그: `logs/error.log`
- 접근 로그: `logs/access.log`

### 진단 명령어
```bash
# 시스템 상태 확인
curl http://localhost:4000/health

# 데이터베이스 연결 확인
curl http://localhost:4000/api/status
```

### 지원 연락처
- 개발팀: dev@doriko.com
- 기술지원: support@doriko.com
- 긴급상황: +82-000-0000

---

**© 2024 DORIKO. All rights reserved.**