import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateService } from '../../services/templateService';
import { validateFileType, validateFileSize } from '../../utils/validators';
import Button from '../common/Button';
import './TemplateUploader.css';

const TemplateUploader = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile) => {
    setError('');

    // Validate file type
    if (!validateFileType(selectedFile)) {
      setError('Invalid file type. Please upload a PNG, JPG, or JPEG image.');
      return;
    }

    // Validate file size
    if (!validateFileSize(selectedFile)) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    if (!templateName.trim()) {
      setError('Please enter a template name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('template', file);
      formData.append('templateName', templateName);

      const response = await templateService.uploadTemplate(formData);

      if (response.success) {
        // Navigate to editor with template ID
        navigate(`/editor/${response.data.templateId}`);
      } else {
        setError(response.message || 'Failed to upload template');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while uploading');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="template-uploader">
      <div className="uploader-card">
        <h2>Upload Certificate Template</h2>
        <p className="uploader-description">
          Upload an A4 landscape certificate template (1122×794px or similar ratio)
        </p>

        <div className="template-name-input">
          <input
            type="text"
            className="template-input"
            placeholder="Enter template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div
          className={`dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Template preview" className="preview-image" />
              <button
                className="remove-preview"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="dropzone-content">
              <svg
                className="upload-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="dropzone-text">
                Drag and drop your template here, or
              </p>
              <label className="file-input-label">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileInput}
                  className="file-input"
                  disabled={loading}
                />
                <span className="browse-btn">Browse Files</span>
              </label>
              <p className="dropzone-hint">
                PNG, JPG, JPEG • Max 5MB • A4 Landscape
              </p>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="upload-actions">
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!file || !templateName || loading}
          >
            {loading ? 'Uploading...' : 'Upload & Continue to Editor'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateUploader;
