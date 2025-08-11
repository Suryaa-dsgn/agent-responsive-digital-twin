#!/usr/bin/env ts-node

/**
 * Environment Validation Script
 * 
 * This script validates that all required environment variables are properly set.
 * It checks both frontend and backend environment files.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Define required environment variables for frontend and backend
const REQUIRED_FRONTEND_VARS = ['NEXT_PUBLIC_BACKEND_URL', 'ANTHROPIC_API_KEY'];
const REQUIRED_BACKEND_VARS = ['PORT', 'CORS_ORIGIN', 'ANTHROPIC_API_KEY'];

// Function to check if a value is a placeholder
function isPlaceholder(value: string): boolean {
  const lowercaseValue = value.toLowerCase();
  const placeholders = ['your', 'here', 'placeholder', 'example', 'demo', 'sample', 'test'];
  return placeholders.some(term => lowercaseValue.includes(term));
}

// Function to validate an environment file
function validateEnvFile(filePath: string, requiredVars: string[]): boolean {
  console.log(`Validating ${filePath}...`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: ${filePath} does not exist`);
    return false;
  }
  
  // Load environment variables from file
  let envConfig;
  try {
    envConfig = dotenv.parse(fs.readFileSync(filePath));
  } catch (error) {
    console.error(`❌ Error parsing ${filePath}: ${error.message}`);
    console.error('The environment file might be malformed or inaccessible');
    return false;
  }
  
  let isValid = true;
  const missing: string[] = [];
  const placeholders: string[] = [];
  
  // Check each required variable
  for (const varName of requiredVars) {
    if (!envConfig[varName]) {
      missing.push(varName);
      isValid = false;
    } else if (isPlaceholder(envConfig[varName])) {
      placeholders.push(varName);
      isValid = false;
    }
  }
  
  // Output results
  if (missing.length > 0) {
    console.error(`❌ Missing required variables in ${filePath}: ${missing.join(', ')}`);
  }
  
  if (placeholders.length > 0) {
    console.error(`❌ Placeholder values detected in ${filePath}: ${placeholders.join(', ')}`);
  }
  
  if (isValid) {
    console.log(`✅ ${filePath} is valid!`);
  }
  
  return isValid;
}

// Main function
function validateEnvironments(): void {
  console.log('🔍 Validating environment configurations...');
  
  const rootDir = process.cwd();
  const frontendEnvPath = path.join(rootDir, 'packages', 'frontend', '.env.local');
  const backendEnvPath = path.join(rootDir, 'packages', 'backend', '.env');
  
  const frontendValid = validateEnvFile(frontendEnvPath, REQUIRED_FRONTEND_VARS);
  const backendValid = validateEnvFile(backendEnvPath, REQUIRED_BACKEND_VARS);
  
  if (frontendValid && backendValid) {
    console.log('✅ All environment files are valid!');
    process.exit(0);
  } else {
    console.error('❌ Environment validation failed.');
    console.log('\nPlease fix the issues above, or run the setup script:');
    console.log('  node setup-env.js');
    process.exit(1);
  }
}

// Run the validation
validateEnvironments();