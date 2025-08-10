import { z } from 'zod';
import { VerifyRequest } from '../types/api';

/**
 * Zod schema for validating VerifyRequest
 */
export const verifyRequestSchema = z.object({
  version: z.enum(['traditional', 'ai-first']),
  email: z.string().email().optional()
}).strict();

/**
 * Type-safe validator for VerifyRequest
 */
export function validateVerifyRequest(data: unknown): { 
  success: boolean; 
  data?: VerifyRequest; 
  error?: string;
} {
  const result = verifyRequestSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { 
      success: false, 
      error: result.error.format()._errors?.length ? result.error.format()._errors.join(', ') : 'Invalid request data'
    };
  }
}
