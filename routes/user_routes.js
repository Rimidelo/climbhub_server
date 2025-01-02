import express from 'express';
import multer from 'multer';
import { uploadProfileImage } from '../controllers/user_controller.js';

const router = express.Router();

// Configure multer for file uploads (using memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Route to handle profile image upload
router.post('/:userId/upload-image', upload.single('image'), uploadProfileImage);

export default router;
