// routes/profile.js
import express from 'express';
import { createProfile, getProfile, updateProfile, deleteProfile } from '../controllers/profile_controller.js';

const router = express.Router();

router.post('/', createProfile);
router.get('/:id', getProfile);
router.put('/:id', updateProfile);
router.delete('/:id', deleteProfile);

export default router;
