import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
  try {
    console.log('Creating email transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    console.log('Verifying email configuration...');
    await transporter.verify();
    console.log('✅ Email configuration is valid!\n');
    
    console.log('Sending test email...');
    const mailOptions = {
      from: `"CertiGen Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email from CertiGen',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">✅ Email Configuration Test Successful!</h2>
          <p>This is a test email to verify that your Gmail App Password is working correctly.</p>
          <p>If you received this email, your CertiGen application is properly configured to send emails.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            Sent from CertiGen Certificate Generator<br>
            ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log(`\nCheck your inbox: ${process.env.EMAIL_USER}`);
    
  } catch (error) {
    console.error('❌ Error sending test email:');
    console.error('Message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n⚠️  Authentication failed. Please check:');
      console.error('   1. EMAIL_USER is set to your Gmail address');
      console.error('   2. EMAIL_PASSWORD is your 16-digit App Password (not your regular password)');
      console.error('   3. 2-Step Verification is enabled on your Google Account');
      console.error('\nSee APP_PASSWORD_SETUP.md for detailed setup instructions.');
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  Network error. Please check your internet connection.');
    }
  }
}

testEmail();
