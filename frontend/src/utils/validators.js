/**
 * Validate file type
 */
export function validateFileType(file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size (max 5MB)
 */
export function validateFileSize(file, maxSize = 5 * 1024 * 1024) {
  return file.size <= maxSize;
}

/**
 * Validate text field configuration
 */
export function validateTextField(field) {
  const errors = [];
  
  if (!field.fieldId) {
    errors.push('Field ID is required');
  }
  
  if (!field.fieldName) {
    errors.push('Field name is required');
  }
  
  if (field.x < 0 || field.x > 100) {
    errors.push('X coordinate must be between 0 and 100');
  }
  
  if (field.y < 0 || field.y > 100) {
    errors.push('Y coordinate must be between 0 and 100');
  }
  
  if (field.width <= 0 || field.width > 100) {
    errors.push('Width must be between 0 and 100');
  }
  
  if (field.height <= 0 || field.height > 100) {
    errors.push('Height must be between 0 and 100');
  }
  
  return errors;
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, '');
}
