/**
 * Helper to check if a value contains placeholder text
 * @param value The string to check
 * @returns boolean indicating if the value contains a placeholder
 */
export const isPlaceholderValue = (value: string): boolean => {
  return value.includes('your_') && value.includes('_here');
};

/**
 * Validates that required environment variables are present
 * @returns boolean indicating if all required environment variables are set
 */
export const validateEnvironment = (): boolean => {
  const requiredVars = ['NEXT_PUBLIC_BACKEND_URL'];
  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.error(
      `Error: Missing required environment variables: ${missingVars.join(', ')}\n` +
      `Please make sure you have a .env.local file in the project root with the required variables.\n` +
      `See .env.example for the required variables.`
    );
    return false;
  }
  
  return true;
};

/**
 * Helper that validates a specific environment variable
 * @param key The environment variable key to check
 * @param defaultValue Optional default value
 * @returns The environment variable value or default
 * @throws Error if the variable is missing and no default is provided
 */
export const getEnvVar = (key: string, defaultValue?: string): string => {
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
