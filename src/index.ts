import express, { Request, Response } from 'express';
import { config } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  logger.http(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/health', healthRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Hi.... Image Service API',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Server running in ${config.env} mode on port ${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

export default app;
