import { Injectable, Logger } from '@nestjs/common';

export interface DocumentSearchResult {
  id: string;
  title_ko: string;
  title_en: string;
  code: string;
  section: string;
  content?: string;
  file_path: string;
  highlights?: any;
  score: number;
}

export interface SearchOptions {
  query: string;
  section?: string;
  filters?: {
    documentType?: string;
    dateRange?: {
      from: string;
      to: string;
    };
    tags?: string[];
  };
  size?: number;
  from?: number;
  sort?: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private mockDocuments: DocumentSearchResult[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock search results for testing
    this.mockDocuments = [
      {
        id: 'main-manual-MM-01',
        title_ko: '일반사항 및 정의',
        title_en: 'General Provisions and Definitions', 
        code: 'MM-01',
        section: 'main-manual',
        content: '본 매뉴얼의 일반사항과 정의에 관한 내용입니다.',
        file_path: '/pdf/00_DRK Main Manual/MM-01. 일반사항 및 정의.pdf',
        score: 1.0,
      },
      {
        id: 'procedures-PR-01-001', 
        title_ko: '안전관리 절차',
        title_en: 'Safety Management Procedure',
        code: 'PR-01-001',
        section: 'procedures',
        content: '선박 안전관리를 위한 세부 절차서입니다.',
        file_path: '/pdf/01_DRK Procedure/DRK-PR01/PR-01-001. 안전관리 절차.pdf',
        score: 0.95,
      }
    ];
    
    this.logger.log('Mock search service initialized');
  }

  async search(options: SearchOptions): Promise<{
    documents: DocumentSearchResult[];
    total: number;
    aggregations?: any;
  }> {
    const { query, section, size = 20, from = 0 } = options;
    
    let filteredDocs = this.mockDocuments;
    
    // Filter by section
    if (section) {
      filteredDocs = filteredDocs.filter(doc => doc.section === section);
    }
    
    // Filter by query
    if (query && query.trim()) {
      const searchTerm = query.trim().toLowerCase();
      filteredDocs = filteredDocs.filter(doc => 
        doc.title_ko.toLowerCase().includes(searchTerm) ||
        doc.title_en.toLowerCase().includes(searchTerm) ||
        doc.code.toLowerCase().includes(searchTerm) ||
        (doc.content && doc.content.toLowerCase().includes(searchTerm))
      );
    }
    
    // Pagination
    const paginatedDocs = filteredDocs.slice(from, from + size);
    
    return {
      documents: paginatedDocs,
      total: filteredDocs.length,
      aggregations: {
        sections: {
          buckets: [
            { key: 'main-manual', doc_count: 1 },
            { key: 'procedures', doc_count: 1 }
          ]
        }
      }
    };
  }

  async suggest(query: string, size = 5): Promise<string[]> {
    const suggestions = this.mockDocuments
      .filter(doc => doc.title_ko.toLowerCase().includes(query.toLowerCase()))
      .slice(0, size)
      .map(doc => doc.title_ko);
    
    return suggestions;
  }

  async indexDocument(document: any): Promise<void> {
    this.logger.log(`Mock indexing document: ${document.code}`);
    // Mock implementation
  }

  async bulkIndex(documents: any[]): Promise<void> {
    this.logger.log(`Mock bulk indexing ${documents.length} documents`);
    // Mock implementation
  }

  async deleteDocument(docId: string): Promise<void> {
    this.logger.log(`Mock deleting document: ${docId}`);
    // Mock implementation
  }

  async clearIndex(): Promise<void> {
    this.logger.log('Mock clearing index');
    // Mock implementation
  }
}