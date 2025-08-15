import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DRKPackageController } from './drk-package.controller';
import { DRKPackageService } from './drk-package.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/packages',
      limits: {
        fileSize: 10 * 1024 * 1024 * 1024, // 10GB
      },
    }),
  ],
  controllers: [DRKPackageController],
  providers: [DRKPackageService],
  exports: [DRKPackageService],
})
export class PackagesModule {}