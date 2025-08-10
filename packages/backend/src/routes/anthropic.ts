import { Router } from 'express';
import { processClaudeRequest } from '../controllers/anthropic';

const router = Router();

/**
 * @route POST /api/v1/anthropic/claude
 * @desc Process request using Anthropic Claude API
 * @access Private
 */
router.post('/claude', processClaudeRequest);

export default router;
