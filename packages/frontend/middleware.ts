import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const config = {
  matcher: '/:path*',
};

export function middleware(request: NextRequest) {
  // Generate a unique nonce for this request
  const nonce = crypto.randomBytes(16).toString('base64');
  
  // Get the response
  const response = NextResponse.next();
  
  // Store the nonce in a request header so it can be accessed by pages
  response.headers.set('x-nonce', nonce);
  
  // Define CSP based on environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Define allowed domains for scripts, styles, etc.
  const connectSrc = ['\'self\''];
  const imgSrc = ['\'self\'', 'data:'];
  const fontSrc = ['\'self\'', 'https://fonts.gstatic.com'];
  const styleSrc = ['\'self\'', 'https://fonts.googleapis.com'];
  
  // Add additional sources as needed for third-party services
  // Example: if using Google Analytics, uncomment these lines
  // scriptSrc.push('https://www.googletagmanager.com', 'https://www.google-analytics.com');
  // connectSrc.push('https://www.google-analytics.com');
  
  // Build the CSP header based on environment
  let scriptSrc, cspHeader;
  
  if (isDevelopment) {
    // Relaxed policy for development
    scriptSrc = ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''];
    styleSrc.push('\'unsafe-inline\'');
    
    // Build CSP for development
    cspHeader = [
      `default-src 'self'`,
      `script-src ${scriptSrc.join(' ')}`,
      `style-src ${styleSrc.join(' ')}`,
      `img-src ${imgSrc.join(' ')}`,
      `font-src ${fontSrc.join(' ')}`,
      `connect-src ${connectSrc.join(' ')}`,
      `base-uri 'self'`,
      `form-action 'self'`
    ].join('; ');
  } else {
    // Strict policy for production with nonce
    scriptSrc = [`'self'`, `'nonce-${nonce}'`, '\'strict-dynamic\''];
    styleSrc.push(`'nonce-${nonce}'`);
    
    // Build CSP for production
    cspHeader = [
      `default-src 'self'`,
      `script-src ${scriptSrc.join(' ')}`,
      `style-src ${styleSrc.join(' ')}`,
      `img-src ${imgSrc.join(' ')}`,
      `font-src ${fontSrc.join(' ')}`,
      `connect-src ${connectSrc.join(' ')}`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`,
      `upgrade-insecure-requests`
    ].join('; ');
  }
  
  // Set CSP header
  response.headers.set('Content-Security-Policy', cspHeader);
  
  // Add additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Set the Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
  
  return response;
}
