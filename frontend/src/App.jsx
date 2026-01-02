import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import TemplateUploader from './components/TemplateUploader/TemplateUploader';
import CanvasEditor from './components/CanvasEditor/CanvasEditor';
import CertificateGenerator from './components/CertificateGenerator/CertificateGenerator';
import BulkCertificateGenerator from './components/BulkCertificateGenerator/BulkCertificateGenerator';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<TemplateUploader />} />
          <Route path="/editor/:templateId" element={<CanvasEditor />} />
          <Route path="/generate/:templateId" element={<CertificateGenerator />} />
          <Route path="/bulk-generate/:templateId" element={<BulkCertificateGenerator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
