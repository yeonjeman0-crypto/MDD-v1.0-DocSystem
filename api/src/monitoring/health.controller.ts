import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get()
  @ApiOperation({ summary: '서비스 헬스체크' })
  @ApiResponse({ status: 200, description: '서비스 상태 반환' })
  async getHealth() {
    const health = await this.monitoringService.getHealthStatus();
    return health;
  }

  @Get('ready')
  @ApiOperation({ summary: '서비스 준비 상태' })
  async getReadiness() {
    // Check if all critical services are ready
    const health = await this.monitoringService.getHealthStatus();
    
    const isReady = health.services.database === 'up' && 
                   health.services.filesystem === 'up';
    
    return {
      status: isReady ? 'ready' : 'not-ready',
      timestamp: new Date().toISOString(),
      services: health.services,
    };
  }

  @Get('live')
  @ApiOperation({ summary: '서비스 활성 상태' })
  async getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}