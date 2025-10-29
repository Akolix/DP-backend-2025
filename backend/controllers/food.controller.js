import * as foodService from '../services/food.service.js';
import * as openFoodFactsService from '../services/openfoodfacts.service.js';
import * as xmlService from '../services/xml.service.js';

export async function getFoodByBarcode(req, res, next) {
    try {
        const { barcode } = req.params;
        const food = await foodService.getFoodByBarcode(barcode);

        if (!food) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(food);
    } catch (error) {
        next(error);
    }
}

export async function getFoodByBarcodeXml(req, res, next) {
    try {
        const { barcode } = req.params;
        const food = await foodService.getFoodByBarcode(barcode);

        if (!food) {
            return res.status(404).send('Product not found');
        }

        const xml = xmlService.convertToXml(food);
        await xmlService.validateXml(xml);

        res.type('application/xml').send(xml);
    } catch (error) {
        next(error);
    }
}

export async function getAllFoods(req, res, next) {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const foods = await foodService.getAllFoods(limit, offset);
        res.json(foods);
    } catch (error) {
        next(error);
    }
}

export async function searchFoods(req, res, next) {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({ error: 'Query must be at least 2 characters' });
        }

        // First search local database
        const localResults = await foodService.searchFoodsByName(q);

        // If not enough results, search OpenFoodFacts
        if (localResults.length < 5) {
            const externalResults = await openFoodFactsService.searchProducts(q);
            return res.json({
                source: 'mixed',
                local: localResults,
                external: externalResults.slice(0, 10)
            });
        }

        res.json({
            source: 'local',
            results: localResults
        });
    } catch (error) {
        next(error);
    }
}