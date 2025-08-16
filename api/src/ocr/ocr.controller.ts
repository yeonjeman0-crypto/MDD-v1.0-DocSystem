import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { OcrService } from './ocr.service.simple';
import * as multer from 'multer';

@ApiTags('OCR')
@Controller('api/ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('extract/pdf')
  @ApiOperation({ summary: 'PDF에서 텍스트 추출' })
  @ApiResponse({ status: 200, description: 'OCR 결과 반환' })
  async extractFromPdf(@Body() body: { filePath: string }) {
    try {
      const result = await this.ocrService.extractTextFromPdf(body.filePath);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'PDF OCR 처리 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('extract/image')
  @ApiOperation({ summary: '이미지에서 텍스트 추출' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  async extractFromImage(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException('이미지 파일이 필요합니다.', HttpStatus.BAD_REQUEST);
      }

      const result = await this.ocrService.extractTextFromImage(file.buffer);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '이미지 OCR 처리 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('process/document')
  @ApiOperation({ summary: '문서를 OCR 처리하여 검색 인덱스 업데이트' })
  async processDocumentForSearch(@Body() body: { 
    documentPath: string; 
    documentData: any 
  }) {
    try {
      await this.ocrService.processDocumentForSearch(
        body.documentPath,
        body.documentData
      );
      return {
        success: true,
        message: '문서 OCR 처리가 완료되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '문서 OCR 처리 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('process/batch')
  @ApiOperation({ summary: '다중 문서 일괄 OCR 처리' })
  async batchProcessDocuments(@Body() body: { documents: any[] }) {
    try {
      // Start batch processing in background
      this.ocrService.batchProcessDocuments(body.documents).catch(error => {
        console.error('Background batch OCR processing failed:', error);
      });

      return {
        success: true,
        message: `${body.documents.length}개 문서의 일괄 OCR 처리가 시작되었습니다.`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '일괄 OCR 처리 시작 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'OCR 처리 통계' })
  async getOcrStatistics() {
    try {
      const stats = await this.ocrService.getOcrStatistics();
      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'OCR 통계 조회 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('test/sample')
  @ApiOperation({ summary: 'OCR 테스트용 샘플 처리' })
  async testOcrWithSample(@Body() body: { samplePath?: string }) {
    try {
      // Test with a known PDF file if it exists
      const testPath = body.samplePath || 'test-sample.pdf';
      
      const result = await this.ocrService.extractTextFromPdf(testPath);
      return {
        success: true,
        data: {
          ...result,
          // Truncate text for response if too long
          extractedText: result.extractedText.length > 1000 
            ? result.extractedText.substring(0, 1000) + '...[truncated]'
            : result.extractedText,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'OCR 테스트 실행 중 오류가 발생했습니다.',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}