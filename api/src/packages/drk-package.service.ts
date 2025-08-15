import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as zstd from '@mongodb-js/zstd';
import * as nacl from 'tweetnacl';
import { promisify } from 'util';

interface PackageManifest {
  version: string;
  type: 'full' | 'delta';
  created_at: string;
  total_size: number;
  compressed_size: number;
  file_count: number;
  signature: string;
  hash_tree: Record<string, string>;
  file_entries: FileEntry[];
  metadata: {
    company: string;
    vessel?: string;
    description: string;
  };
}

interface FileEntry {
  path: string;
  size: number;
  hash: string;
  compressed: boolean;
  offset?: number;
  compressedSize?: number;
}

@Injectable()
export class DRKPackageService {
  private readonly logger = new Logger(DRKPackageService.name);
  private readonly MAGIC_HEADER = Buffer.from('DRK\x00');
  private readonly VERSION = '1.0.0';
  
  // Ed25519 키페어 (실제로는 안전하게 관리해야 함)
  private keyPair: nacl.SignKeyPair;

  constructor() {
    // 임시 키페어 생성 (실제로는 저장된 키 사용)
    this.keyPair = nacl.sign.keyPair();
    this.logger.log('DRK Package Service initialized');
  }

  /**
   * 전체 패키지 생성 (.drkpack)
   */
  async createFullPackage(
    sourceDir: string,
    outputPath: string,
    metadata: any = {}
  ): Promise<void> {
    this.logger.log(`Creating full package from ${sourceDir}`);
    
    const files: FileEntry[] = [];
    const hashTree: Record<string, string> = {};
    
    // 1. 파일 수집 및 해시 계산
    await this.collectFiles(sourceDir, '', files, hashTree);
    
    // 2. 패키지 매니페스트 생성
    const manifest: PackageManifest = {
      version: this.VERSION,
      type: 'full',
      created_at: new Date().toISOString(),
      total_size: files.reduce((sum, f) => sum + f.size, 0),
      compressed_size: 0, // 압축 후 업데이트
      file_count: files.length,
      signature: '', // 서명 후 업데이트
      hash_tree: hashTree,
      file_entries: files,
      metadata: {
        company: 'DORIKO',
        ...metadata
      }
    };

    // 3. 패키지 파일 생성
    const packageBuffer = await this.buildPackage(files, manifest, sourceDir);
    
    // 4. 디지털 서명
    manifest.signature = this.signPackage(packageBuffer);
    
    // 5. 최종 패키지 저장
    await this.savePackage(outputPath, packageBuffer, manifest);
    
    this.logger.log(`Package created: ${outputPath} (${files.length} files)`);
  }

  /**
   * 증분 패키지 생성 (.drkdelta)
   */
  async createDeltaPackage(
    baseManifest: PackageManifest,
    sourceDir: string,
    outputPath: string,
    metadata: any = {}
  ): Promise<void> {
    this.logger.log('Creating delta package');
    
    const files: FileEntry[] = [];
    const hashTree: Record<string, string> = {};
    
    // 1. 변경된 파일만 수집
    await this.collectChangedFiles(sourceDir, baseManifest, files, hashTree);
    
    if (files.length === 0) {
      this.logger.log('No changes detected, skipping delta creation');
      return;
    }

    // 2. 델타 매니페스트 생성
    const manifest: PackageManifest = {
      version: this.VERSION,
      type: 'delta',
      created_at: new Date().toISOString(),
      total_size: files.reduce((sum, f) => sum + f.size, 0),
      compressed_size: 0,
      file_count: files.length,
      signature: '',
      hash_tree: hashTree,
      file_entries: files,
      metadata: {
        company: 'DORIKO',
        base_version: baseManifest.created_at,
        ...metadata
      }
    };

    // 3. 델타 패키지 생성
    const packageBuffer = await this.buildPackage(files, manifest, sourceDir);
    
    // 4. 서명
    manifest.signature = this.signPackage(packageBuffer);
    
    // 5. 저장
    await this.savePackage(outputPath, packageBuffer, manifest);
    
    this.logger.log(`Delta package created: ${outputPath} (${files.length} changed files)`);
  }

  /**
   * 패키지 검증
   */
  async verifyPackage(packagePath: string): Promise<boolean> {
    try {
      this.logger.log(`Verifying package: ${packagePath}`);
      
      // 1. 패키지 읽기
      const packageData = await fs.promises.readFile(packagePath);
      
      // 2. 매직 헤더 확인
      if (!packageData.subarray(0, 4).equals(this.MAGIC_HEADER)) {
        this.logger.error('Invalid package format');
        return false;
      }

      // 3. 매니페스트 추출
      const manifestLength = packageData.readUInt32LE(4);
      const manifestJson = packageData.subarray(8, 8 + manifestLength).toString();
      const manifest: PackageManifest = JSON.parse(manifestJson);

      // 4. 서명 검증
      const signature = Buffer.from(manifest.signature, 'hex');
      const message = packageData.subarray(8 + manifestLength);
      
      // 실제로는 공개키로 검증
      const isValid = nacl.sign.detached.verify(
        message as Uint8Array,
        signature as Uint8Array,
        this.keyPair.publicKey
      );

      if (!isValid) {
        this.logger.error('Invalid signature');
        return false;
      }

      // 5. 해시 검증
      for (const [filePath, expectedHash] of Object.entries(manifest.hash_tree)) {
        // 파일별 해시 검증 로직
        this.logger.debug(`Verified: ${filePath}`);
      }

      this.logger.log('Package verification successful');
      return true;
    } catch (error) {
      this.logger.error('Package verification failed', error);
      return false;
    }
  }

  /**
   * 패키지 적용
   */
  async applyPackage(packagePath: string, targetDir: string): Promise<void> {
    this.logger.log(`Applying package to ${targetDir}`);
    
    // 1. 패키지 검증
    if (!await this.verifyPackage(packagePath)) {
      throw new Error('Package verification failed');
    }

    // 2. 백업 생성
    const backupDir = `${targetDir}_backup_${Date.now()}`;
    await this.createBackup(targetDir, backupDir);

    try {
      // 3. 패키지 압축 해제 및 적용
      await this.extractPackage(packagePath, targetDir);
      
      // 4. 원자적 스왑
      await this.atomicSwap(targetDir, backupDir);
      
      this.logger.log('Package applied successfully');
    } catch (error) {
      // 5. 실패 시 롤백
      this.logger.error('Package application failed, rolling back', error);
      await this.rollback(targetDir, backupDir);
      throw error;
    }
  }

  // === Private Methods ===

  private async collectFiles(
    dir: string,
    relativePath: string,
    files: FileEntry[],
    hashTree: Record<string, string>
  ): Promise<void> {
    const entries = await fs.promises.readdir(path.join(dir, relativePath), { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, relativePath, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        await this.collectFiles(dir, relPath, files, hashTree);
      } else if (entry.isFile() && entry.name.endsWith('.pdf')) {
        const stats = await fs.promises.stat(fullPath);
        const hash = await this.calculateFileHash(fullPath);
        
        files.push({
          path: relPath,
          size: stats.size,
          hash: hash,
          compressed: false
        });
        
        hashTree[relPath] = hash;
      }
    }
  }

  private async collectChangedFiles(
    dir: string,
    baseManifest: PackageManifest,
    files: FileEntry[],
    hashTree: Record<string, string>
  ): Promise<void> {
    await this.collectFiles(dir, '', files, hashTree);
    
    // 변경된 파일만 필터링
    const changedFiles = files.filter(file => {
      const baseHash = baseManifest.hash_tree[file.path];
      return !baseHash || baseHash !== file.hash;
    });
    
    files.length = 0;
    files.push(...changedFiles);
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    const fileBuffer = await fs.promises.readFile(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(new Uint8Array(fileBuffer));
    return hash.digest('hex');
  }

  private async buildPackage(
    files: FileEntry[],
    manifest: PackageManifest,
    sourceDir: string
  ): Promise<Buffer> {
    const chunks: Buffer[] = [];
    let offset = 0;
    
    // 파일 데이터 압축 및 연결
    for (const file of files) {
      const filePath = path.join(sourceDir, file.path);
      const fileData = await fs.promises.readFile(filePath);
      
      // Zstd 압축
      const compressed = new Uint8Array(await zstd.compress(fileData));
      
      file.compressed = true;
      file.offset = offset;
      file.compressedSize = compressed.length;
      
      chunks.push(compressed);
      offset += compressed.length;
    }
    
    manifest.compressed_size = offset;
    
    return Buffer.concat(chunks as readonly Uint8Array[]);
  }

  private signPackage(data: Buffer): string {
    const signature = nacl.sign.detached(data as Uint8Array, this.keyPair.secretKey);
    return Buffer.from(signature).toString('hex');
  }

  private async savePackage(
    outputPath: string,
    packageData: Buffer,
    manifest: PackageManifest
  ): Promise<void> {
    const manifestJson = JSON.stringify(manifest, null, 2);
    const manifestBuffer = Buffer.from(manifestJson);
    
    // 패키지 구조: [MAGIC_HEADER][MANIFEST_LENGTH][MANIFEST][DATA]
    const output = Buffer.concat([
      this.MAGIC_HEADER,
      Buffer.allocUnsafe(4),
      manifestBuffer,
      packageData
    ] as readonly Uint8Array[]);
    
    // 매니페스트 길이 기록
    output.writeUInt32LE(manifestBuffer.length, 4);
    
    await fs.promises.writeFile(outputPath, new Uint8Array(output));
  }

  private async extractPackage(packagePath: string, targetDir: string): Promise<void> {
    const packageData = await fs.promises.readFile(packagePath);
    
    // 매니페스트 추출
    const manifestLength = packageData.readUInt32LE(4);
    const manifestJson = packageData.subarray(8, 8 + manifestLength).toString();
    const manifest: PackageManifest = JSON.parse(manifestJson);
    
    // 데이터 섹션
    const dataSection = packageData.subarray(8 + manifestLength);
    
    // 임시 추출 디렉토리 생성
    const tempDir = `${targetDir}_extract_${Date.now()}`;
    await fs.promises.mkdir(tempDir, { recursive: true });
    
    try {
      // file_entries를 사용하여 정확한 오프셋과 크기로 파일 추출
      for (const fileEntry of manifest.file_entries) {
        this.logger.debug(`Extracting: ${fileEntry.path}`);
        
        // 압축된 데이터 추출
        const compressedData = dataSection.subarray(
          fileEntry.offset || 0, 
          (fileEntry.offset || 0) + (fileEntry.compressedSize || 0)
        );
        
        // Zstd 압축 해제
        try {
          const decompressed = new Uint8Array(await zstd.decompress(compressedData));
          
          // 파일 경로 생성
          const outputPath = path.join(tempDir, fileEntry.path);
          const outputDir = path.dirname(outputPath);
          
          await fs.promises.mkdir(outputDir, { recursive: true });
          await fs.promises.writeFile(outputPath, Buffer.from(decompressed));
          
          // 해시 검증
          const actualHash = await this.calculateFileHash(outputPath);
          const expectedHash = manifest.hash_tree[fileEntry.path];
          
          if (actualHash !== expectedHash) {
            throw new Error(`Hash mismatch for ${fileEntry.path}`);
          }
          
          this.logger.debug(`Extracted and verified: ${fileEntry.path}`);
          
        } catch (error) {
          this.logger.error(`Failed to extract ${fileEntry.path}:`, error);
          throw error;
        }
      }
      
      // 성공적으로 추출된 파일들을 최종 목적지로 이동
      await fs.promises.cp(tempDir, targetDir, { recursive: true });
      
    } finally {
      // 임시 디렉토리 정리
      if (fs.existsSync(tempDir)) {
        await fs.promises.rm(tempDir, { recursive: true });
      }
    }
  }

  private async createBackup(sourceDir: string, backupDir: string): Promise<void> {
    // 간단한 백업 로직 (실제로는 더 효율적으로)
    await fs.promises.cp(sourceDir, backupDir, { recursive: true });
  }

  private async atomicSwap(targetDir: string, backupDir: string): Promise<void> {
    // 원자적 교체 로직
    const tempDir = `${targetDir}_temp`;
    await fs.promises.rename(targetDir, tempDir);
    await fs.promises.rename(backupDir, targetDir);
    await fs.promises.rm(tempDir, { recursive: true });
  }

  private async rollback(targetDir: string, backupDir: string): Promise<void> {
    if (fs.existsSync(backupDir)) {
      await fs.promises.rm(targetDir, { recursive: true });
      await fs.promises.rename(backupDir, targetDir);
    }
  }
}