import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SearchService, SearchOptions } from './search.service.simple';

@ApiTags('Search')
@Controller('api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('documents')
  @ApiOperation({ summary: '문서 검색' })
  @ApiResponse({ status: 200, description: '검색 결과 반환' })
  async searchDocuments(@Body() searchOptions: SearchOptions) {
    try {
      const result = await this.searchService.search(searchOptions);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '검색 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('suggest')
  @ApiOperation({ summary: '검색 자동완성' })
  @ApiQuery({ name: 'q', description: '검색 쿼리' })
  @ApiQuery({ name: 'size', description: '결과 개수', required: false })
  async getSuggestions(
    @Query('q') query: string,
    @Query('size') size?: number,
  ) {
    try {
      const suggestions = await this.searchService.suggest(
        query,
        size ? parseInt(size.toString()) : 5,
      );
      return {
        success: true,
        data: suggestions,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '자동완성 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('index/document')
  @ApiOperation({ summary: '문서 인덱싱' })
  async indexDocument(@Body() document: any) {
    try {
      await this.searchService.indexDocument(document);
      return {
        success: true,
        message: '문서가 성공적으로 인덱싱되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '문서 인덱싱 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('index/bulk')
  @ApiOperation({ summary: '문서 일괄 인덱싱' })
  async bulkIndexDocuments(@Body() documents: any[]) {
    try {
      await this.searchService.bulkIndex(documents);
      return {
        success: true,
        message: `${documents.length}개 문서가 성공적으로 인덱싱되었습니다.`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '문서 일괄 인덱싱 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('index/document/:id')
  @ApiOperation({ summary: '문서 인덱스 삭제' })
  async deleteDocument(@Param('id') id: string) {
    try {
      await this.searchService.deleteDocument(id);
      return {
        success: true,
        message: '문서가 성공적으로 삭제되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '문서 삭제 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('index/clear')
  @ApiOperation({ summary: '전체 인덱스 초기화' })
  async clearIndex() {
    try {
      await this.searchService.clearIndex();
      return {
        success: true,
        message: '인덱스가 성공적으로 초기화되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '인덱스 초기화 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('index/init')
  @ApiOperation({ summary: '문서 데이터로부터 인덱스 초기화' })
  async initializeIndex() {
    try {
      // This would typically fetch all documents from your document service
      // and bulk index them
      const documentsService = require('../documents/document-list.service');
      
      // For now, return success - in real implementation, you'd fetch and index all docs
      return {
        success: true,
        message: '인덱스 초기화가 시작되었습니다.',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '인덱스 초기화 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @ApiOperation({ summary: '검색 인덱스 통계' })
  async getIndexStats() {
    try {
      // In a real implementation, you'd get actual stats from Elasticsearch
      return {
        success: true,
        data: {
          totalDocuments: 0,
          indexSize: '0 MB',
          lastUpdated: new Date().toISOString(),
          sections: {
            'main-manual': 0,
            'procedures': 0,
            'instructions': 0,
            'forms': 0,
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '통계 조회 중 오류가 발생했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}