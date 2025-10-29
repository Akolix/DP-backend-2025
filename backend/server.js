import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import foodRoutes from './routes/food.routes.js';
import trackerRoutes from './routes/tracker.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { corsOptions } from './config/cors.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend/ directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes (must be before static files and catch-all)
app.use('/api/foods', foodRoutes);
app.use('/api/tracker', trackerRoutes);

// Serve Angular static files
const frontendDistPath = path.join(__dirname, '../frontend/dist/frontend');
app.use(express.static(frontendDistPath));

// Catch-all route: send index.html for any non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Serving frontend from: ${frontendDistPath}`);
});