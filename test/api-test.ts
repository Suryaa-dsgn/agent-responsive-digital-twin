import axios from 'axios';
import { TraditionalApiResponse, AiFirstApiResponse } from '../src/types/api';

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3001';
const VERIFY_ENDPOINT = `${API_URL}/api/v1/verify`;
const HEALTH_ENDPOINT = `${API_URL}/health`;

/**
 * Simple test function to verify API responses
 */
async function runTests() {
  console.log('🧪 Starting API Simulator Tests\n');
  
  // Flag to track if any assertion fails
  let testsFailed = false;
  
  try {
    // Step 1: Check if API is up and running
    console.log('📡 Testing Health Check Endpoint...');
    const healthResponse = await axios.get(HEALTH_ENDPOINT);
    console.log(`✅ Health check successful - Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthResponse.data, null, 2)}\n`);

    // Step 2: Test Traditional API Response
    console.log('📡 Testing Traditional API Response...');
    const traditionalResponse = await axios.post(
      VERIFY_ENDPOINT,
      { version: 'traditional' },
      { validateStatus: () => true } // Accept any status code
    );
    
    console.log(`✅ Traditional API Test - Status: ${traditionalResponse.status}`);
    console.log('   Response:');
    console.log(`   ${JSON.stringify(traditionalResponse.data, null, 2)}`);
    
    // Verify traditional response format
    const traditionalData = traditionalResponse.data as TraditionalApiResponse;
    if (traditionalData.status === 'error' && traditionalData.message === 'Email not verified') {
      console.log('   ✅ Traditional response format verified\n');
    } else {
      console.error('   ❌ Traditional response format incorrect\n');
      testsFailed = true;
    }

    // Step 3: Test AI-First API Response
    console.log('📡 Testing AI-First API Response...');
    const aiFirstResponse = await axios.post(
      VERIFY_ENDPOINT,
      { version: 'ai-first' },
      { validateStatus: () => true } // Accept any status code
    );
    
    console.log(`✅ AI-First API Test - Status: ${aiFirstResponse.status}`);
    console.log('   Response:');
    console.log(`   ${JSON.stringify(aiFirstResponse.data, null, 2)}`);
    
    // Verify AI-first response format
    const aiFirstData = aiFirstResponse.data as AiFirstApiResponse;
    if (
      aiFirstData.status === 'email_verification_required' &&
      aiFirstData.remediation &&
      aiFirstData.recommendedNextAction &&
      aiFirstData.context &&
      aiFirstData.machineReadable === true
    ) {
      console.log('   ✅ AI-First response format verified\n');
    } else {
      console.error('   ❌ AI-First response format incorrect\n');
      testsFailed = true;
    }

    // Step 4: Compare the responses side by side
    console.log('📊 Response Comparison:');
    console.log('┌───────────────────────────────────────────────────────────┐');
    console.log('│                  Traditional vs AI-First                  │');
    console.log('├───────────────────────────────┬───────────────────────────┤');
    console.log('│ Traditional                   │ AI-First                  │');
    console.log('├───────────────────────────────┼───────────────────────────┤');
    console.log(`│ status: "${traditionalData.status}"          │ status: "${aiFirstData.status}" │`);
    console.log(`│ message: "${traditionalData.message}" │ remediation: provided        │`);
    console.log('│ No action guidance           │ recommendedNextAction: provided │');
    console.log('│ No context                   │ context: provided            │');
    console.log('│ No retry information         │ retryable: true              │');
    console.log('│ No machine readability flag  │ machineReadable: true        │');
    console.log('└───────────────────────────────┴───────────────────────────┘\n');

    if (testsFailed) {
      console.error('❌ One or more assertion tests failed');
      process.exit(1);
    } else {
      console.log('🎉 All tests completed successfully!\n');
    }

  } catch (error) {
    console.error('❌ Test failed with error:');
    if (axios.isAxiosError(error)) {
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Message: ${error.message}`);
      console.error(`   Data: ${JSON.stringify(error.response?.data, null, 2)}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the tests
runTests();
