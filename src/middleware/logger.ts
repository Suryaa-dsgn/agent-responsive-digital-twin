import type { Request, Response, NextFunction } from 'express';

/**
 * Safely sanitize request body by redacting sensitive fields
 */
const sanitizeBody = (body: Record<string, any>): Record<string, any> => {
  if (!body) return {};
  
  const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'creditCard', 'ssn'];
  const sanitized = { ...body };
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * Enhanced request logger middleware with proper response tracking
 * and sensitive data protection
 */
export const requestLogger = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const start = Date.now();
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  // Log sanitized request body if it exists and isn't empty
  if (req.body && Object.keys(req.body).length > 0) {
    // Skip detailed body logging in production or sanitize the body
    if (process.env.NODE_ENV === 'production') {
      console.log('Request body: [Body contents hidden in production]');
    } else {
      console.log(`Request body: ${JSON.stringify(sanitizeBody(req.body))}`);
    }
  }
  
  // Use response finish event to capture all response types
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};