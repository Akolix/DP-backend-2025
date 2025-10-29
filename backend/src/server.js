import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import foodRoutes from './routes/food.routes.js';
import trackerRoutes from './routes/tracker.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { corsOptions } from './config/cors.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/foods', foodRoutes);
app.use('/api/tracker', trackerRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});