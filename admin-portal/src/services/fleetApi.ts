import axios from 'axios';

const API_BASE_URL = 'http://localhost:3003';

// Fleet API client
const fleetApi = axios.create({
  baseURL: `${API_BASE_URL}/api/fleet`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
fleetApi.interceptors.request.use(
  (config) => {
    console.log(`Fleet API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Fleet API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
fleetApi.interceptors.response.use(
  (response) => {
    console.log(`Fleet API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Fleet API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Vessel interfaces
export interface VesselCreateRequest {
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
  buildDate: string;
  classificationSociety: string;
  owner: string;
  operator: string;
  manager: string;
  mainEngineType: string;
  mainEnginePower: number;
  maxSpeed: number;
  serviceSpeed: number;
}

export interface VesselUpdateRequest {
  vesselName?: string;
  status?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  currentPort?: string;
  destination?: string;
  estimatedArrival?: string;
  notes?: string;
}

export interface Vessel {
  id: number;
  imoNumber: string;
  vesselName: string;
  callSign: string;
  mmsiNumber: string;
  vesselType: string;
  status: string;
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
  buildDate: string;
  hullNumber: string;
  classificationSociety: string;
  classNotation: string;
  owner: string;
  operator: string;
  manager: string;
  charterer?: string;
  mainEngineType: string;
  mainEnginePower: number;
  propulsionType: string;
  maxSpeed: number;
  serviceSpeed: number;
  currentLatitude?: number;
  currentLongitude?: number;
  currentPort?: string;
  destination?: string;
  estimatedArrival?: string;
  piInsurer: string;
  piExpiryDate: string;
  hullInsurer: string;
  hullInsuranceExpiry: string;
  ismCode: string;
  ismExpiryDate: string;
  ispsCode: string;
  ispsExpiryDate: string;
  mlcCertificate: string;
  mlcExpiryDate: string;
  eediCompliant: boolean;
  seemCompliant: boolean;
  tier?: string;
  ballastWaterTreatment: boolean;
  masterName?: string;
  shipEmail?: string;
  satellitePhone?: string;
  inmarsat?: string;
  fuelConsumptionRate: number;
  dailyHfoConsumption: number;
  dailyMdoConsumption: number;
  voyageNumber?: string;
  cargoDescription?: string;
  cargoQuantity?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  ageInYears: number;
  isCertificateExpiringSoon: boolean;
  certificates?: VesselCertificate[];
}

export interface VesselCertificate {
  id: number;
  certificateType: string;
  certificateName: string;
  certificateNumber: string;
  status: string;
  issuingAuthorityType: string;
  issuingAuthority: string;
  issuingCountry: string;
  issuingOfficer?: string;
  issueDate: string;
  expiryDate: string;
  endorsementDate?: string;
  surveyDate?: string;
  nextSurveyDate?: string;
  surveyType?: string;
  surveyorName?: string;
  surveyLocation?: string;
  conditions?: string;
  limitations?: string;
  remarks?: string;
  documentPath?: string;
  documentHash?: string;
  documentSize?: number;
  documentFormat?: string;
  isCompliant: boolean;
  complianceNotes?: string;
  lastAuditDate?: string;
  auditor?: string;
  renewalInProcess: boolean;
  renewalApplicationDate?: string;
  renewalAuthority?: string;
  renewalStatus?: string;
  issuanceCost?: number;
  currency: string;
  renewalCost?: number;
  alertDaysBefore: number;
  emailAlertEnabled: boolean;
  alertRecipients?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  vesselId: number;
  daysUntilExpiry: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  priorityLevel: string;
  certificateAge: number;
  isCritical: boolean;
}

export interface CertificateCreateRequest {
  vesselId: number;
  certificateType: string;
  certificateName: string;
  certificateNumber: string;
  issuingAuthority: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate: string;
  surveyDate?: string;
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
  expiryDate: string;
  daysUntilExpiry: number;
  priorityLevel: string;
  isCritical: boolean;
}

export interface FleetDashboard {
  statistics: FleetStatistics;
  alerts: {
    critical: CertificateAlert[];
    expiring: CertificateAlert[];
    expired: CertificateAlert[];
  };
  summary: {
    totalVessels: number;
    activeVessels: number;
    maintenanceVessels: number;
    totalAlerts: number;
    criticalAlerts: number;
    complianceRate: number;
  };
}

export interface FleetPerformanceMetrics {
  fleetUtilization: number;
  maintenanceRate: number;
  averageVesselAge: number;
  averageServiceSpeed: number;
  averageEnginePower: number;
  totalDeadweight: number;
  totalGrossTonnage: number;
  fleetCapacity: {
    container: number;
    bulkCarrier: number;
    tanker: number;
    cargo: number;
  };
}

export interface ComplianceReport {
  vessel: Vessel;
  totalCertificates: number;
  validCertificates: number;
  expiredCertificates: number;
  expiringSoonCertificates: number;
  complianceScore: number;
  criticalIssues: number;
}

// Mock data for demonstration
const mockVessels: Vessel[] = [
  {
    id: 1,
    imoNumber: '9123456',
    vesselName: 'DORIKO STAR',
    callSign: 'HLKB',
    mmsiNumber: '440123456',
    vesselType: 'CONTAINER',
    status: 'ACTIVE',
    flagState: 'Korea',
    portOfRegistry: 'Busan',
    officialNumber: 'KR001',
    grossTonnage: 75000,
    netTonnage: 45000,
    deadweight: 85000,
    lengthOverall: 300,
    beam: 48,
    draft: 14.5,
    shipyard: 'Hyundai Heavy Industries',
    buildCountry: 'Korea',
    buildDate: '2018-06-15',
    hullNumber: 'H2025',
    classificationSociety: 'KR',
    classNotation: 'KRS',
    owner: 'DORIKO Shipping',
    operator: 'DORIKO Maritime',
    manager: 'DORIKO Management',
    mainEngineType: 'MAN B&W',
    mainEnginePower: 25000,
    propulsionType: 'Single Screw',
    maxSpeed: 22.5,
    serviceSpeed: 20.0,
    currentPort: 'Busan',
    destination: 'Shanghai',
    piInsurer: 'Korea P&I',
    piExpiryDate: '2025-02-20',
    hullInsurer: 'Samsung Fire',
    hullInsuranceExpiry: '2025-03-15',
    ismCode: 'ISM001',
    ismExpiryDate: '2025-06-30',
    ispsCode: 'ISPS001',
    ispsExpiryDate: '2025-07-15',
    mlcCertificate: 'MLC001',
    mlcExpiryDate: '2025-05-20',
    eediCompliant: true,
    seemCompliant: true,
    ballastWaterTreatment: true,
    fuelConsumptionRate: 45.5,
    dailyHfoConsumption: 42.0,
    dailyMdoConsumption: 3.5,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-16T00:00:00Z',
    ageInYears: 7,
    isCertificateExpiringSoon: true
  },
  {
    id: 2,
    imoNumber: '9234567',
    vesselName: 'DORIKO OCEAN',
    callSign: 'HLKC',
    mmsiNumber: '440234567',
    vesselType: 'BULK_CARRIER',
    status: 'MAINTENANCE',
    flagState: 'Korea',
    portOfRegistry: 'Busan',
    officialNumber: 'KR002',
    grossTonnage: 65000,
    netTonnage: 39000,
    deadweight: 120000,
    lengthOverall: 280,
    beam: 45,
    draft: 16.0,
    shipyard: 'Daewoo Shipbuilding',
    buildCountry: 'Korea',
    buildDate: '2015-03-20',
    hullNumber: 'D3022',
    classificationSociety: 'KR',
    classNotation: 'KRS',
    owner: 'DORIKO Shipping',
    operator: 'DORIKO Maritime',
    manager: 'DORIKO Management',
    mainEngineType: 'Wartsila',
    mainEnginePower: 18000,
    propulsionType: 'Single Screw',
    maxSpeed: 16.5,
    serviceSpeed: 14.0,
    currentPort: 'Ulsan',
    piInsurer: 'Korea P&I',
    piExpiryDate: '2025-04-10',
    hullInsurer: 'Samsung Fire',
    hullInsuranceExpiry: '2025-05-25',
    ismCode: 'ISM002',
    ismExpiryDate: '2025-08-30',
    ispsCode: 'ISPS002',
    ispsExpiryDate: '2025-09-15',
    mlcCertificate: 'MLC002',
    mlcExpiryDate: '2025-07-20',
    eediCompliant: true,
    seemCompliant: true,
    ballastWaterTreatment: true,
    fuelConsumptionRate: 32.0,
    dailyHfoConsumption: 30.0,
    dailyMdoConsumption: 2.0,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-08-16T00:00:00Z',
    ageInYears: 10,
    isCertificateExpiringSoon: false
  }
];

const mockStatistics: FleetStatistics = {
  totalVessels: 2,
  vesselsByType: [
    { type: 'CONTAINER', count: 1 },
    { type: 'BULK_CARRIER', count: 1 }
  ],
  vesselsByStatus: [
    { status: 'ACTIVE', count: 1 },
    { status: 'MAINTENANCE', count: 1 }
  ],
  averageAge: 8.5,
  totalDeadweight: 205000,
  totalGrossTonnage: 140000,
  certificatesExpiring: 3,
  certificatesExpired: 0,
  certificatesValid: 10,
  criticalAlerts: 1,
  maintenanceDue: 1
};

const mockAlerts: CertificateAlert[] = [
  {
    vesselId: 1,
    vesselName: 'DORIKO STAR',
    imoNumber: '9123456',
    certificateId: 1,
    certificateType: 'P&I',
    certificateName: 'Protection & Indemnity Certificate',
    expiryDate: '2025-02-20',
    daysUntilExpiry: 157,
    priorityLevel: 'HIGH',
    isCritical: true
  },
  {
    vesselId: 1,
    vesselName: 'DORIKO STAR',
    imoNumber: '9123456',
    certificateId: 2,
    certificateType: 'HULL',
    certificateName: 'Hull Insurance Certificate',
    expiryDate: '2025-03-15',
    daysUntilExpiry: 180,
    priorityLevel: 'MEDIUM',
    isCritical: false
  }
];

// Fleet API methods with mock data
export const fleetApiMethods = {
  // Vessel Management
  createVessel: (data: VesselCreateRequest) => 
    Promise.resolve({ data: { ...data, id: Date.now() } as any }),

  getAllVessels: () => 
    Promise.resolve({ data: mockVessels }),

  getVesselById: (id: number) => 
    Promise.resolve({ data: mockVessels.find(v => v.id === id) }),

  getVesselByImo: (imoNumber: string) => 
    Promise.resolve({ data: mockVessels.find(v => v.imoNumber === imoNumber) }),

  updateVessel: (id: number, data: VesselUpdateRequest) => 
    Promise.resolve({ data: { ...mockVessels.find(v => v.id === id), ...data } }),

  deleteVessel: (id: number) => 
    Promise.resolve({ data: { success: true } }),

  getVesselsByType: (type: string) => 
    Promise.resolve({ data: mockVessels.filter(v => v.vesselType === type) }),

  getVesselsByStatus: (status: string) => 
    Promise.resolve({ data: mockVessels.filter(v => v.status === status) }),

  getVesselsByFlag: (flagState: string) => 
    Promise.resolve({ data: mockVessels.filter(v => v.flagState === flagState) }),

  searchVessels: (query: string) => 
    Promise.resolve({ data: mockVessels.filter(v => 
      v.vesselName.toLowerCase().includes(query.toLowerCase()) ||
      v.imoNumber.includes(query)
    ) }),

  getVesselsByAgeRange: (minAge: number, maxAge: number) => 
    Promise.resolve({ data: mockVessels.filter(v => v.ageInYears >= minAge && v.ageInYears <= maxAge) }),

  getVesselsByTonnageRange: (minTonnage: number, maxTonnage: number) => 
    Promise.resolve({ data: mockVessels.filter(v => v.deadweight >= minTonnage && v.deadweight <= maxTonnage) }),

  // Certificate Management
  createCertificate: (data: CertificateCreateRequest) => 
    Promise.resolve({ data: { ...data, id: Date.now() } as any }),

  getCertificatesByVessel: (vesselId: number) => 
    Promise.resolve({ data: [] }),

  updateCertificate: (id: number, data: Partial<VesselCertificate>) => 
    Promise.resolve({ data: { id, ...data } }),

  deleteCertificate: (id: number) => 
    Promise.resolve({ data: { success: true } }),

  // Certificate Monitoring and Alerts
  getCertificateAlerts: (daysAhead?: number) => 
    Promise.resolve({ data: mockAlerts }),

  getExpiredCertificates: () => 
    Promise.resolve({ data: [] }),

  getCriticalAlerts: () => 
    Promise.resolve({ data: mockAlerts.filter(a => a.isCritical) }),

  // Fleet Analytics and Statistics
  getFleetStatistics: () => 
    Promise.resolve({ data: mockStatistics }),

  getComplianceReport: () => 
    Promise.resolve({ data: [] }),

  // Fleet Dashboard
  getFleetDashboard: () => 
    Promise.resolve({ data: { statistics: mockStatistics, alerts: { critical: mockAlerts.filter(a => a.isCritical), expiring: mockAlerts, expired: [] }, summary: { totalVessels: 2, activeVessels: 1, maintenanceVessels: 1, totalAlerts: 2, criticalAlerts: 1, complianceRate: 85 } } }),

  getFleetPerformanceMetrics: () => 
    Promise.resolve({ data: {} }),

  // Certificate Document Upload
  uploadCertificateDocument: (certificateId: number, file: File) => 
    Promise.resolve({ data: { success: true, url: '/certificates/docs/' + file.name } }),
};

// Export fleetApi instance and methods
export { fleetApi };
export default fleetApiMethods;