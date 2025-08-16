import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { HealthController } from './health.controller';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'mdd_',
        },
      },
      path: '/metrics',
      defaultLabels: {
        app: 'mdd-api',
        version: '1.0.0',
      },
    }),
  ],
  providers: [MonitoringService],
  controllers: [MonitoringController, HealthController],
  exports: [MonitoringService],
})
export class MonitoringModule {}