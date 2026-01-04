import AWS from 'aws-sdk';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configure the Spaces endpoint
const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT);

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_ACCESS_KEY,
  secretAccessKey: process.env.SPACES_SECRET_KEY,
  region: process.env.SPACES_REGION
});

/**
 * Upload a file to DigitalOcean Spaces
 * @param {string} filePath - Local file path
 * @param {string} key - Object key (filename in Spaces)
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export const uploadToSpaces = async (filePath, key) => {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const params = {
      Bucket: process.env.SPACES_BUCKET,
      Key: key,
      Body: fileContent,
      ACL: 'public-read', // Make file publicly accessible
      ContentType: 'application/pdf'
    };

    const data = await s3.upload(params).promise();
    
    // Return CDN URL for better performance
    const cdnUrl = `${process.env.SPACES_CDN_URL}/${key}`;
    
    console.log(`✅ File uploaded to Spaces: ${cdnUrl}`);
    return cdnUrl;
    
  } catch (error) {
    console.error('❌ Spaces upload error:', error);
    throw new Error(`Failed to upload to Spaces: ${error.message}`);
  }
};

/**
 * Delete a file from DigitalOcean Spaces
 * @param {string} key - Object key (filename in Spaces)
 */
export const deleteFromSpaces = async (key) => {
  try {
    const params = {
      Bucket: process.env.SPACES_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
    console.log(`✅ File deleted from Spaces: ${key}`);
    
  } catch (error) {
    console.error('❌ Spaces delete error:', error);
    throw new Error(`Failed to delete from Spaces: ${error.message}`);
  }
};

/**
 * Get a signed URL for temporary access (optional - for private files)
 * @param {string} key - Object key
 * @param {number} expiresIn - Expiration time in seconds
 */
export const getSignedUrl = (key, expiresIn = 3600) => {
  const params = {
    Bucket: process.env.SPACES_BUCKET,
    Key: key,
    Expires: expiresIn
  };

  return s3.getSignedUrl('getObject', params);
};

/**
 * Test Spaces connection
 */
export const testSpacesConnection = async () => {
  try {
    const params = {
      Bucket: process.env.SPACES_BUCKET
    };
    await s3.headBucket(params).promise();
    console.log('✅ Spaces connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Spaces connection failed:', error.message);
    return false;
  }
};
