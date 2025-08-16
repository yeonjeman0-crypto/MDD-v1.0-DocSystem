import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { DRKPackageService } from './drk-package.service';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Multer 저장소 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/packages';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

@ApiTags('DRK Packages')
@Controller('api/packages')
export class DRKPackageController {
  private readonly logger = new Logger(DRKPackageController.name);

  constructor(private readonly packageService: DRKPackageService) {}

  @Post('create-full')
  @ApiOperation({ summary: '전체 DRK 패키지 생성' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sourceDir: { type: 'string', description: '소스 디렉토리 경로' },
        metadata: {
          type: 'object',
          properties: {
            vessel: { type: 'string' },
            description: { type: 'string' }
          }
        }
      }
    }
  })
  async createFullPackage(
    @Body() body: { sourceDir: string; metadata?: any }
  ): Promise<any> {
    this.logger.log('Creating full DRK package');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = `./uploads/packages/full-${timestamp}.drkpack`;
    
    try {
      await this.packageService.createFullPackage(
        body.sourceDir,
        outputPath,
        body.metadata
      );

      const stats = await fs.promises.stat(outputPath);
      
      return {
        success: true,
        package: {
          type: 'full',
          path: outputPath,
          size: stats.size,
          created_at: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error('Failed to create full package', error);
      throw error;
    }
  }

  @Post('create-delta')
  @ApiOperation({ summary: '증분 DRK 패키지 생성' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        baseManifestPath: { type: 'string', description: '기준 매니페스트 경로' },
        sourceDir: { type: 'string', description: '소스 디렉토리 경로' },
        metadata: {
          type: 'object',
          properties: {
            vessel: { type: 'string' },
            description: { type: 'string' }
          }
        }
      }
    }
  })
  async createDeltaPackage(
    @Body() body: { baseManifestPath: string; sourceDir: string; metadata?: any }
  ): Promise<any> {
    this.logger.log('Creating delta DRK package');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = `./uploads/packages/delta-${timestamp}.drkdelta`;
    
    try {
      // 기준 매니페스트 로드
      const baseManifest = JSON.parse(
        await fs.promises.readFile(body.baseManifestPath, 'utf-8')
      );

      await this.packageService.createDeltaPackage(
        baseManifest,
        body.sourceDir,
        outputPath,
        body.metadata
      );

      const stats = await fs.promises.stat(outputPath);
      
      return {
        success: true,
        package: {
          type: 'delta',
          path: outputPath,
          size: stats.size,
          created_at: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error('Failed to create delta package', error);
      throw error;
    }
  }

  @Post('verify')
  @UseInterceptors(FileInterceptor('package', { storage }))
  @ApiOperation({ summary: 'DRK 패키지 검증' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        package: {
          type: 'string',
          format: 'binary',
          description: 'DRK 패키지 파일 (.drkpack 또는 .drkdelta)'
        }
      }
    }
  })
  async verifyPackage(
    @UploadedFile() file: Express.Multer.File
  ): Promise<any> {
    this.logger.log(`Verifying package: ${file.originalname}`);
    
    try {
      const isValid = await this.packageService.verifyPackage(file.path);
      
      return {
        success: true,
        package: {
          filename: file.originalname,
          size: file.size,
          valid: isValid,
          verified_at: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error('Package verification failed', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('apply')
  @UseInterceptors(FileInterceptor('package', { storage }))
  @ApiOperation({ summary: 'DRK 패키지 적용' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        package: {
          type: 'string',
          format: 'binary',
          description: 'DRK 패키지 파일'
        },
        targetDir: {
          type: 'string',
          description: '대상 디렉토리'
        }
      }
    }
  })
  async applyPackage(
    @UploadedFile() file: Express.Multer.File,
    @Body('targetDir') targetDir: string
  ): Promise<any> {
    this.logger.log(`Applying package: ${file.originalname} to ${targetDir}`);
    
    try {
      await this.packageService.applyPackage(file.path, targetDir);
      
      return {
        success: true,
        message: 'Package applied successfully',
        package: {
          filename: file.originalname,
          target: targetDir,
          applied_at: new Date().toISOString()
        }
      };
    } catch (error) {
      this.logger.error('Package application failed', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'DRK 패키지 다운로드' })
  async downloadPackage(
    @Param('filename') filename: string,
    @Res() res: Response
  ): Promise<void> {
    const filePath = path.join('./uploads/packages', filename);
    
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Package not found' });
      return;
    }

    const stats = await fs.promises.stat(filePath);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);
    
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }

  @Get('list')
  @ApiOperation({ summary: '생성된 패키지 목록 조회' })
  async listPackages(): Promise<any> {
    const packagesDir = './uploads/packages';
    
    if (!fs.existsSync(packagesDir)) {
      return { packages: [] };
    }

    const files = await fs.promises.readdir(packagesDir);
    const packages = [];

    for (const file of files) {
      if (file.endsWith('.drkpack') || file.endsWith('.drkdelta')) {
        const filePath = path.join(packagesDir, file);
        const stats = await fs.promises.stat(filePath);
        
        packages.push({
          filename: file,
          type: file.endsWith('.drkpack') ? 'full' : 'delta',
          size: stats.size,
          created_at: stats.birthtime,
          modified_at: stats.mtime
        });
      }
    }

    return {
      packages,
      total: packages.length
    };
  }

  @Get('stats')
  @ApiOperation({ summary: '패키지 통계 조회' })
  async getPackageStats(): Promise<any> {
    const packagesDir = './uploads/packages';
    
    if (!fs.existsSync(packagesDir)) {
      return {
        totalPackages: 0,
        fullPackages: 0,
        deltaPackages: 0,
        totalSize: 0
      };
    }

    const files = await fs.promises.readdir(packagesDir);
    let totalPackages = 0;
    let fullPackages = 0;
    let deltaPackages = 0;
    let totalSize = 0;

    for (const file of files) {
      if (file.endsWith('.drkpack') || file.endsWith('.drkdelta')) {
        const filePath = path.join(packagesDir, file);
        const stats = await fs.promises.stat(filePath);
        
        totalPackages++;
        totalSize += stats.size;
        
        if (file.endsWith('.drkpack')) {
          fullPackages++;
        } else {
          deltaPackages++;
        }
      }
    }

    this.logger.log(`Package stats: ${totalPackages} total (${fullPackages} full, ${deltaPackages} delta)`);

    return {
      totalPackages,
      fullPackages,
      deltaPackages,
      totalSize
    };
  }
}