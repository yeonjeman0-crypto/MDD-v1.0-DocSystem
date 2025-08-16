import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PackageVersion } from './package-version.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  currentVersion: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  latestStableVersion: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'varchar', length: 255, nullable: true })
  maintainer: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PackageVersion, (version) => version.package, { cascade: true })
  versions: PackageVersion[];
}