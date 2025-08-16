import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { PackageVersion } from './entities/package-version.entity';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as semver from 'semver';

export interface CreateVersionDto {
  packageId: number;
  version: string;
  type: 'full' | 'delta';
  description?: string;
  filePath: string;
  parentVersion?: string;
  targetVersion?: string;
  changeLog?: any;
}

export interface VersionComparisonResult {
  version: string;
  type: 'full' | 'delta';
  size: number;
  createdAt: Date;
  isPublished: boolean;
  downloadCount: number;
  changes?: any;
}

@Injectable()
export class VersionManagementService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(PackageVersion)
    private versionRepository: Repository<PackageVersion>,
  ) {}

  async createVersion(createVersionDto: CreateVersionDto): Promise<PackageVersion> {
    const { packageId, version, type, filePath } = createVersionDto;

    // 패키지 존재 확인
    const pkg = await this.packageRepository.findOne({ 
      where: { id: packageId },
      relations: ['versions']
    });

    if (!pkg) {
      throw new NotFoundException('패키지를 찾을 수 없습니다.');
    }

    // 버전 중복 확인
    const existingVersion = await this.versionRepository.findOne({
      where: { packageId, version }
    });

    if (existingVersion) {
      throw new BadRequestException('이미 존재하는 버전입니다.');
    }

    // 파일 정보 확인
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('파일을 찾을 수 없습니다.');
    }

    const fileStats = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = crypto.createHash('sha256').update(new Uint8Array(fileBuffer)).digest('hex');

    // 매니페스트 추출
    let manifest = null;
    try {
      manifest = await this.extractManifest(filePath);
    } catch (error) {
      console.warn('매니페스트 추출 실패:', error.message);
    }

    // 델타 패키지 검증
    if (type === 'delta') {
      if (!createVersionDto.parentVersion || !createVersionDto.targetVersion) {
        throw new BadRequestException('델타 패키지는 parent와 target 버전이 필요합니다.');
      }

      const parentExists = await this.versionRepository.findOne({
        where: { packageId, version: createVersionDto.parentVersion }
      });

      if (!parentExists) {
        throw new BadRequestException('부모 버전을 찾을 수 없습니다.');
      }
    }

    // 새 버전 생성
    const newVersion = this.versionRepository.create({
      ...createVersionDto,
      fileSize: fileStats.size,
      fileHash,
      manifest,
      package: pkg,
    });

    const savedVersion = await this.versionRepository.save(newVersion);

    // 패키지 현재 버전 업데이트
    if (type === 'full' && this.isNewerVersion(version, pkg.currentVersion)) {
      pkg.currentVersion = version;
      if (savedVersion.isPublished) {
        pkg.latestStableVersion = version;
      }
      await this.packageRepository.save(pkg);
    }

    return savedVersion;
  }

  async publishVersion(packageId: number, version: string): Promise<PackageVersion> {
    const packageVersion = await this.versionRepository.findOne({
      where: { packageId, version },
      relations: ['package']
    });

    if (!packageVersion) {
      throw new NotFoundException('버전을 찾을 수 없습니다.');
    }

    packageVersion.isPublished = true;

    // 패키지 최신 안정 버전 업데이트
    if (packageVersion.type === 'full' && 
        this.isNewerVersion(version, packageVersion.package.latestStableVersion)) {
      packageVersion.package.latestStableVersion = version;
      await this.packageRepository.save(packageVersion.package);
    }

    return await this.versionRepository.save(packageVersion);
  }

  async deprecateVersion(packageId: number, version: string): Promise<PackageVersion> {
    const packageVersion = await this.versionRepository.findOne({
      where: { packageId, version }
    });

    if (!packageVersion) {
      throw new NotFoundException('버전을 찾을 수 없습니다.');
    }

    packageVersion.isDeprecated = true;
    return await this.versionRepository.save(packageVersion);
  }

  async getVersionHistory(packageId: number): Promise<PackageVersion[]> {
    return await this.versionRepository.find({
      where: { packageId },
      order: { createdAt: 'DESC' },
      relations: ['package']
    });
  }

  async compareVersions(packageId: number, fromVersion: string, toVersion: string): Promise<VersionComparisonResult[]> {
    const versions = await this.versionRepository.find({
      where: { packageId },
      order: { createdAt: 'ASC' }
    });

    const fromIndex = versions.findIndex(v => v.version === fromVersion);
    const toIndex = versions.findIndex(v => v.version === toVersion);

    if (fromIndex === -1 || toIndex === -1) {
      throw new NotFoundException('비교할 버전을 찾을 수 없습니다.');
    }

    const compareVersions = versions.slice(Math.min(fromIndex, toIndex), Math.max(fromIndex, toIndex) + 1);

    return compareVersions.map(version => ({
      version: version.version,
      type: version.type,
      size: version.fileSize,
      createdAt: version.createdAt,
      isPublished: version.isPublished,
      downloadCount: version.downloadCount,
      changes: version.changeLog
    }));
  }

  async getDeltaChain(packageId: number, targetVersion: string): Promise<PackageVersion[]> {
    const deltaVersions = await this.versionRepository.find({
      where: { packageId, type: 'delta', targetVersion },
      order: { createdAt: 'ASC' }
    });

    return deltaVersions;
  }

  async getOptimalUpdatePath(packageId: number, currentVersion: string, targetVersion: string): Promise<{
    path: PackageVersion[];
    totalSize: number;
    strategy: 'direct' | 'incremental';
  }> {
    // 직접 업데이트 (full package)
    const directUpdate = await this.versionRepository.findOne({
      where: { packageId, version: targetVersion, type: 'full' }
    });

    // 증분 업데이트 경로 찾기
    const deltaChain = await this.getDeltaChain(packageId, targetVersion);
    const applicableDeltas = deltaChain.filter(delta => 
      this.isVersionCompatible(currentVersion, delta.parentVersion)
    );

    if (!directUpdate && applicableDeltas.length === 0) {
      throw new NotFoundException('업데이트 경로를 찾을 수 없습니다.');
    }

    const directSize = directUpdate?.fileSize || Infinity;
    const incrementalSize = applicableDeltas.reduce((sum, delta) => sum + delta.fileSize, 0);

    if (directSize <= incrementalSize || applicableDeltas.length === 0) {
      return {
        path: directUpdate ? [directUpdate] : [],
        totalSize: directSize,
        strategy: 'direct'
      };
    } else {
      return {
        path: applicableDeltas,
        totalSize: incrementalSize,
        strategy: 'incremental'
      };
    }
  }

  async recordDownload(packageId: number, version: string): Promise<void> {
    await this.versionRepository.increment(
      { packageId, version },
      'downloadCount',
      1
    );
  }

  async cleanupOldVersions(packageId: number, keepCount: number = 10): Promise<number> {
    const versions = await this.versionRepository.find({
      where: { packageId, isDeprecated: true },
      order: { createdAt: 'DESC' }
    });

    const toDelete = versions.slice(keepCount);
    let deletedCount = 0;

    for (const version of toDelete) {
      try {
        // 파일 삭제
        if (fs.existsSync(version.filePath)) {
          fs.unlinkSync(version.filePath);
        }
        
        // DB에서 삭제
        await this.versionRepository.remove(version);
        deletedCount++;
      } catch (error) {
        console.error(`버전 ${version.version} 삭제 실패:`, error);
      }
    }

    return deletedCount;
  }

  private async extractManifest(filePath: string): Promise<any> {
    const packageData = fs.readFileSync(filePath);
    
    // DRK 매직 헤더 확인
    if (packageData[0] !== 0x44 || packageData[1] !== 0x52 || 
        packageData[2] !== 0x4B || packageData[3] !== 0x00) {
      throw new Error('유효하지 않은 DRK 패키지입니다.');
    }

    const manifestLength = packageData.readUInt32LE(4);
    const manifestJson = packageData.subarray(8, 8 + manifestLength).toString();
    
    return JSON.parse(manifestJson);
  }

  private isNewerVersion(version1: string, version2: string): boolean {
    if (!version2) return true;
    
    try {
      return semver.gt(version1, version2);
    } catch {
      // semver 파싱 실패 시 문자열 비교
      return version1 > version2;
    }
  }

  private isVersionCompatible(currentVersion: string, parentVersion: string): boolean {
    try {
      return semver.gte(currentVersion, parentVersion);
    } catch {
      return currentVersion >= parentVersion;
    }
  }
}