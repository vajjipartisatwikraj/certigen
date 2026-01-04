import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { certificateService } from '../services/certificateService';
import Button from '../components/common/Button';
import './ManageRecipients.css';

const ManageRecipients = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadCertificates();
  }, [templateId]);

  const loadCertificates = async () => {
    try {
      const response = await certificateService.getCertificatesByTemplate(templateId);
      if (response.success) {
        setCertificates(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recipients');
    }
  };

  const handleDelete = async (certificateId) => {
    if (!confirm('Are you sure you want to delete this certificate? This will also remove it from cloud storage.')) {
      return;
    }

    try {
      setDeleting(certificateId);
      const response = await certificateService.deleteCertificate(certificateId);
      if (response.success) {
        setCertificates(certificates.filter(cert => cert.certificateId !== certificateId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete certificate');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="manage-recipients">
      <div className="recipients-header">
        <h1>Manage Recipients</h1>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="recipients-container">
        <div className="recipients-stats">
          <div className="stat-card">
            <div className="stat-value">{certificates.length}</div>
            <div className="stat-label">Total Recipients</div>
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="no-recipients">
            <p>No certificates have been issued for this template yet.</p>
            <Button variant="primary" onClick={() => navigate(`/bulk-generate/${templateId}`)}>
              Generate Certificates
            </Button>
          </div>
        ) : (
          <div className="recipients-table-container">
            <table className="recipients-table">
              <thead>
                <tr>
                  <th>Recipient Name</th>
                  <th>Email</th>
                  <th>Issued Date</th>
                  <th>Certificate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
                  <tr key={cert.certificateId}>
                    <td>{cert.recipientName}</td>
                    <td>{cert.recipientEmail}</td>
                    <td>{formatDate(cert.createdAt)}</td>
                    <td>
                      <a 
                        href={cert.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-link"
                      >
                        View Certificate
                      </a>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(cert.certificateId)}
                        disabled={deleting === cert.certificateId}
                      >
                        {deleting === cert.certificateId ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRecipients;
