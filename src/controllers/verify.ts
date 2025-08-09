import type { Request, Response, NextFunction } from 'express';
import { VerifyRequest, ApiResponse } from '../types/api';
import { ApiError } from '../middleware/errorHandler';
import { validateVerifyRequest } from '../utils/validators';

/**
 * Handles the email verification endpoint with dual response modes
 */
export const verifyEmail = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Validate the request using Zod schema
    const validationResult = validateVerifyRequest(req.body);
    
    if (!validationResult.success) {
      return next(new ApiError(400, `Invalid request. ${validationResult.error}`));
    }
    
    // We know data exists because validation succeeded
    const { version } = validationResult.data!
    
    // Generate response based on version
    if (version === 'traditional') {
      // Traditional API response - less useful for AI agents
      const response = {
        status: 'error',
        message: 'Email not verified'
      };
      
      res.status(400).json(response);
    } else {
      // AI-first API response - structured for machine consumption
      const response = {
        status: 'email_verification_required',
        remediation: 'Ensure email format is valid and domain exists',
        recommendedNextAction: 'verify_email',
        context: 'user_onboarding',
        retryable: true,
        machineReadable: true
      };
      
      res.status(400).json(response);
    }
  } catch (error) {
    next(error);
  }
};