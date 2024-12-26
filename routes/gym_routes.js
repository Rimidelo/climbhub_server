// routes/gymRoutes.js

import express from 'express';
import { getGyms, createGym, getGym, updateGym, deleteGym } from '../controllers/gym_controller.js';

const router = express.Router();

// Define routes relative to /gyms
router.get('/', getGyms);
router.post('/', createGym);
router.put('/:id', updateGym);
router.delete('/:id', deleteGym);

export default router;
