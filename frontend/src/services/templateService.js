import api from './api';

export const templateService = {
  /**
   * Upload a new template
   */
  uploadTemplate: async (formData) => {
    const response = await api.post('/templates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Save text field configurations
   */
  saveTextFields: async (templateId, textFields) => {
    const response = await api.post(`/templates/${templateId}/fields`, {
      textFields,
    });
    return response.data;
  },

  /**
   * Get template by ID
   */
  getTemplate: async (templateId) => {
    const response = await api.get(`/templates/${templateId}`);
    return response.data;
  },

  /**
   * Get all templates
   */
  getAllTemplates: async () => {
    const response = await api.get('/templates');
    return response.data;
  },

  /**
   * Delete a template
   */
  deleteTemplate: async (templateId) => {
    const response = await api.delete(`/templates/${templateId}`);
    return response.data;
  },
};
