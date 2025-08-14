import { headers } from 'next/headers';
import { cache } from 'react';
import React from 'react';

/**
 * Gets the CSP nonce from headers for the current request
 * Use this in Server Components or Route Handlers to retrieve the nonce
 * This function is cached per-request to avoid multiple header lookups
 */
export const getNonce = cache((): string => {
  try {
    const headersList = headers();
    const nonce = headersList.get('x-nonce') || '';
    return nonce;
  } catch (e) {
    // If headers() fails (client component), return empty string
    // Client components should use the NonceScript or Script component
    return '';
  }
});

/**
 * Script component with automatic nonce attribute
 * Use this instead of raw script tags in server components
 */
export function NonceScript({ 
  children, 
  ...props 
}: React.ScriptHTMLAttributes<HTMLScriptElement> & { 
  children?: React.ReactNode 
}): React.ReactElement {
  const nonce = getNonce();
  
  return React.createElement(
    'script',
    { ...props, nonce },
    children
  );
}

/**
 * Style component with automatic nonce attribute
 * Use this instead of raw style tags in server components
 */
export function NonceStyle({
  children,
  ...props
}: React.StyleHTMLAttributes<HTMLStyleElement> & {
  children?: React.ReactNode
}): React.ReactElement {
  const nonce = getNonce();
  
  return React.createElement(
    'style',
    { ...props, nonce },
    children
  );
}
