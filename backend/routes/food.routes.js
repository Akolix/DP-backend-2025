import express from 'express';
import * as foodController from '../controllers/food.controller.js';
import {validateFood} from "../middleware/validator.js";

const router = express.Router();

router.get('/search', foodController.searchFoods);
router.get('/:barcode/xml', foodController.getFoodByBarcodeXml);
router.get('/:barcode', foodController.getFoodByBarcode);
router.get('/', foodController.getAllFoods);

export default router;