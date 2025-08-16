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

// Fleet API methods
export const fleetApiMethods = {
  // Vessel Management
  createVessel: (data: VesselCreateRequest) => 
    fleetApi.post<Vessel>('/vessels', data),

  getAllVessels: () => 
    fleetApi.get<Vessel[]>('/vessels'),

  getVesselById: (id: number) => 
    fleetApi.get<Vessel>(`/vessels/${id}`),

  getVesselByImo: (imoNumber: string) => 
    fleetApi.get<Vessel>(`/vessels/imo/${imoNumber}`),

  updateVessel: (id: number, data: VesselUpdateRequest) => 
    fleetApi.put<Vessel>(`/vessels/${id}`, data),

  deleteVessel: (id: number) => 
    fleetApi.delete(`/vessels/${id}`),

  getVesselsByType: (type: string) => 
    fleetApi.get<Vessel[]>(`/vessels/filter/type/${type}`),

  getVesselsByStatus: (status: string) => 
    fleetApi.get<Vessel[]>(`/vessels/filter/status/${status}`),

  getVesselsByFlag: (flagState: string) => 
    fleetApi.get<Vessel[]>(`/vessels/filter/flag/${flagState}`),

  searchVessels: (query: string) => 
    fleetApi.get<Vessel[]>(`/vessels/search?q=${encodeURIComponent(query)}`),

  getVesselsByAgeRange: (minAge: number, maxAge: number) => 
    fleetApi.get<Vessel[]>(`/vessels/filter/age?minAge=${minAge}&maxAge=${maxAge}`),

  getVesselsByTonnageRange: (minTonnage: number, maxTonnage: number) => 
    fleetApi.get<Vessel[]>(`/vessels/filter/tonnage?minTonnage=${minTonnage}&maxTonnage=${maxTonnage}`),

  // Certificate Management
  createCertificate: (data: CertificateCreateRequest) => 
    fleetApi.post<VesselCertificate>('/certificates', data),

  getCertificatesByVessel: (vesselId: number) => 
    fleetApi.get<VesselCertificate[]>(`/vessels/${vesselId}/certificates`),

  updateCertificate: (id: number, data: Partial<VesselCertificate>) => 
    fleetApi.put<VesselCertificate>(`/certificates/${id}`, data),

  deleteCertificate: (id: number) => 
    fleetApi.delete(`/certificates/${id}`),

  // Certificate Monitoring and Alerts
  getCertificateAlerts: (daysAhead?: number) => 
    fleetApi.get<CertificateAlert[]>(`/certificates/alerts${daysAhead ? `?daysAhead=${daysAhead}` : ''}`),

  getExpiredCertificates: () => 
    fleetApi.get<CertificateAlert[]>('/certificates/expired'),

  getCriticalAlerts: () => 
    fleetApi.get<CertificateAlert[]>('/certificates/critical-alerts'),

  // Fleet Analytics and Statistics
  getFleetStatistics: () => 
    fleetApi.get<FleetStatistics>('/statistics'),

  getComplianceReport: () => 
    fleetApi.get<ComplianceReport[]>('/compliance-report'),

  // Fleet Dashboard
  getFleetDashboard: () => 
    fleetApi.get<FleetDashboard>('/dashboard'),

  getFleetPerformanceMetrics: () => 
    fleetApi.get<FleetPerformanceMetrics>('/performance-metrics'),

  // Certificate Document Upload
  uploadCertificateDocument: (certificateId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fleetApi.post(`/certificates/${certificateId}/upload-document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Export fleetApi instance and methods
export { fleetApi };
export default fleetApiMethods;