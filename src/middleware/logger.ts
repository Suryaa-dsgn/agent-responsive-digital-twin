import type { Request, Response, NextFunction } from 'express';

/**
 * Safely sanitize request body by redacting sensitive fields
 */
const sanitizeBody = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = [
    'password', 'passwordconfirmation', 'token', 'secret', 
    'authorization', 'creditcard', 'ssn', 'apikey', 'accesstoken',
    'refreshtoken', 'key', 'credential'
  ];
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeBody(item));
  }
  
  // Handle objects
  const sanitized = { ...data };
  
  for (const [key, value] of Object.entries(sanitized)) {
    // Check if the current key matches any sensitive field (case-insensitive)
    // Only match exact field names or with specific prefixes/suffixes to avoid over-redaction
    const keyLower = key.toLowerCase();
    const isSensitive = sensitiveFields.some(field => {
      const fieldLower = field.toLowerCase();
      // Exact match
      if (keyLower === fieldLower) return true;
      
      // Common prefixes
      if (keyLower.startsWith(`${fieldLower}_`) || 
          keyLower.startsWith(`${fieldLower}-`)) return true;
      
      // Common suffixes
      if (keyLower.endsWith(`_${fieldLower}`) || 
          keyLower.endsWith(`-${fieldLower}`)) return true;
      
      return false;
    });
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (value !== null && typeof value === 'object') {
      // Recursively sanitize nested objects and arrays
      sanitized[key] = sanitizeBody(value);
    }
  }
  
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
  
  // Log sanitized request body if it exists and is appropriate for logging
  try {
    // Check content-type to ensure we only log supported types
    const contentType = req.get('content-type') || '';
    const isJSON = contentType.includes('application/json');
    const isForm = contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');
    
    // Skip logging for binary content or large payloads
    const isBinary = contentType.includes('image/') || 
                     contentType.includes('audio/') || 
                     contentType.includes('video/') ||
                     contentType.includes('application/octet-stream');
    const bodySize = req.body ? JSON.stringify(req.body).length : 0;
    const isLargePayload = bodySize > 10000; // Skip if > 10KB
    
    if (req.body && !isBinary && !isLargePayload) {
      // Verify req.body is an object that can be logged
      const isLoggableObject = req.body && 
                              typeof req.body === 'object' && 
                              !Buffer.isBuffer(req.body) &&
                              !(req.body instanceof Uint8Array);
      
      if (isLoggableObject && Object.keys(req.body).length > 0) {
        // Skip detailed body logging in production or sanitize the body
        if (process.env.NODE_ENV === 'production') {
          console.log('Request body: [Body contents hidden in production]');
        } else {
          console.log(`Request body: ${JSON.stringify(sanitizeBody(req.body))}`);
        }
      } else if (req.body && typeof req.body === 'string') {
        // Handle string body (truncate if too long)
        const truncatedBody = req.body.length > 200 ? 
          `${req.body.substring(0, 200)}... [truncated, ${req.body.length} chars total]` : 
          req.body;
        console.log(`Request body (string): ${truncatedBody}`);
      } else if (req.body) {
        // Just log the type for other body types
        console.log(`Request body: [${typeof req.body}]`);
      }
    } else if (isBinary) {
      console.log('Request body: [Binary content not logged]');
    } else if (isLargePayload) {
      console.log(`Request body: [Large payload not logged, size: ~${Math.round(bodySize/1024)}KB]`);
    }
  } catch (err) {
    console.log(`Error logging request body: ${(err as Error).message}`);
  }
  
  // Use response finish event to capture all response types
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};