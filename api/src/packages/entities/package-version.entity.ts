import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Package } from './package.entity';

@Entity('package_versions')
export class PackageVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  version: string;

  @Column({ type: 'varchar', length: 50 })
  type: 'full' | 'delta';

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @Column({ type: 'integer' })
  fileSize: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  fileHash: string;

  @Column({ type: 'json', nullable: true })
  manifest: any;

  @Column({ type: 'json', nullable: true })
  changeLog: any;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'boolean', default: false })
  isDeprecated: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  parentVersion: string; // For delta packages

  @Column({ type: 'varchar', length: 100, nullable: true })
  targetVersion: string; // For delta packages

  @Column({ type: 'integer', default: 0 })
  downloadCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Package, (pkg) => pkg.versions)
  @JoinColumn({ name: 'packageId' })
  package: Package;

  @Column()
  packageId: number;
}