import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SystemMetrics {
  uptime: number;
  memory: NodeJS.MemoryUsage;
  cpu: NodeJS.CpuUsage;
  timestamp: string;
}

export interface PerformanceMetrics {
  http: {
    totalRequests: number;
    avgResponseTime: number;
  };
  search: {
    totalSearches: number;
    avgResponseTime: number;
    indexSize: number;
  };
  ocr: {
    totalRequests: number;
    avgProcessingTime: number;
    avgConfidence: number;
  };
  documents: {
    indexed: number;
    total: number;
  };
  packages: {
    created: number;
    avgSize: number;
  };
  system: {
    activeConnections: number;
    errors: number;
  };
}

export interface DashboardData extends SystemMetrics {
  metrics: PerformanceMetrics;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  version: string;
  services: {
    database: 'up' | 'down';
    elasticsearch: 'up' | 'down';
    filesystem: 'up' | 'down';
  };
}

export const monitoringApi = {
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get('/monitoring/dashboard');
    return response.data.data;
  },

  async getMetricsSummary(): Promise<any> {
    const response = await api.get('/monitoring/metrics/summary');
    return response.data.data;
  },

  async getHealthStatus(): Promise<HealthStatus> {
    const response = await api.get('/health');
    return response.data;
  },

  async getReadinessStatus(): Promise<any> {
    const response = await api.get('/health/ready');
    return response.data;
  },

  async getLivenessStatus(): Promise<any> {
    const response = await api.get('/health/live');
    return response.data;
  },

  async getPrometheusMetrics(): Promise<string> {
    const response = await api.get('/metrics', {
      headers: { Accept: 'text/plain' },
    });
    return response.data;
  },
};