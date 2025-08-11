// Test script to verify Redis rate limiter functionality
import { checkRateLimit } from './lib/ai';

async function testRateLimiter() {
  console.log('Testing Redis rate limiter...');
  
  const testId = 'test-user-' + Date.now();
  console.log(`Using test identifier: ${testId}`);
  
  // Run multiple requests to trigger rate limiting
  for (let i = 1; i <= 12; i++) {
    try {
      const result = await checkRateLimit(testId);
      console.log(`Request ${i}: allowed=${result.allowed}, remaining=${result.remaining}`);
    } catch (error) {
      console.error(`Error on request ${i}:`, error);
    }
  }
  
  console.log('Test complete!');
  // Exit after test
  process.exit(0);
}

testRateLimiter();
