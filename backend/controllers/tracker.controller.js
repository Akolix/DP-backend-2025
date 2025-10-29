import * as trackerService from '../services/tracker.service.js';

// Default user ID for demo (in production, use authentication)
const DEFAULT_USER = 'demo-user';

export async function logFood(req, res, next) {
    try {
        const userId = req.body.user_id || DEFAULT_USER;
        const loggedFood = await trackerService.logFood(userId, req.body);
        res.status(201).json(loggedFood);
    } catch (error) {
        next(error);
    }
}

export async function getDailyLog(req, res, next) {
    try {
        const userId = req.query.user_id || DEFAULT_USER;
        const date = req.params.date ? new Date(req.params.date) : new Date();

        const logs = await trackerService.getDailyLog(userId, date);
        res.json(logs);
    } catch (error) {
        next(error);
    }
}

export async function deleteLoggedFood(req, res, next) {
    try {
        const userId = req.query.user_id || DEFAULT_USER;
        const { id } = req.params;

        await trackerService.deleteLoggedFood(userId, id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function getDailySummary(req, res, next) {
    try {
        const userId = req.query.user_id || DEFAULT_USER;
        const date = req.query.date ? new Date(req.query.date) : new Date();

        const summary = await trackerService.getDailySummary(userId, date);
        const goals = await trackerService.getUserGoals(userId);

        res.json({
            date: date.toISOString().split('T')[0],
            summary,
            goals,
            progress: {
                calories: ((summary.totalCalories / goals.daily_goal) * 100).toFixed(1),
                protein: ((summary.totalProtein / goals.protein_goal) * 100).toFixed(1),
                carbs: ((summary.totalCarbs / goals.carbs_goal) * 100).toFixed(1),
                fat: ((summary.totalFat / goals.fat_goal) * 100).toFixed(1)
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function getUserGoals(req, res, next) {
    try {
        const userId = req.query.user_id || DEFAULT_USER;
        const goals = await trackerService.getUserGoals(userId);
        res.json(goals);
    } catch (error) {
        next(error);
    }
}

export async function updateUserGoals(req, res, next) {
    try {
        const userId = req.body.user_id || DEFAULT_USER;
        const updatedGoals = await trackerService.updateUserGoals(userId, req.body);
        res.json(updatedGoals);
    } catch (error) {
        next(error);
    }
}