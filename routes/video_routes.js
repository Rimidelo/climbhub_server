// routes/video_routes.js
import express from 'express';
import multer from 'multer';
import { uploadVideo } from '../controllers/videos_controller.js';

const router = express.Router();

// We use Multer to parse multipart/form-data, but we won't store locally
// We'll just pass the file buffer along to our GCP helper function
const storage = multer.memoryStorage(); // store file in memory as a buffer
const upload = multer({ storage });

router.post('/', upload.single('videoFile'), uploadVideo);

export default router;
