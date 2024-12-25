import express from 'express';
import { createProfile, getProfile, updateProfile, deleteProfile } from '../controllers/gym_controller.js';
import { getGyms, createGym, getGym, updateGym, deleteGym } from '../controllers/gym_controller.js';

const router = express.Router();

router.get('/gyms', getGyms);

module.exports = router;
router.post('/gyms', createGym);
router.get('/gyms/:id', getGym);
router.put('/gyms/:id', updateGym);
router.delete('/gyms/:id', deleteGym);

export default router;