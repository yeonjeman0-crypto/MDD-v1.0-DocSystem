import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5분 (대용량 파일 처리)
  headers: {
    'Content-Type': 'application/json',
  },
});

// 패키지 정보 인터페이스
export interface PackageInfo {
  filename: string;
  type: 'full' | 'delta';
  size: number;
  created_at: string;
  modified_at: string;
}

export interface PackageListResponse {
  packages: PackageInfo[];
  total: number;
}

export interface CreatePackageRequest {
  sourceDir: string;
  metadata?: {
    vessel?: string;
    description: string;
  };
}

export interface CreatePackageResponse {
  success: boolean;
  package: {
    type: 'full' | 'delta';
    path: string;
    size: number;
    created_at: string;
  };
}

export interface VerifyPackageResponse {
  success: boolean;
  package: {
    filename: string;
    size: number;
    valid: boolean;
    verified_at: string;
  };
  error?: string;
}

// 패키지 API 서비스
export const packageApi = {
  // 패키지 목록 조회
  async listPackages(): Promise<PackageListResponse> {
    try {
      const response = await apiClient.get('/packages/list');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      throw error;
    }
  },

  // 전체 패키지 생성
  async createFullPackage(data: CreatePackageRequest): Promise<CreatePackageResponse> {
    try {
      const response = await apiClient.post('/packages/create-full', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create full package:', error);
      throw error;
    }
  },

  // 증분 패키지 생성
  async createDeltaPackage(data: CreatePackageRequest & { baseManifestPath: string }): Promise<CreatePackageResponse> {
    try {
      const response = await apiClient.post('/packages/create-delta', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create delta package:', error);
      throw error;
    }
  },

  // 패키지 검증
  async verifyPackage(file: File): Promise<VerifyPackageResponse> {
    try {
      const formData = new FormData();
      formData.append('package', file);

      const response = await apiClient.post('/packages/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to verify package:', error);
      throw error;
    }
  },

  // 패키지 적용
  async applyPackage(file: File, targetDir: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('package', file);
      formData.append('targetDir', targetDir);

      const response = await apiClient.post('/packages/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to apply package:', error);
      throw error;
    }
  },

  // 패키지 다운로드
  async downloadPackage(filename: string): Promise<void> {
    try {
      const response = await apiClient.get(`/packages/download/${filename}`, {
        responseType: 'blob',
      });

      // 파일 다운로드 처리
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download package:', error);
      throw error;
    }
  },

  // 패키지 상세 정보 조회 (매니페스트 파싱)
  async getPackageDetails(filename: string): Promise<any> {
    try {
      // 실제로는 서버에서 매니페스트를 파싱해서 반환하는 API가 필요
      // 현재는 기본 정보만 반환
      const packages = await this.listPackages();
      return packages.packages.find(pkg => pkg.filename === filename);
    } catch (error) {
      console.error('Failed to get package details:', error);
      throw error;
    }
  },

  // 패키지 삭제 (향후 구현 예정)
  async deletePackage(filename: string): Promise<void> {
    // TODO: 서버에 삭제 API 구현 후 연동
    console.log('Delete package:', filename);
  },

  // 패키지 통계 조회
  async getPackageStats(): Promise<{
    totalPackages: number;
    fullPackages: number;
    deltaPackages: number;
    totalSize: number;
  }> {
    try {
      const response = await apiClient.get('/packages/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to get package stats:', error);
      throw error;
    }
  },
};

// 에러 처리 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 서버에서 응답을 받았지만 에러 상태
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      console.error('Network Error:', error.request);
    } else {
      // 요청을 설정하는 중에 에러 발생
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default packageApi;