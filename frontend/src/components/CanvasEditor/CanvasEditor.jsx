import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import { templateService } from '../../services/templateService';
import { pixelToPercent, percentToPixel } from '../../utils/canvasUtils';
import Button from '../common/Button';
import Input from '../common/Input';
import './CanvasEditor.css';

const CanvasEditor = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [template, setTemplate] = useState(null);
  const [textFields, setTextFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const response = await templateService.getTemplate(templateId);
      if (response.success) {
        setTemplate(response.data);
        setTextFields(response.data.textFields || []);
      } else {
        setError('Failed to load template');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (template && canvasRef.current) {
      const canvas = canvasRef.current;
      const maxWidth = 800;
      const aspectRatio = template.dimensions.height / template.dimensions.width;
      
      const displayWidth = Math.min(maxWidth, template.dimensions.width);
      const displayHeight = displayWidth * aspectRatio;
      
      setCanvasDimensions({ width: displayWidth, height: displayHeight });
    }
  }, [template]);

  const addTextField = () => {
    const newField = {
      fieldId: `field_${Date.now()}`,
      fieldName: `Field ${textFields.length + 1}`,
      x: 20,
      y: 20 + (textFields.length * 10),
      width: 40,
      height: 8,
      fontSize: 48,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      alignment: 'center',
      color: '#000000'
    };
    setTextFields([...textFields, newField]);
    setSelectedField(newField.fieldId);
  };

  const updateField = (fieldId, updates) => {
    setTextFields(textFields.map(field =>
      field.fieldId === fieldId ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (fieldId) => {
    setTextFields(textFields.filter(field => field.fieldId !== fieldId));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  const handleDrag = (fieldId, e, data) => {
    const xPercent = pixelToPercent(data.x, canvasDimensions.width);
    const yPercent = pixelToPercent(data.y, canvasDimensions.height);
    updateField(fieldId, { x: xPercent, y: yPercent });
  };

  const saveConfiguration = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await templateService.saveTextFields(templateId, textFields);
      if (response.success) {
        alert('Configuration saved successfully!');
      } else {
        setError('Failed to save configuration');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const goToGenerate = () => {
    navigate(`/generate/${templateId}`);
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (error && !template) {
    return <div className="error-message">{error}</div>;
  }

  const selectedFieldData = textFields.find(f => f.fieldId === selectedField);

  return (
    <div className="canvas-editor">
      <div className="editor-header">
        <h1>Template Editor: {template?.templateName}</h1>
        <div className="editor-actions">
          <Button variant="success" onClick={saveConfiguration} disabled={saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
          <Button variant="primary" onClick={goToGenerate}>
            Generate Certificates
          </Button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="editor-container">
        <div className="hierarchy-panel">
          <h3>Fields</h3>
          <button className="add-field-btn" onClick={addTextField}>
            <span>+</span>
            <span>Add Text Field</span>
          </button>
          <div className="fields-list">
            {textFields.length === 0 ? (
              <div className="empty-fields">No fields yet. Add a field to get started.</div>
            ) : (
              textFields.map((field) => (
                <div
                  key={field.fieldId}
                  className={`field-item ${selectedField === field.fieldId ? 'selected' : ''}`}
                  onClick={() => setSelectedField(field.fieldId)}
                >
                  <div className="field-item-content">
                    <div className="field-item-name">{field.fieldName}</div>
                    <div className="field-item-info">{field.fontFamily} • {field.fontSize}px</div>
                  </div>
                  <button
                    className="field-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteField(field.fieldId);
                    }}
                    title="Delete field"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="canvas-panel">
          <div className="canvas-wrapper">
            <div
              ref={canvasRef}
              className="canvas"
              style={{
                width: `${canvasDimensions.width}px`,
                height: `${canvasDimensions.height}px`,
                backgroundImage: template?.imageUrl ? `url(${template.imageUrl})` : 'none',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                position: 'relative',
                border: '1px solid #ddd'
              }}
            >
              {textFields.map((field) => {
                const x = percentToPixel(field.x, canvasDimensions.width);
                const y = percentToPixel(field.y, canvasDimensions.height);
                const width = percentToPixel(field.width, canvasDimensions.width);
                const height = percentToPixel(field.height, canvasDimensions.height);

                return (
                  <Draggable
                    key={field.fieldId}
                    position={{ x, y }}
                    onDrag={(e, data) => handleDrag(field.fieldId, e, data)}
                    bounds="parent"
                  >
                    <div
                      className={`text-field ${selectedField === field.fieldId ? 'selected' : ''}`}
                      style={{
                        width: `${width}px`,
                        height: `${height}px`,
                      }}
                      onClick={() => setSelectedField(field.fieldId)}
                    >
                      <div className="field-label">{field.fieldName}</div>
                      <div className="field-coordinates">
                        ({field.x.toFixed(1)}%, {field.y.toFixed(1)}%)
                      </div>
                    </div>
                  </Draggable>
                );
              })}
            </div>
          </div>
        </div>

        <div className="properties-panel">
          <h3>Field Properties</h3>
          {selectedFieldData ? (
            <div className="properties-form">
              <Input
                label="Field Name"
                value={selectedFieldData.fieldName}
                onChange={(e) => updateField(selectedField, { fieldName: e.target.value })}
              />

              <div className="form-row">
                <Input
                  label="X Position (%)"
                  type="number"
                  value={selectedFieldData.x.toFixed(1)}
                  onChange={(e) => updateField(selectedField, { x: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  step="0.1"
                />
                <Input
                  label="Y Position (%)"
                  type="number"
                  value={selectedFieldData.y.toFixed(1)}
                  onChange={(e) => updateField(selectedField, { y: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div className="form-row">
                <Input
                  label="Width (%)"
                  type="number"
                  value={selectedFieldData.width}
                  onChange={(e) => updateField(selectedField, { width: parseFloat(e.target.value) })}
                  min="1"
                  max="100"
                  step="0.1"
                />
                <Input
                  label="Height (%)"
                  type="number"
                  value={selectedFieldData.height}
                  onChange={(e) => updateField(selectedField, { height: parseFloat(e.target.value) })}
                  min="1"
                  max="100"
                  step="0.1"
                />
              </div>

              <Input
                label="Font Size (px)"
                type="number"
                value={selectedFieldData.fontSize}
                onChange={(e) => updateField(selectedField, { fontSize: parseInt(e.target.value) })}
                min="12"
                max="200"
              />

              <div className="form-group">
                <label className="input-label">Font Family</label>
                <select
                  className="input"
                  value={selectedFieldData.fontFamily}
                  onChange={(e) => updateField(selectedField, { fontFamily: e.target.value })}
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Font Weight</label>
                <select
                  className="input"
                  value={selectedFieldData.fontWeight}
                  onChange={(e) => updateField(selectedField, { fontWeight: e.target.value })}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="bolder">Bolder</option>
                  <option value="lighter">Lighter</option>
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Text Alignment</label>
                <select
                  className="input"
                  value={selectedFieldData.alignment}
                  onChange={(e) => updateField(selectedField, { alignment: e.target.value })}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Text Color</label>
                <input
                  type="color"
                  className="color-input"
                  value={selectedFieldData.color}
                  onChange={(e) => updateField(selectedField, { color: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <p className="no-selection">Select a text field to edit its properties</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
