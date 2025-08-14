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
const readlineSync = require('readline-sync');
const { execSync } = require('child_process');
const { Writable } = require('stream');

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions with input validation
function ask(question) {
  return new Promise((resolve) => {
    rl.question(`\x1b[36m${question}\x1b[0m `, (answer) => {
      const trimmed = answer.trim();
      
      // Reject inputs with potentially dangerous characters
      if (trimmed.includes('\n') || trimmed.includes('\r')) {
        console.log('\x1b[31mInvalid input: newlines not allowed\x1b[0m');
        return ask(question).then(resolve);
      }
      
      // Check for command injection attempts
      if (/[;&|`$()]/.test(trimmed)) {
        console.log('\x1b[31mInvalid input: potentially dangerous characters detected\x1b[0m');
        return ask(question).then(resolve);
      }
      
      // Check for extremely long inputs that might be used for DoS
      if (trimmed.length > 1000) {
        console.log('\x1b[31mInvalid input: input too long\x1b[0m');
        return ask(question).then(resolve);
      }
      
      // Check for null bytes which can cause issues in some systems
      if (trimmed.includes('\0')) {
        console.log('\x1b[31mInvalid input: null bytes not allowed\x1b[0m');
        return ask(question).then(resolve);
      }
      
      resolve(trimmed);
    });
  });
}

// Helper function to ask for sensitive information (like passwords/API keys)
function askSecret(question) {
  return new Promise((resolve) => {
    // Create a writable stream that doesn't write the input
    const muted = new Writable({
      write: function(chunk, encoding, callback) {
        callback();
      }
    });
    
    // Create custom readline interface that doesn't echo input
    const secureRl = readline.createInterface({
      input: process.stdin,
      output: muted,
      terminal: true
    });
    
    process.stdout.write(`\x1b[36m${question}\x1b[0m `);
    
    // Save the original configurations
    const originalStdinRawMode = process.stdin.isRaw;
    
    // Set raw mode to handle input manually
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    
    let input = '';
    
    // Create listeners for stdin
    const onData = (key) => {
      // Ctrl+C
      if (key.toString() === '\u0003') {
        process.exit();
      }
      
      // Enter key
      if (key.toString() === '\r' || key.toString() === '\n') {
        process.stdout.write('\n');
        cleanup();
        
        // Enhanced validation for secure input
        if (input.includes('\n') || input.includes('\r')) {
          console.log('\x1b[31mInvalid input: newlines not allowed\x1b[0m');
          // Restart the askSecret function
          return askSecret(question).then(resolve);
        }
        
        // Check for command injection attempts
        if (/[;&|`$()]/.test(input)) {
          console.log('\x1b[31mInvalid input: potentially dangerous characters detected\x1b[0m');
          return askSecret(question).then(resolve);
        }
        
        // Check for extremely long inputs that might be used for DoS
        if (input.length > 1000) {
          console.log('\x1b[31mInvalid input: input too long\x1b[0m');
          return askSecret(question).then(resolve);
        }
        
        // Check for null bytes which can cause issues in some systems
        if (input.includes('\0')) {
          console.log('\x1b[31mInvalid input: null bytes not allowed\x1b[0m');
          return askSecret(question).then(resolve);
        }
        
        resolve(input);
        return;
      }
      
      // Backspace/Delete
      if (key.toString() === '\u007f' || key.toString() === '\b') {
        if (input.length > 0) {
          input = input.substring(0, input.length - 1);
          process.stdout.write('\b \b'); // Erase last * character
        }
        return;
      }
      
      // Regular character
      input += key.toString();
      process.stdout.write('*');
    };
    
    const cleanup = () => {
      // Restore original settings
      process.stdin.removeListener('data', onData);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(originalStdinRawMode);
      }
      secureRl.close();
    };
    
    // Listen for user input
    process.stdin.on('data', onData);
    
    // Handle interruption
    secureRl.on('SIGINT', () => {
      cleanup();
      process.exit();
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

// Helper to copy template file to destination securely
function copyTemplate(templatePath, destPath) {
  // Validate paths
  if (!templatePath || typeof templatePath !== 'string' || templatePath.trim() === '') {
    console.log('\x1b[31mError: Invalid template path provided\x1b[0m');
    return false;
  }
  
  if (!destPath || typeof destPath !== 'string' || destPath.trim() === '') {
    console.log('\x1b[31mError: Invalid destination path provided\x1b[0m');
    return false;
  }
  
  // Prevent directory traversal
  if (templatePath.includes('..') || destPath.includes('..')) {
    console.log('\x1b[31mError: Path contains directory traversal patterns\x1b[0m');
    return false;
  }
  
  // Ensure template path ends with expected extensions
  if (!templatePath.endsWith('.template') && !templatePath.endsWith('env.template')) {
    console.log('\x1b[31mWarning: Template file has unexpected extension\x1b[0m');
  }
  
  // Ensure destination path is an env file
  if (!destPath.endsWith('.env') && !destPath.endsWith('.env.local')) {
    console.log('\x1b[31mError: Destination must be an env file\x1b[0m');
    return false;
  }
  
  if (!fileExists(templatePath)) {
    console.log(`\x1b[31mTemplate file not found: ${templatePath}\x1b[0m`);
    return false;
  }
  
  try {
    // Get file size
    const stats = fs.statSync(templatePath);
    
    // Check for unusually large files (potential DoS)
    if (stats.size > 1024 * 50) { // 50KB limit for env files
      console.log('\x1b[31mWarning: Template file is unusually large\x1b[0m');
      const readlineSync = require('readline-sync');
      const proceed = readlineSync.question('Do you want to continue? (y/n): ').trim().toLowerCase();
      if (proceed !== 'y') {
        return false;
      }
    }
    
    // Use native OS copy commands which preserve encoding better
    if (process.platform === 'win32') {
      // On Windows, use the copy command
      try {
        const { execSync } = require('child_process');
        // Use cmd.exe to run the copy command
        execSync(`copy "${templatePath.replace(/"/g, '""')}" "${destPath.replace(/"/g, '""')}"`, { shell: 'cmd.exe' });
      } catch (copyErr) {
        // Fallback to fs.copyFileSync if the command fails
        fs.copyFileSync(templatePath, destPath);
      }
    } else {
      // On Unix systems, use copyFileSync
      fs.copyFileSync(templatePath, destPath);
    }
    
    // Set secure permissions
    try {
      fs.chmodSync(destPath, 0o600); // Only owner can read/write
    } catch (permErr) {
      console.log('\x1b[33mWarning: Could not set secure permissions\x1b[0m');
    }
    
    return true;
  } catch (err) {
    console.log(`\x1b[31mError copying template: ${err.message}\x1b[0m`);
    return false;
  }
}

// Helper to update env file with a value
function updateEnvFile(filePath, key, value) {
  try {
    // Validate filePath
    if (!filePath || typeof filePath !== 'string' || filePath.trim() === '') {
      console.log('\x1b[31mError: Invalid file path provided\x1b[0m');
      return false;
    }
    
    // Prevent directory traversal by ensuring filePath doesn't contain suspicious patterns
    if (filePath.includes('..') || !filePath.endsWith('.env') && !filePath.endsWith('.env.local')) {
      console.log('\x1b[31mError: Invalid env file path\x1b[0m');
      return false;
    }
    
    // Validate key and value for security
    if (!key || typeof key !== 'string' || key.length === 0) {
      console.log('\x1b[31mError: Invalid key provided\x1b[0m');
      return false;
    }
    
    // Validate key format (allow only alphanumeric, underscore)
    if (!/^[A-Za-z0-9_]+$/.test(key)) {
      console.log('\x1b[31mError: Environment variable keys should only contain letters, numbers, and underscores\x1b[0m');
      return false;
    }
    
    // Maximum key length to prevent excessive data
    if (key.length > 100) {
      console.log('\x1b[31mError: Environment variable key is too long\x1b[0m');
      return false;
    }
    
    // Validate value to prevent injection
    if (value === undefined || value === null) {
      console.log('\x1b[31mError: Value cannot be null or undefined\x1b[0m');
      return false;
    }
    
    // Ensure value is a string and sanitize
    let stringValue = String(value);
    
    // Maximum value length to prevent excessive data
    if (stringValue.length > 5000) {
      console.log('\x1b[31mError: Environment variable value is too long\x1b[0m');
      return false;
    }
    
    // Check for null bytes which can cause issues in some systems
    if (stringValue.includes('\0')) {
      console.log('\x1b[31mError: Value contains null bytes which are not allowed\x1b[0m');
      return false;
    }
    
    // Check for problematic characters in value
    const dangerousPatterns = ['`', '$(', '${', ';', '&&', '||', '|', '>', '<', '\\n'];
    const foundPattern = dangerousPatterns.find(pattern => stringValue.includes(pattern));
    
    if (foundPattern) {
      console.log(`\x1b[31mError: Value contains "${foundPattern}" which could be used for command injection\x1b[0m`);
      console.log('\x1b[31mRejecting value for security reasons\x1b[0m');
      return false;
    }
    
    // Read content and validate file exists
    if (!fs.existsSync(filePath)) {
      console.log('\x1b[33mFile does not exist, creating it\x1b[0m');
      // Create empty file with UTF-8 BOM for Windows compatibility
      const emptyWithBOM = Buffer.from([0xEF, 0xBB, 0xBF]);
      fs.writeFileSync(filePath, emptyWithBOM, { mode: 0o600 }); // Secure permissions
    }
    
    let content = fs.readFileSync(filePath, {encoding: 'utf8'});
    
    // Escape regex special characters in the key
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Check if the key already exists
    const regex = new RegExp(`^${escapedKey}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${stringValue}`);
    } else {
      // Ensure there's a newline at the end if file is not empty
      if (content.length > 0 && !content.endsWith('\n')) {
        content += '\n';
      }
      content += `${key}=${stringValue}`;
    }
    
    // Use atomic write pattern with a temporary file
    const tempFilePath = `${filePath}.tmp`;
    // Get original file mode to preserve permissions
    const stats = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    // Write to temp file with restricted permissions - use BOM for Windows compatibility
    const bomHeader = Buffer.from([0xEF, 0xBB, 0xBF]);
    const contentBuffer = Buffer.from(content, 'utf8');
    const dataWithBOM = Buffer.concat([bomHeader, contentBuffer]);
    fs.writeFileSync(tempFilePath, dataWithBOM, { mode: 0o600 }); // Only owner can read/write
    // Preserve original file mode if it existed
    if (stats) {
      fs.chmodSync(tempFilePath, stats.mode);
    }
    // Atomically replace the original file
    fs.renameSync(tempFilePath, filePath);
    
    return true;
  } catch (err) {
    console.log(`\x1b[31mError updating env file: ${err.message}\x1b[0m`);
    return false;
  }
}

// Helper to validate URLs
function validateUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return { valid: false, message: 'URL cannot be empty' };
  }
  
  const trimmedUrl = url.trim();
  
  // Check for potentially dangerous characters
  if (/[;&|`$()]/.test(trimmedUrl)) {
    return { 
      valid: false, 
      message: 'URL contains potentially dangerous characters' 
    };
  }
  
  // Check for extremely long URLs that might be used for DoS
  if (trimmedUrl.length > 2000) {
    return { 
      valid: false, 
      message: 'URL is too long (exceeds 2000 characters)' 
    };
  }
  
  // Check for null bytes which can cause issues in some systems
  if (trimmedUrl.includes('\0')) {
    return { 
      valid: false, 
      message: 'URL contains null bytes which are not allowed' 
    };
  }
  
  // Check if it's a valid URL format
  try {
    const urlObj = new URL(trimmedUrl);
    
    // Validate protocol (only allow http/https)
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:' && 
        urlObj.protocol !== 'redis:' && urlObj.protocol !== 'rediss:') {
      return { 
        valid: false, 
        message: `Invalid protocol: ${urlObj.protocol}. Only http:, https:, redis:, and rediss: are allowed.` 
      };
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, message: 'Invalid URL format' };
  }
}

// Helper to validate API keys
function validateApiKey(key, type = 'general') {
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return { valid: false, message: 'API key cannot be empty' };
  }
  
  // Remove any whitespace
  const trimmedKey = key.trim();
  
  // General API key validation
  if (trimmedKey.length < 10) {
    return { 
      valid: false, 
      message: 'API key appears too short (should be at least 10 characters)'
    };
  }
  
  if (trimmedKey.length > 200) {
    return { 
      valid: false, 
      message: 'API key appears too long (exceeds 200 characters)'
    };
  }
  
  // Check for common API key patterns based on type
  if (type === 'anthropic') {
    // Warn if it doesn't match expected pattern but don't reject
    if (!trimmedKey.startsWith('sk-ant-')) {
      console.log('\x1b[33mWarning: Anthropic API keys typically start with "sk-ant-"\x1b[0m');
    }
    
    // Anthropic keys are typically at least 30 characters
    if (trimmedKey.length < 30) {
      return { 
        valid: false, 
        message: 'Anthropic API key appears too short' 
      };
    }
    
    // Allow more flexible format but still check for dangerous characters
    if (!/^[a-zA-Z0-9-_]+$/.test(trimmedKey)) {
      return { 
        valid: false, 
        message: 'API key contains invalid characters' 
      };
    }
  }
  
  // Check for potentially harmful characters
  if (/[;&|`$()]/.test(trimmedKey)) {
    return { 
      valid: false, 
      message: 'API key contains potentially dangerous characters' 
    };
  }
  
  // Check for common security issues like hardcoded test keys
  if (/test|demo|sample|example/i.test(trimmedKey)) {
    return { 
      valid: false, 
      message: 'API key appears to be a test/demo key' 
    };
  }
  
  return { valid: true };
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
      let redisUrl;
      let isValidRedisUrl = false;
      
      do {
        redisUrl = await ask('Enter your Redis Cloud URL:');
        if (!redisUrl) {
          const skipRedis = await ask('Continue without Redis? (y/n)');
          if (skipRedis.toLowerCase() === 'y') break;
        } else {
          // Validate Redis URL format (should start with redis:// or rediss://)
          if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
            console.log('\x1b[31mError: Redis URL should start with redis:// or rediss://\x1b[0m');
          } else {
            const validation = validateUrl(redisUrl);
            if (validation.valid) {
              isValidRedisUrl = true;
            } else {
              console.log(`\x1b[31mInvalid Redis URL: ${validation.message}\x1b[0m`);
            }
          }
          
          if (!isValidRedisUrl) {
            const retry = await ask('Would you like to try again? (y/n)');
            if (retry.toLowerCase() !== 'y') break;
          }
        }
      } while (!isValidRedisUrl && redisUrl);
      
      if (redisUrl && isValidRedisUrl) {
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
    
    // Get and validate Anthropic API key (using masked input)
    let anthropicKey;
    let isValidKey = false;
    
    do {
      anthropicKey = await askSecret('Enter your Anthropic API key (get one from https://console.anthropic.com/):');
      if (!anthropicKey) {
        console.log('\x1b[33mWarning: Anthropic API key is required for full functionality.\x1b[0m');
        const skipKey = await ask('Continue without an API key? (y/n)');
        if (skipKey.toLowerCase() === 'y') break;
      } else {
        const validation = validateApiKey(anthropicKey, 'anthropic');
        if (validation.valid) {
          isValidKey = true;
        } else {
          console.log(`\x1b[31mInvalid API key: ${validation.message}\x1b[0m`);
          const retry = await ask('Would you like to try again? (y/n)');
          if (retry.toLowerCase() !== 'y') break;
        }
      }
    } while (!isValidKey && anthropicKey);
    
    if (anthropicKey && isValidKey) {
      updateEnvFile(destPath, 'ANTHROPIC_API_KEY', anthropicKey);
    } else {
      console.log('\x1b[33mWarning: Valid Anthropic API key is required for full functionality.\x1b[0m');
    }
    
    // Ask for backend URL with validation
    let backendUrl;
    let isValidUrl = false;
    
    do {
      backendUrl = await ask('Enter backend URL (default: http://localhost:3001):');
      
      if (!backendUrl) {
        // Default value is acceptable
        backendUrl = 'http://localhost:3001';
        isValidUrl = true;
      } else {
        const validation = validateUrl(backendUrl);
        if (validation.valid) {
          isValidUrl = true;
        } else {
          console.log(`\x1b[31mInvalid URL: ${validation.message}\x1b[0m`);
          const retry = await ask('Would you like to try again? (y/n)');
          if (retry.toLowerCase() !== 'y') {
            backendUrl = 'http://localhost:3001';
            isValidUrl = true;
            console.log('\x1b[32mUsing default URL: http://localhost:3001\x1b[0m');
          }
        }
      }
    } while (!isValidUrl);
    
    updateEnvFile(destPath, 'NEXT_PUBLIC_BACKEND_URL', backendUrl);
    
    // Ask for GitHub repo URL with validation
    let repoUrl = await ask('Enter GitHub repo URL (optional):');
    
    if (repoUrl) {
      // Basic GitHub URL validation
      if (!repoUrl.startsWith('https://github.com/') && !repoUrl.startsWith('http://github.com/')) {
        console.log('\x1b[33mWarning: URL does not seem to be a GitHub repository URL.\x1b[0m');
        const confirm = await ask('Continue with this URL anyway? (y/n)');
        if (confirm.toLowerCase() !== 'y') {
          repoUrl = '';
        }
      } else {
        // Further validate the URL format
        const validation = validateUrl(repoUrl);
        if (!validation.valid) {
          console.log(`\x1b[31mInvalid URL: ${validation.message}\x1b[0m`);
          repoUrl = '';
        }
      }
      
      if (repoUrl) {
        updateEnvFile(destPath, 'NEXT_PUBLIC_GITHUB_REPO_URL', repoUrl);
      }
    }
    
    console.log('\x1b[32mFrontend environment configured successfully!\x1b[0m');
  }
}

// Function to set up backend environment
async function setupBackendEnv(templatePath, destPath) {
  console.log('Setting up backend environment...');
  
  if (copyTemplate(templatePath, destPath)) {
    console.log('\x1b[32mCreated backend .env file from template.\x1b[0m');
    
    // Get and validate Anthropic API key (using masked input)
    console.log('We need the same Anthropic API key for the backend:');
    let anthropicKey;
    let isValidKey = false;
    
    do {
      anthropicKey = await askSecret('Enter your Anthropic API key:');
      if (!anthropicKey) {
        console.log('\x1b[33mWarning: Anthropic API key is required for full functionality.\x1b[0m');
        const skipKey = await ask('Continue without an API key? (y/n)');
        if (skipKey.toLowerCase() === 'y') break;
      } else {
        const validation = validateApiKey(anthropicKey, 'anthropic');
        if (validation.valid) {
          isValidKey = true;
        } else {
          console.log(`\x1b[31mInvalid API key: ${validation.message}\x1b[0m`);
          const retry = await ask('Would you like to try again? (y/n)');
          if (retry.toLowerCase() !== 'y') break;
        }
      }
    } while (!isValidKey && anthropicKey);
    
    if (anthropicKey && isValidKey) {
      updateEnvFile(destPath, 'ANTHROPIC_API_KEY', anthropicKey);
    } else {
      console.log('\x1b[33mWarning: Valid Anthropic API key is required for full functionality.\x1b[0m');
    }
    
    // Ask for port with validation
    let port;
    let isValidPort = false;
    
    do {
      port = await ask('Enter backend port (default: 3001):');
      
      if (!port) {
        // Default value is acceptable
        port = '3001';
        isValidPort = true;
      } else if (!/^\d+$/.test(port)) {
        console.log('\x1b[31mError: Port must be a number\x1b[0m');
      } else if (parseInt(port) < 1024 || parseInt(port) > 65535) {
        console.log('\x1b[31mWarning: Port should be between 1024 and 65535\x1b[0m');
        const continueWithPort = await ask('Continue with this port anyway? (y/n)');
        if (continueWithPort.toLowerCase() === 'y') {
          isValidPort = true;
        }
      } else {
        isValidPort = true;
      }
      
      if (!isValidPort) {
        const retry = await ask('Would you like to try again? (y/n)');
        if (retry.toLowerCase() !== 'y') {
          port = '3001'; // Use default if user gives up
          isValidPort = true;
          console.log('\x1b[32mUsing default port: 3001\x1b[0m');
        }
      }
    } while (!isValidPort);
    
    updateEnvFile(destPath, 'PORT', port);
    
    // Ask for CORS origin with validation
    let corsOrigin;
    let isValidOrigin = false;
    
    do {
      corsOrigin = await ask('Enter CORS origin (default: http://localhost:3000):');
      
      if (!corsOrigin) {
        // Default value is acceptable
        corsOrigin = 'http://localhost:3000';
        isValidOrigin = true;
      } else if (corsOrigin === '*') {
        // Allow wildcard, but warn
        console.log('\x1b[33mWarning: Using wildcard (*) for CORS is not recommended for production.\x1b[0m');
        const confirm = await ask('Are you sure you want to use wildcard CORS? (y/n)');
        if (confirm.toLowerCase() === 'y') {
          isValidOrigin = true;
        }
      } else {
        const validation = validateUrl(corsOrigin);
        if (validation.valid) {
          isValidOrigin = true;
        } else {
          console.log(`\x1b[31mInvalid URL for CORS: ${validation.message}\x1b[0m`);
          const retry = await ask('Would you like to try again? (y/n)');
          if (retry.toLowerCase() !== 'y') {
            corsOrigin = 'http://localhost:3000';
            isValidOrigin = true;
            console.log('\x1b[32mUsing default CORS origin: http://localhost:3000\x1b[0m');
          }
        }
      }
    } while (!isValidOrigin);
    
    updateEnvFile(destPath, 'CORS_ORIGIN', corsOrigin);
    
    console.log('\x1b[32mBackend environment configured successfully!\x1b[0m');
  }
}

// Run the setup
setup();
