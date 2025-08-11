#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies that a deployment is working correctly by:
 * 1. Checking that all required environment variables are set
 * 2. Checking that the backend API is accessible
 * 3. Performing basic health checks on critical endpoints
 */

const axios = require('axios');
require('dotenv').config();

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

// Configuration
const config = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
  frontendUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
  requiredEnvVars: [
    'NEXT_PUBLIC_BACKEND_URL',
    'NEXT_PUBLIC_ENABLE_AI_FEATURES',
    'ANTHROPIC_API_KEY'
  ],
  endpoints: [
    { url: '/health', name: 'Health Check' },
    { url: '/api/backend/health', name: 'Backend API' }
  ]
};

/**
 * Main verification function
 */
async function verifyDeployment() {
  console.log(`${colors.blue}=== Deployment Verification ===\n${colors.reset}`);
  
  // Step 1: Check environment variables
  verifyEnvironmentVariables();
  
  // Step 2: Check endpoints
  await verifyEndpoints();
  
  console.log(`\n${colors.blue}=== Verification Complete ===\n${colors.reset}`);
}

/**
 * Verify that all required environment variables are set
 */
function verifyEnvironmentVariables() {
  console.log(`${colors.cyan}Checking environment variables...${colors.reset}`);
  
  let allValid = true;
  
  for (const envVar of config.requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`${colors.green}✓ ${envVar} is set${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${envVar} is NOT set${colors.reset}`);
      allValid = false;
    }
  }
  
  if (allValid) {
    console.log(`${colors.green}All required environment variables are set!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}Warning: Some environment variables are missing!${colors.reset}`);
  }
}

/**
 * Verify that all endpoints are accessible
 */
async function verifyEndpoints() {
  console.log(`\n${colors.cyan}Checking API endpoints...${colors.reset}`);
  
  for (const endpoint of config.endpoints) {
    const url = `${config.backendUrl}${endpoint.url}`;
    try {
      console.log(`Testing ${endpoint.name}: ${url}`);
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`${colors.green}✓ ${endpoint.name} is available (${response.status})${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ ${endpoint.name} returned status ${response.status}${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.red}✗ ${endpoint.name} is not available: ${error.message}${colors.reset}`);
    }
  }
}

// Execute verification
verifyDeployment()
  .then(() => {
    console.log(`${colors.green}Deployment verification completed successfully!${colors.reset}`);
  })
  .catch((error) => {
    console.error(`${colors.red}Error during deployment verification: ${error.message}${colors.reset}`);
    process.exit(1);
  });
