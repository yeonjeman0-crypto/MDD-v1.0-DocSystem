import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service.simple';
import { OcrController } from './ocr.controller';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule],
  providers: [OcrService],
  controllers: [OcrController],
  exports: [OcrService],
})
export class OcrModule {}