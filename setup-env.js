#!/usr/bin/env node

/**
 * Environment Setup Script
 * 
 * This script helps set up the development environment for the Developer Digital Twin project.
 * It guides the user through creating environment files and configuring required variables.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(`\x1b[36m${question}\x1b[0m `, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Helper function to display section headers
function displayHeader(text) {
  console.log(`\n\x1b[1m\x1b[32m${text}\x1b[0m`);
  console.log('='.repeat(text.length));
}

// Helper to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Helper to copy template file to destination
function copyTemplate(templatePath, destPath) {
  if (!fileExists(templatePath)) {
    console.log(`\x1b[31mTemplate file not found: ${templatePath}\x1b[0m`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(templatePath, 'utf8');
    fs.writeFileSync(destPath, content);
    return true;
  } catch (err) {
    console.log(`\x1b[31mError copying template: ${err.message}\x1b[0m`);
    return false;
  }
}

// Helper to update env file with a value
function updateEnvFile(filePath, key, value) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the key already exists
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
    
    fs.writeFileSync(filePath, content);
    return true;
  } catch (err) {
    console.log(`\x1b[31mError updating env file: ${err.message}\x1b[0m`);
    return false;
  }
}

// Main setup function
async function setup() {
  try {
    console.log('\x1b[1m\x1b[35m');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║            Developer Digital Twin Setup                ║');
    console.log('║      Environment Configuration Helper Script           ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('\x1b[0m');
    
    console.log('This script will help you set up your development environment.');
    
    // Project root directory
    const rootDir = path.resolve(__dirname);
    const frontendDir = path.join(rootDir, 'packages', 'frontend');
    const backendDir = path.join(rootDir, 'packages', 'backend');
    
    // Check if the directories exist
    if (!fileExists(frontendDir) || !fileExists(backendDir)) {
      console.log('\x1b[31mError: Project structure is not as expected. Make sure you run this script from the project root.\x1b[0m');
      process.exit(1);
    }
    
    // Front-end setup
    displayHeader('Frontend Environment Setup');
    
    const frontendEnvTemplate = path.join(frontendDir, 'env.template');
    const frontendEnvDest = path.join(frontendDir, '.env.local');
    
    if (fileExists(frontendEnvDest)) {
      const overwriteFrontend = await ask('Frontend .env.local file already exists. Overwrite? (y/n)');
      if (overwriteFrontend.toLowerCase() !== 'y') {
        console.log('Skipping frontend environment setup.');
      } else {
        await setupFrontendEnv(frontendEnvTemplate, frontendEnvDest);
      }
    } else {
      await setupFrontendEnv(frontendEnvTemplate, frontendEnvDest);
    }
    
    // Back-end setup
    displayHeader('Backend Environment Setup');
    
    const backendEnvTemplate = path.join(backendDir, 'env.template');
    const backendEnvDest = path.join(backendDir, '.env');
    
    if (fileExists(backendEnvDest)) {
      const overwriteBackend = await ask('Backend .env file already exists. Overwrite? (y/n)');
      if (overwriteBackend.toLowerCase() !== 'y') {
        console.log('Skipping backend environment setup.');
      } else {
        await setupBackendEnv(backendEnvTemplate, backendEnvDest);
      }
    } else {
      await setupBackendEnv(backendEnvTemplate, backendEnvDest);
    }
    
    // Redis setup guidance
    displayHeader('Redis Configuration');
    console.log('Redis is used for rate limiting. You have three options:');
    console.log('1. Use Redis Cloud (recommended for production)');
    console.log('2. Use Docker (recommended for development)');
    console.log('3. Use in-memory fallback (no setup required)');
    
    const redisOption = await ask('Which Redis option do you want to use? (1/2/3)');
    
    if (redisOption === '1') {
      console.log('\nTo use Redis Cloud:');
      console.log('1. Sign up at https://redis.com/try-free/');
      console.log('2. Create a new subscription and database');
      const redisUrl = await ask('Enter your Redis Cloud URL:');
      if (redisUrl) {
        updateEnvFile(frontendEnvDest, 'REDIS_URL', redisUrl);
        console.log('\x1b[32mRedis Cloud configuration saved!\x1b[0m');
      }
    } else if (redisOption === '2') {
      console.log('\nTo use Docker:');
      console.log('Run this command in a separate terminal:');
      console.log('\x1b[33mdocker run -p 6379:6379 redis\x1b[0m');
      updateEnvFile(frontendEnvDest, 'REDIS_URL', 'redis://localhost:6379');
      console.log('\x1b[32mDocker Redis configuration saved!\x1b[0m');
    } else {
      console.log('\n\x1b[32mUsing in-memory fallback for rate limiting.\x1b[0m');
    }
    
    // Final instructions
    displayHeader('Setup Complete!');
    console.log('To start the development servers:');
    console.log('\n1. Start the backend:');
    console.log('\x1b[33m   cd packages/backend && npm run dev\x1b[0m');
    console.log('\n2. In another terminal, start the frontend:');
    console.log('\x1b[33m   cd packages/frontend && npm run dev\x1b[0m');
    console.log('\n3. Visit http://localhost:3000 in your browser');
    
    console.log('\n\x1b[32mHappy coding!\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mSetup failed:', error.message, '\x1b[0m');
  } finally {
    rl.close();
  }
}

// Function to set up frontend environment
async function setupFrontendEnv(templatePath, destPath) {
  console.log('Setting up frontend environment...');
  
  if (copyTemplate(templatePath, destPath)) {
    console.log('\x1b[32mCreated frontend .env.local file from template.\x1b[0m');
    
    // Get Anthropic API key
    const anthropicKey = await ask('Enter your Anthropic API key (get one from https://console.anthropic.com/):');
    if (anthropicKey) {
      updateEnvFile(destPath, 'ANTHROPIC_API_KEY', anthropicKey);
    }
    
    // Ask for backend URL
    const backendUrl = await ask('Enter backend URL (default: http://localhost:3001):');
    if (backendUrl) {
      updateEnvFile(destPath, 'NEXT_PUBLIC_BACKEND_URL', backendUrl);
    }
    
    // Ask for GitHub repo URL
    const repoUrl = await ask('Enter GitHub repo URL (optional):');
    if (repoUrl) {
      updateEnvFile(destPath, 'NEXT_PUBLIC_GITHUB_REPO_URL', repoUrl);
    }
    
    console.log('\x1b[32mFrontend environment configured successfully!\x1b[0m');
  }
}

// Function to set up backend environment
async function setupBackendEnv(templatePath, destPath) {
  console.log('Setting up backend environment...');
  
  if (copyTemplate(templatePath, destPath)) {
    console.log('\x1b[32mCreated backend .env file from template.\x1b[0m');
    
    // Get Anthropic API key
    console.log('We need the same Anthropic API key for the backend:');
    const anthropicKey = await ask('Enter your Anthropic API key:');
    if (anthropicKey) {
      updateEnvFile(destPath, 'ANTHROPIC_API_KEY', anthropicKey);
    }
    
    // Ask for port
    const port = await ask('Enter backend port (default: 3001):');
    if (port) {
      updateEnvFile(destPath, 'PORT', port);
    }
    
    // Ask for CORS origin
    const corsOrigin = await ask('Enter CORS origin (default: http://localhost:3000):');
    if (corsOrigin) {
      updateEnvFile(destPath, 'CORS_ORIGIN', corsOrigin);
    }
    
    console.log('\x1b[32mBackend environment configured successfully!\x1b[0m');
  }
}

// Run the setup
setup();
