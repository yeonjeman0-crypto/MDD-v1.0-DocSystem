import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vessel } from './vessel.entity';

export enum CertificateType {
  // Safety Certificates
  SAFETY_CONSTRUCTION = 'SAFETY_CONSTRUCTION', // Safety Construction Certificate
  SAFETY_EQUIPMENT = 'SAFETY_EQUIPMENT', // Safety Equipment Certificate
  SAFETY_RADIO = 'SAFETY_RADIO', // Safety Radio Certificate
  LOAD_LINE = 'LOAD_LINE', // Load Line Certificate
  
  // Pollution Prevention
  IOPP = 'IOPP', // International Oil Pollution Prevention
  NLS = 'NLS', // Noxious Liquid Substances
  GARBAGE = 'GARBAGE', // Garbage Certificate
  SEWAGE = 'SEWAGE', // Sewage Certificate
  ANTI_FOULING = 'ANTI_FOULING', // Anti-fouling System Certificate
  BALLAST_WATER = 'BALLAST_WATER', // Ballast Water Management
  
  // Tonnage and Measurement
  TONNAGE = 'TONNAGE', // Tonnage Certificate
  SUEZ_TONNAGE = 'SUEZ_TONNAGE', // Suez Canal Tonnage Certificate
  PANAMA_TONNAGE = 'PANAMA_TONNAGE', // Panama Canal Tonnage Certificate
  
  // Navigation and Communication
  COMPASS = 'COMPASS', // Compass Certificate
  RADAR = 'RADAR', // Radar Certificate
  GMDSS = 'GMDSS', // Global Maritime Distress Safety System
  AIS = 'AIS', // Automatic Identification System
  
  // Cargo and Specialized
  DANGEROUS_GOODS = 'DANGEROUS_GOODS', // Dangerous Goods Certificate
  GRAIN = 'GRAIN', // Grain Loading Certificate
  SHIP_SANITATION = 'SHIP_SANITATION', // Ship Sanitation Certificate
  DERATTING = 'DERATTING', // Deratting Certificate
  
  // Security
  ISPS = 'ISPS', // International Ship and Port Facility Security
  CSR = 'CSR', // Continuous Synopsis Record
  
  // Management
  ISM = 'ISM', // International Safety Management
  MLC = 'MLC', // Maritime Labour Convention
  
  // Environmental
  ENERGY_EFFICIENCY = 'ENERGY_EFFICIENCY', // Energy Efficiency Certificate
  NOX_TECHNICAL = 'NOX_TECHNICAL', // NOx Technical File
  
  // Classification
  CLASS_CERTIFICATE = 'CLASS_CERTIFICATE', // Classification Society Certificate
  
  // Port State Control
  PSC_INSPECTION = 'PSC_INSPECTION', // Port State Control Inspection
  
  // Insurance
  PI_CERTIFICATE = 'PI_CERTIFICATE', // Protection & Indemnity
  HULL_INSURANCE = 'HULL_INSURANCE', // Hull & Machinery Insurance
  
  // Other
  OTHER = 'OTHER'
}

export enum CertificateStatus {
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
  EXPIRING_SOON = 'EXPIRING_SOON', // Within 90 days
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
  PENDING_RENEWAL = 'PENDING_RENEWAL'
}

export enum IssuingAuthority {
  FLAG_STATE = 'FLAG_STATE',
  CLASSIFICATION_SOCIETY = 'CLASSIFICATION_SOCIETY',
  RECOGNIZED_ORGANIZATION = 'RECOGNIZED_ORGANIZATION',
  PORT_STATE = 'PORT_STATE',
  INSURANCE_COMPANY = 'INSURANCE_COMPANY',
  IMO = 'IMO',
  OTHER = 'OTHER'
}

@Entity('vessel_certificates')
export class VesselCertificate {
  @PrimaryGeneratedColumn()
  id: number;

  // Certificate Information
  @Column({ type: 'varchar', length: 100 })
  certificateType: string;

  @Column({ type: 'varchar', length: 200 })
  certificateName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  certificateNumber: string;

  @Column({ type: 'varchar', length: 50, default: 'VALID' })
  status: string;

  // Issuing Information
  @Column({ type: 'varchar', length: 50 })
  issuingAuthorityType: string;

  @Column({ type: 'varchar', length: 200 })
  issuingAuthority: string;

  @Column({ type: 'varchar', length: 100 })
  issuingCountry: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  issuingOfficer: string;

  // Dates
  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'date', nullable: true })
  endorsementDate: Date;

  @Column({ type: 'date', nullable: true })
  surveyDate: Date;

  @Column({ type: 'date', nullable: true })
  nextSurveyDate: Date;

  // Survey Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  surveyType: string; // Annual, Intermediate, Renewal, etc.

  @Column({ type: 'varchar', length: 200, nullable: true })
  surveyorName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  surveyLocation: string;

  // Conditions and Limitations
  @Column({ type: 'text', nullable: true })
  conditions: string;

  @Column({ type: 'text', nullable: true })
  limitations: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  // Document Management
  @Column({ type: 'varchar', length: 500, nullable: true })
  documentPath: string; // Path to scanned certificate

  @Column({ type: 'varchar', length: 100, nullable: true })
  documentHash: string; // SHA-256 hash for integrity

  @Column({ type: 'integer', nullable: true })
  documentSize: number; // File size in bytes

  @Column({ type: 'varchar', length: 50, nullable: true })
  documentFormat: string; // PDF, JPEG, etc.

  // Compliance and Audit
  @Column({ type: 'boolean', default: true })
  isCompliant: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  complianceNotes: string;

  @Column({ type: 'date', nullable: true })
  lastAuditDate: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  auditor: string;

  // Renewal Information
  @Column({ type: 'boolean', default: false })
  renewalInProcess: boolean;

  @Column({ type: 'date', nullable: true })
  renewalApplicationDate: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  renewalAuthority: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  renewalStatus: string;

  // Cost Information
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  issuanceCost: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  renewalCost: number;

  // Alert Configuration
  @Column({ type: 'integer', default: 90 })
  alertDaysBefore: number; // Days before expiry to alert

  @Column({ type: 'boolean', default: true })
  emailAlertEnabled: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  alertRecipients: string; // Comma-separated email list

  // System Fields
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
  @ManyToOne(() => Vessel, vessel => vessel.certificates)
  @JoinColumn({ name: 'vesselId' })
  vessel: Vessel;

  @Column()
  vesselId: number;

  // Computed Properties
  get daysUntilExpiry(): number {
    const now = new Date();
    const expiryDate = this.expiryDate instanceof Date ? this.expiryDate : new Date(this.expiryDate);
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isExpired(): boolean {
    const expiryDate = this.expiryDate instanceof Date ? this.expiryDate : new Date(this.expiryDate);
    return new Date() > expiryDate;
  }

  get isExpiringSoon(): boolean {
    return this.daysUntilExpiry <= this.alertDaysBefore && this.daysUntilExpiry > 0;
  }

  get priorityLevel(): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (this.isExpired) return 'HIGH';
    if (this.daysUntilExpiry <= 30) return 'HIGH';
    if (this.daysUntilExpiry <= 90) return 'MEDIUM';
    return 'LOW';
  }

  get certificateAge(): number {
    const now = new Date();
    const issueDate = this.issueDate instanceof Date ? this.issueDate : new Date(this.issueDate);
    const diffTime = now.getTime() - issueDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Critical certificates that require immediate attention when expired
  get isCritical(): boolean {
    const criticalTypes = [
      'SAFETY_CONSTRUCTION',
      'SAFETY_EQUIPMENT',
      'LOAD_LINE',
      'IOPP',
      'ISM',
      'ISPS',
      'MLC'
    ];
    return criticalTypes.includes(this.certificateType);
  }
}