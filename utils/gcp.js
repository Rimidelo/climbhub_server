// utils/gcp.js
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 1) We configure the GCP client
// Make sure you have your GOOGLE_APPLICATION_CREDENTIALS set or pass in keyFilename

const storage = new Storage({
  projectId: 'climbhub',
  keyFilename: path.join(process.cwd(), './climbhub-13b957184262.json'),
  // or use process.env.GOOGLE_APPLICATION_CREDENTIALS if you prefer
});

// 2) Reference your bucket
const bucketName = 'climuhb-videos';
const bucket = storage.bucket(bucketName);

// 3) A function to upload the file buffer to GCP
export const uploadToGCP = async (file) => {
  return new Promise((resolve, reject) => {
    // Create a unique filename
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    
    // Create a file object in the bucket
    const blob = bucket.file(uniqueName);

    // Set up a stream to upload the file’s buffer
    const blobStream = blob.createWriteStream({
      resumable: false, // or true if you prefer
      contentType: file.mimetype,
    });

    blobStream.on('error', (err) => {
      console.error('GCP upload error:', err);
      reject(err);
    });

    blobStream.on('finish', async () => {
      try {
        // Make the file publicly accessible (optional, depends on your needs)
        // await blob.makePublic();

        // The public URL can be accessed via
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    });

    // Finally, write the file buffer to the stream
    blobStream.end(file.buffer);
  });
};
