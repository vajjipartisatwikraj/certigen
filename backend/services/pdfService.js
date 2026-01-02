import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Calculate optimal font size that fits within the given width
 */
function calculateOptimalFontSize(text, maxWidth, initialFontSize, minFontSize, fontFamily, fontWeight) {
  const canvas = createCanvas(1000, 1000);
  const ctx = canvas.getContext('2d');
  
  let fontSize = initialFontSize;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  let textWidth = ctx.measureText(text).width;
  
  // Reduce font size until text fits or minimum is reached
  while (textWidth > maxWidth && fontSize > minFontSize) {
    fontSize -= 0.5;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    textWidth = ctx.measureText(text).width;
  }
  
  // Handle overflow with truncation
  if (textWidth > maxWidth) {
    let truncatedText = text;
    while (ctx.measureText(truncatedText + '...').width > maxWidth && truncatedText.length > 0) {
      truncatedText = truncatedText.slice(0, -1);
    }
    return { fontSize: minFontSize, text: truncatedText + '...' };
  }
  
  return { fontSize, text };
}

/**
 * Generate a certificate PDF
 */
export async function generateCertificatePDF(template, data, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const { width, height } = template.dimensions;
      
      // Create PDF document with exact template dimensions
      const doc = new PDFDocument({
        size: [width, height],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        autoFirstPage: false
      });

      // Create write stream
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // Add a page
      doc.addPage({
        size: [width, height],
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      });

      // Add template image as background
      if (fs.existsSync(template.imagePath)) {
        doc.image(template.imagePath, 0, 0, {
          width: width,
          height: height,
          align: 'center',
          valign: 'center'
        });
      } else {
        throw new Error('Template image not found');
      }

      // Process each text field
      template.textFields.forEach(field => {
        const fieldData = data[field.fieldId] || data.recipientName || '';
        
        if (!fieldData) return;

        // Convert percentage coordinates to absolute pixels
        const x = (field.x / 100) * width;
        const y = (field.y / 100) * height;
        const fieldWidth = (field.width / 100) * width;

        // Calculate optimal font size
        const minFontSize = 20;
        const { fontSize, text } = calculateOptimalFontSize(
          fieldData,
          fieldWidth,
          field.fontSize,
          minFontSize,
          field.fontFamily,
          field.fontWeight
        );

        // Set font
        const fontName = field.fontWeight === 'bold' ? 'Helvetica-Bold' : 'Helvetica';
        doc.font(fontName);
        doc.fontSize(fontSize);
        doc.fillColor(field.color || '#000000');

        // Draw text with proper alignment
        const textOptions = {
          width: fieldWidth,
          align: field.alignment || 'center',
          lineBreak: false
        };

        doc.text(text, x, y, textOptions);
      });

      // Finalize PDF
      doc.end();

      writeStream.on('finish', () => {
        resolve(outputPath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate a preview image (PNG) for the certificate
 */
export function generatePreviewImage(template, data) {
  const { width, height } = template.dimensions;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Load and draw template image
  return new Promise((resolve, reject) => {
    try {
      // For now, return a simple base64 placeholder
      // In production, you'd load the actual template image
      
      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Process each text field
      template.textFields.forEach(field => {
        const fieldData = data[field.fieldId] || data.recipientName || '';
        
        if (!fieldData) return;

        // Convert percentage coordinates to absolute pixels
        const x = (field.x / 100) * width;
        const y = (field.y / 100) * height;
        const fieldWidth = (field.width / 100) * width;

        // Calculate optimal font size
        const minFontSize = 20;
        const { fontSize, text } = calculateOptimalFontSize(
          fieldData,
          fieldWidth,
          field.fontSize,
          minFontSize,
          field.fontFamily,
          field.fontWeight
        );

        // Set text properties
        ctx.font = `${field.fontWeight} ${fontSize}px ${field.fontFamily}`;
        ctx.fillStyle = field.color || '#000000';
        ctx.textAlign = field.alignment || 'center';

        // Draw text
        const textX = field.alignment === 'center' ? x + fieldWidth / 2 :
                     field.alignment === 'right' ? x + fieldWidth : x;
        ctx.fillText(text, textX, y + fontSize);
      });

      // Convert to base64
      const base64Image = canvas.toDataURL('image/png');
      resolve(base64Image);

    } catch (error) {
      reject(error);
    }
  });
}
