import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsModule } from './documents/documents.module';
import { PackagesModule } from './packages/packages.module';
import { AIModule } from './ai/ai.module';
import { CollaborationModule } from './collaboration/collaboration.module';
import { FleetModule } from './fleet/fleet.module';
import { SearchModule } from './search/search.module';
import { OcrModule } from './ocr/ocr.module';
import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite', // 지속적인 SQLite 데이터베이스 사용
      autoLoadEntities: true,
      synchronize: true,
    }),
    DocumentsModule,
    PackagesModule,
    AIModule,
    CollaborationModule,
    FleetModule,
    SearchModule,
    OcrModule,
    MonitoringModule,
  ],
})
export class AppModule {}