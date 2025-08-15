# MDD v1.0 System - Setup Verification Guide

## 🔍 Environment Verification Results

### ✅ System Requirements
- **Node.js**: v22.18.0 ✅ (Required: >=20.0.0)
- **npm**: v10.9.3 ✅ (Required: >=9.0.0)
- **Docker**: v28.3.2 ✅
- **Docker Compose**: v2.39.1 ✅

### ✅ Project Structure Verification
- **Root package.json**: ✅ Workspace configuration valid
- **admin-portal/package.json**: ✅ React 18.3 + Ant Design 5
- **api/package.json**: ✅ NestJS 10 + TypeORM + PostgreSQL
- **viewer/package.json**: ✅ Electron 25 + React-PDF
- **docker-compose.yml**: ✅ Full infrastructure stack

### ✅ File Organization
- **JSON Documents**: 4개 파일 (MM, PR, I, DRKF) 정상 위치
- **PDF Documents**: 절차서 PDF/ 폴더 정리 완료
- **Original Documents**: 절차서 원본/ 폴더 정리 완료
- **Temporary Files**: 모든 임시 파일 제거 완료

## 🚀 Quick Start Commands

### 1. 의존성 설치
```bash
cd MDD-v1.0-DocSystem
npm install
```

### 2. 개발 인프라 시작
```bash
docker-compose up -d
```

### 3. 개발 서버 실행
```bash
# 모든 서비스 동시 실행
npm run dev

# 또는 개별 실행
npm run dev:api      # NestJS API (포트 3001)
npm run dev:portal   # React Portal (포트 5173)
```

### 4. 접속 확인
- **Admin Portal**: http://localhost:5173
- **API Server**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **MinIO Console**: http://localhost:9001 (admin/minio_password123)
- **Grafana**: http://localhost:3000 (admin/admin)

## 🔧 Development Tools

### 빌드 명령어
```bash
npm run build           # 모든 프로젝트 빌드
npm run build:api       # API 빌드
npm run build:portal    # Portal 빌드
npm run build:viewer    # Viewer 빌드
```

### 테스트 명령어
```bash
npm run test           # 모든 프로젝트 테스트
npm run test:api       # API 테스트
npm run test:portal    # Portal 테스트
```

### Docker 명령어
```bash
npm run docker:build   # 도커 이미지 빌드
npm run docker:up      # 도커 컨테이너 시작
npm run docker:down    # 도커 컨테이너 중지
```

## 📝 Known Issues & Solutions

### ESLint 이슈
현재 ESLint가 설치되지 않은 상태이므로 다음 명령어로 해결:
```bash
cd api && npm install eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser --save-dev
cd ../admin-portal && npm install eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser --save-dev
```

### 권한 이슈 (Windows)
Docker Desktop이 실행 중인지 확인하고, 관리자 권한으로 실행할 것을 권장합니다.

## 🎯 Next Development Steps

1. **Phase 2: Viewer Implementation**
   - Electron PDF 뷰어 구현
   - DRK 패키지 포맷 구현
   - 드래그앤드롭 기능 추가

2. **Phase 3: Advanced Features**
   - Elasticsearch 통합
   - 무결성 검증 시스템
   - 모니터링 대시보드

## ✅ Setup Complete
프로젝트가 성공적으로 정리되고 개발 준비가 완료되었습니다.