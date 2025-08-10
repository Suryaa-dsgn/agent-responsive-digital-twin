/**
 * Helper to check if a value contains placeholder text
 * @param value The string to check
 * @returns boolean indicating if the value contains a placeholder
 */
export const isPlaceholderValue = (value: string): boolean => {
  const lowercaseValue = value.toLowerCase();
  
  // Check for common placeholder patterns
  const placeholderTerms = ['your', 'here', 'placeholder', 'example', 'demo', 'sample', 'test'];
  const hasPlaceholderTerms = placeholderTerms.some(term => lowercaseValue.includes(term));
  
  // Check for specific patterns with different separators (_, -, space)
  const placeholderPatterns = [
    /your[_\s-].*?here/i,
    /here[_\s-].*?your/i,
    /place[_\s-]?holder/i,
    /sample[_\s-]?value/i,
    /demo[_\s-]?value/i,
    /test[_\s-]?value/i,
    /example[_\s-]?value/i
  ];
  
  const matchesPattern = placeholderPatterns.some(pattern => pattern.test(value));
  
  return hasPlaceholderTerms || matchesPattern;
};

/**
 * Verification helper to ensure getEnvVar is not imported in client components
 * This function should be run in a script to verify correct usage
 * @param filePath Path to file to check
 * @param fileContents Contents of the file to check
 * @returns Error message if validation fails, undefined if passes
 */
export const verifyNoServerEnvInClient = (filePath: string, fileContents: string): string | undefined => {
  // Skip if this is a server component or not a component at all
  // Match 'use client' with either single or double quotes, allowing for comments and whitespace
  const clientComponentRegex = /^(?:[^\S\n]*(?:\/\/.*|\/\*[\s\S]*?\*\/|#![^\n]*)\n)*[^\S\n]*(?:'use client';|"use client";)/m;
  if (!filePath.includes('/components/') || !clientComponentRegex.test(fileContents)) {
    return undefined;
  }
  
  // Check for invalid imports
  const hasGetEnvVarImport = fileContents.includes('getEnvVar') && 
    (fileContents.includes('import { getEnvVar }') || 
     fileContents.includes('import {getEnvVar}'));
  
  const hasValidateEnvironmentImport = fileContents.includes('validateEnvironment') && 
    (fileContents.includes('import { validateEnvironment }') || 
     fileContents.includes('import {validateEnvironment}'));
  
  const hasProcessEnvDynamicAccess = /process\.env\[/i.test(fileContents);
  
  if (hasGetEnvVarImport || hasValidateEnvironmentImport || hasProcessEnvDynamicAccess) {
    return `Error in ${filePath}: Client component should not use server-side environment functions. ` +
      `Use the exported constants from validateEnv.ts instead (e.g., PUBLIC_BACKEND_URL).`;
  }
  
  return undefined;
};

/**
 * Validates that required environment variables are present and don't contain placeholder values
 * @returns boolean indicating if all required environment variables are valid
 */
export const validateEnvironment = (): boolean => {
  const requiredVars: EnvVarKey[] = ['NEXT_PUBLIC_BACKEND_URL'];
  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.error(
      `Error: Missing required environment variables: ${missingVars.join(', ')}\n` +
      `Please make sure you have a .env.local file in the Next.js app root directory with the required variables.\n` +
      `See .env.example for the required variables.`
    );
    return false;
  }
  
  const placeholderVars = requiredVars.filter(
    (varName) => process.env[varName] && isPlaceholderValue(process.env[varName] as string)
  );
  
  if (placeholderVars.length > 0) {
    console.error(
      `Error: Environment variables contain placeholder values: ${placeholderVars.join(', ')}\n` +
      `Please update your .env.local file in the Next.js app root directory with actual values.\n` +
      `Placeholder values like "your_*" or similar are not valid for production use.`
    );
    return false;
  }
  
  return true;
};

/**
 * Type definition for environment variable keys to ensure type safety
 */
export type EnvVarKey = 
  // Server-side environment variables
  | 'API_URL'
  | 'ANTHROPIC_API_KEY'
  // Client-side public environment variables
  | 'NEXT_PUBLIC_BACKEND_URL';

/**
 * Pre-validated static environment variables for client components
 * Use these constants in client components instead of getEnvVar
 */
export const PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

// Validate public env vars and warn about missing ones
if (!PUBLIC_BACKEND_URL || isPlaceholderValue(PUBLIC_BACKEND_URL)) {
  console.warn('NEXT_PUBLIC_BACKEND_URL is missing or contains a placeholder value');
}

/**
 * Helper that validates a specific environment variable
 * @param key The environment variable key to check
 * @param defaultValue Optional default value
 * @returns The environment variable value or default
 * @throws Error if the variable is missing and no default is provided
 * @warning DO NOT USE THIS FUNCTION IN CLIENT COMPONENTS - it uses dynamic access to process.env which breaks in client code
 * @warning Use the exported constants instead for client code (e.g., PUBLIC_BACKEND_URL)
 */
export const getEnvVar = (key: EnvVarKey, defaultValue?: string): string => {
  // Check if this is being called from client component
  if (typeof window !== 'undefined' && !key.startsWith('NEXT_PUBLIC_')) {
    console.error(`getEnvVar('${key}') called from client component! Use exported constants instead.`);
  }
  
  const value = process.env[key];
  
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  // Check if it's a placeholder value from .env.example
  if (isPlaceholderValue(value)) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    
    throw new Error(`Environment variable ${key} contains a placeholder value. Please update it with your actual value.`);
  }
  
  return value;
};
