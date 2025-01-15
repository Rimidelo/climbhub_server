// routes/profile.js
import express from 'express';
import { createProfile, getProfile, updateProfile, deleteProfile,searchProfiles } from '../controllers/profile_controller.js';

const router = express.Router();

router.post('/', createProfile);
router.get('/search', searchProfiles);
router.get('/:id', getProfile);
router.put('/:id', updateProfile);
router.delete('/:id', deleteProfile);


export default router;
