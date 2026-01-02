import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { certificateService } from '../../services/certificateService';
import Button from '../common/Button';
import Input from '../common/Input';
import ProgressBar from '../common/ProgressBar';
import './BulkCertificateGenerator.css';

const BulkCertificateGenerator = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [csvFile, setCsvFile] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [fromName, setFromName] = useState('CertiGen');
  const [emailUser, setEmailUser] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailTemplate, setEmailTemplate] = useState(null);
  const [emailTemplateContent, setEmailTemplateContent] = useState('');
  const [emailTemplateName, setEmailTemplateName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [emailDragActive, setEmailDragActive] = useState(false);
  
  // Progress tracking state
  const [progress, setProgress] = useState({
    total: 0,
    current: 0,
    successful: 0,
    failed: 0,
    status: 'idle',
    currentRecipient: null,
    estimatedTimeRemaining: 0,
    elapsedTime: 0,
    errorMessage: '',
    recentLogs: []
  });
  
  const eventSourceRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setCsvFile(file);
    setCsvFileName(file.name);
    setError('');
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = 'name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com\nMike Johnson,mike@example.com';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_recipients.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleEmailTemplateDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setEmailDragActive(true);
    } else if (e.type === 'dragleave') {
      setEmailDragActive(false);
    }
  };

  const handleEmailTemplateDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEmailDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleEmailTemplateFile(e.dataTransfer.files[0]);
    }
  };

  const handleEmailTemplateChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleEmailTemplateFile(e.target.files[0]);
    }
  };

  const handleEmailTemplateFile = (file) => {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setError('Please select an HTML file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setEmailTemplateContent(content);
      setEmailTemplate(file);
      setEmailTemplateName(file.name);
      setError('');
    };
    reader.readAsText(file);
  };

  const removeEmailTemplate = () => {
    setEmailTemplate(null);
    setEmailTemplateContent('');
    setEmailTemplateName('');
  };

  const addLog = (type, message) => {
    setProgress(prev => ({
      ...prev,
      recentLogs: [
        { type, message, timestamp: new Date().toISOString() },
        ...prev.recentLogs.slice(0, 9) // Keep last 10 logs
      ]
    }));
  };

  const handleGenerate = async () => {
    if (!csvFile) {
      setError('Please upload a CSV file');
      return;
    }

    if (!emailTemplate) {
      setError('Please upload an email template');
      return;
    }

    if (!emailUser || !emailPassword) {
      setError('Please provide email credentials');
      return;
    }

    setGenerating(true);
    setError('');
    setResults(null);
    
    // Reset progress
    setProgress({
      total: 0,
      current: 0,
      successful: 0,
      failed: 0,
      status: 'processing',
      currentRecipient: null,
      estimatedTimeRemaining: 0,
      elapsedTime: 0,
      errorMessage: '',
      recentLogs: []
    });

    try {
      // Create form data
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      formData.append('templateId', templateId);
      formData.append('fromName', fromName);
      formData.append('emailUser', emailUser);
      formData.append('emailPassword', emailPassword);
      formData.append('emailTemplate', emailTemplate);

      // Get API base URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Create EventSource connection
      const url = `${apiUrl}/api/certificates/bulk-generate-stream`;
      
      // Use fetch to send FormData and get response as stream
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to start generation process');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Read stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              switch (data.type) {
                case 'connected':
                  addLog('info', 'Connected to server');
                  break;

                case 'info':
                  addLog('info', data.message);
                  if (data.total) {
                    setProgress(prev => ({ ...prev, total: data.total }));
                  }
                  break;

                case 'generating':
                  addLog('info', `Generating certificate for ${data.recipient}`);
                  break;

                case 'generation_error':
                  addLog('failed', data.message);
                  break;

                case 'progress':
                  setProgress(prev => ({
                    ...prev,
                    current: data.current,
                    total: data.total,
                    successful: data.successful,
                    failed: data.failed,
                    currentRecipient: data.recipient,
                    estimatedTimeRemaining: data.estimatedTimeRemaining,
                    elapsedTime: data.elapsedTime
                  }));

                  if (data.status === 'sending') {
                    addLog('sending', `Sending to ${data.recipient?.name || 'recipient'}`);
                  } else if (data.status === 'success') {
                    addLog('success', `Sent to ${data.recipient?.name || 'recipient'}`);
                  } else if (data.status === 'failed') {
                    addLog('failed', `Failed: ${data.recipient?.name || 'recipient'} - ${data.error || 'Unknown error'}`);
                  }
                  break;

                case 'complete':
                  setProgress(prev => ({
                    ...prev,
                    status: 'complete',
                    currentRecipient: null
                  }));
                  setResults(data.data);
                  addLog('success', 'All certificates processed!');
                  
                  if (data.data.failedEmails === 0) {
                    setTimeout(() => {
                      alert(`Success! ${data.data.successfulEmails} certificates sent successfully!`);
                    }, 500);
                  } else {
                    setTimeout(() => {
                      alert(`Processed ${data.data.totalRecipients} certificates.\nSent: ${data.data.successfulEmails}\nFailed: ${data.data.failedEmails}`);
                    }, 500);
                  }
                  break;

                case 'error':
                  setProgress(prev => ({
                    ...prev,
                    status: 'error',
                    errorMessage: data.message
                  }));
                  setError(data.message);
                  addLog('failed', `Error: ${data.message}`);
                  break;
              }
            } catch (e) {
              console.error('Failed to parse SSE message:', e);
            }
          }
        }
      }

    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate bulk certificates');
      setProgress(prev => ({
        ...prev,
        status: 'error',
        errorMessage: err.message
      }));
      addLog('failed', `Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bulk-certificate-generator">
      <div className="bulk-header">
        <h1>Bulk Certificate Generation</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <div className="bulk-container">
        <div className="bulk-card card">
          <h3 className="card-title">Email Configuration</h3>
          
          <div className="config-section">
            <div className="email-info-box">
              <h4>What is an App Password?</h4>
              <p>An App Password is a 16-character code that gives an app or device permission to access your Gmail account. It's more secure than using your regular password.</p>
              
              <div className="info-steps">
                <strong>How to generate:</strong>
                <ol>
                  <li>Go to your Google Account settings</li>
                  <li>Select Security → 2-Step Verification → App passwords</li>
                  <li>Generate a new app password for "Mail"</li>
                  <li>Copy the 16-character code (e.g., "abcd efgh ijkl mnop")</li>
                </ol>
              </div>

              <div className="security-warning">
                <svg style={{ width: '18px', height: '18px', marginRight: '8px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span><strong>Security Note:</strong> Your credentials are transmitted securely and never stored on our servers. For added security, we recommend deleting the app password from your Google Account after bulk generation is complete.</span>
              </div>
            </div>

            <div className="email-credentials-row">
              <Input
                label="Email Address"
                type="email"
                value={emailUser}
                onChange={(e) => setEmailUser(e.target.value)}
                placeholder="your-email@gmail.com"
                required
              />

              <Input
                label="App Password"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="abcd efgh ijkl mnop"
                required
              />
            </div>
          </div>
        </div>

        <div className="bulk-card card">
          <h3 className="card-title">Email Template</h3>
          
          <div className="csv-section">
            <div 
              className={`csv-dropzone ${emailDragActive ? 'active' : ''}`}
              onDragEnter={handleEmailTemplateDrag}
              onDragLeave={handleEmailTemplateDrag}
              onDragOver={handleEmailTemplateDrag}
              onDrop={handleEmailTemplateDrop}
            >
              {!emailTemplate ? (
                <div className="dropzone-content">
                  <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="dropzone-text">Drag and drop HTML email template here, or</p>
                  <label className="file-input-label">
                    <input
                      type="file"
                      className="file-input"
                      accept=".html,.htm"
                      onChange={handleEmailTemplateChange}
                    />
                    <span className="btn btn-secondary">Browse Files</span>
                  </label>
                  <p className="dropzone-hint">HTML format only</p>
                </div>
              ) : (
                <div className="file-selected">
                  <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="file-name">{emailTemplateName}</p>
                  <button
                    className="remove-file btn btn-secondary"
                    onClick={removeEmailTemplate}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {emailTemplateContent && (
              <div className="email-preview-section">
                <h4>Email Preview:</h4>
                <div className="email-preview-container">
                  <iframe
                    title="Email Preview"
                    srcDoc={emailTemplateContent}
                    className="email-preview-iframe"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bulk-card card">
          <h3 className="card-title">Upload Recipients CSV</h3>

          <div className="csv-section">
            <div
              className={`csv-dropzone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {csvFileName ? (
                <div className="file-selected">
                  <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="file-name">{csvFileName}</p>
                  <button
                    className="remove-file"
                    onClick={() => {
                      setCsvFile(null);
                      setCsvFileName('');
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="dropzone-content">
                  <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="dropzone-text">Drag and drop CSV file here, or</p>
                  <label className="file-input-label">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="file-input"
                    />
                    <span className="btn btn-secondary">Browse Files</span>
                  </label>
                  <p className="dropzone-hint">CSV format: name,email</p>
                </div>
              )}
            </div>

            <div className="sample-section">
              <p>Don't have a CSV file? Download a sample template:</p>
              <Button variant="secondary" onClick={downloadSampleCSV}>
                Download Sample CSV
              </Button>
            </div>

            <div className="csv-format-info">
              <h4>CSV Format Requirements:</h4>
              <div className="code-block">
                <code>
                  name,email<br/>
                  John Doe,john@example.com<br/>
                  Jane Smith,jane@example.com
                </code>
              </div>
              <p>First row must be headers: <strong>name,email</strong></p>
              <p>Each subsequent row should contain recipient name and email</p>
            </div>

            <div className="bulk-actions">
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={!csvFile || generating}
                className="generate-btn"
              >
                {generating ? 'Generating & Sending...' : 'Generate & Send Certificates'}
              </Button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Real-time Progress Bar */}
        {(generating || progress.status !== 'idle') && (
          <ProgressBar
            total={progress.total}
            current={progress.current}
            successful={progress.successful}
            failed={progress.failed}
            status={progress.status}
            currentRecipient={progress.currentRecipient}
            estimatedTimeRemaining={progress.estimatedTimeRemaining}
            elapsedTime={progress.elapsedTime}
            errorMessage={progress.errorMessage}
            recentLogs={progress.recentLogs}
          />
        )}

        {results && (
          <div className="results-card card">
            <h3 className="card-title">Generation Results</h3>
            <div className="results-summary">
              <div className="stat">
                <div className="stat-value">{results.totalRecipients}</div>
                <div className="stat-label">Total Recipients</div>
              </div>
              <div className="stat success">
                <div className="stat-value">{results.successfulEmails}</div>
                <div className="stat-label">Successful</div>
              </div>
              <div className="stat failed">
                <div className="stat-value">{results.failedEmails}</div>
                <div className="stat-label">Failed</div>
              </div>
            </div>

            {results.emailResults.failed.length > 0 && (
              <div className="failed-emails">
                <h4>Failed Emails:</h4>
                <ul>
                  {results.emailResults.failed.map((item, index) => (
                    <li key={index}>
                      {item.name} ({item.email}): {item.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default BulkCertificateGenerator;
