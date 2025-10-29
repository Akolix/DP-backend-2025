export function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    const status = err.status || 500;
    const message = err.message || 'Internal server error';

    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

// middleware/validator.js
import Ajv from 'ajv';
import foodSchema from '../schemas/foods.schema.json' with { type: 'json' };

const ajv = new Ajv();
const validateFoodSchema = ajv.compile(foodSchema);

export function validateFood(req, res, next) {
    const valid = validateFoodSchema(req.body);

    if (!valid) {
        return res.status(400).json({
            error: 'Validation failed',
            details: validateFoodSchema.errors
        });
    }

    next();
}

export function validateLogFood(req, res, next) {
    const { barcode, product_name, energy_kcal, protein } = req.body;

    if (!barcode || !product_name || energy_kcal === undefined || protein === undefined) {
        return res.status(400).json({
            error: 'Missing required fields: barcode, product_name, energy_kcal, protein'
        });
    }

    if (req.body.meal_type && !['breakfast', 'lunch', 'dinner', 'snack'].includes(req.body.meal_type)) {
        return res.status(400).json({
            error: 'Invalid meal_type. Must be: breakfast, lunch, dinner, or snack'
        });
    }

    next();
}

export function validateGoals(req, res, next) {
    const { daily_goal, protein_goal, carbs_goal, fat_goal } = req.body;

    if (daily_goal !== undefined && (daily_goal < 0 || daily_goal > 10000)) {
        return res.status(400).json({ error: 'daily_goal must be between 0 and 10000' });
    }

    if (protein_goal !== undefined && (protein_goal < 0 || protein_goal > 1000)) {
        return res.status(400).json({ error: 'protein_goal must be between 0 and 1000' });
    }

    next();
}