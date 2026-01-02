import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateService } from '../../services/templateService';
import { certificateService } from '../../services/certificateService';
import { calculateOptimalFontSize, percentToPixel, downloadBlob } from '../../utils/canvasUtils';
import Button from '../common/Button';
import Input from '../common/Input';
import './CertificateGenerator.css';

const CertificateGenerator = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [template, setTemplate] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [customFields, setCustomFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  useEffect(() => {
    if (template && recipientName) {
      drawPreview();
    }
  }, [template, recipientName, customFields]);

  const loadTemplate = async () => {
    try {
      const response = await templateService.getTemplate(templateId);
      if (response.success) {
        setTemplate(response.data);
        
        // Initialize custom fields
        const fields = {};
        response.data.textFields.forEach(field => {
          fields[field.fieldId] = '';
        });
        setCustomFields(fields);
      } else {
        setError('Failed to load template');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas || !template) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = template.dimensions;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Load and draw template image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);

      // Draw text fields
      template.textFields.forEach(field => {
        const fieldData = customFields[field.fieldId] || recipientName || '';
        if (!fieldData) return;

        const x = percentToPixel(field.x, width);
        const y = percentToPixel(field.y, height);
        const fieldWidth = percentToPixel(field.width, width);
        const fieldHeight = percentToPixel(field.height, height);

        // Calculate optimal font size
        const { fontSize, text } = calculateOptimalFontSize(
          fieldData,
          fieldWidth,
          field.fontSize,
          20,
          field.fontFamily,
          field.fontWeight
        );

        // Set text properties
        ctx.font = `${field.fontWeight} ${fontSize}px ${field.fontFamily}`;
        ctx.fillStyle = field.color;
        ctx.textAlign = field.alignment;
        ctx.textBaseline = 'top';

        // Calculate text position based on alignment
        let textX = x;
        if (field.alignment === 'center') {
          textX = x + fieldWidth / 2;
        } else if (field.alignment === 'right') {
          textX = x + fieldWidth;
        }

        // Draw text
        ctx.fillText(text, textX, y);
      });
    };

    img.src = template.imageUrl;
  };

  const handleGenerate = async () => {
    if (!recipientName.trim()) {
      setError('Please enter recipient name');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const blob = await certificateService.generateCertificate(
        templateId,
        recipientName,
        customFields
      );

      // Download the PDF
      downloadBlob(blob, `certificate-${recipientName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (error && !template) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="certificate-generator">
      <div className="generator-header">
        <div>
          <h1>Generate Certificate: {template?.templateName}</h1>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => navigate(`/bulk-generate/${templateId}`)}
        >
          Bulk Generate & Email
        </Button>
      </div>

      <div className="generator-container">
        <div className="preview-panel">
          <h3>Live Preview</h3>
          <canvas
            ref={canvasRef}
            className="preview-canvas"
            style={{
              maxWidth: '700px',
              width: '100%',
              height: 'auto'
            }}
          />
        </div>

        <div className="input-panel">
          <h3>Certificate Details</h3>
          
          <div className="form-section">
            <Input
              label="Recipient Name *"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter recipient name"
            />

            {template?.textFields.filter(f => f.fieldId !== 'name_field').map(field => (
              <Input
                key={field.fieldId}
                label={field.fieldName}
                value={customFields[field.fieldId] || ''}
                onChange={(e) => setCustomFields({
                  ...customFields,
                  [field.fieldId]: e.target.value
                })}
                placeholder={`Enter ${field.fieldName.toLowerCase()}`}
              />
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="generate-actions">
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={!recipientName || generating}
              className="generate-btn"
            >
              {generating ? 'Generating...' : 'Generate & Download Certificate'}
            </Button>
          </div>

          <div className="info-box">
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Enter the recipient's name and any additional details</li>
              <li>Preview updates in real-time on the left</li>
              <li>Font size adjusts automatically to fit the text box</li>
              <li>Click generate to download the certificate as PDF</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
