import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateService } from '../services/templateService';
import Button from '../components/common/Button';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalCertificates: 0,
    emailsSent: 0,
    recentActivity: []
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await templateService.getAllTemplates();
      if (response.success) {
        setTemplates(response.data);
        // Calculate stats
        setStats({
          totalTemplates: response.data.length,
          totalCertificates: response.data.reduce((sum, t) => sum + (t.generatedCount || 0), 0),
          emailsSent: response.data.reduce((sum, t) => sum + (t.emailedCount || 0), 0),
          recentActivity: []
        });
      }
    } catch (err) {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await templateService.deleteTemplate(templateId);
      setTemplates(templates.filter(t => t.templateId !== templateId));
    } catch (err) {
      alert('Failed to delete template');
    }
  };

  return (
    <div className="home">
      {/* Header */}
      <div className="hero-header">
        <div className="hero-content">
          <h1 className="hero-title">CertiGen</h1>
          <p className="hero-subtitle">
            Professional certificate generation and distribution platform
          </p>
          <div className="hero-actions">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/upload')}
            >
              Create Template
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
            >
              Browse Templates
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <div className="stat-details">
            <div className="stat-label">Templates</div>
            <div className="stat-value">{stats.totalTemplates}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-details">
            <div className="stat-label">Certificates</div>
            <div className="stat-value">{stats.totalCertificates}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-details">
            <div className="stat-label">Emails Sent</div>
            <div className="stat-value">{stats.emailsSent}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-details">
            <div className="stat-label">Status</div>
            <div className="stat-value status-online">Online</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Templates Section */}
      <div className="templates-section">
        <div className="section-header">
          <h2 className="section-title">Templates</h2>
          <div className="search-bar">
            <input
              type="text"
              className="input-floating"
              placeholder="Search templates..."
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="empty-state">
            <h3>No Templates</h3>
            <p>Create your first template to get started</p>
            <Button 
              variant="primary"
              onClick={() => navigate('/upload')}
            >
              Create Template
            </Button>
          </div>
        ) : (
          <div className="templates-grid">
            {templates.map((template) => (
              <div 
                key={template._id} 
                className="template-card"
              >
                <div className="template-preview">
                  {template.imageUrl ? (
                    <img src={template.imageUrl} alt={template.templateName} />
                  ) : (
                    <div className="no-image">
                      <p>No Preview</p>
                    </div>
                  )}
                </div>
                
                <div className="template-info">
                  <h3 className="template-name">{template.templateName}</h3>
                  <div className="template-meta">
                    <span className="meta-item">
                      {template.dimensions.width} × {template.dimensions.height}
                    </span>
                    <span className="meta-item">
                      {template.textFields?.length || 0} fields
                    </span>
                  </div>
                  
                  <div className="template-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/editor/${template.templateId}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/generate/${template.templateId}`)}
                    >
                      Generate
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/bulk-generate/${template.templateId}`)}
                    >
                      Bulk Email
                    </Button>
                  </div>
                  
                  <button
                    className="template-delete"
                    onClick={() => handleDelete(template.templateId)}
                    title="Delete template"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
