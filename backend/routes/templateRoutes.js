import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import upload from '../config/multer.js';
import Template from '../models/Template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// A4 landscape dimensions at 72 DPI: 1122px × 794px (or equivalent ratio)
const A4_LANDSCAPE_RATIO = 1122 / 794; // ~1.413
const RATIO_TOLERANCE = 0.05; // 5% tolerance

/**
 * POST /api/templates/upload
 * Upload a certificate template image
 */
router.post('/upload', upload.single('template'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    
    // Validate image dimensions
    const metadata = await sharp(filePath).metadata();
    const { width, height } = metadata;
    
    const imageRatio = width / height;
    const ratioDifference = Math.abs(imageRatio - A4_LANDSCAPE_RATIO);
    
    if (ratioDifference > RATIO_TOLERANCE) {
      // Delete the uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `Invalid dimensions. Expected A4 landscape ratio (${A4_LANDSCAPE_RATIO.toFixed(2)}), got ${imageRatio.toFixed(2)}. Please upload an image with dimensions like 1122×794px.`
      });
    }

    // Generate template ID
    const templateId = uuidv4();
    const templateName = req.body.templateName || `Template ${Date.now()}`;
    
    // Create image URL
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Create template document
    const template = new Template({
      templateId,
      templateName,
      imagePath: filePath,
      imageUrl,
      dimensions: {
        width,
        height
      },
      textFields: []
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: 'Template uploaded successfully',
      data: {
        templateId: template.templateId,
        templateName: template.templateName,
        imageUrl: template.imageUrl,
        dimensions: template.dimensions,
        _id: template._id
      }
    });

  } catch (error) {
    console.error('Template upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload template',
      error: error.message
    });
  }
});

/**
 * POST /api/templates/:templateId/fields
 * Save text field configurations for a template
 */
router.post('/:templateId/fields', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { textFields } = req.body;

    if (!textFields || !Array.isArray(textFields)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid text fields data'
      });
    }

    const template = await Template.findOne({ templateId });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Validate text fields
    for (const field of textFields) {
      if (!field.fieldId || !field.fieldName) {
        return res.status(400).json({
          success: false,
          message: 'Each field must have fieldId and fieldName'
        });
      }
    }

    template.textFields = textFields;
    template.updatedAt = Date.now();
    await template.save();

    res.json({
      success: true,
      message: 'Text fields saved successfully',
      data: template
    });

  } catch (error) {
    console.error('Save fields error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save text fields',
      error: error.message
    });
  }
});

/**
 * GET /api/templates/:templateId
 * Retrieve a specific template configuration
 */
router.get('/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await Template.findOne({ templateId });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve template',
      error: error.message
    });
  }
});

/**
 * GET /api/templates
 * List all templates
 */
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find()
      .sort({ createdAt: -1 })
      .select('-imagePath'); // Exclude file path for security

    res.json({
      success: true,
      count: templates.length,
      data: templates
    });

  } catch (error) {
    console.error('List templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve templates',
      error: error.message
    });
  }
});

/**
 * DELETE /api/templates/:templateId
 * Delete a template and its associated file
 */
router.delete('/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await Template.findOne({ templateId });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Delete the image file
    if (fs.existsSync(template.imagePath)) {
      fs.unlinkSync(template.imagePath);
    }

    await Template.deleteOne({ templateId });

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error.message
    });
  }
});

export default router;
