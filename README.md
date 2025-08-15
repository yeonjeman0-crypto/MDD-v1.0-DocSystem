# MDD v1.0 - Maritime Document Distribution System

## 🚢 승인 제외형 문서·서식 통합 배포·열람 시스템

**Enterprise급 해운업 특화 문서 관리 솔루션**

### 📋 시스템 개요

- **목적**: 사내 문서·서식 중앙관리, 선박 오프라인 열람·인쇄·다운로드
- **배포**: USB 초기 설치 + 이메일 증분팩 (단일 드래그앤드롭)
- **용량**: 2-10GB 확장 지원, Zip64+Zstd-seekable 컨테이너
- **보안**: Ed25519 서명, SHA256 중복제거

### 🏗️ 아키텍처

```
관리 포털(웹) + 팩 생성기 + MinIO/S3 + PostgreSQL + Elasticsearch + 선박 Viewer(Electron)
```

### 📦 패키지 구조

```
MDD-v1.0-DocSystem/
├── admin-portal/       # React 18.3 + TypeScript + Ant Design 5
├── viewer/            # Electron 64-bit + React-PDF
├── exporter/          # NestJS Job (팩 생성기)
├── api/               # NestJS REST API
├── infrastructure/    # Docker + K8s + Helm
├── tools/             # DRKJoin, 해시검증기
└── docs/              # 기술 문서 및 가이드
```

### 🔥 핵심 기능

#### 📄 DRK 패키지 포맷
- **풀팩**: `.drkpack` (2-3GB, 주 1회 배포)
- **증분팩**: `.drkdelta` (10-40MB, 이메일 첨부)
- **무결성**: Ed25519 서명 + SHA256 트리해시
- **압축**: Zstd-seekable (랜덤 액세스)

#### 🚀 선박 Viewer 특징
- 단일 드래그앤드롭 적용
- 원자적 스왑 (무중단 업데이트)
- 실패 자동 롤백
- 백그라운드 인덱싱
- 즉시 열람 가능

#### 🔍 스마트 수집
- 서버폴더/Teams/SharePoint/ERP 자동 수집
- SHA256 기반 중복제거 (60-80% 공간 절약)
- 델타 토큰 기반 증분 수집
- 메타데이터 자동 추출

### ⚙️ 기술 스택

| 계층 | 기술 |
|------|------|
| **Frontend** | React 18.3, TypeScript 5, Vite 5, Ant Design 5 |
| **Backend** | NestJS, Node.js 20 LTS, WebSocket |
| **Database** | PostgreSQL 15+, Redis 7+, Elasticsearch 8 |
| **Storage** | MinIO (S3 호환), Versioning + Lifecycle |
| **Security** | Keycloak OIDC, RBAC, Ed25519, TLS 1.2+ |
| **Container** | Docker, Kubernetes, Helm, ArgoCD |
| **Monitoring** | Prometheus + Grafana, ELK Stack |

### 🎯 성능 목표

- **풀팩 생성**: 2GB ≤ 7분
- **증분팩 생성**: 10-40MB ≤ 60초  
- **선박 적용**: ≤ 20초 + FTS 백그라운드 ≤ 3분
- **검색 응답**: p95 ≤ 300ms

### 🎯 구현 완료 현황

#### ✅ Phase 1: Core Infrastructure (완료)
- [x] **JSON 파서 시스템**: 4개 문서 유형 완전 파싱 지원
- [x] **NestJS API 백엔드**: REST API, TypeORM, Swagger 문서화 완료
- [x] **React Admin Portal**: Ant Design 5 기반 UI, 문서 트리 네비게이션
- [x] **PostgreSQL 엔티티**: 문서 구조 데이터베이스 스키마 설계
- [x] **문서 구조 관리**: Main Manual, Procedures, Instructions, Forms

#### 🚧 Phase 2: Viewer & Delta (개발 중)
- [x] **Electron Viewer 프로젝트**: 기본 구조 및 빌드 시스템
- [ ] React-PDF 통합 
- [ ] 드래그앤드롭 핸들러
- [ ] 델타 생성 알고리즘
- [ ] 이메일 배포 시스템

#### 📋 Phase 3: Enterprise Features (예정)
- [ ] Elasticsearch 통합
- [ ] OCR 텍스트 추출
- [ ] 모니터링 대시보드
- [ ] 감사 로그 시스템

#### 📋 Phase 4: Integration & Optimization (예정)
- [ ] Teams/SharePoint 연동
- [ ] ERP 시스템 커넥터
- [ ] 성능 최적화
- [ ] DR 시나리오 테스트

### 📊 현재 구현 상태

#### ✅ 완료된 기능
1. **JSON 문서 파서**: 4개 JSON 파일 완전 파싱 (MM, PR, I, DRKF)
2. **REST API 서버**: NestJS 기반 백엔드 서비스
3. **관리자 포털**: React 18 + TypeScript + Ant Design 5
4. **문서 트리 네비게이션**: 계층적 문서 구조 표시
5. **데이터베이스 엔티티**: TypeORM 기반 스키마 설계
6. **Swagger API 문서**: 자동 생성된 API 문서
7. **Docker 컨테이너**: 개발 환경 컨테이너화
8. **Electron 뷰어**: 기본 프로젝트 구조

#### 🔧 개발 현황
- **API 엔드포인트**: 4개 완료 (Main Manual, Procedures, Instructions, Forms)
- **프론트엔드 컴포넌트**: DocumentTree, DocumentViewer 기본 구조
- **JSON 데이터**: 한국어/영어 이중 언어 지원
- **타입 정의**: 완전한 TypeScript 타입 시스템

### 🚀 빠른 시작

```bash
# 저장소 클론
git clone https://github.com/yeonjeman0-crypto/MDD-v1.0-DocSystem.git
cd MDD-v1.0-DocSystem

# 개발 환경 설정
docker-compose up -d

# 의존성 설치 (루트에서 모든 워크스페이스)
npm install

# 개발 서버 실행 (API + Admin Portal 동시)
npm run dev

# 또는 개별 실행
npm run dev:api      # NestJS API 서버 (포트 3001)
npm run dev:portal   # React Admin Portal (포트 5173)
```

### 🌐 접속 주소

- **Admin Portal**: http://localhost:5173
- **API Server**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

### 📚 문서

- [API 문서](./docs/api.md)
- [배포 가이드](./docs/deployment.md)
- [개발자 가이드](./docs/development.md)
- [사용자 매뉴얼](./docs/user-manual.md)

### 🔐 보안

- **인증**: Keycloak OIDC + RBAC
- **무결성**: Ed25519 서명 검증
- **암호화**: TLS 1.2+, AES-256
- **감사**: 모든 작업 로깅

### 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

### 📞 지원

- **이슈**: [GitHub Issues](https://github.com/yeonjeman0-crypto/MDD-v1.0-DocSystem/issues)
- **문의**: [support@company.com](mailto:support@company.com)
- **문서**: [프로젝트 위키](https://github.com/yeonjeman0-crypto/MDD-v1.0-DocSystem/wiki)

---

**Made with ❤️ for Maritime Industry**