import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, In } from 'typeorm';
import { Vessel, VesselStatus, VesselType } from './entities/vessel.entity';
import { VesselCertificate, CertificateStatus, CertificateType } from './entities/vessel-certificate.entity';

export interface VesselCreateDto {
  imoNumber: string;
  vesselName: string;
  callSign: string;
  mmsiNumber: string;
  vesselType: string;
  flagState: string;
  portOfRegistry: string;
  officialNumber: string;
  grossTonnage: number;
  netTonnage: number;
  deadweight: number;
  lengthOverall: number;
  beam: number;
  draft: number;
  shipyard: string;
  buildCountry: string;
  buildDate: Date;
  classificationSociety: string;
  owner: string;
  operator: string;
  manager: string;
  mainEngineType: string;
  mainEnginePower: number;
  maxSpeed: number;
  serviceSpeed: number;
}

export interface VesselUpdateDto extends Partial<VesselCreateDto> {
  status?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  currentPort?: string;
  destination?: string;
  estimatedArrival?: Date;
  notes?: string;
}

export interface CertificateCreateDto {
  vesselId: number;
  certificateType: string;
  certificateName: string;
  certificateNumber: string;
  issuingAuthority: string;
  issuingCountry: string;
  issueDate: Date;
  expiryDate: Date;
  surveyDate?: Date;
  conditions?: string;
  limitations?: string;
}

export interface FleetStatistics {
  totalVessels: number;
  vesselsByType: { type: string; count: number }[];
  vesselsByStatus: { status: string; count: number }[];
  averageAge: number;
  totalDeadweight: number;
  totalGrossTonnage: number;
  certificatesExpiring: number;
  certificatesExpired: number;
  certificatesValid: number;
  criticalAlerts: number;
  maintenanceDue: number;
}

export interface CertificateAlert {
  vesselId: number;
  vesselName: string;
  imoNumber: string;
  certificateId: number;
  certificateType: string;
  certificateName: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  isCritical: boolean;
}

@Injectable()
export class FleetService {
  constructor(
    @InjectRepository(Vessel)
    private vesselRepository: Repository<Vessel>,
    @InjectRepository(VesselCertificate)
    private certificateRepository: Repository<VesselCertificate>,
  ) {}

  // Vessel Management
  async createVessel(createVesselDto: VesselCreateDto): Promise<Vessel> {
    // Check if IMO number already exists
    const existingVessel = await this.vesselRepository.findOne({
      where: { imoNumber: createVesselDto.imoNumber }
    });

    if (existingVessel) {
      throw new BadRequestException(`Vessel with IMO number ${createVesselDto.imoNumber} already exists`);
    }

    const vessel = this.vesselRepository.create(createVesselDto);
    return await this.vesselRepository.save(vessel);
  }

  async getAllVessels(): Promise<Vessel[]> {
    return await this.vesselRepository.find({
      where: { isActive: true },
      relations: ['certificates'],
      order: { vesselName: 'ASC' }
    });
  }

  async getVesselById(id: number): Promise<Vessel> {
    const vessel = await this.vesselRepository.findOne({
      where: { id, isActive: true },
      relations: ['certificates']
    });

    if (!vessel) {
      throw new NotFoundException(`Vessel with ID ${id} not found`);
    }

    return vessel;
  }

  async getVesselByImo(imoNumber: string): Promise<Vessel> {
    const vessel = await this.vesselRepository.findOne({
      where: { imoNumber, isActive: true },
      relations: ['certificates']
    });

    if (!vessel) {
      throw new NotFoundException(`Vessel with IMO ${imoNumber} not found`);
    }

    return vessel;
  }

  async updateVessel(id: number, updateVesselDto: VesselUpdateDto): Promise<Vessel> {
    const vessel = await this.getVesselById(id);
    
    Object.assign(vessel, updateVesselDto);
    vessel.updatedAt = new Date();

    return await this.vesselRepository.save(vessel);
  }

  async deleteVessel(id: number): Promise<void> {
    const vessel = await this.getVesselById(id);
    
    // Soft delete
    vessel.isActive = false;
    vessel.updatedAt = new Date();
    
    await this.vesselRepository.save(vessel);
  }

  async getVesselsByType(vesselType: string): Promise<Vessel[]> {
    return await this.vesselRepository.find({
      where: { vesselType, isActive: true },
      relations: ['certificates'],
      order: { vesselName: 'ASC' }
    });
  }

  async getVesselsByStatus(status: string): Promise<Vessel[]> {
    return await this.vesselRepository.find({
      where: { status, isActive: true },
      relations: ['certificates'],
      order: { vesselName: 'ASC' }
    });
  }

  async getVesselsByFlag(flagState: string): Promise<Vessel[]> {
    return await this.vesselRepository.find({
      where: { flagState, isActive: true },
      relations: ['certificates'],
      order: { vesselName: 'ASC' }
    });
  }

  // Certificate Management
  async createCertificate(createCertificateDto: CertificateCreateDto): Promise<VesselCertificate> {
    // Verify vessel exists
    await this.getVesselById(createCertificateDto.vesselId);

    // Check if certificate number already exists
    const existingCertificate = await this.certificateRepository.findOne({
      where: { certificateNumber: createCertificateDto.certificateNumber }
    });

    if (existingCertificate) {
      throw new BadRequestException(`Certificate with number ${createCertificateDto.certificateNumber} already exists`);
    }

    const certificate = this.certificateRepository.create(createCertificateDto);
    return await this.certificateRepository.save(certificate);
  }

  async getCertificatesByVessel(vesselId: number): Promise<VesselCertificate[]> {
    await this.getVesselById(vesselId); // Verify vessel exists

    return await this.certificateRepository.find({
      where: { vesselId, isActive: true },
      order: { expiryDate: 'ASC' }
    });
  }

  async updateCertificate(id: number, updates: Partial<VesselCertificate>): Promise<VesselCertificate> {
    const certificate = await this.certificateRepository.findOne({
      where: { id, isActive: true }
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    Object.assign(certificate, updates);
    certificate.updatedAt = new Date();

    return await this.certificateRepository.save(certificate);
  }

  async deleteCertificate(id: number): Promise<void> {
    const certificate = await this.certificateRepository.findOne({
      where: { id, isActive: true }
    });

    if (!certificate) {
      throw new NotFoundException(`Certificate with ID ${id} not found`);
    }

    // Soft delete
    certificate.isActive = false;
    certificate.updatedAt = new Date();
    
    await this.certificateRepository.save(certificate);
  }

  // Certificate Alerts and Monitoring
  async getCertificateAlerts(daysAhead: number = 90): Promise<CertificateAlert[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const certificates = await this.certificateRepository
      .createQueryBuilder('cert')
      .leftJoinAndSelect('cert.vessel', 'vessel')
      .where('cert.isActive = :isActive', { isActive: true })
      .andWhere('vessel.isActive = :vesselActive', { vesselActive: true })
      .andWhere('cert.expiryDate <= :futureDate', { futureDate })
      .andWhere('cert.expiryDate >= :now', { now: new Date() })
      .orderBy('cert.expiryDate', 'ASC')
      .getMany();

    return certificates.map(cert => ({
      vesselId: cert.vessel.id,
      vesselName: cert.vessel.vesselName,
      imoNumber: cert.vessel.imoNumber,
      certificateId: cert.id,
      certificateType: cert.certificateType,
      certificateName: cert.certificateName,
      expiryDate: cert.expiryDate,
      daysUntilExpiry: cert.daysUntilExpiry,
      priorityLevel: cert.priorityLevel,
      isCritical: cert.isCritical
    }));
  }

  async getExpiredCertificates(): Promise<CertificateAlert[]> {
    const certificates = await this.certificateRepository
      .createQueryBuilder('cert')
      .leftJoinAndSelect('cert.vessel', 'vessel')
      .where('cert.isActive = :isActive', { isActive: true })
      .andWhere('vessel.isActive = :vesselActive', { vesselActive: true })
      .andWhere('cert.expiryDate < :now', { now: new Date() })
      .orderBy('cert.expiryDate', 'DESC')
      .getMany();

    return certificates.map(cert => ({
      vesselId: cert.vessel.id,
      vesselName: cert.vessel.vesselName,
      imoNumber: cert.vessel.imoNumber,
      certificateId: cert.id,
      certificateType: cert.certificateType,
      certificateName: cert.certificateName,
      expiryDate: cert.expiryDate,
      daysUntilExpiry: cert.daysUntilExpiry,
      priorityLevel: 'HIGH' as const,
      isCritical: cert.isCritical
    }));
  }

  async getCriticalAlerts(): Promise<CertificateAlert[]> {
    const criticalTypes = [
      'SAFETY_CONSTRUCTION',
      'SAFETY_EQUIPMENT',
      'LOAD_LINE',
      'IOPP',
      'ISM',
      'ISPS',
      'MLC'
    ];

    const certificates = await this.certificateRepository
      .createQueryBuilder('cert')
      .leftJoinAndSelect('cert.vessel', 'vessel')
      .where('cert.isActive = :isActive', { isActive: true })
      .andWhere('vessel.isActive = :vesselActive', { vesselActive: true })
      .andWhere('cert.certificateType IN (:...types)', { types: criticalTypes })
      .andWhere('(cert.expiryDate < :now OR cert.expiryDate <= :thirtyDays)', {
        now: new Date(),
        thirtyDays: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      .orderBy('cert.expiryDate', 'ASC')
      .getMany();

    return certificates.map(cert => ({
      vesselId: cert.vessel.id,
      vesselName: cert.vessel.vesselName,
      imoNumber: cert.vessel.imoNumber,
      certificateId: cert.id,
      certificateType: cert.certificateType,
      certificateName: cert.certificateName,
      expiryDate: cert.expiryDate,
      daysUntilExpiry: cert.daysUntilExpiry,
      priorityLevel: 'HIGH' as const,
      isCritical: true
    }));
  }

  // Fleet Statistics and Analytics
  async getFleetStatistics(): Promise<FleetStatistics> {
    const vessels = await this.vesselRepository.find({
      where: { isActive: true },
      relations: ['certificates']
    });

    const certificates = await this.certificateRepository.find({
      where: { isActive: true },
      relations: ['vessel']
    });

    // Calculate statistics
    const totalVessels = vessels.length;
    
    // Define vessel type constants
    const vesselTypes = ['CONTAINER', 'BULK_CARRIER', 'TANKER', 'CRUISE', 'FERRY', 'CARGO', 'FISHING', 'NAVAL', 'OFFSHORE', 'OTHER'];
    const vesselStatuses = ['ACTIVE', 'MAINTENANCE', 'DOCKED', 'DECOMMISSIONED', 'EMERGENCY'];

    const vesselsByType = vesselTypes.map(type => ({
      type,
      count: vessels.filter(v => v.vesselType === type).length
    }));

    const vesselsByStatus = vesselStatuses.map(status => ({
      status,
      count: vessels.filter(v => v.status === status).length
    }));

    const averageAge = vessels.length > 0 
      ? vessels.reduce((sum, v) => sum + v.ageInYears, 0) / vessels.length 
      : 0;

    const totalDeadweight = vessels.reduce((sum, v) => sum + v.deadweight, 0);
    const totalGrossTonnage = vessels.reduce((sum, v) => sum + v.grossTonnage, 0);

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const certificatesExpired = certificates.filter(c => c.expiryDate < now).length;
    const certificatesExpiring = certificates.filter(c => 
      c.expiryDate >= now && c.expiryDate <= ninetyDaysFromNow
    ).length;
    const certificatesValid = certificates.filter(c => c.expiryDate > ninetyDaysFromNow).length;

    const criticalAlerts = certificates.filter(c => 
      c.isCritical && (c.expiryDate < now || c.expiryDate <= thirtyDaysFromNow)
    ).length;

    const maintenanceDue = vessels.filter(v => v.status === 'MAINTENANCE').length;

    return {
      totalVessels,
      vesselsByType,
      vesselsByStatus,
      averageAge: Math.round(averageAge * 10) / 10,
      totalDeadweight,
      totalGrossTonnage,
      certificatesExpiring,
      certificatesExpired,
      certificatesValid,
      criticalAlerts,
      maintenanceDue
    };
  }

  // Search and Filter
  async searchVessels(query: string): Promise<Vessel[]> {
    return await this.vesselRepository
      .createQueryBuilder('vessel')
      .leftJoinAndSelect('vessel.certificates', 'certificates')
      .where('vessel.isActive = :isActive', { isActive: true })
      .andWhere(`(
        vessel.vesselName LIKE :query OR 
        vessel.imoNumber LIKE :query OR 
        vessel.callSign LIKE :query OR 
        vessel.mmsiNumber LIKE :query OR 
        vessel.flagState LIKE :query OR 
        vessel.owner LIKE :query OR 
        vessel.operator LIKE :query
      )`, { query: `%${query}%` })
      .orderBy('vessel.vesselName', 'ASC')
      .getMany();
  }

  async getVesselsByAgeRange(minAge: number, maxAge: number): Promise<Vessel[]> {
    const currentYear = new Date().getFullYear();
    const maxBuildYear = currentYear - minAge;
    const minBuildYear = currentYear - maxAge;

    return await this.vesselRepository
      .createQueryBuilder('vessel')
      .leftJoinAndSelect('vessel.certificates', 'certificates')
      .where('vessel.isActive = :isActive', { isActive: true })
      .andWhere('YEAR(vessel.buildDate) BETWEEN :minYear AND :maxYear', {
        minYear: minBuildYear,
        maxYear: maxBuildYear
      })
      .orderBy('vessel.buildDate', 'DESC')
      .getMany();
  }

  async getVesselsByTonnageRange(minTonnage: number, maxTonnage: number): Promise<Vessel[]> {
    return await this.vesselRepository.find({
      where: {
        isActive: true,
        deadweight: Between(minTonnage, maxTonnage)
      },
      relations: ['certificates'],
      order: { deadweight: 'DESC' }
    });
  }

  // Compliance Monitoring
  async getComplianceReport(): Promise<{
    vessel: Vessel;
    totalCertificates: number;
    validCertificates: number;
    expiredCertificates: number;
    expiringSoonCertificates: number;
    complianceScore: number;
    criticalIssues: number;
  }[]> {
    const vessels = await this.vesselRepository.find({
      where: { isActive: true },
      relations: ['certificates'],
      order: { vesselName: 'ASC' }
    });

    return vessels.map(vessel => {
      const certificates = vessel.certificates.filter(c => c.isActive);
      const now = new Date();
      const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const totalCertificates = certificates.length;
      const validCertificates = certificates.filter(c => c.expiryDate > ninetyDaysFromNow).length;
      const expiredCertificates = certificates.filter(c => c.expiryDate < now).length;
      const expiringSoonCertificates = certificates.filter(c => 
        c.expiryDate >= now && c.expiryDate <= ninetyDaysFromNow
      ).length;

      const criticalIssues = certificates.filter(c => 
        c.isCritical && c.expiryDate <= ninetyDaysFromNow
      ).length;

      // Calculate compliance score (0-100)
      let complianceScore = 100;
      if (totalCertificates > 0) {
        complianceScore = Math.max(0, 100 - (
          (expiredCertificates * 40) + 
          (expiringSoonCertificates * 20) + 
          (criticalIssues * 30)
        ) / totalCertificates);
      }

      return {
        vessel,
        totalCertificates,
        validCertificates,
        expiredCertificates,
        expiringSoonCertificates,
        complianceScore: Math.round(complianceScore),
        criticalIssues
      };
    });
  }
}