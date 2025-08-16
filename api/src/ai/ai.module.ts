import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AIAnalysisService } from './ai-analysis.service';
import { AIAnalysisController } from './ai-analysis.controller';
import * as fs from 'fs';

// uploads/ai-analysis 디렉토리 생성
const uploadDir = './uploads/ai-analysis';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/ai-analysis',
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
  ],
  controllers: [AIAnalysisController],
  providers: [AIAnalysisService],
  exports: [AIAnalysisService],
})
export class AIModule {}