import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { VesselCertificate } from './vessel-certificate.entity';

export enum VesselType {
  CONTAINER = 'CONTAINER',
  BULK_CARRIER = 'BULK_CARRIER',
  TANKER = 'TANKER',
  CRUISE = 'CRUISE',
  FERRY = 'FERRY',
  CARGO = 'CARGO',
  FISHING = 'FISHING',
  NAVAL = 'NAVAL',
  OFFSHORE = 'OFFSHORE',
  OTHER = 'OTHER'
}

export enum VesselStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  DOCKED = 'DOCKED',
  DECOMMISSIONED = 'DECOMMISSIONED',
  EMERGENCY = 'EMERGENCY'
}

@Entity('vessels')
export class Vessel {
  @PrimaryGeneratedColumn()
  id: number;

  // Basic Vessel Information
  @Column({ type: 'varchar', length: 100, unique: true })
  imoNumber: string; // International Maritime Organization number

  @Column({ type: 'varchar', length: 100 })
  vesselName: string;

  @Column({ type: 'varchar', length: 100 })
  callSign: string;

  @Column({ type: 'varchar', length: 100 })
  mmsiNumber: string; // Maritime Mobile Service Identity

  @Column({ type: 'varchar', length: 50 })
  vesselType: string;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;

  // Flag State and Registration
  @Column({ type: 'varchar', length: 100 })
  flagState: string;

  @Column({ type: 'varchar', length: 100 })
  portOfRegistry: string;

  @Column({ type: 'varchar', length: 100 })
  officialNumber: string;

  // Physical Specifications
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  grossTonnage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  netTonnage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  deadweight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  lengthOverall: number; // meters

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  beam: number; // meters

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  draft: number; // meters

  // Build Information
  @Column({ type: 'varchar', length: 100 })
  shipyard: string;

  @Column({ type: 'varchar', length: 100 })
  buildCountry: string;

  @Column({ type: 'date' })
  buildDate: Date;

  @Column({ type: 'varchar', length: 100 })
  hullNumber: string;

  // Classification Society
  @Column({ type: 'varchar', length: 100 })
  classificationSociety: string;

  @Column({ type: 'varchar', length: 100 })
  classNotation: string;

  // Ownership and Management
  @Column({ type: 'varchar', length: 200 })
  owner: string;

  @Column({ type: 'varchar', length: 200 })
  operator: string;

  @Column({ type: 'varchar', length: 200 })
  manager: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  charterer: string;

  // Engine and Propulsion
  @Column({ type: 'varchar', length: 100 })
  mainEngineType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  mainEnginePower: number; // kW

  @Column({ type: 'varchar', length: 100 })
  propulsionType: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  maxSpeed: number; // knots

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  serviceSpeed: number; // knots

  // Current Location and Status
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  currentLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  currentLongitude: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  currentPort: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  destination: string;

  @Column({ type: 'datetime', nullable: true })
  estimatedArrival: Date;

  // Insurance and Safety
  @Column({ type: 'varchar', length: 100 })
  piInsurer: string; // Protection & Indemnity

  @Column({ type: 'date' })
  piExpiryDate: Date;

  @Column({ type: 'varchar', length: 100 })
  hullInsurer: string;

  @Column({ type: 'date' })
  hullInsuranceExpiry: Date;

  // ISM and ISPS
  @Column({ type: 'varchar', length: 100 })
  ismCode: string; // International Safety Management

  @Column({ type: 'date' })
  ismExpiryDate: Date;

  @Column({ type: 'varchar', length: 100 })
  ispsCode: string; // International Ship and Port Facility Security

  @Column({ type: 'date' })
  ispsExpiryDate: Date;

  // MLC (Maritime Labour Convention)
  @Column({ type: 'varchar', length: 100 })
  mlcCertificate: string;

  @Column({ type: 'date' })
  mlcExpiryDate: Date;

  // Environmental Compliance
  @Column({ type: 'boolean', default: false })
  eediCompliant: boolean; // Energy Efficiency Design Index

  @Column({ type: 'boolean', default: false })
  seemCompliant: boolean; // Ship Energy Efficiency Management

  @Column({ type: 'varchar', length: 50, nullable: true })
  tier: string; // NOx emission tier

  @Column({ type: 'boolean', default: false })
  ballastWaterTreatment: boolean;

  // Contact Information
  @Column({ type: 'varchar', length: 200, nullable: true })
  masterName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  shipEmail: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  satellitePhone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  inmarsat: string;

  // Operational Data
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fuelConsumptionRate: number; // MT/day

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  dailyHfoConsumption: number; // Heavy Fuel Oil

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  dailyMdoConsumption: number; // Marine Diesel Oil

  @Column({ type: 'varchar', length: 100, nullable: true })
  voyageNumber: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  cargoDescription: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cargoQuantity: number;

  // System Fields
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;

  // Relations
  @OneToMany(() => VesselCertificate, certificate => certificate.vessel)
  certificates: VesselCertificate[];

  // Computed Properties
  get ageInYears(): number {
    const now = new Date();
    const buildDate = this.buildDate instanceof Date ? this.buildDate : new Date(this.buildDate);
    const buildYear = buildDate.getFullYear();
    return now.getFullYear() - buildYear;
  }

  get isCertificateExpiringSoon(): boolean {
    const now = new Date();
    const threeMonths = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
    
    return [
      this.piExpiryDate,
      this.hullInsuranceExpiry,
      this.ismExpiryDate,
      this.ispsExpiryDate,
      this.mlcExpiryDate
    ].some(date => {
      const expiryDate = date instanceof Date ? date : new Date(date);
      return expiryDate <= threeMonths;
    });
  }

  get dwt(): number {
    return this.deadweight;
  }

  get gt(): number {
    return this.grossTonnage;
  }
}