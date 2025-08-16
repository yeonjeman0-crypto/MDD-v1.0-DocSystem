import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { FleetController } from './fleet.controller';
import { FleetService } from './fleet.service';
import { FleetSampleService } from './fleet-sample.service';
import { Vessel } from './entities/vessel.entity';
import { VesselCertificate } from './entities/vessel-certificate.entity';
import * as fs from 'fs';

// uploads/certificates 디렉토리 생성
const uploadDir = './uploads/certificates';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Vessel, VesselCertificate]),
    MulterModule.register({
      dest: './uploads/certificates',
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [FleetController],
  providers: [FleetService, FleetSampleService],
  exports: [FleetService, FleetSampleService],
})
export class FleetModule {}