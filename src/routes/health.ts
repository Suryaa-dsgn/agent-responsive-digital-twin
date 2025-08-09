import * as express from 'express';
import { HealthCheckResponse } from '../types/api';

const router = express.Router();

/**
 * GET /health
 * Health check endpoint to verify API is operational
 */
router.get('/', (req, res) => {
  const healthData: HealthCheckResponse = {
    status: 'ok',
    message: 'API Server is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0'
  };
  
  res.status(200).json(healthData);
});

export default router;