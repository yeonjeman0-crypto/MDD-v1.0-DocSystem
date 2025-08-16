import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DRKPackageController } from './drk-package.controller';
import { DRKPackageService } from './drk-package.service';
import { VersionManagementService } from './version-management.service';
import { VersionManagementController } from './version-management.controller';
import { Package } from './entities/package.entity';
import { PackageVersion } from './entities/package-version.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Package, PackageVersion]),
    MulterModule.register({
      dest: './uploads/packages',
      limits: {
        fileSize: 10 * 1024 * 1024 * 1024, // 10GB
      },
    }),
  ],
  controllers: [
    DRKPackageController,
    VersionManagementController
  ],
  providers: [
    DRKPackageService,
    VersionManagementService
  ],
  exports: [
    DRKPackageService,
    VersionManagementService
  ],
})
export class PackagesModule {}