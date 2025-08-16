import { 
  Controller, 
  Post, 
  Get,
  Body, 
  Param, 
  Query,
  HttpStatus,
  HttpException,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AIAnalysisService } from './ai-analysis.service';
import * as multer from 'multer';
import * as path from 'path';

const storage = multer.diskStorage({
  destination: './uploads/ai-analysis',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

@ApiTags('AI Document Analysis')
@Controller('ai')
export class AIAnalysisController {
  constructor(
    private readonly aiService: AIAnalysisService,
  ) {}

  @Post('analyze')
  @ApiOperation({ summary: '문서 AI 분석' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        language: {
          type: 'string',
          default: 'ko'
        },
        analysisType: {
          type: 'string',
          enum: ['summary', 'compliance', 'risk', 'full'],
          default: 'full'
        }
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage }))
  async analyzeDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      language?: string;
      analysisType?: 'summary' | 'compliance' | 'risk' | 'full';
      customPrompts?: string;
    }
  ) {
    if (!file) {
      throw new HttpException('파일이 업로드되지 않았습니다.', HttpStatus.BAD_REQUEST);
    }

    try {
      const customPrompts = body.customPrompts ? body.customPrompts.split(',') : undefined;
      
      const analysis = await this.aiService.analyzeDocument(file.path, {
        language: body.language || 'ko',
        analysisType: body.analysisType || 'full',
        customPrompts
      });

      return {
        success: true,
        data: {
          fileName: file.originalname,
          fileSize: file.size,
          analysis
        },
        message: '문서 분석이 완료되었습니다.'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Document Analysis Failed'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('compliance-check')
  @ApiOperation({ summary: '해운 규정 준수 검사' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async checkMaritimeCompliance(
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new HttpException('파일이 업로드되지 않았습니다.', HttpStatus.BAD_REQUEST);
    }

    try {
      const documentContent = await this.aiService['extractDocumentContent'](file.path);
      const complianceResults = await this.aiService.checkMaritimeCompliance(documentContent);

      const summary = {
        totalChecks: complianceResults.length,
        compliant: complianceResults.filter(r => r.status === 'compliant').length,
        nonCompliant: complianceResults.filter(r => r.status === 'non-compliant').length,
        unclear: complianceResults.filter(r => r.status === 'unclear').length
      };

      return {
        success: true,
        data: {
          fileName: file.originalname,
          summary,
          results: complianceResults
        },
        message: '규정 준수 검사가 완료되었습니다.'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Compliance Check Failed'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('compare')
  @ApiOperation({ summary: '문서 비교 분석' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('files', { storage }))
  async compareDocuments(
    @Body() body: {
      document1Path: string;
      document2Path: string;
    }
  ) {
    try {
      const comparison = await this.aiService.compareDocuments(
        body.document1Path,
        body.document2Path
      );

      return {
        success: true,
        data: comparison,
        message: '문서 비교가 완료되었습니다.'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Document Comparison Failed'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('extract-info')
  @ApiOperation({ summary: '카테고리별 핵심 정보 추출' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async extractKeyInformation(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      category: 'safety' | 'procedures' | 'regulations' | 'maintenance';
    }
  ) {
    if (!file) {
      throw new HttpException('파일이 업로드되지 않았습니다.', HttpStatus.BAD_REQUEST);
    }

    try {
      const documentContent = await this.aiService['extractDocumentContent'](file.path);
      const extractedInfo = await this.aiService.extractKeyInformation(
        documentContent,
        body.category
      );

      return {
        success: true,
        data: {
          fileName: file.originalname,
          category: body.category,
          extractedInfo
        },
        message: '핵심 정보 추출이 완료되었습니다.'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Information Extraction Failed'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('summarize')
  @ApiOperation({ summary: '문서 요약 생성' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async generateDocumentSummary(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      maxLength?: string;
      summaryType?: 'general' | 'executive' | 'technical';
    }
  ) {
    if (!file) {
      throw new HttpException('파일이 업로드되지 않았습니다.', HttpStatus.BAD_REQUEST);
    }

    try {
      const documentContent = await this.aiService['extractDocumentContent'](file.path);
      const maxLength = body.maxLength ? parseInt(body.maxLength) : 500;
      
      const summaries = await this.aiService.generateDocumentSummary(documentContent, maxLength);

      const result = body.summaryType ? 
        { [body.summaryType]: summaries[body.summaryType] } :
        summaries;

      return {
        success: true,
        data: {
          fileName: file.originalname,
          summaries: result,
          wordCount: documentContent.split(/\s+/).length,
          compressionRatio: Math.round((maxLength / documentContent.length) * 100)
        },
        message: '문서 요약이 완료되었습니다.'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Document Summarization Failed'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('regulations')
  @ApiOperation({ summary: '지원하는 해운 규정 목록' })
  @ApiResponse({ status: 200, description: '규정 목록 반환' })
  getMaritimeRegulations() {
    return {
      success: true,
      data: {
        regulations: [
          {
            code: 'SOLAS',
            name: 'Safety of Life at Sea',
            description: '해상에서의 인명안전을 위한 국제협약',
            category: 'safety'
          },
          {
            code: 'MARPOL',
            name: 'Marine Pollution Prevention',
            description: '선박으로부터의 해양오염 방지를 위한 국제협약',
            category: 'environment'
          },
          {
            code: 'STCW',
            name: 'Standards of Training, Certification and Watchkeeping',
            description: '선원의 훈련, 자격증명 및 당직근무의 기준에 관한 국제협약',
            category: 'training'
          },
          {
            code: 'MLC',
            name: 'Maritime Labour Convention',
            description: '해사노동협약',
            category: 'labour'
          },
          {
            code: 'ISM',
            name: 'International Safety Management Code',
            description: '국제안전관리규약',
            category: 'management'
          },
          {
            code: 'ISPS',
            name: 'International Ship and Port Facility Security Code',
            description: '국제선박 및 항만시설 보안규약',
            category: 'security'
          },
          {
            code: 'COLREG',
            name: 'Convention on International Regulations for Preventing Collisions at Sea',
            description: '해상에서의 충돌방지를 위한 국제규칙에 관한 협약',
            category: 'navigation'
          }
        ]
      }
    };
  }

  @Get('analysis-templates')
  @ApiOperation({ summary: 'AI 분석 템플릿 목록' })
  @ApiResponse({ status: 200, description: '분석 템플릿 목록' })
  getAnalysisTemplates() {
    return {
      success: true,
      data: {
        templates: [
          {
            id: 'safety-audit',
            name: '안전 감사 분석',
            description: '안전 관련 문서의 감사 포인트 분석',
            category: 'safety',
            prompts: [
              '안전 규정 준수 여부 확인',
              '위험 요소 식별',
              '개선 사항 제안'
            ]
          },
          {
            id: 'procedure-review',
            name: '절차서 검토',
            description: '운영 절차서의 완성도 및 명확성 분석',
            category: 'procedures',
            prompts: [
              '절차의 명확성 평가',
              '누락된 단계 식별',
              '효율성 개선 방안'
            ]
          },
          {
            id: 'compliance-check',
            name: '규정 준수 검사',
            description: '국제 해운 규정 준수 여부 종합 검사',
            category: 'regulations',
            prompts: [
              'IMO 규정 준수 확인',
              '누락된 요구사항 식별',
              '준수 개선 계획'
            ]
          },
          {
            id: 'maintenance-analysis',
            name: '정비 계획 분석',
            description: '정비 관련 문서의 체계성 및 실행 가능성 분석',
            category: 'maintenance',
            prompts: [
              '정비 주기 적정성',
              '자원 요구사항 분석',
              '예방정비 효과성'
            ]
          }
        ]
      }
    };
  }

  @Get('supported-formats')
  @ApiOperation({ summary: '지원하는 파일 형식' })
  @ApiResponse({ status: 200, description: '지원 파일 형식 목록' })
  getSupportedFormats() {
    return {
      success: true,
      data: {
        formats: [
          {
            extension: '.pdf',
            mimeType: 'application/pdf',
            description: 'PDF 문서',
            maxSize: '100MB',
            features: ['텍스트 추출', '이미지 분석', 'OCR 지원']
          },
          {
            extension: '.docx',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            description: 'Microsoft Word 문서',
            maxSize: '50MB',
            features: ['텍스트 추출', '구조 분석', '메타데이터 추출']
          },
          {
            extension: '.txt',
            mimeType: 'text/plain',
            description: '텍스트 파일',
            maxSize: '10MB',
            features: ['직접 텍스트 분석']
          },
          {
            extension: '.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            description: 'Excel 스프레드시트',
            maxSize: '50MB',
            features: ['데이터 분석', '차트 해석'] 
          }
        ]
      }
    };
  }
}