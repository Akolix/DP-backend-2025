import express from 'express';
import * as foodController from '../controllers/food.controller.js';
import { validateFood } from '../middleware/validator.js';

const router = express.Router();

router.get('/search', foodController.searchFoods);
router.get('/:barcode/xml', foodController.getFoodByBarcodeXml);
router.get('/:barcode', foodController.getFoodByBarcode);
router.get('/', foodController.getAllFoods);

export default router;

// routes/tracker.routes.js
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