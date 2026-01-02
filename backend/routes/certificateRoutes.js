import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import Template from '../models/Template.js';
import Certificate from '../models/Certificate.js';
import { generateCertificatePDF, generatePreviewImage } from '../services/pdfService.js';
import { sendCertificateEmail, sendBulkCertificateEmails, testEmailConfig } from '../services/emailService.js';
import upload from '../config/multer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create certificates directory if it doesn't exist
const certificatesDir = path.join(__dirname, '..', 'certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

/**
 * POST /api/certificates/generate
 * Generate a certificate PDF
 */
router.post('/generate', async (req, res) => {
  try {
    const { templateId, recipientName, customFields } = req.body;

    if (!templateId || !recipientName) {
      return res.status(400).json({
        success: false,
        message: 'Template ID and recipient name are required'
      });
    }

    // Find template
    const template = await Template.findOne({ templateId });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Generate unique certificate ID
    const certificateId = uuidv4();
    const filename = `certificate-${certificateId}.pdf`;
    const outputPath = path.join(certificatesDir, filename);

    // Prepare data for PDF generation
    const data = {
      recipientName,
      ...customFields
    };

    // Generate PDF
    await generateCertificatePDF(template, data, outputPath);

    // Save certificate record
    const certificate = new Certificate({
      certificateId,
      templateId: template._id,
      recipientName,
      customFields,
      pdfPath: outputPath
    });

    await certificate.save();

    // Send PDF file
    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({
          success: false,
          message: 'Failed to download certificate'
        });
      }
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate certificate',
      error: error.message
    });
  }
});

/**
 * POST /api/certificates/preview
 * Generate a preview image of the certificate
 */
router.post('/preview', async (req, res) => {
  try {
    const { templateId, recipientName, customFields } = req.body;

    if (!templateId || !recipientName) {
      return res.status(400).json({
        success: false,
        message: 'Template ID and recipient name are required'
      });
    }

    // Find template
    const template = await Template.findOne({ templateId });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Prepare data for preview generation
    const data = {
      recipientName,
      ...customFields
    };

    // Generate preview
    const previewImage = await generatePreviewImage(template, data);

    res.json({
      success: true,
      data: {
        preview: previewImage
      }
    });

  } catch (error) {
    console.error('Preview generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview',
      error: error.message
    });
  }
});

/**
 * GET /api/certificates/:certificateId/download
 * Download a previously generated certificate
 */
router.get('/:certificateId/download', async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (!fs.existsSync(certificate.pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found'
      });
    }

    // Increment download count
    certificate.downloadCount += 1;
    await certificate.save();

    // Send file
    res.download(certificate.pdfPath, `certificate-${certificateId}.pdf`);

  } catch (error) {
    console.error('Certificate download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download certificate',
      error: error.message
    });
  }
});

/**
 * GET /api/certificates
 * List all generated certificates
 */
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('templateId', 'templateName')
      .sort({ generatedAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: certificates.length,
      data: certificates
    });

  } catch (error) {
    console.error('List certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificates',
      error: error.message
    });
  }
});

/**
 * POST /api/certificates/bulk-generate-stream
 * Generate and email certificates in bulk from CSV file with real-time progress via SSE
 */
router.post('/bulk-generate-stream', upload.fields([
  { name: 'csvFile', maxCount: 1 },
  { name: 'emailTemplate', maxCount: 1 }
]), async (req, res) => {
  try {
    const { templateId, fromName, emailUser, emailPassword } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required'
      });
    }

    if (!emailUser || !emailPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email credentials are required'
      });
    }

    if (!req.files || !req.files.csvFile) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Helper function to send SSE message
    const sendSSE = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial connection message
    sendSSE({ type: 'connected', message: 'Stream connected' });

    // Set FROM_NAME for this request if provided
    const originalFromName = process.env.EMAIL_FROM_NAME;
    if (fromName) {
      process.env.EMAIL_FROM_NAME = fromName;
    }

    try {
      // Find template
      sendSSE({ type: 'info', message: 'Finding template...' });
      const template = await Template.findOne({ templateId });

      if (!template) {
        sendSSE({ 
          type: 'error', 
          message: 'Template not found' 
        });
        if (fromName) {
          process.env.EMAIL_FROM_NAME = originalFromName;
        }
        res.end();
        return;
      }

      // Parse CSV file
      sendSSE({ type: 'info', message: 'Parsing CSV file...' });
      const recipients = [];
      const csvPath = req.files.csvFile[0].path;
      const emailTemplatePath = req.files.emailTemplate ? req.files.emailTemplate[0].path : null;

      await new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (row) => {
            const name = row.name || row.Name || row.NAME;
            const email = row.email || row.Email || row.EMAIL;
            
            if (name && email) {
              recipients.push({ name: name.trim(), email: email.trim() });
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // Delete CSV file after parsing
      fs.unlinkSync(csvPath);

      if (recipients.length === 0) {
        sendSSE({ 
          type: 'error', 
          message: 'No valid recipients found in CSV file' 
        });
        if (fromName) {
          process.env.EMAIL_FROM_NAME = originalFromName;
        }
        res.end();
        return;
      }

      sendSSE({ 
        type: 'info', 
        message: `Found ${recipients.length} recipients. Generating certificates...`,
        total: recipients.length
      });

      // Generate certificates for all recipients
      const certificatePaths = [];
      const certificateRecords = [];

      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        const certificateId = uuidv4();
        const filename = `certificate-${certificateId}.pdf`;
        const outputPath = path.join(certificatesDir, filename);

        const data = {
          recipientName: recipient.name
        };

        try {
          sendSSE({
            type: 'generating',
            message: `Generating certificate ${i + 1}/${recipients.length}`,
            current: i + 1,
            total: recipients.length,
            recipient: recipient.name
          });

          await generateCertificatePDF(template, data, outputPath);
          certificatePaths.push(outputPath);

          // Save certificate record
          const certificate = new Certificate({
            certificateId,
            templateId: template._id,
            recipientName: recipient.name,
            recipientEmail: recipient.email,
            pdfPath: outputPath
          });

          await certificate.save();
          certificateRecords.push(certificate);

        } catch (error) {
          console.error(`Failed to generate certificate for ${recipient.name}:`, error);
          sendSSE({
            type: 'generation_error',
            message: `Failed to generate certificate for ${recipient.name}`,
            error: error.message
          });
        }
      }

      sendSSE({ 
        type: 'info', 
        message: 'Certificates generated. Starting email delivery...' 
      });

      // Send emails with progress callback
      const emailResults = await sendBulkCertificateEmails(
        recipients, 
        certificatePaths,
        (progress) => {
          sendSSE({
            type: 'progress',
            ...progress
          });
        },
        emailUser,
        emailPassword,
        null // emailTemplate - will be added later when HTML template feature is implemented
      );

      // Send final summary
      sendSSE({
        type: 'complete',
        message: 'All certificates processed',
        data: {
          totalRecipients: recipients.length,
          successfulEmails: emailResults.success.length,
          failedEmails: emailResults.failed.length,
          emailResults
        }
      });

      // Restore fromName if changed
      if (fromName) {
        process.env.EMAIL_FROM_NAME = originalFromName;
      }

      res.end();

    } catch (error) {
      console.error('Bulk certificate generation error:', error);
      
      sendSSE({
        type: 'error',
        message: 'Failed to generate bulk certificates',
        error: error.message
      });

      // Restore fromName if changed
      if (fromName) {
        process.env.EMAIL_FROM_NAME = originalFromName;
      }

      res.end();
    }

  } catch (error) {
    console.error('Stream setup error:', error);
    
    // Clean up uploaded files if they exist
    if (req.files) {
      if (req.files.csvFile && fs.existsSync(req.files.csvFile[0].path)) {
        fs.unlinkSync(req.files.csvFile[0].path);
      }
      if (req.files.emailTemplate && fs.existsSync(req.files.emailTemplate[0].path)) {
        fs.unlinkSync(req.files.emailTemplate[0].path);
      }
    }
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to start stream',
        error: error.message
      });
    } else {
      res.end();
    }
  }
});

/**
 * POST /api/certificates/bulk-generate
 * Generate and email certificates in bulk from CSV file
 */
router.post('/bulk-generate', upload.single('csvFile'), async (req, res) => {
  try {
    const { templateId, gmailUser, gmailPassword, fromName } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }

    if (!gmailUser || !gmailPassword) {
      return res.status(400).json({
        success: false,
        message: 'Gmail credentials are required'
      });
    }

    // Temporarily set email credentials for this request
    const originalUser = process.env.GMAIL_USER;
    const originalPassword = process.env.GMAIL_APP_PASSWORD;
    const originalFromName = process.env.EMAIL_FROM_NAME;

    process.env.GMAIL_USER = gmailUser;
    process.env.GMAIL_APP_PASSWORD = gmailPassword;
    process.env.EMAIL_FROM_NAME = fromName || 'CertiGen';

    // Find template
    const template = await Template.findOne({ templateId });

    if (!template) {
      // Restore original credentials
      process.env.GMAIL_USER = originalUser;
      process.env.GMAIL_APP_PASSWORD = originalPassword;
      process.env.EMAIL_FROM_NAME = originalFromName;
      
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Parse CSV file
    const recipients = [];
    const csvPath = req.file.path;

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Expected CSV format: name,email (or Name,Email)
          const name = row.name || row.Name || row.NAME;
          const email = row.email || row.Email || row.EMAIL;
          
          if (name && email) {
            recipients.push({ name: name.trim(), email: email.trim() });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Delete CSV file after parsing
    fs.unlinkSync(csvPath);

    if (recipients.length === 0) {
      // Restore original credentials
      process.env.GMAIL_USER = originalUser;
      process.env.GMAIL_APP_PASSWORD = originalPassword;
      process.env.EMAIL_FROM_NAME = originalFromName;
      
      return res.status(400).json({
        success: false,
        message: 'No valid recipients found in CSV file. Expected format: name,email'
      });
    }

    // Generate certificates for all recipients
    const certificatePaths = [];
    const certificateRecords = [];

    for (const recipient of recipients) {
      const certificateId = uuidv4();
      const filename = `certificate-${certificateId}.pdf`;
      const outputPath = path.join(certificatesDir, filename);

      const data = {
        recipientName: recipient.name
      };

      try {
        await generateCertificatePDF(template, data, outputPath);
        certificatePaths.push(outputPath);

        // Save certificate record
        const certificate = new Certificate({
          certificateId,
          templateId: template._id,
          recipientName: recipient.name,
          recipientEmail: recipient.email,
          pdfPath: outputPath
        });

        await certificate.save();
        certificateRecords.push(certificate);

      } catch (error) {
        console.error(`Failed to generate certificate for ${recipient.name}:`, error);
      }
    }

    // Send emails
    const emailResults = await sendBulkCertificateEmails(recipients, certificatePaths);

    // Restore fromName if changed
    if (fromName) {
      process.env.EMAIL_FROM_NAME = originalFromName;
    }

    res.json({
      success: true,
      message: `Processed ${recipients.length} certificates`,
      data: {
        totalRecipients: recipients.length,
        successfulEmails: emailResults.success.length,
        failedEmails: emailResults.failed.length,
        emailResults
      }
    });

  } catch (error) {
    console.error('Bulk certificate generation error:', error);
    
    // Clean up uploaded CSV if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate bulk certificates',
      error: error.message
    });
  }
});

/**
 * POST /api/certificates/send-email
 * Send an existing certificate via email
 */
router.post('/send-email', async (req, res) => {
  try {
    const { certificateId, recipientEmail } = req.body;

    if (!certificateId || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Certificate ID and recipient email are required'
      });
    }

    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (!fs.existsSync(certificate.pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found'
      });
    }

    const result = await sendCertificateEmail(
      recipientEmail,
      certificate.recipientName,
      certificate.pdfPath
    );

    res.json({
      success: true,
      message: 'Certificate sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send certificate email',
      error: error.message
    });
  }
});

/**
 * POST /api/certificates/test-email
 * Test email configuration
 */
router.post('/test-email', async (req, res) => {
  try {
    const result = await testEmailConfig();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
