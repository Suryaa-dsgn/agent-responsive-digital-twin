#!/usr/bin/env node

/**
 * Pre-Deployment Test Script
 * 
 * This script runs a comprehensive suite of tests before deployment:
 * 1. Linting
 * 2. Type checking
 * 3. Unit tests
 * 4. API integration tests
 * 5. Build verification
 */

const { execSync } = require('child_process');

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
  timeout: 60000, // 60 seconds timeout for each command
};

/**
 * Execute a command with proper error handling
 */
function executeCommand(command, name) {
  console.log(`\n${colors.cyan}Running ${name}...${colors.reset}`);
  console.log(`$ ${command}\n`);
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      timeout: config.timeout 
    });
    console.log(`${colors.green}✓ ${name} passed${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ ${name} failed${colors.reset}`);
    return false;
  }
}

/**
 * Main test function
 */
function runTests() {
  console.log(`${colors.blue}=== Pre-Deployment Test Suite ===\n${colors.reset}`);
  
  let allPassed = true;
  
  // Step 1: Validate environment variables
  allPassed = executeCommand('node scripts/environment-validation.js', 'Environment validation') && allPassed;
  
  // Step 2: Run linting
  allPassed = executeCommand('npm run lint', 'Linting') && allPassed;
  
  // Step 3: Run type checking
  allPassed = executeCommand('cd packages/frontend && npm run check-types', 'TypeScript type checking (frontend)') && allPassed;
  
  // Step 4: Run unit tests
  allPassed = executeCommand('npm run test', 'Unit tests') && allPassed;
  
  // Step 5: Run API tests if backend is available
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const testCommand = `cross-env BACKEND_URL=${backendUrl} npm run test:api`;
    allPassed = executeCommand(testCommand, 'API integration tests') && allPassed;
  } catch (error) {
    console.error(`${colors.red}✗ API tests failed with error:${colors.reset}`);
    console.error(error.message);
    console.error(error.stack);
    allPassed = false;
    // Uncomment the next line to fail fast on API test errors
    // process.exit(1);
  }
  
  // Step 6: Test the build process
  allPassed = executeCommand('npm run build', 'Build verification') && allPassed;
  
  // Summary
  console.log(`\n${colors.blue}=== Test Results ===\n${colors.reset}`);
  if (allPassed) {
    console.log(`${colors.green}✓ All tests passed! The application is ready for deployment.${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Some tests failed. Please fix the issues before deploying.${colors.reset}`);
    process.exit(1);
  }
}

// Execute tests
runTests();
