import { Injectable, Logger } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import * as promClient from 'prom-client';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  // HTTP Metrics
  private readonly httpRequestsTotal: promClient.Counter<string>;
  private readonly httpRequestDuration: promClient.Histogram<string>;

  // Search Metrics
  private readonly searchRequestsTotal: promClient.Counter<string>;
  private readonly searchResponseTime: promClient.Histogram<string>;
  private readonly searchIndexSize: promClient.Gauge<string>;

  // OCR Metrics
  private readonly ocrRequestsTotal: promClient.Counter<string>;
  private readonly ocrProcessingTime: promClient.Histogram<string>;
  private readonly ocrConfidenceScore: promClient.Histogram<string>;

  // Document Metrics
  private readonly documentsIndexed: promClient.Gauge<string>;
  private readonly documentsTotal: promClient.Gauge<string>;

  // Package Metrics
  private readonly packagesCreated: promClient.Counter<string>;
  private readonly packageSizeBytes: promClient.Histogram<string>;

  // System Metrics
  private readonly activeConnections: promClient.Gauge<string>;
  private readonly errorRate: promClient.Counter<string>;

  constructor() {
    // Initialize HTTP metrics
    this.httpRequestsTotal = new promClient.Counter({
      name: 'mdd_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'endpoint', 'status_code'],
    });

    this.httpRequestDuration = new promClient.Histogram({
      name: 'mdd_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'endpoint'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    });

    // Initialize Search metrics
    this.searchRequestsTotal = new promClient.Counter({
      name: 'mdd_search_requests_total',
      help: 'Total number of search requests',
      labelNames: ['section', 'query_type'],
    });

    this.searchResponseTime = new promClient.Histogram({
      name: 'mdd_search_response_time_seconds',
      help: 'Search response time in seconds',
      labelNames: ['section'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    });

    this.searchIndexSize = new promClient.Gauge({
      name: 'mdd_search_index_size_documents',
      help: 'Number of documents in search index',
      labelNames: ['section'],
    });

    // Initialize OCR metrics
    this.ocrRequestsTotal = new promClient.Counter({
      name: 'mdd_ocr_requests_total',
      help: 'Total number of OCR requests',
      labelNames: ['type', 'status'],
    });

    this.ocrProcessingTime = new promClient.Histogram({
      name: 'mdd_ocr_processing_time_seconds',
      help: 'OCR processing time in seconds',
      labelNames: ['type'],
      buckets: [1, 5, 10, 30, 60, 120, 300],
    });

    this.ocrConfidenceScore = new promClient.Histogram({
      name: 'mdd_ocr_confidence_score',
      help: 'OCR confidence score (0-100)',
      buckets: [10, 30, 50, 70, 80, 90, 95, 99],
    });

    // Initialize Document metrics
    this.documentsIndexed = new promClient.Gauge({
      name: 'mdd_documents_indexed_total',
      help: 'Total number of indexed documents',
      labelNames: ['section'],
    });

    this.documentsTotal = new promClient.Gauge({
      name: 'mdd_documents_total',
      help: 'Total number of documents',
      labelNames: ['section'],
    });

    // Initialize Package metrics
    this.packagesCreated = new promClient.Counter({
      name: 'mdd_packages_created_total',
      help: 'Total number of packages created',
      labelNames: ['type', 'status'],
    });

    this.packageSizeBytes = new promClient.Histogram({
      name: 'mdd_package_size_bytes',
      help: 'Package size in bytes',
      labelNames: ['type'],
      buckets: [1024, 10240, 102400, 1048576, 10485760, 104857600, 1073741824],
    });

    // Initialize System metrics
    this.activeConnections = new promClient.Gauge({
      name: 'mdd_active_connections',
      help: 'Number of active connections',
    });

    this.errorRate = new promClient.Counter({
      name: 'mdd_errors_total',
      help: 'Total number of errors',
      labelNames: ['type', 'endpoint'],
    });

    // Register all metrics
    promClient.register.registerMetric(this.httpRequestsTotal);
    promClient.register.registerMetric(this.httpRequestDuration);
    promClient.register.registerMetric(this.searchRequestsTotal);
    promClient.register.registerMetric(this.searchResponseTime);
    promClient.register.registerMetric(this.searchIndexSize);
    promClient.register.registerMetric(this.ocrRequestsTotal);
    promClient.register.registerMetric(this.ocrProcessingTime);
    promClient.register.registerMetric(this.ocrConfidenceScore);
    promClient.register.registerMetric(this.documentsIndexed);
    promClient.register.registerMetric(this.documentsTotal);
    promClient.register.registerMetric(this.packagesCreated);
    promClient.register.registerMetric(this.packageSizeBytes);
    promClient.register.registerMetric(this.activeConnections);
    promClient.register.registerMetric(this.errorRate);

    this.logger.log('Monitoring metrics initialized');
  }

  // HTTP Metrics Methods
  recordHttpRequest(method: string, endpoint: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, endpoint, status_code: statusCode.toString() });
    this.httpRequestDuration.observe({ method, endpoint }, duration);
  }

  // Search Metrics Methods
  recordSearchRequest(section: string, queryType: string, responseTime: number) {
    this.searchRequestsTotal.inc({ section, query_type: queryType });
    this.searchResponseTime.observe({ section }, responseTime);
  }

  updateSearchIndexSize(section: string, count: number) {
    this.searchIndexSize.set({ section }, count);
  }

  // OCR Metrics Methods
  recordOcrRequest(type: string, status: string, processingTime: number, confidence?: number) {
    this.ocrRequestsTotal.inc({ type, status });
    this.ocrProcessingTime.observe({ type }, processingTime);
    
    if (confidence !== undefined) {
      this.ocrConfidenceScore.observe(confidence);
    }
  }

  // Document Metrics Methods
  updateDocumentCounts(section: string, indexed: number, total: number) {
    this.documentsIndexed.set({ section }, indexed);
    this.documentsTotal.set({ section }, total);
  }

  // Package Metrics Methods
  recordPackageCreation(type: string, status: string, sizeBytes: number) {
    this.packagesCreated.inc({ type, status });
    this.packageSizeBytes.observe({ type }, sizeBytes);
  }

  // System Metrics Methods
  updateActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  recordError(type: string, endpoint: string) {
    this.errorRate.inc({ type, endpoint });
  }

  // Dashboard Data Methods
  async getDashboardMetrics(): Promise<any> {
    const metrics = await promClient.register.metrics();
    
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      metrics: {
        http: {
          totalRequests: await this.getMetricValue('mdd_http_requests_total'),
          avgResponseTime: await this.getMetricValue('mdd_http_request_duration_seconds'),
        },
        search: {
          totalSearches: await this.getMetricValue('mdd_search_requests_total'),
          avgResponseTime: await this.getMetricValue('mdd_search_response_time_seconds'),
          indexSize: await this.getMetricValue('mdd_search_index_size_documents'),
        },
        ocr: {
          totalRequests: await this.getMetricValue('mdd_ocr_requests_total'),
          avgProcessingTime: await this.getMetricValue('mdd_ocr_processing_time_seconds'),
          avgConfidence: await this.getMetricValue('mdd_ocr_confidence_score'),
        },
        documents: {
          indexed: await this.getMetricValue('mdd_documents_indexed_total'),
          total: await this.getMetricValue('mdd_documents_total'),
        },
        packages: {
          created: await this.getMetricValue('mdd_packages_created_total'),
          avgSize: await this.getMetricValue('mdd_package_size_bytes'),
        },
        system: {
          activeConnections: await this.getMetricValue('mdd_active_connections'),
          errors: await this.getMetricValue('mdd_errors_total'),
        },
      },
    };
  }

  private async getMetricValue(metricName: string): Promise<number> {
    try {
      const metrics = await promClient.register.getSingleMetric(metricName);
      if (metrics) {
        const values = await metrics.get();
        if (values.values && values.values.length > 0) {
          return values.values[0].value;
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to get metric value for ${metricName}:`, error);
    }
    return 0;
  }

  // Health Check Methods
  async getHealthStatus(): Promise<{
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
  }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      services: {
        database: 'up', // TODO: Implement actual health checks
        elasticsearch: 'up', // TODO: Implement actual health checks
        filesystem: 'up', // TODO: Implement actual health checks
      },
    };
  }
}