/**
 * Calculate optimal font size that fits within the given width
 */
export function calculateOptimalFontSize(
  text,
  maxWidth,
  initialFontSize,
  minFontSize = 20,
  fontFamily = 'Arial',
  fontWeight = 'bold'
) {
  const canvas = document.createElement('canvas');
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
    while (
      ctx.measureText(truncatedText + '...').width > maxWidth &&
      truncatedText.length > 0
    ) {
      truncatedText = truncatedText.slice(0, -1);
    }
    return { fontSize: minFontSize, text: truncatedText + '...' };
  }
  
  return { fontSize, text };
}

/**
 * Convert percentage coordinates to pixel coordinates
 */
export function percentToPixel(percent, dimension) {
  return (percent / 100) * dimension;
}

/**
 * Convert pixel coordinates to percentage coordinates
 */
export function pixelToPercent(pixel, dimension) {
  return (pixel / dimension) * 100;
}

/**
 * Validate A4 landscape dimensions
 */
export function validateA4Landscape(width, height) {
  const A4_LANDSCAPE_RATIO = 1122 / 794; // ~1.413
  const RATIO_TOLERANCE = 0.05;
  
  const imageRatio = width / height;
  const ratioDifference = Math.abs(imageRatio - A4_LANDSCAPE_RATIO);
  
  return ratioDifference <= RATIO_TOLERANCE;
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
