# MDD v1.0 Document System - Project Structure

## 📁 Project Overview
**Total Size**: 1.1GB  
**Last Updated**: 2025-08-15  
**Status**: Development Ready

## 🗂️ Directory Structure

```
MDD-v1.0-DocSystem/
├── 📋 PROJECT_STRUCTURE.md         # This file
├── 📄 README.md                    # Project documentation
├── 📜 LICENSE                      # MIT License
├── 📦 package.json                 # Workspace configuration
├── 🐳 docker-compose.yml           # Development infrastructure
│
├── 🌐 admin-portal/                # React Frontend (Admin)
│   └── package.json               # React 18.3 + Ant Design 5
│
├── ⚙️ api/                         # NestJS Backend API
│   └── package.json               # NestJS 10 + TypeORM + PostgreSQL
│
├── 🖥️ viewer/                      # Electron Ship Viewer
│   └── package.json               # Electron 25 + React-PDF
│
├── 📤 exporter/                    # Package Export Tools
├── 🏗️ infrastructure/              # K8s & Docker configs
├── 🛠️ tools/                       # Development utilities
│
├── 📚 docs/                        # Technical documentation
├── 📖 docsapi/                     # API documentation
├── 🚀 docsdeployment/              # Deployment guides
├── 👨‍💻 docsdevelopment/             # Development guides
├── 📖 docsuser-manual/             # User manuals
│
├── 📑 절차서 PDF/                   # 🆕 Converted PDF Documents
│   ├── 00_DRK Main Manual/        # Main system manual (22 files)
│   ├── 01_DRK Procedure/          # Procedures PR-01 to PR-22 (22 categories)
│   ├── 02_DRK Instruction/        # Instructions I-01 to I-10
│   └── 03_DRK Form/               # Forms for all procedures
│
└── 📄 절차서 원본/                  # 📁 Original Source Documents
    ├── 원본/                      # Master original files
    │   ├── 절차서/                # Procedures (DOC/DOCX)
    │   ├── 지침서/                # Instructions (DOC/DOCX/XLS)
    │   └── Form/                  # Forms (DOC/XLS)
    └── 표준문서관리대장.xlsx        # Document control registry
```

## 📊 Document Statistics

### 📑 PDF Documents (절차서 PDF)
- **Main Manual**: 22 files
- **Procedures**: 22 categories (PR-01 to PR-22)
- **Instructions**: 10 categories (I-01 to I-10) 
- **Forms**: 21 categories
- **Total**: 500+ PDF files

### 📄 Original Documents (절차서 원본)
- **Procedures**: DOC/DOCX format
- **Instructions**: DOC/DOCX/XLS format
- **Forms**: DOC/XLS format
- **Total**: 500+ source files

## 🚢 Maritime Procedure Categories

### 📋 Core Procedures (PR-01 to PR-22)
1. **PR-01**: Management Duty (경영진업무)
2. **PR-02**: Document & Record Control (문서 및 기록관리)
3. **PR-03**: Shore Staff Management (육상직원관리)
4. **PR-04**: Crew Management (해상직원관리)
5. **PR-05**: Maintenance (정비업무)
6. **PR-06**: Purchase & Supply (구매 및 보급)
7. **PR-07**: External Provider Control (외부공급자 관리)
8. **PR-08**: Safety Navigation (항행안전)
9. **PR-09**: Cargo Handling (화물관리)
10. **PR-10**: Incident Control (사고관리)
11. **PR-11**: Risk Assessment (위험성평가)
12. **PR-12**: Management of Change (변화관리)
13. **PR-13**: Safety Management (안전관리)
14. **PR-14**: Environment Management (환경관리)
15. **PR-15**: Emergency Response (비상대응)
16. **PR-16**: External Inspection & Audit (외부검사 및 심사)
17. **PR-17**: Ship Acceptance & Delivery (선박 인수 및 인도)
18. **PR-18**: Measurement, Analysis & Improvement (측정분석 및 개선)
19. **PR-19**: Customer Complaint Control (고객불만사항 처리)
20. **PR-20**: Internal Audit (내부심사)
21. **PR-21**: Non-Conformity Control (부적합처리)
22. **PR-22**: Cyber Security Management (사이버 보안 관리)

### 📖 Instructions (I-01 to I-10)
- **I-01**: Incident Press (사고속보)
- **I-02**: Marine Information (해사정보)
- **I-03**: Technical Information (기관정보)
- **I-04**: Port Information (항만정보)
- **I-05**: Official Notice (업무지시)
- **I-06**: Audit/Inspection Info (심사, 검사 정보)
- **I-07**: Risk Assessment Sheet (위험성평가서)
- **I-08**: Environmental Impact Sheet (환경영향평가서)
- **I-09**: New Crew Essential Guide (신규승선자 필수지침)
- **I-10**: Company Instruction (업무지시서)

## 🧹 Cleanup Results

### ✅ Removed Files
- **Thumbs.db**: 50+ files removed
- **Duplicate copies**: 4 files removed
- **Temporary files**: 0 files (none found)
- **Shortcuts**: 1 file removed

### 📈 Size Optimization
- **Before**: ~1.1GB
- **After**: 1.1GB (minimal impact from small files)
- **Status**: Optimized and ready for development

## 🔧 Technical Stack

### 🌐 Frontend (admin-portal)
- React 18.3 + TypeScript 5
- Ant Design 5 + Icons
- React Query + Zustand
- React-PDF + Monaco Editor
- Vite 4 build system

### ⚙️ Backend (api)
- NestJS 10 + TypeScript 5
- PostgreSQL + TypeORM
- Redis + Bull Queue
- JWT Authentication
- Swagger API docs

### 🖥️ Desktop Viewer (viewer)
- Electron 25 + React 18.3
- React-PDF integration
- SQLite3 local database
- Zstd compression support
- Ed25519 signatures

### 🏗️ Infrastructure
- Docker + Docker Compose
- PostgreSQL + Redis + MinIO
- Elasticsearch + Prometheus + Grafana
- Kubernetes deployment ready

## 🎯 Next Steps

1. **Development Environment Setup**
   ```bash
   cd MDD-v1.0-DocSystem
   npm install
   docker-compose up -d
   npm run dev
   ```

2. **Document Import Process**
   - Implement document parser for original files
   - Set up PDF indexing with Elasticsearch
   - Create categorization system (PR-01 to PR-22)

3. **Package Generation**
   - Implement .drkpack (full packages)
   - Implement .drkdelta (incremental updates)
   - Add Zstd compression + Ed25519 signatures

4. **Testing & Deployment**
   - Unit tests for all modules
   - Integration tests for document workflow
   - Ship environment deployment testing

## 📋 Project Status
- ✅ Project structure complete
- ✅ Documents organized and cleaned
- ✅ Development environment configured
- ✅ GitHub repository created
- 🔄 Ready for development phase