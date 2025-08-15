import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const documentApi = {
  // JSON 파일 직접 읽기
  async getMainManual() {
    const response = await api.get('/api/documents/lists/main-manual');
    return response.data;
  },

  async getProcedures() {
    const response = await api.get('/api/documents/lists/procedures');
    return response.data;
  },

  async getInstructions() {
    const response = await api.get('/api/documents/lists/instructions');
    return response.data;
  },

  async getForms() {
    const response = await api.get('/api/documents/lists/forms');
    return response.data;
  },

  async getAllDocuments() {
    const response = await api.get('/api/documents/lists/all');
    return response.data;
  },

  async validateJsonFiles() {
    const response = await api.get('/api/documents/lists/validate');
    return response.data;
  },

  // 데이터베이스 연동
  async importJsonToDatabase() {
    const response = await api.post('/api/documents/data/import');
    return response.data;
  },

  async getMainManualFromDb() {
    const response = await api.get('/api/documents/data/main-manual');
    return response.data;
  },

  async getProceduresFromDb() {
    const response = await api.get('/api/documents/data/procedures');
    return response.data;
  },

  async getInstructionsFromDb() {
    const response = await api.get('/api/documents/data/instructions');
    return response.data;
  },

  async getFormsFromDb(prCode?: string) {
    const url = prCode 
      ? `/api/documents/data/forms?pr_code=${prCode}`
      : '/api/documents/data/forms';
    const response = await api.get(url);
    return response.data;
  },
};