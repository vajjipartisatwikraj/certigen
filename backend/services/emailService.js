import pkg from 'nodemailer';
const { createTransport } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

/**
 * Create nodemailer transporter with custom credentials
 */
function createTransporter(emailUser = null, emailPassword = null) {
  return createTransport({
    service: 'gmail',
    auth: {
      user: emailUser || process.env.EMAIL_USER,
      pass: emailPassword || process.env.EMAIL_PASSWORD
    }
  });
}

/**
 * Send certificate email to a recipient using nodemailer
 */
export async function sendCertificateEmail(recipientEmail, recipientName, pdfPath, emailUser = null, emailPassword = null, emailTemplate = null) {
  try {
    const transporter = createTransporter(emailUser, emailPassword);
    
    const subject = `Your Certificate of Participation - ZENITH '25`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.8; 
            color: #333333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .email-wrapper { 
            max-width: 650px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
            border-radius: 8px; 
            overflow: hidden; 
          }
          .banner { 
            width: 100%; 
            height: auto; 
            display: block; 
          }
          .content { 
            padding: 40px 50px; 
          }
          .greeting { 
            font-size: 18px; 
            font-weight: 600; 
            color: #2c3e50; 
            margin-bottom: 20px; 
          }
          .message { 
            font-size: 15px; 
            margin-bottom: 18px; 
            color: #555555; 
          }
          .signature { 
            margin-top: 35px; 
            padding-top: 25px; 
            border-top: 1px solid #e0e0e0; 
            font-size: 15px; 
          }
          .signature-title { 
            font-weight: 600; 
            margin: 4px 0; 
            color: #2c3e50; 
          }
          .signature-org { 
            color: #666666; 
          }
          .footer { 
            background-color: #f8f9fa; 
            padding: 25px 50px; 
            text-align: center; 
            border-top: 1px solid #e0e0e0; 
          }
          .footer-text { 
            font-size: 13px; 
            color: #888888; 
            margin: 0; 
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <img src="cid:banner-image" alt="ZENITH '25 - The Cloud Voyage" class="banner" />
          
          <div class="content">
            <p class="greeting">Dear ${recipientName},</p>
            
            <p class="message">
              We're pleased to share your Certificate of Participation for <strong>ZENITH '25 – The Cloud Voyage</strong>, organized by SCOPE Club, MLR Institute of Technology. Thank you for your enthusiasm and active participation throughout the event.
            </p>
            
            <p class="message">
              Please find your certificate attached to this email. You may download and print it for your records.
            </p>
            
            <p class="message">
              Once again, thank you for being a part of ZENITH '25. We wish you all the very best.
            </p>
            
            <div class="signature">
              <p style="margin-bottom: 8px;">Warm regards,</p>
              <p class="signature-title">Team SCOPE</p>
              <p class="signature-org">MLR Institute of Technology</p>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Check if banner image exists
    const bannerPath = path.join(process.cwd(), 'email-banner.png');
    const bannerExists = fs.existsSync(bannerPath);
    
    // Setup email options
    const mailOptions = {
      from: `"SCOPE Club - ZENITH '25" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: subject,
      html: html,
      attachments: [
        {
          filename: `Certificate_${recipientName.replace(/\s+/g, '_')}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf'
        }
      ]
    };

    // Add banner as inline attachment if it exists
    if (bannerExists) {
      mailOptions.attachments.push({
        filename: 'banner.png',
        path: bannerPath,
        cid: 'banner-image' // Same CID as referenced in the HTML
      });
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      recipientEmail
    };

  } catch (error) {
    console.error('Email send error:', error);
    throw new Error(`Failed to send email to ${recipientEmail}: ${error.message}`);
  }
}

/**
 * Send certificates to multiple recipients
 */
export async function sendBulkCertificateEmails(recipients, certificatePaths, onProgress = null, emailUser = null, emailPassword = null, emailTemplate = null) {
  const results = {
    success: [],
    failed: []
  };

  const totalRecipients = recipients.length;
  const startTime = Date.now();

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const pdfPath = certificatePaths[i];

    // Calculate progress metrics
    const currentIndex = i + 1;
    const progressPercent = Math.round((currentIndex / totalRecipients) * 100);
    const elapsedTime = Date.now() - startTime;
    const avgTimePerEmail = elapsedTime / currentIndex;
    const remainingEmails = totalRecipients - currentIndex;
    const estimatedTimeRemaining = Math.round((avgTimePerEmail * remainingEmails) / 1000); // in seconds

    try {
      // Notify progress - sending
      if (onProgress) {
        onProgress({
          type: 'sending',
          current: currentIndex,
          total: totalRecipients,
          percent: progressPercent,
          recipient: {
            name: recipient.name,
            email: recipient.email
          },
          successful: results.success.length,
          failed: results.failed.length,
          estimatedTimeRemaining,
          elapsedTime: Math.round(elapsedTime / 1000)
        });
      }

      const result = await sendCertificateEmail(
        recipient.email,
        recipient.name,
        pdfPath,
        emailUser,
        emailPassword,
        emailTemplate
      );
      
      results.success.push({
        name: recipient.name,
        email: recipient.email,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      });

      // Notify progress - success
      if (onProgress) {
        onProgress({
          type: 'success',
          current: currentIndex,
          total: totalRecipients,
          percent: progressPercent,
          recipient: {
            name: recipient.name,
            email: recipient.email
          },
          successful: results.success.length,
          failed: results.failed.length,
          estimatedTimeRemaining,
          elapsedTime: Math.round(elapsedTime / 1000)
        });
      }

      // Small delay to avoid rate limiting (500ms between emails)
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      results.failed.push({
        name: recipient.name,
        email: recipient.email,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      // Notify progress - failed
      if (onProgress) {
        onProgress({
          type: 'failed',
          current: currentIndex,
          total: totalRecipients,
          percent: progressPercent,
          recipient: {
            name: recipient.name,
            email: recipient.email
          },
          error: error.message,
          successful: results.success.length,
          failed: results.failed.length,
          estimatedTimeRemaining,
          elapsedTime: Math.round(elapsedTime / 1000)
        });
      }

      // Small delay even on failure (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Test email configuration
 */
export async function testEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    throw new Error(`Email configuration error: ${error.message}`);
  }
}
