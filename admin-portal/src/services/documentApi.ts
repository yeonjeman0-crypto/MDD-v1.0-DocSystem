import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 에러 처리 인터셉터
api.interceptors.response.use(
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

export const documentApi = {
  // JSON 파일 직접 읽기
  async getMainManual() {
    const response = await api.get('/documents/lists/main-manual');
    return response.data;
  },

  async getProcedures() {
    const response = await api.get('/documents/lists/procedures');
    return response.data;
  },

  async getInstructions() {
    const response = await api.get('/documents/lists/instructions');
    return response.data;
  },

  async getForms() {
    const response = await api.get('/documents/lists/forms');
    return response.data;
  },

  async getAllDocuments() {
    const response = await api.get('/documents/lists/all');
    return response.data;
  },

  async validateJsonFiles() {
    const response = await api.get('/documents/lists/validate');
    return response.data;
  },

  // 데이터베이스 연동
  async importJsonToDatabase() {
    const response = await api.post('/documents/data/import');
    return response.data;
  },

  async getMainManualFromDb() {
    const response = await api.get('/documents/data/main-manual');
    return response.data;
  },

  async getProceduresFromDb() {
    const response = await api.get('/documents/data/procedures');
    return response.data;
  },

  async getInstructionsFromDb() {
    const response = await api.get('/documents/data/instructions');
    return response.data;
  },

  async getFormsFromDb(prCode?: string) {
    const url = prCode 
      ? `/documents/data/forms?pr_code=${prCode}`
      : '/documents/data/forms';
    const response = await api.get(url);
    return response.data;
  },
};