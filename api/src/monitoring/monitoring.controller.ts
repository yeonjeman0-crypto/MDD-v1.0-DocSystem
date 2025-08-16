import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';

@ApiTags('Monitoring')
@Controller('api/monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '모니터링 대시보드 데이터' })
  @ApiResponse({ status: 200, description: '대시보드 메트릭 반환' })
  async getDashboardData() {
    const metrics = await this.monitoringService.getDashboardMetrics();
    return {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics/summary')
  @ApiOperation({ summary: '메트릭 요약' })
  async getMetricsSummary() {
    const metrics = await this.monitoringService.getDashboardMetrics();
    return {
      success: true,
      data: {
        system: {
          uptime: metrics.uptime,
          memory: `${Math.round(metrics.memory.used / 1024 / 1024)}MB`,
          cpu: metrics.cpu,
        },
        performance: {
          totalRequests: metrics.metrics.http.totalRequests,
          avgResponseTime: `${metrics.metrics.http.avgResponseTime}ms`,
          searchRequests: metrics.metrics.search.totalSearches,
          ocrRequests: metrics.metrics.ocr.totalRequests,
        },
        content: {
          documentsIndexed: metrics.metrics.documents.indexed,
          documentsTotal: metrics.metrics.documents.total,
          packagesCreated: metrics.metrics.packages.created,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}