import dotenv from 'dotenv';
import { testSpacesConnection, uploadToSpaces } from './services/spacesService.js';
import fs from 'fs';

dotenv.config();

async function testSpaces() {
  console.log('🧪 Testing DigitalOcean Spaces...\n');

  // Test connection
  console.log('1. Testing connection...');
  const isConnected = await testSpacesConnection();
  
  if (!isConnected) {
    console.error('❌ Connection failed. Check your credentials!');
    return;
  }

  // Create a test file
  console.log('\n2. Creating test file...');
  const testContent = 'This is a test certificate PDF from CertiGen';
  const testFilePath = './test-certificate.txt';
  fs.writeFileSync(testFilePath, testContent);

  // Upload test file
  console.log('\n3. Uploading test file...');
  const url = await uploadToSpaces(testFilePath, 'certificates/test-certificate.txt');
  
  console.log('\n✅ Success! Your file is available at:');
  console.log(url);
  console.log('\n👆 Open this URL in your browser to verify!');

  // Clean up local test file
  fs.unlinkSync(testFilePath);
  
  console.log('\n✅ Test completed successfully!');
  console.log('🚀 DigitalOcean Spaces is ready to use!');
}

testSpaces().catch(console.error);
