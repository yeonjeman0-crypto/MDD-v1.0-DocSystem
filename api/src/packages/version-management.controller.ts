import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Body, 
  Param, 
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { VersionManagementService, CreateVersionDto } from './version-management.service';

@ApiTags('Version Management')
@Controller('packages/:packageId/versions')
export class VersionManagementController {
  constructor(
    private readonly versionService: VersionManagementService,
  ) {}

  @Post()
  @ApiOperation({ summary: '새 버전 생성' })
  @ApiParam({ name: 'packageId', description: '패키지 ID' })
  @ApiResponse({ status: 201, description: '버전이 성공적으로 생성됨' })
  async createVersion(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Body() createVersionDto: Omit<CreateVersionDto, 'packageId'>
  ) {
    try {
      const version = await this.versionService.createVersion({
        ...createVersionDto,
        packageId
      });
      return {
        success: true,
        data: version,
        message: '버전이 성공적으로 생성되었습니다.'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Version Creation Failed'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @ApiOperation({ summary: '버전 히스토리 조회' })
  @ApiParam({ name: 'packageId', description: '패키지 ID' })
  @ApiResponse({ status: 200, description: '버전 히스토리 목록' })
  async getVersionHistory(
    @Param('packageId', ParseIntPipe) packageId: number
  ) {
    try {
      const versions = await this.versionService.getVersionHistory(packageId);
      return {
        success: true,
        data: versions,
        count: versions.length
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Version History Fetch Failed'
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Put(':version/publish')
  @ApiOperation({ summary: '버전 퍼블리시' })
  @ApiParam({ name: 'packageId', description: '패키지 ID' })
  @ApiParam({ name: 'version', description: '버전 번호' })
  @ApiResponse({ status: 200, description: '버전이 성공적으로 퍼블리시됨' })
  async publishVersion(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Param('version') version: string
  ) {
    try {
      const publishedVersion = await this.versionService.publishVersion(packageId, version);
      return {
        success: true,
        data: publishedVersion,
        message: '버전이 성공적으로 퍼블리시되었습니다.'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Version Publish Failed'
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Put(':version/deprecate')
  @ApiOperation({ summary: '버전 사용 중단' })
  @ApiParam({ name: 'packageId', description: '패키지 ID' })
  @ApiParam({ name: 'version', description: '버전 번호' })
  @ApiResponse({ status: 200, description: '버전이 성공적으로 사용 중단됨' })
  async deprecateVersion(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Param('version') version: string
  ) {
    try {
      const deprecatedVersion = await this.versionService.deprecateVersion(packageId, version);
      return {
        success: true,
        data: deprecatedVersion,
        message: '버전이 성공적으로 사용 중단되었습니다.'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Version Deprecation Failed'
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Get('compare')
  @ApiOperation({ summary: '버전 비교' })
  @ApiParam({ name: 'packageId', description: '패키지 ID' })
  @ApiQuery({ name: 'from', description: '비교 시작 버전' })
  @ApiQuery({ name: 'to', description: '비교 종료 버전' })
  @ApiResponse({ status: 200, description: '버전 비교 결과' })
  async compareVersions(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Query('from') fromVersion: string,
    @Query('to') toVersion: string
  ) {
    try {
      const comparison = await this.versionService.compareVersions(packageId, fromVersion, toVersion);
      return {
        success: true,
        data: {
          from: fromVersion,
          to: toVersion,
          versions: comparison
        }
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Version Comparison Failed'
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Get('update-path')
  @ApiOperation({ summary: '최적 업데이트 경로 조회' })
  @ApiParam({ name: 'packageId', description: '패키지 ID' })
  @ApiQuery({ name: 'current', description: '현재 버전' })
  @ApiQuery({ name: 'target', description: '목표 버전' })
  @ApiResponse({ status: 200, description: '최적 업데이트 경로' })
  async getOptimalUpdatePath(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Query('current') currentVersion: string,
    @Query('target') targetVersion: string
  ) {
    try {
      const updatePath = await this.versionService.getOptimalUpdatePath(
        packageId,
        currentVersion,
        targetVersion
      );
      return {
        success: true,
        data: updatePath
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Update Path Calculation Failed'
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Get(':version/delta-chain')
  @ApiOperation({ summary: '델타 체인 조회' })
  @ApiParam({ name: 'packageId', description: '패키지 ID' })
  @ApiParam({ name: 'version', description: '목표 버전' })
  @ApiResponse({ status: 200, description: '델타 패키지 체인' })
  async getDeltaChain(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Param('version') targetVersion: string
  ) {
    try {
      const deltaChain = await this.versionService.getDeltaChain(packageId, targetVersion);
      return {
        success: true,
        data: deltaChain,
        count: deltaChain.length
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Delta Chain Fetch Failed'
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Post(':version/download')
  @ApiOperation({ summary: '다운로드 기록' })
  @ApiParam({ name: 'packageId', description: '패키지 ID' })
  @ApiParam({ name: 'version', description: '버전 번호' })
  @ApiResponse({ status: 200, description: '다운로드가 기록됨' })
  async recordDownload(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Param('version') version: string
  ) {
    try {
      await this.versionService.recordDownload(packageId, version);
      return {
        success: true,
        message: '다운로드가 기록되었습니다.'
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Download Recording Failed'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete('cleanup')
  @ApiOperation({ summary: '오래된 버전 정리' })
  @ApiParam({ name: 'packageId', description: '패키지 ID' })
  @ApiQuery({ name: 'keep', description: '유지할 버전 수', required: false })
  @ApiResponse({ status: 200, description: '정리 완료' })
  async cleanupOldVersions(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Query('keep') keepCount?: string
  ) {
    try {
      const keep = keepCount ? parseInt(keepCount) : 10;
      const deletedCount = await this.versionService.cleanupOldVersions(packageId, keep);
      return {
        success: true,
        data: {
          deletedCount,
          keepCount: keep
        },
        message: `${deletedCount}개의 오래된 버전이 정리되었습니다.`
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Version Cleanup Failed'
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}