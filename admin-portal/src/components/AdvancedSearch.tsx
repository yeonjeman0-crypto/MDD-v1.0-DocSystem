import React, { useState, useEffect, useCallback } from 'react';
import {
  Input,
  Select,
  Button,
  Card,
  List,
  Typography,
  Tag,
  Space,
  Pagination,
  Row,
  Col,
  Collapse,
  DatePicker,
  Spin,
  Alert,
  Empty,
  AutoComplete,
  Divider,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  BookOutlined,
  SafetyOutlined,
  FormOutlined,
  FilterOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { searchApi, SearchOptions, DocumentSearchResult } from '../services/searchApi';
import { DocumentViewer } from './DocumentViewer/DocumentViewer';
import dayjs from 'dayjs';
import './AdvancedSearch.css';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

interface SearchProps {
  onDocumentSelect?: (document: DocumentSearchResult) => void;
}

export const AdvancedSearch: React.FC<SearchProps> = ({ onDocumentSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedDocument, setSelectedDocument] = useState<DocumentSearchResult | null>(null);
  const [aggregations, setAggregations] = useState<any>(null);
  
  // Filter states
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [sortOrder, setSortOrder] = useState<string>('_score');

  const sectionOptions = [
    { value: '', label: '모든 섹션' },
    { value: 'main-manual', label: '📖 본 매뉴얼', icon: <BookOutlined /> },
    { value: 'procedures', label: '📋 절차서', icon: <SafetyOutlined /> },
    { value: 'instructions', label: '📝 지침서', icon: <FileTextOutlined /> },
    { value: 'forms', label: '📄 서식', icon: <FormOutlined /> },
  ];

  const sortOptions = [
    { value: '_score', label: '관련도순' },
    { value: 'date', label: '날짜순' },
    { value: 'title', label: '제목순' },
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        getSuggestions(query.trim());
      } else {
        setSuggestions([]);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const getSuggestions = async (query: string) => {
    try {
      const suggestions = await searchApi.getSuggestions(query, 5);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  };

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim() && !selectedSection && !selectedDocumentType) {
      return;
    }

    setLoading(true);
    setCurrent(page);

    try {
      const searchOptions: SearchOptions = {
        query: searchQuery.trim(),
        section: selectedSection || undefined,
        size: pageSize,
        from: (page - 1) * pageSize,
        sort: sortOrder,
        filters: {
          documentType: selectedDocumentType || undefined,
          dateRange: dateRange
            ? {
                from: dateRange[0].format('YYYY-MM-DD'),
                to: dateRange[1].format('YYYY-MM-DD'),
              }
            : undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        },
      };

      const response = await searchApi.searchDocuments(searchOptions);
      setSearchResults(response.data.documents);
      setTotal(response.data.total);
      setAggregations(response.data.aggregations);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (document: DocumentSearchResult) => {
    setSelectedDocument(document);
    if (onDocumentSelect) {
      onDocumentSelect(document);
    }
  };

  const handleDownload = (document: DocumentSearchResult) => {
    const encodedPath = document.file_path
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    const pdfUrl = `http://localhost:3003${encodedPath}`;
    window.open(pdfUrl, '_blank');
  };

  const clearFilters = () => {
    setSelectedSection('');
    setSelectedDocumentType('');
    setSelectedTags([]);
    setDateRange(null);
    setSortOrder('_score');
  };

  const getSectionIcon = (section: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'main-manual': <BookOutlined style={{ color: '#1890ff' }} />,
      procedures: <SafetyOutlined style={{ color: '#52c41a' }} />,
      instructions: <FileTextOutlined style={{ color: '#fa8c16' }} />,
      forms: <FormOutlined style={{ color: '#722ed1' }} />,
    };
    return iconMap[section] || <FileTextOutlined />;
  };

  const getSectionName = (section: string) => {
    const nameMap: Record<string, string> = {
      'main-manual': '본 매뉴얼',
      procedures: '절차서',
      instructions: '지침서',
      forms: '서식',
    };
    return nameMap[section] || section;
  };

  const renderHighlights = (highlights: any) => {
    if (!highlights) return null;

    return Object.entries(highlights).map(([field, values]: [string, any]) => (
      <div key={field} style={{ marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {field === 'title_ko' ? '제목' : field === 'content' ? '내용' : field}:
        </Text>
        {Array.isArray(values) &&
          values.map((value, index) => (
            <Paragraph
              key={index}
              style={{ margin: '4px 0', fontSize: 12 }}
              ellipsis={{ rows: 2 }}
            >
              <span dangerouslySetInnerHTML={{ __html: value }} />
            </Paragraph>
          ))}
      </div>
    ));
  };

  const filterPanel = (
    <Card title={<><FilterOutlined /> 고급 필터</>} size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>섹션</Text>
          <Select
            style={{ width: '100%', marginTop: 4 }}
            value={selectedSection}
            onChange={setSelectedSection}
            placeholder="섹션 선택"
          >
            {sectionOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <Text strong>정렬</Text>
          <Select
            style={{ width: '100%', marginTop: 4 }}
            value={sortOrder}
            onChange={setSortOrder}
            placeholder="정렬 방식"
          >
            {sortOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <Text strong>날짜 범위</Text>
          <RangePicker
            style={{ width: '100%', marginTop: 4 }}
            value={dateRange}
            onChange={setDateRange}
            placeholder={['시작일', '종료일']}
          />
        </div>

        <Button
          type="dashed"
          block
          onClick={clearFilters}
          style={{ marginTop: 8 }}
        >
          필터 초기화
        </Button>
      </Space>
    </Card>
  );

  const aggregationPanel = aggregations && (
    <Card title="검색 통계" size="small" style={{ marginTop: 16 }}>
      {aggregations.sections && (
        <div style={{ marginBottom: 12 }}>
          <Text strong>섹션별 분포</Text>
          <div style={{ marginTop: 4 }}>
            {aggregations.sections.buckets.map((bucket: any) => (
              <Tag
                key={bucket.key}
                style={{ margin: 2 }}
                onClick={() => setSelectedSection(bucket.key)}
              >
                {getSectionName(bucket.key)} ({bucket.doc_count})
              </Tag>
            ))}
          </div>
        </div>
      )}
      
      {aggregations.vessel_types && aggregations.vessel_types.buckets.length > 0 && (
        <div>
          <Text strong>선박 타입</Text>
          <div style={{ marginTop: 4 }}>
            {aggregations.vessel_types.buckets.map((bucket: any) => (
              <Tag key={bucket.key} style={{ margin: 2 }}>
                {bucket.key} ({bucket.doc_count})
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Card>
  );

  return (
    <div className="advanced-search">
      <Row gutter={24}>
        {/* Search Panel */}
        <Col xs={24} lg={selectedDocument ? 12 : 18}>
          <Card title={<><SearchOutlined /> 문서 검색</>}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <AutoComplete
                style={{ width: '100%' }}
                value={searchQuery}
                onChange={setSearchQuery}
                onSelect={setSearchQuery}
                options={suggestions.map((suggestion) => ({ value: suggestion }))}
                placeholder="문서 제목, 코드, 내용으로 검색..."
              >
                <Input.Search
                  size="large"
                  enterButton={
                    <Button type="primary" icon={<SearchOutlined />} loading={loading}>
                      검색
                    </Button>
                  }
                  onSearch={() => handleSearch(1)}
                />
              </AutoComplete>

              <Collapse ghost>
                <Panel header="고급 검색 옵션" key="1">
                  {filterPanel}
                </Panel>
              </Collapse>
            </Space>
          </Card>

          {/* Search Results */}
          {loading && (
            <Card style={{ marginTop: 16, textAlign: 'center' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>검색 중...</div>
            </Card>
          )}

          {!loading && searchResults.length === 0 && searchQuery && (
            <Card style={{ marginTop: 16 }}>
              <Empty
                description="검색 결과가 없습니다."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          )}

          {!loading && searchResults.length > 0 && (
            <Card
              title={
                <Space>
                  <Text>검색 결과</Text>
                  <Badge count={total} showZero style={{ backgroundColor: '#52c41a' }} />
                </Space>
              }
              style={{ marginTop: 16 }}
              extra={
                <Button icon={<ReloadOutlined />} onClick={() => handleSearch(currentPage)}>
                  새로고침
                </Button>
              }
            >
              <List
                itemLayout="vertical"
                dataSource={searchResults}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleDocumentClick(item)}
                      >
                        보기
                      </Button>,
                      <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(item)}
                      >
                        다운로드
                      </Button>,
                    ]}
                    className="search-result-item"
                    onClick={() => handleDocumentClick(item)}
                  >
                    <List.Item.Meta
                      avatar={getSectionIcon(item.section)}
                      title={
                        <Space>
                          <span className="document-code">{item.code}</span>
                          <span className="document-title">{item.title_ko}</span>
                          {item.score && (
                            <Badge
                              count={`${Math.round(item.score * 100)}%`}
                              style={{ backgroundColor: '#108ee9' }}
                            />
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Space wrap>
                            <Tag color="blue">{getSectionName(item.section)}</Tag>
                            {item.vessel_type && <Tag color="green">{item.vessel_type}</Tag>}
                            {item.procedure_code && <Tag color="orange">{item.procedure_code}</Tag>}
                            {item.pr_code && <Tag color="purple">{item.pr_code}</Tag>}
                          </Space>
                          {item.title_en && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {item.title_en}
                            </Text>
                          )}
                          {renderHighlights(item.highlights)}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />

              <Divider />

              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} / 총 ${total}개 문서`
                }
                onChange={(page, size) => {
                  setPageSize(size || pageSize);
                  handleSearch(page);
                }}
                onShowSizeChange={(current, size) => {
                  setPageSize(size);
                  handleSearch(1);
                }}
              />
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={selectedDocument ? 6 : 6}>
          {aggregationPanel}
          
          {!selectedDocument && (
            <Alert
              message="검색 도움말"
              description={
                <div>
                  <p>• 문서 제목, 코드, 내용으로 검색 가능</p>
                  <p>• 고급 필터로 정확한 검색</p>
                  <p>• 자동완성 기능 지원</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Col>

        {/* Document Viewer */}
        {selectedDocument && (
          <Col xs={24} lg={6}>
            <Card
              title="문서 상세"
              size="small"
              extra={
                <Button
                  type="text"
                  onClick={() => setSelectedDocument(null)}
                >
                  ✕
                </Button>
              }
            >
              <DocumentViewer documentData={selectedDocument} />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}