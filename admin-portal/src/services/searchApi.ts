import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SearchOptions {
  query: string;
  section?: string;
  filters?: {
    documentType?: string;
    dateRange?: {
      from: string;
      to: string;
    };
    tags?: string[];
  };
  size?: number;
  from?: number;
  sort?: string;
}

export interface DocumentSearchResult {
  id: string;
  title_ko: string;
  title_en: string;
  code: string;
  section: string;
  content?: string;
  file_path: string;
  highlights?: any;
  score: number;
  vessel_type?: string;
  procedure_code?: string;
  pr_code?: string;
}

export interface SearchResponse {
  success: boolean;
  data: {
    documents: DocumentSearchResult[];
    total: number;
    aggregations?: any;
  };
  timestamp: string;
}

export const searchApi = {
  async searchDocuments(options: SearchOptions): Promise<SearchResponse> {
    const response = await api.post('/search/documents', options);
    return response.data;
  },

  async getSuggestions(query: string, size = 5): Promise<string[]> {
    const response = await api.get('/search/suggest', {
      params: { q: query, size },
    });
    return response.data.data;
  },

  async indexDocument(document: any): Promise<any> {
    const response = await api.post('/search/index/document', document);
    return response.data;
  },

  async bulkIndexDocuments(documents: any[]): Promise<any> {
    const response = await api.post('/search/index/bulk', documents);
    return response.data;
  },

  async deleteDocument(id: string): Promise<any> {
    const response = await api.delete(`/search/index/document/${id}`);
    return response.data;
  },

  async clearIndex(): Promise<any> {
    const response = await api.delete('/search/index/clear');
    return response.data;
  },

  async initializeIndex(): Promise<any> {
    const response = await api.post('/search/index/init');
    return response.data;
  },

  async getIndexStats(): Promise<any> {
    const response = await api.get('/search/stats');
    return response.data;
  },
};