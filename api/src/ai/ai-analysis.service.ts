import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface DocumentAnalysisResult {
  summary: string;
  keyPoints: string[];
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'low' | 'medium' | 'high';
  readabilityScore: number;
  suggestedActions: string[];
  relatedDocuments: string[];
  riskFactors: string[];
  complianceIssues: string[];
}

export interface ComplianceCheck {
  regulation: string;
  status: 'compliant' | 'non-compliant' | 'unclear';
  issues: string[];
  recommendations: string[];
}

export interface DocumentComparison {
  similarity: number;
  differences: string[];
  similarities: string[];
  recommendedUpdates: string[];
}

@Injectable()
export class AIAnalysisService {
  private readonly supportedLanguages = ['ko', 'en', 'ja', 'zh'];
  private readonly maritimeRegulations = [
    'SOLAS', 'MARPOL', 'STCW', 'MLC', 'ISM Code', 'ISPS Code', 'COLREG'
  ];

  async analyzeDocument(documentPath: string, options?: {
    language?: string;
    analysisType?: 'summary' | 'compliance' | 'risk' | 'full';
    customPrompts?: string[];
  }): Promise<DocumentAnalysisResult> {
    try {
      const documentContent = await this.extractDocumentContent(documentPath);
      const language = options?.language || 'ko';
      const analysisType = options?.analysisType || 'full';

      // 해운업 특화 키워드 검출
      const maritimeKeywords = this.detectMaritimeKeywords(documentContent);
      
      // 문서 복잡도 분석
      const complexity = this.calculateComplexity(documentContent);
      
      // 가독성 점수 계산
      const readabilityScore = this.calculateReadability(documentContent, language);

      // AI 분석 실행 (실제 구현에서는 외부 AI API 호출)
      const analysis = await this.performAIAnalysis(documentContent, {
        language,
        analysisType,
        maritimeKeywords,
        customPrompts: options?.customPrompts
      });

      return {
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        topics: [...maritimeKeywords, ...analysis.topics],
        sentiment: analysis.sentiment,
        complexity,
        readabilityScore,
        suggestedActions: this.generateMaritimeActions(analysis, maritimeKeywords),
        relatedDocuments: await this.findRelatedDocuments(maritimeKeywords),
        riskFactors: this.identifyRiskFactors(documentContent, maritimeKeywords),
        complianceIssues: await this.checkCompliance(documentContent)
      };
    } catch (error) {
      throw new HttpException(
        `문서 분석 실패: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async checkMaritimeCompliance(documentContent: string): Promise<ComplianceCheck[]> {
    const complianceResults: ComplianceCheck[] = [];

    for (const regulation of this.maritimeRegulations) {
      const check = await this.checkSpecificRegulation(documentContent, regulation);
      complianceResults.push(check);
    }

    return complianceResults.filter(result => result.status !== 'unclear');
  }

  async compareDocuments(document1Path: string, document2Path: string): Promise<DocumentComparison> {
    const content1 = await this.extractDocumentContent(document1Path);
    const content2 = await this.extractDocumentContent(document2Path);

    // 문서 유사도 계산
    const similarity = this.calculateSimilarity(content1, content2);
    
    // 차이점 및 유사점 분석
    const differences = this.findDifferences(content1, content2);
    const similarities = this.findSimilarities(content1, content2);
    
    // 업데이트 권장사항
    const recommendedUpdates = this.generateUpdateRecommendations(differences);

    return {
      similarity,
      differences,
      similarities,
      recommendedUpdates
    };
  }

  async extractKeyInformation(documentContent: string, category: 'safety' | 'procedures' | 'regulations' | 'maintenance'): Promise<{
    information: string[];
    actionItems: string[];
    deadlines: Date[];
    responsibleParties: string[];
  }> {
    const categoryKeywords = {
      safety: ['안전', '위험', '사고', '예방', 'safety', 'hazard', 'risk'],
      procedures: ['절차', '순서', '방법', 'procedure', 'process', 'step'],
      regulations: ['규정', '법규', '준수', 'regulation', 'compliance', 'requirement'],
      maintenance: ['정비', '점검', '수리', 'maintenance', 'inspection', 'repair']
    };

    const keywords = categoryKeywords[category];
    const relevantSections = this.extractRelevantSections(documentContent, keywords);
    
    return {
      information: this.extractInformation(relevantSections),
      actionItems: this.extractActionItems(relevantSections),
      deadlines: this.extractDeadlines(relevantSections),
      responsibleParties: this.extractResponsibleParties(relevantSections)
    };
  }

  async generateDocumentSummary(documentContent: string, maxLength: number = 500): Promise<{
    summary: string;
    executiveSummary: string;
    technicalSummary: string;
  }> {
    // 실제 구현에서는 고급 NLP 모델 사용
    const sentences = this.splitIntoSentences(documentContent);
    const importantSentences = this.rankSentencesByImportance(sentences);
    
    const summary = this.generateSummaryFromSentences(
      importantSentences.slice(0, Math.ceil(maxLength / 50))
    );
    
    const executiveSummary = this.generateExecutiveSummary(importantSentences);
    const technicalSummary = this.generateTechnicalSummary(importantSentences);

    return {
      summary,
      executiveSummary,
      technicalSummary
    };
  }

  private async extractDocumentContent(documentPath: string): Promise<string> {
    if (!fs.existsSync(documentPath)) {
      throw new Error('문서 파일을 찾을 수 없습니다.');
    }

    const ext = path.extname(documentPath).toLowerCase();
    
    switch (ext) {
      case '.txt':
        return fs.readFileSync(documentPath, 'utf8');
      case '.pdf':
        // PDF 텍스트 추출 (실제 구현에서는 pdf-parse 등 사용)
        return await this.extractPDFText(documentPath);
      case '.docx':
        // DOCX 텍스트 추출 (실제 구현에서는 mammoth 등 사용)
        return await this.extractDOCXText(documentPath);
      default:
        throw new Error('지원하지 않는 파일 형식입니다.');
    }
  }

  private async extractPDFText(pdfPath: string): Promise<string> {
    // 실제 구현에서는 pdf-parse, pdf2pic 등을 사용
    // 현재는 샘플 텍스트 반환
    return `PDF 문서 내용 (샘플): 해운 안전 절차서입니다. 
    이 문서는 선박 운항 시 준수해야 할 안전 규정들을 다루고 있습니다.
    SOLAS 협약에 따른 필수 안전 점검 사항들이 포함되어 있습니다.`;
  }

  private async extractDOCXText(docxPath: string): Promise<string> {
    // 실제 구현에서는 mammoth 등을 사용
    return `DOCX 문서 내용 (샘플): 선박 정비 매뉴얼입니다.
    정기적인 엔진 점검 및 안전 장비 검사 절차가 설명되어 있습니다.`;
  }

  private detectMaritimeKeywords(content: string): string[] {
    const maritimeKeywords = [
      '선박', '항해', '안전', '승무원', '화물', '항만', '해운', '선장', '기관장',
      'ship', 'vessel', 'navigation', 'cargo', 'port', 'maritime', 'seafarer',
      'SOLAS', 'MARPOL', 'STCW', 'MLC', 'ISM', 'ISPS', 'IMO'
    ];

    return maritimeKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private calculateComplexity(content: string): 'low' | 'medium' | 'high' {
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    if (avgWordsPerSentence < 15) return 'low';
    if (avgWordsPerSentence < 25) return 'medium';
    return 'high';
  }

  private calculateReadability(content: string, language: string): number {
    // 간단한 가독성 점수 계산 (실제로는 언어별 공식 사용)
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // 0-100 점수로 정규화
    const score = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 10) * 2));
    return Math.round(score);
  }

  private async performAIAnalysis(content: string, options: any): Promise<any> {
    // 실제 구현에서는 외부 AI API (GPT, Claude 등) 호출
    // 현재는 해운업 특화 샘플 분석 결과 반환
    return {
      summary: `이 문서는 해운업 ${options.maritimeKeywords.join(', ')} 관련 내용을 다루고 있습니다. 주요 안전 절차와 규정 준수 사항들이 포함되어 있습니다.`,
      keyPoints: [
        '선박 안전 점검 절차',
        'SOLAS 협약 준수 사항',
        '승무원 안전 교육 요구사항',
        '비상 상황 대응 절차'
      ],
      topics: ['해운안전', '규정준수', '절차서', '매뉴얼'],
      sentiment: 'neutral' as const
    };
  }

  private generateMaritimeActions(analysis: any, keywords: string[]): string[] {
    const actions = [];
    
    if (keywords.includes('안전') || keywords.includes('safety')) {
      actions.push('안전 점검 일정 수립', '승무원 안전 교육 실시');
    }
    
    if (keywords.includes('SOLAS')) {
      actions.push('SOLAS 요구사항 검토', '안전 설비 점검');
    }
    
    if (keywords.includes('정비') || keywords.includes('maintenance')) {
      actions.push('정비 계획 수립', '예비 부품 재고 확인');
    }
    
    return actions;
  }

  private async findRelatedDocuments(keywords: string[]): Promise<string[]> {
    // 실제 구현에서는 문서 데이터베이스 검색
    return [
      '해운 안전 매뉴얼 v2.1',
      'SOLAS 준수 체크리스트',
      '선박 정비 가이드라인'
    ];
  }

  private identifyRiskFactors(content: string, keywords: string[]): string[] {
    const riskFactors = [];
    
    if (content.includes('위험') || content.includes('risk')) {
      riskFactors.push('위험 요소 식별됨');
    }
    
    if (keywords.includes('화물') && content.includes('위험물')) {
      riskFactors.push('위험물 화물 취급 주의');
    }
    
    return riskFactors;
  }

  private async checkCompliance(content: string): Promise<string[]> {
    const issues = [];
    
    // SOLAS 준수 여부 확인
    if (!content.includes('SOLAS') && content.includes('안전')) {
      issues.push('SOLAS 준수 확인 필요');
    }
    
    // 환경 규정 확인
    if (content.includes('배출') && !content.includes('MARPOL')) {
      issues.push('MARPOL 환경 규정 검토 필요');
    }
    
    return issues;
  }

  private async checkSpecificRegulation(content: string, regulation: string): Promise<ComplianceCheck> {
    // 실제 구현에서는 규정별 상세 검사
    const hasRegulationMention = content.toLowerCase().includes(regulation.toLowerCase());
    
    return {
      regulation,
      status: hasRegulationMention ? 'compliant' : 'unclear',
      issues: hasRegulationMention ? [] : [`${regulation} 준수 여부 확인 필요`],
      recommendations: hasRegulationMention ? [] : [`${regulation} 요구사항 검토 권장`]
    };
  }

  private calculateSimilarity(content1: string, content2: string): number {
    // 간단한 유사도 계산 (실제로는 더 정교한 알고리즘 사용)
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return Math.round((intersection.size / union.size) * 100);
  }

  private findDifferences(content1: string, content2: string): string[] {
    // 실제 구현에서는 더 정교한 차이점 분석
    return ['문서 구조의 차이', '내용 업데이트 사항', '새로운 절차 추가'];
  }

  private findSimilarities(content1: string, content2: string): string[] {
    return ['기본 안전 절차', '규정 준수 사항', '문서 형식'];
  }

  private generateUpdateRecommendations(differences: string[]): string[] {
    return differences.map(diff => `${diff}에 대한 업데이트 검토 권장`);
  }

  private extractRelevantSections(content: string, keywords: string[]): string[] {
    const sentences = content.split(/[.!?]+/);
    return sentences.filter(sentence => 
      keywords.some(keyword => sentence.toLowerCase().includes(keyword.toLowerCase()))
    );
  }

  private extractInformation(sections: string[]): string[] {
    return sections.map(section => section.trim()).filter(section => section.length > 10);
  }

  private extractActionItems(sections: string[]): string[] {
    const actionWords = ['해야', '필요', '확인', '점검', '실시', '수행'];
    return sections.filter(section => 
      actionWords.some(word => section.includes(word))
    );
  }

  private extractDeadlines(sections: string[]): Date[] {
    // 실제 구현에서는 날짜 패턴 인식
    return [];
  }

  private extractResponsibleParties(sections: string[]): string[] {
    const roles = ['선장', '기관장', '승무원', '안전관리자', '정비사'];
    const found = [];
    
    sections.forEach(section => {
      roles.forEach(role => {
        if (section.includes(role) && !found.includes(role)) {
          found.push(role);
        }
      });
    });
    
    return found;
  }

  private splitIntoSentences(content: string): string[] {
    return content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  }

  private rankSentencesByImportance(sentences: string[]): string[] {
    // 실제 구현에서는 TF-IDF, 키워드 밀도 등 사용
    const importantWords = ['안전', '규정', '절차', '중요', '필수', 'safety', 'regulation'];
    
    return sentences.sort((a, b) => {
      const scoreA = importantWords.reduce((score, word) => 
        score + (a.toLowerCase().includes(word.toLowerCase()) ? 1 : 0), 0);
      const scoreB = importantWords.reduce((score, word) => 
        score + (b.toLowerCase().includes(word.toLowerCase()) ? 1 : 0), 0);
      return scoreB - scoreA;
    });
  }

  private generateSummaryFromSentences(sentences: string[]): string {
    return sentences.slice(0, 5).join('. ') + '.';
  }

  private generateExecutiveSummary(sentences: string[]): string {
    return '임원진을 위한 요약: ' + sentences.slice(0, 3).join('. ') + '.';
  }

  private generateTechnicalSummary(sentences: string[]): string {
    return '기술적 요약: ' + sentences.slice(0, 4).join('. ') + '.';
  }
}