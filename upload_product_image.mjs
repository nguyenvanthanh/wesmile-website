import { storagePut } from './server/storage.ts';
import fs from 'fs';
import path from 'path';

// Read the image file
const imagePath = '/home/ubuntu/upload/WeSmilePro3+1.png';
const imageData = fs.readFileSync(imagePath);

// Upload to S3
const result = await storagePut(
  'products/wesmile-pro-3+1-main.png',
  imageData,
  'image/png'
);

console.log('Upload successful!');
console.log('URL:', result.url);
console.log('Key:', result.key);
