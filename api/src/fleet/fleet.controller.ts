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
  ValidationPipe,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FleetService, VesselCreateDto, VesselUpdateDto, CertificateCreateDto } from './fleet.service';
import { FleetSampleService } from './fleet-sample.service';
import { Vessel, VesselType, VesselStatus } from './entities/vessel.entity';
import { VesselCertificate, CertificateType } from './entities/vessel-certificate.entity';

@ApiTags('Fleet Management')
@Controller('api/fleet')
export class FleetController {
  constructor(
    private readonly fleetService: FleetService,
    private readonly fleetSampleService: FleetSampleService,
  ) {}

  // Vessel Management Endpoints
  @Post('vessels')
  @ApiOperation({ summary: 'Create a new vessel' })
  @ApiResponse({ status: 201, description: 'Vessel created successfully', type: Vessel })
  @ApiResponse({ status: 400, description: 'Bad request - IMO number already exists' })
  async createVessel(@Body(ValidationPipe) createVesselDto: VesselCreateDto): Promise<Vessel> {
    return await this.fleetService.createVessel(createVesselDto);
  }

  @Get('vessels')
  @ApiOperation({ summary: 'Get all vessels' })
  @ApiResponse({ status: 200, description: 'List of all vessels', type: [Vessel] })
  async getAllVessels(): Promise<Vessel[]> {
    return await this.fleetService.getAllVessels();
  }

  @Get('vessels/:id')
  @ApiOperation({ summary: 'Get vessel by ID' })
  @ApiParam({ name: 'id', description: 'Vessel ID' })
  @ApiResponse({ status: 200, description: 'Vessel details', type: Vessel })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  async getVesselById(@Param('id', ParseIntPipe) id: number): Promise<Vessel> {
    return await this.fleetService.getVesselById(id);
  }

  @Get('vessels/imo/:imoNumber')
  @ApiOperation({ summary: 'Get vessel by IMO number' })
  @ApiParam({ name: 'imoNumber', description: 'IMO Number' })
  @ApiResponse({ status: 200, description: 'Vessel details', type: Vessel })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  async getVesselByImo(@Param('imoNumber') imoNumber: string): Promise<Vessel> {
    return await this.fleetService.getVesselByImo(imoNumber);
  }

  @Put('vessels/:id')
  @ApiOperation({ summary: 'Update vessel information' })
  @ApiParam({ name: 'id', description: 'Vessel ID' })
  @ApiResponse({ status: 200, description: 'Vessel updated successfully', type: Vessel })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  async updateVessel(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateVesselDto: VesselUpdateDto,
  ): Promise<Vessel> {
    return await this.fleetService.updateVessel(id, updateVesselDto);
  }

  @Delete('vessels/:id')
  @ApiOperation({ summary: 'Delete vessel (soft delete)' })
  @ApiParam({ name: 'id', description: 'Vessel ID' })
  @ApiResponse({ status: 204, description: 'Vessel deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVessel(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.fleetService.deleteVessel(id);
  }

  @Get('vessels/filter/type/:type')
  @ApiOperation({ summary: 'Get vessels by type' })
  @ApiParam({ name: 'type', enum: VesselType, description: 'Vessel type' })
  @ApiResponse({ status: 200, description: 'List of vessels by type', type: [Vessel] })
  async getVesselsByType(@Param('type') vesselType: string): Promise<Vessel[]> {
    return await this.fleetService.getVesselsByType(vesselType);
  }

  @Get('vessels/filter/status/:status')
  @ApiOperation({ summary: 'Get vessels by status' })
  @ApiParam({ name: 'status', enum: VesselStatus, description: 'Vessel status' })
  @ApiResponse({ status: 200, description: 'List of vessels by status', type: [Vessel] })
  async getVesselsByStatus(@Param('status') status: string): Promise<Vessel[]> {
    return await this.fleetService.getVesselsByStatus(status);
  }

  @Get('vessels/filter/flag/:flagState')
  @ApiOperation({ summary: 'Get vessels by flag state' })
  @ApiParam({ name: 'flagState', description: 'Flag state' })
  @ApiResponse({ status: 200, description: 'List of vessels by flag state', type: [Vessel] })
  async getVesselsByFlag(@Param('flagState') flagState: string): Promise<Vessel[]> {
    return await this.fleetService.getVesselsByFlag(flagState);
  }

  @Get('vessels/search')
  @ApiOperation({ summary: 'Search vessels by multiple criteria' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Search results', type: [Vessel] })
  async searchVessels(@Query('q') query: string): Promise<Vessel[]> {
    return await this.fleetService.searchVessels(query);
  }

  @Get('vessels/filter/age')
  @ApiOperation({ summary: 'Get vessels by age range' })
  @ApiQuery({ name: 'minAge', description: 'Minimum age in years' })
  @ApiQuery({ name: 'maxAge', description: 'Maximum age in years' })
  @ApiResponse({ status: 200, description: 'List of vessels by age range', type: [Vessel] })
  async getVesselsByAgeRange(
    @Query('minAge', ParseIntPipe) minAge: number,
    @Query('maxAge', ParseIntPipe) maxAge: number,
  ): Promise<Vessel[]> {
    return await this.fleetService.getVesselsByAgeRange(minAge, maxAge);
  }

  @Get('vessels/filter/tonnage')
  @ApiOperation({ summary: 'Get vessels by tonnage range' })
  @ApiQuery({ name: 'minTonnage', description: 'Minimum deadweight tonnage' })
  @ApiQuery({ name: 'maxTonnage', description: 'Maximum deadweight tonnage' })
  @ApiResponse({ status: 200, description: 'List of vessels by tonnage range', type: [Vessel] })
  async getVesselsByTonnageRange(
    @Query('minTonnage', ParseIntPipe) minTonnage: number,
    @Query('maxTonnage', ParseIntPipe) maxTonnage: number,
  ): Promise<Vessel[]> {
    return await this.fleetService.getVesselsByTonnageRange(minTonnage, maxTonnage);
  }

  // Certificate Management Endpoints
  @Post('certificates')
  @ApiOperation({ summary: 'Create a new vessel certificate' })
  @ApiResponse({ status: 201, description: 'Certificate created successfully', type: VesselCertificate })
  @ApiResponse({ status: 400, description: 'Bad request - Certificate number already exists' })
  async createCertificate(@Body(ValidationPipe) createCertificateDto: CertificateCreateDto): Promise<VesselCertificate> {
    return await this.fleetService.createCertificate(createCertificateDto);
  }

  @Get('vessels/:vesselId/certificates')
  @ApiOperation({ summary: 'Get all certificates for a vessel' })
  @ApiParam({ name: 'vesselId', description: 'Vessel ID' })
  @ApiResponse({ status: 200, description: 'List of vessel certificates', type: [VesselCertificate] })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  async getCertificatesByVessel(@Param('vesselId', ParseIntPipe) vesselId: number): Promise<VesselCertificate[]> {
    return await this.fleetService.getCertificatesByVessel(vesselId);
  }

  @Put('certificates/:id')
  @ApiOperation({ summary: 'Update certificate information' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  @ApiResponse({ status: 200, description: 'Certificate updated successfully', type: VesselCertificate })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  async updateCertificate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updates: Partial<VesselCertificate>,
  ): Promise<VesselCertificate> {
    return await this.fleetService.updateCertificate(id, updates);
  }

  @Delete('certificates/:id')
  @ApiOperation({ summary: 'Delete certificate (soft delete)' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  @ApiResponse({ status: 204, description: 'Certificate deleted successfully' })
  @ApiResponse({ status: 404, description: 'Certificate not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCertificate(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.fleetService.deleteCertificate(id);
  }

  // Certificate Monitoring and Alerts
  @Get('certificates/alerts')
  @ApiOperation({ summary: 'Get certificate expiry alerts' })
  @ApiQuery({ name: 'daysAhead', description: 'Days ahead to check for expiry', required: false })
  @ApiResponse({ status: 200, description: 'List of certificate alerts' })
  async getCertificateAlerts(@Query('daysAhead') daysAhead?: string) {
    const days = daysAhead ? parseInt(daysAhead) : 90;
    return await this.fleetService.getCertificateAlerts(days);
  }

  @Get('certificates/expired')
  @ApiOperation({ summary: 'Get expired certificates' })
  @ApiResponse({ status: 200, description: 'List of expired certificates' })
  async getExpiredCertificates() {
    return await this.fleetService.getExpiredCertificates();
  }

  @Get('certificates/critical-alerts')
  @ApiOperation({ summary: 'Get critical certificate alerts' })
  @ApiResponse({ status: 200, description: 'List of critical certificate alerts' })
  async getCriticalAlerts() {
    return await this.fleetService.getCriticalAlerts();
  }

  // Fleet Analytics and Statistics
  @Get('statistics')
  @ApiOperation({ summary: 'Get fleet statistics and analytics' })
  @ApiResponse({ status: 200, description: 'Fleet statistics and analytics' })
  async getFleetStatistics() {
    return await this.fleetService.getFleetStatistics();
  }

  @Get('compliance-report')
  @ApiOperation({ summary: 'Get fleet compliance report' })
  @ApiResponse({ status: 200, description: 'Fleet compliance report' })
  async getComplianceReport() {
    return await this.fleetService.getComplianceReport();
  }

  // Certificate Document Upload
  @Post('certificates/:id/upload-document')
  @ApiOperation({ summary: 'Upload certificate document' })
  @ApiParam({ name: 'id', description: 'Certificate ID' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Document uploaded successfully' })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, callback) => {
      if (file.mimetype.match(/\/(pdf|jpeg|jpg|png)$/)) {
        callback(null, true);
      } else {
        callback(new Error('Only PDF, JPEG, JPG, and PNG files are allowed'), false);
      }
    },
  }))
  async uploadCertificateDocument(
    @Param('id', ParseIntPipe) certificateId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // TODO: Implement file storage and certificate update
    // This would involve:
    // 1. Storing the file securely
    // 2. Generating file hash for integrity
    // 3. Updating certificate record with file info
    // 4. Implementing file retrieval endpoint
    
    return {
      message: 'Certificate document uploaded successfully',
      certificateId,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  // Fleet Dashboard Data
  @Get('dashboard')
  @ApiOperation({ summary: 'Get fleet dashboard data' })
  @ApiResponse({ status: 200, description: 'Fleet dashboard data' })
  async getFleetDashboard() {
    const [statistics, criticalAlerts, certificateAlerts, expiredCertificates] = await Promise.all([
      this.fleetService.getFleetStatistics(),
      this.fleetService.getCriticalAlerts(),
      this.fleetService.getCertificateAlerts(30), // Next 30 days
      this.fleetService.getExpiredCertificates(),
    ]);

    return {
      statistics,
      alerts: {
        critical: criticalAlerts,
        expiring: certificateAlerts,
        expired: expiredCertificates,
      },
      summary: {
        totalVessels: statistics.totalVessels,
        activeVessels: statistics.vesselsByStatus.find(s => s.status === 'ACTIVE')?.count || 0,
        maintenanceVessels: statistics.vesselsByStatus.find(s => s.status === 'MAINTENANCE')?.count || 0,
        totalAlerts: criticalAlerts.length + certificateAlerts.length + expiredCertificates.length,
        criticalAlerts: criticalAlerts.length,
        complianceRate: Math.round(
          ((statistics.certificatesValid / (statistics.certificatesValid + statistics.certificatesExpiring + statistics.certificatesExpired)) * 100) || 0
        ),
      },
    };
  }

  // Fleet Performance Metrics
  @Get('performance-metrics')
  @ApiOperation({ summary: 'Get fleet performance metrics' })
  @ApiResponse({ status: 200, description: 'Fleet performance metrics' })
  async getFleetPerformanceMetrics() {
    const vessels = await this.fleetService.getAllVessels();
    
    // Calculate performance metrics
    const averageAge = vessels.reduce((sum, v) => sum + v.ageInYears, 0) / vessels.length;
    const averageSpeed = vessels.reduce((sum, v) => sum + v.serviceSpeed, 0) / vessels.length;
    const averagePower = vessels.reduce((sum, v) => sum + v.mainEnginePower, 0) / vessels.length;
    
    const utilizationRate = vessels.filter(v => v.status === 'ACTIVE').length / vessels.length * 100;
    const maintenanceRate = vessels.filter(v => v.status === 'MAINTENANCE').length / vessels.length * 100;
    
    return {
      fleetUtilization: Math.round(utilizationRate * 100) / 100,
      maintenanceRate: Math.round(maintenanceRate * 100) / 100,
      averageVesselAge: Math.round(averageAge * 10) / 10,
      averageServiceSpeed: Math.round(averageSpeed * 10) / 10,
      averageEnginePower: Math.round(averagePower),
      totalDeadweight: vessels.reduce((sum, v) => sum + v.deadweight, 0),
      totalGrossTonnage: vessels.reduce((sum, v) => sum + v.grossTonnage, 0),
      fleetCapacity: {
        container: vessels.filter(v => v.vesselType === 'CONTAINER').reduce((sum, v) => sum + v.deadweight, 0),
        bulkCarrier: vessels.filter(v => v.vesselType === 'BULK_CARRIER').reduce((sum, v) => sum + v.deadweight, 0),
        tanker: vessels.filter(v => v.vesselType === 'TANKER').reduce((sum, v) => sum + v.deadweight, 0),
        cargo: vessels.filter(v => v.vesselType === 'CARGO').reduce((sum, v) => sum + v.deadweight, 0),
      },
    };
  }

  // Sample Data Management
  @Post('sample/create-fleet')
  @ApiOperation({ summary: 'Create sample fleet data for testing' })
  @ApiResponse({ status: 201, description: 'Sample fleet created successfully' })
  async createSampleFleet() {
    await this.fleetSampleService.createSampleFleet();
    return {
      message: 'Sample fleet data created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('sample/summary')
  @ApiOperation({ summary: 'Get sample fleet summary' })
  @ApiResponse({ status: 200, description: 'Sample fleet summary' })
  async getSampleFleetSummary() {
    return await this.fleetSampleService.getFleetSummary();
  }
}