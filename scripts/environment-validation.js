#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * This script provides a more detailed validation of environment variables for both
 * development and production environments. It checks:
 * 
 * 1. Required environment variables
 * 2. Format validation (URLs, API keys, etc)
 * 3. Environment-specific requirements
 */

const fs = require('fs');
const path = require('path');

const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Environment variable definitions
const environmentVariables = {
  common: [
    { 
      name: 'ANTHROPIC_API_KEY', 
      required: true, 
      description: 'Anthropic API key for Claude',
      validate: (val) => val && val.length > 10 && val.startsWith('sk-ant-')
    },
    { 
      name: 'NEXT_PUBLIC_ENABLE_AI_FEATURES', 
      required: false, 
      description: 'Feature flag for AI functionality',
      validate: (val) => val == null ? true : ['true', 'false'].includes(String(val).toLowerCase())
    },
  ],
  development: [
    { 
      name: 'NEXT_PUBLIC_BACKEND_URL', 
      required: true, 
      description: 'Backend URL for local development',
      validate: (val) => val && (val.startsWith('http://localhost') || val.startsWith('https://localhost'))
    },
  ],
  production: [
    { 
      name: 'NEXT_PUBLIC_BACKEND_URL', 
      required: true, 
      description: 'Backend URL for production',
      validate: (val) => val && val.startsWith('https://') 
    },
    { 
      name: 'REDIS_URL', 
      required: false, 
      description: 'Redis URL for rate limiting',
      validate: (val) => !val || val.startsWith('redis://') 
    },
  ]
};

// Main validation function
function validateEnvironment() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`${colors.blue}=== Environment Validation (${nodeEnv}) ===\n${colors.reset}`);

  // Validate if the environment is supported
  const supportedEnvironments = Object.keys(environmentVariables).filter(key => key !== 'common');
  
  if (!environmentVariables.hasOwnProperty(nodeEnv)) {
    console.log(`${colors.red}ERROR: Unsupported NODE_ENV value: "${nodeEnv}"${colors.reset}`);
    console.log(`${colors.yellow}Supported environments: ${supportedEnvironments.join(', ')}${colors.reset}`);
    process.exit(1);
  }

  // Combine common and environment-specific variables
  const varsToCheck = [
    ...environmentVariables.common,
    ...environmentVariables[nodeEnv]
  ];

  // Results tracking
  let errors = 0;
  let warnings = 0;
  
  // Check each variable
  varsToCheck.forEach(variable => {
    const { name, required, description, validate } = variable;
    const value = process.env[name];
    
    process.stdout.write(`Checking ${name}... `);
    
    // Check if required variable is missing
    if (required && !value) {
      console.log(`${colors.red}MISSING (Required)${colors.reset}`);
      console.log(`  ${description}`);
      errors++;
      return;
    }
    
    // If variable exists, validate it
    if (value) {
      const isValid = validate ? validate(value) : true;
      if (isValid) {
        console.log(`${colors.green}VALID${colors.reset}`);
      } else {
        console.log(`${colors.red}INVALID FORMAT${colors.reset}`);
        console.log(`  ${description}`);
        errors++;
      }
    } else {
      console.log(`${colors.yellow}NOT SET (Optional)${colors.reset}`);
      warnings++;
    }
  });
  
  // Summary
  console.log(`\n${colors.blue}=== Validation Summary ===\n${colors.reset}`);
  if (errors === 0) {
    console.log(`${colors.green}✓ All required environment variables are valid.${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Found ${errors} error(s) in environment configuration.${colors.reset}`);
  }
  
  if (warnings > 0) {
    console.log(`${colors.yellow}⚠ ${warnings} optional variable(s) not set.${colors.reset}`);
  }
  
  // Exit with error code if validation fails
  if (errors > 0) {
    process.exit(1);
  }
}

// Execute validation
validateEnvironment();
