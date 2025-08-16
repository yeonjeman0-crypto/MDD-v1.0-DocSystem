import React from 'react';
import { Button, Dropdown } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const items: MenuProps['items'] = [
    {
      key: 'ko',
      label: '한국어',
      onClick: () => changeLanguage('ko'),
    },
    {
      key: 'en',
      label: 'English',
      onClick: () => changeLanguage('en'),
    },
  ];

  const getCurrentLanguageLabel = () => {
    return i18n.language === 'ko' ? '한국어' : 'English';
  };

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button icon={<GlobalOutlined />} type="text">
        {getCurrentLanguageLabel()}
      </Button>
    </Dropdown>
  );
};