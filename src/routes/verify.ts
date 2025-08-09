import * as express from 'express';
import { verifyEmail } from '../controllers/verify';

const router = express.Router();

/**
 * POST /api/v1/verify
 * Simulates email verification with different response formats
 */
router.post('/', verifyEmail);

export default router;