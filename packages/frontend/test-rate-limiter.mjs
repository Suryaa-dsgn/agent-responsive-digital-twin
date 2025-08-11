// Test script to verify Redis rate limiter functionality
import { getRedisClient } from './lib/ai.js';

async function testRateLimiter() {
  console.log('Testing Redis client connection...');
  
  // Move Redis client to outer scope
  let redis = null;
  
  try {
    // Try to connect to Redis
    redis = getRedisClient();
    
    // Verify connection before proceeding
    console.log('Verifying Redis connection...');
    const pingResult = await redis.ping();
    if (pingResult !== 'PONG') {
      throw new Error(`Redis ping failed: expected 'PONG', got '${pingResult}'`);
    }
    console.log('Redis connection verified successfully!');
    
    // Test if Redis is working
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    
    console.log(`Redis test successful! Got value: ${value}`);
    
    // Clean up
    await redis.del('test-key');
    
    console.log('Test operations completed successfully!');
  } catch (error) {
    console.error('Error during Redis operations:', error);
    throw error; // Re-throw to ensure error is propagated
  } finally {
    // Ensure Redis connection is closed even if an error occurs
    if (redis) {
      try {
        await redis.quit();
        console.log('Redis connection closed successfully');
      } catch (quitError) {
        console.error('Error while closing Redis connection:', quitError);
        // Don't throw to avoid masking the original error
      }
    }
    console.log('Test complete!');
  }
}

testRateLimiter().catch(err => {
  console.error('Unhandled error in test:', err);
  process.exit(1);
});
