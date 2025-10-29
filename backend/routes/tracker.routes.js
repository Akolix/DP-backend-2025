import express from 'express';
import * as trackerController from '../controllers/tracker.controller.js';
import { validateLogFood, validateGoals } from '../middleware/validator.js';

const router = express.Router();

router.post('/log', validateLogFood, trackerController.logFood);
router.get('/daily/:date?', trackerController.getDailyLog);
router.delete('/log/:id', trackerController.deleteLoggedFood);
router.get('/summary', trackerController.getDailySummary);
router.get('/goals', trackerController.getUserGoals);
router.put('/goals', validateGoals, trackerController.updateUserGoals);

export default router;