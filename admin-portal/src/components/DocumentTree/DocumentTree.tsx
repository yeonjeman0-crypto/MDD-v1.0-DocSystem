import React, { useState, useEffect } from 'react';
import { Tree, Spin, Alert, Typography } from 'antd';
import type { TreeDataNode } from 'antd';
import { 
  FileTextOutlined, 
  FolderOutlined, 
  BookOutlined, 
  FormOutlined,
  SafetyOutlined,
  ToolOutlined 
} from '@ant-design/icons';
import { documentApi } from '../../services/documentApi';

const { Title } = Typography;

interface DocumentTreeProps {
  onDocumentSelect?: (key: string, nodeData: any) => void;
}

export const DocumentTree: React.FC<DocumentTreeProps> = ({ onDocumentSelect }) => {
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['main-manual', 'procedures']);

  useEffect(() => {
    loadDocumentStructure();
  }, []);

  const loadDocumentStructure = async () => {
    try {
      setLoading(true);
      const treeData: TreeDataNode[] = [];

      // 각 API를 개별적으로 호출하여 일부만 실패해도 다른 데이터는 표시
      try {
        const mainManual = await documentApi.getMainManual();
        treeData.push(buildMainManualNode(mainManual));
      } catch (error) {
        console.error('Failed to load main manual:', error);
        treeData.push({
          title: '📖 본 매뉴얼 (로딩 실패)',
          key: 'main-manual-error',
          icon: <BookOutlined />,
          disabled: true,
        });
      }

      try {
        const procedures = await documentApi.getProcedures();
        treeData.push(buildProceduresNode(procedures));
      } catch (error) {
        console.error('Failed to load procedures:', error);
        treeData.push({
          title: '📋 절차서 (로딩 실패)',
          key: 'procedures-error',
          icon: <FileTextOutlined />,
          disabled: true,
        });
      }

      try {
        const instructions = await documentApi.getInstructions();
        treeData.push(buildInstructionsNode(instructions));
      } catch (error) {
        console.error('Failed to load instructions:', error);
        treeData.push({
          title: '📝 지침서 (로딩 실패)',
          key: 'instructions-error',
          icon: <SafetyOutlined />,
          disabled: true,
        });
      }

      try {
        const forms = await documentApi.getForms();
        treeData.push(buildFormsNode(forms));
      } catch (error) {
        console.error('Failed to load forms:', error);
        treeData.push({
          title: '📄 서식 (로딩 실패)',
          key: 'forms-error',
          icon: <FormOutlined />,
          disabled: true,
        });
      }

      setTreeData(treeData);
    } catch (error) {
      console.error('Failed to load document structure:', error);
      setError('문서 구조를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const buildMainManualNode = (data: any): TreeDataNode => {
    const children: TreeDataNode[] = [];

    // Front 항목들
    if (data.front?.length > 0) {
      children.push({
        title: '표지 및 개요',
        key: 'mm-front',
        icon: <FolderOutlined />,
        children: data.front.map((item: any, index: number) => ({
          title: `${item.code}. ${item.title_ko}`,
          key: `mm-front-${index}`,
          icon: <FileTextOutlined />,
          isLeaf: true,
          data: { ...item, section: 'main-manual', type: 'front' },
        })),
      });
    }

    // Forms 항목들
    if (data.forms?.length > 0) {
      children.push({
        title: '기본 양식',
        key: 'mm-forms',
        icon: <FormOutlined />,
        children: data.forms.map((item: any, index: number) => ({
          title: `${item.code}. ${item.title_ko}`,
          key: `mm-forms-${index}`,
          icon: <FileTextOutlined />,
          isLeaf: true,
          data: { ...item, section: 'main-manual', type: 'forms' },
        })),
      });
    }

    // Chapters 항목들
    if (data.chapters?.length > 0) {
      children.push({
        title: '본문 장',
        key: 'mm-chapters',
        icon: <BookOutlined />,
        children: data.chapters.map((item: any, index: number) => ({
          title: `${item.code}. ${item.title_ko}`,
          key: `mm-chapters-${index}`,
          icon: <FileTextOutlined />,
          isLeaf: true,
          data: { ...item, section: 'main-manual', type: 'chapters' },
        })),
      });
    }

    // Appendices 항목들
    if (data.appendices?.length > 0) {
      children.push({
        title: '부록',
        key: 'mm-appendices',
        icon: <ToolOutlined />,
        children: data.appendices.map((item: any, index: number) => ({
          title: `${item.code}. ${item.title_ko}`,
          key: `mm-appendices-${index}`,
          icon: <FileTextOutlined />,
          isLeaf: true,
          data: { ...item, section: 'main-manual', type: 'appendices' },
        })),
      });
    }

    return {
      title: '메인 매뉴얼',
      key: 'main-manual',
      icon: <BookOutlined style={{ color: '#1890ff' }} />,
      children,
    };
  };

  const buildProceduresNode = (data: any): TreeDataNode => {
    const children: TreeDataNode[] = data.items?.map((procedure: any, procedureIndex: number) => {
      const procChildren: TreeDataNode[] = [];

      // Front 항목들
      if (procedure.front?.length > 0) {
        procChildren.push({
          title: '표지 및 개요',
          key: `${procedure.code}-front`,
          icon: <FolderOutlined />,
          children: procedure.front.map((item: any, index: number) => ({
            title: `${item.code}. ${item.title_ko}`,
            key: `${procedure.code}-front-${index}`,
            icon: <FileTextOutlined />,
            isLeaf: true,
            data: { ...item, section: 'procedures', procedureCode: procedure.code, vesselType: procedure.vessel_type },
          })),
        });
      }

      // Chapters 항목들
      if (procedure.chapters?.length > 0) {
        procChildren.push({
          title: '본문 장',
          key: `${procedure.code}-chapters`,
          icon: <BookOutlined />,
          children: procedure.chapters.map((item: any, index: number) => ({
            title: `${item.code}. ${item.title_ko}`,
            key: `${procedure.code}-chapters-${index}`,
            icon: <FileTextOutlined />,
            isLeaf: true,
            data: { ...item, section: 'procedures', procedureCode: procedure.code, vesselType: procedure.vessel_type },
          })),
        });
      }

      // Appendices 항목들
      if (procedure.appendices?.length > 0) {
        procChildren.push({
          title: '부록',
          key: `${procedure.code}-appendices`,
          icon: <ToolOutlined />,
          children: procedure.appendices.map((item: any, index: number) => ({
            title: `${item.code}. ${item.title_ko}`,
            key: `${procedure.code}-appendices-${index}`,
            icon: <FileTextOutlined />,
            isLeaf: true,
            data: { ...item, section: 'procedures', procedureCode: procedure.code, vesselType: procedure.vessel_type },
          })),
        });
      }

      const procedureTitle = procedure.vessel_type 
        ? `${procedure.code} ${procedure.title_ko} (${procedure.vessel_type})`
        : `${procedure.code} ${procedure.title_ko}`;

      return {
        title: procedureTitle,
        key: `procedure-${procedure.code}-${procedureIndex}`, // More explicit unique key
        icon: <SafetyOutlined style={{ color: '#52c41a' }} />,
        children: procChildren,
      };
    }) || [];

    return {
      title: '절차서 (PR-01 ~ PR-22)',
      key: 'procedures',
      icon: <SafetyOutlined style={{ color: '#52c41a' }} />,
      children,
    };
  };

  const buildInstructionsNode = (data: any): TreeDataNode => {
    const children: TreeDataNode[] = data.items?.map((instruction: any) => ({
      title: `${instruction.code}. ${instruction.title_ko}`,
      key: instruction.code,
      icon: <FileTextOutlined style={{ color: '#fa8c16' }} />,
      isLeaf: true,
      data: { ...instruction, section: 'instructions' },
    })) || [];

    return {
      title: '지침서 (I-01 ~ I-10)',
      key: 'instructions',
      icon: <FileTextOutlined style={{ color: '#fa8c16' }} />,
      children,
    };
  };

  const buildFormsNode = (data: any): TreeDataNode => {
    // PR 코드별로 그룹화
    const formsByPr = data.items?.reduce((groups: any, form: any) => {
      const prCode = form.pr_code;
      if (!groups[prCode]) {
        groups[prCode] = [];
      }
      groups[prCode].push(form);
      return groups;
    }, {}) || {};

    const children: TreeDataNode[] = Object.entries(formsByPr).map(([prCode, forms]: [string, any], groupIndex: number) => ({
      title: `${prCode} 서식 (${forms.length}개)`,
      key: `forms-group-${prCode}-${groupIndex}`, // More explicit unique key for groups
      icon: <FolderOutlined />,
      children: forms.map((form: any, index: number) => ({
        title: `${form.code}. ${form.title_ko}`,
        key: `form-item-${form.code}-${prCode}-${index}`, // More explicit unique key for form items
        icon: <FormOutlined />,
        isLeaf: true,
        data: { ...form, section: 'forms' },
      })),
    }));

    return {
      title: '서식 (DRKF)',
      key: 'forms',
      icon: <FormOutlined style={{ color: '#eb2f96' }} />,
      children,
    };
  };

  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    if (info.node.isLeaf && info.node.data) {
      onDocumentSelect?.(selectedKeys[0] as string, info.node.data);
    }
  };

  const handleExpand = (expandedKeys: React.Key[]) => {
    setExpandedKeys(expandedKeys);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>문서 구조를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="오류"
        description={error}
        type="error"
        showIcon
        action={
          <button onClick={loadDocumentStructure}>
            다시 시도
          </button>
        }
      />
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        📚 문서 구조
      </Title>
      <Tree
        treeData={treeData}
        expandedKeys={expandedKeys}
        onExpand={handleExpand}
        onSelect={handleSelect}
        showIcon
        style={{ background: '#fafafa', padding: '16px', borderRadius: '6px' }}
      />
    </div>
  );
};