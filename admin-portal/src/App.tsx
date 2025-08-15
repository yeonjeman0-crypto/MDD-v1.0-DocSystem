import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { DocumentsPage } from './pages/DocumentsPage';
import './App.css';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={koKR}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<DocumentsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;