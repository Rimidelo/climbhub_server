// routes/gymRoutes.js

import express from 'express';
import { getGyms, createGym, updateGym, deleteGym,getGymsWithVideos } from '../controllers/gym_controller.js';

const router = express.Router();

// Define routes relative to /gyms
router.get('/', getGyms);
router.post('/', createGym);
router.put('/:id', updateGym);
router.delete('/:id', deleteGym);
router.get('/gyms-with-videos', getGymsWithVideos);

export default router;
