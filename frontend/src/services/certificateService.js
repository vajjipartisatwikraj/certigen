import api from './api';

export const certificateService = {
  /**
   * Generate a certificate PDF
   */
  generateCertificate: async (templateId, recipientName, customFields = {}) => {
    const response = await api.post(
      '/certificates/generate',
      {
        templateId,
        recipientName,
        customFields,
      },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Generate a preview image
   */
  generatePreview: async (templateId, recipientName, customFields = {}) => {
    const response = await api.post('/certificates/preview', {
      templateId,
      recipientName,
      customFields,
    });
    return response.data;
  },

  /**
   * Download a certificate
   */
  downloadCertificate: async (certificateId) => {
    const response = await api.get(`/certificates/${certificateId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get all certificates
   */
  getAllCertificates: async () => {
    const response = await api.get('/certificates');
    return response.data;
  },

  /**
   * Generate bulk certificates from CSV and send via email
   */
  generateBulkCertificates: async (templateId, csvFile, gmailUser, gmailPassword, fromName) => {
    // First, update the backend environment with email credentials
    // Note: In production, this should be done server-side for security
    const formData = new FormData();
    formData.append('csvFile', csvFile);
    formData.append('templateId', templateId);
    formData.append('gmailUser', gmailUser);
    formData.append('gmailPassword', gmailPassword);
    formData.append('fromName', fromName);

    const response = await api.post('/certificates/bulk-generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Send an existing certificate via email
   */
  sendCertificateEmail: async (certificateId, recipientEmail) => {
    const response = await api.post('/certificates/send-email', {
      certificateId,
      recipientEmail,
    });
    return response.data;
  },

  /**
   * Test email configuration
   */
  testEmailConfig: async () => {
    const response = await api.post('/certificates/test-email');
    return response.data;
  },
};
