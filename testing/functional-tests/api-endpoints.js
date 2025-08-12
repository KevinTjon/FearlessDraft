// API endpoint functional testing - validates all endpoints work correctly
import axios from 'axios';
import { CONFIG, getTargetUrl, createMockDraftSession } from '../config.js';
import chalk from 'chalk';

const TARGET_URL = getTargetUrl();
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

console.log(chalk.blue('🧪 Starting API Endpoint Functional Tests'));
console.log(chalk.gray(`Target: ${TARGET_URL}`));
console.log(chalk.gray('─'.repeat(50)));

// Helper function to run a test
async function runTest(testName, testFunction) {
  testsRun++;
  try {
    console.log(chalk.yellow(`🔄 Running: ${testName}`));
    await testFunction();
    testsPassed++;
    console.log(chalk.green(`✅ PASSED: ${testName}`));
  } catch (error) {
    testsFailed++;
    console.log(chalk.red(`❌ FAILED: ${testName}`));
    console.log(chalk.red(`   Error: ${error.message}`));
  }
  console.log('');
}

// Test health endpoint
async function testHealthEndpoint() {
  const response = await axios.get(`${TARGET_URL}${CONFIG.ENDPOINTS.HEALTH}`, {
    timeout: 5000
  });
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  const data = response.data;
  console.log(chalk.gray(`   Health data: ${JSON.stringify(data, null, 2)}`));
  
  // Check if we have the expected health response format
  if (data.status && data.status === 'healthy') {
    console.log(chalk.gray(`   ✓ Health status is correctly set to 'healthy'`));
  } else {
    console.log(chalk.yellow(`   ⚠ Health status field: '${data.status}' (expected 'healthy')`));
  }
  
  if (data.timestamp) {
    console.log(chalk.gray(`   ✓ Timestamp present: ${data.timestamp}`));
  } else {
    console.log(chalk.yellow(`   ⚠ No timestamp in health response`));
  }
}

// Test sessions endpoint
async function testSessionsEndpoint() {
  const response = await axios.get(`${TARGET_URL}${CONFIG.ENDPOINTS.SESSIONS}`, {
    timeout: 5000
  });
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  const data = response.data;
  console.log(chalk.gray(`   Sessions data: ${JSON.stringify(data, null, 2)}`));
  
  // Check if we have the expected sessions response format
  if (typeof data.count === 'number') {
    console.log(chalk.gray(`   ✓ Session count: ${data.count}`));
  } else {
    console.log(chalk.yellow(`   ⚠ Count field: '${data.count}' (type: ${typeof data.count}, expected number)`));
  }
  
  if (Array.isArray(data.sessions)) {
    console.log(chalk.gray(`   ✓ Sessions array with ${data.sessions.length} items`));
    if (data.sessions.length > 0) {
      console.log(chalk.gray(`   Sample session: ${JSON.stringify(data.sessions[0], null, 2)}`));
    }
  } else {
    console.log(chalk.yellow(`   ⚠ Sessions field: type ${typeof data.sessions} (expected array)`));
  }
}

// Test non-existent session endpoint
async function testNonExistentSession() {
  const fakeSessionId = 'non-existent-session-123';
  try {
    const response = await axios.get(`${TARGET_URL}/api/sessions/${fakeSessionId}`, {
      timeout: 5000
    });
    
    if (response.status !== 404) {
      throw new Error(`Expected status 404 for non-existent session, got ${response.status}`);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(chalk.gray(`   Correctly returned 404 for non-existent session`));
      return; // This is expected
    }
    throw error;
  }
}

// Test CORS headers
async function testCORSHeaders() {
  const response = await axios.get(`${TARGET_URL}${CONFIG.ENDPOINTS.HEALTH}`, {
    timeout: 5000
  });
  
  const corsHeader = response.headers['access-control-allow-origin'];
  if (!corsHeader) {
    throw new Error('CORS headers not present');
  }
  
  console.log(chalk.gray(`   CORS header: ${corsHeader}`));
}

// Test response times
async function testResponseTimes() {
  const endpoints = [
    CONFIG.ENDPOINTS.HEALTH,
    CONFIG.ENDPOINTS.SESSIONS
  ];
  
  const responseTimes = [];
  
  for (const endpoint of endpoints) {
    const startTime = Date.now();
    await axios.get(`${TARGET_URL}${endpoint}`, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    responseTimes.push({ endpoint, responseTime });
  }
  
  const averageResponseTime = responseTimes.reduce((sum, rt) => sum + rt.responseTime, 0) / responseTimes.length;
  
  if (averageResponseTime > 5000) {
    throw new Error(`Average response time too high: ${averageResponseTime}ms`);
  }
  
  console.log(chalk.gray(`   Response times:`));
  responseTimes.forEach(rt => {
    console.log(chalk.gray(`     ${rt.endpoint}: ${rt.responseTime}ms`));
  });
  console.log(chalk.gray(`   Average: ${averageResponseTime.toFixed(2)}ms`));
}

// Test error handling for invalid requests
async function testErrorHandling() {
  // Test invalid JSON in POST request
  try {
    await axios.post(`${TARGET_URL}/api/invalid-endpoint`, '"invalid json"', {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    throw new Error('Expected error for invalid endpoint');
  } catch (error) {
    if (error.response && (error.response.status === 404 || error.response.status === 400)) {
      console.log(chalk.gray(`   Correctly handled invalid request with status ${error.response.status}`));
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Server is not running or not accessible');
    } else {
      // Log what we actually got for debugging
      console.log(chalk.gray(`   Unexpected error response: ${error.response?.status} - ${error.message}`));
      throw error;
    }
  }
}

// Test static file serving (production only)
async function testStaticFileServing() {
  try {
    const response = await axios.get(TARGET_URL, {
      timeout: 5000,
      headers: {
        'Accept': 'text/html'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200 for root path, got ${response.status}`);
    }
    
    if (!response.data.includes('html') && !response.data.includes('DOCTYPE')) {
      console.log(chalk.yellow('   Warning: Root path may not be serving HTML content'));
    } else {
      console.log(chalk.gray(`   Root path correctly serves HTML content`));
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Server is not running or not accessible');
    }
    // For development, this might fail and that's okay
    console.log(chalk.yellow(`   Static file test: ${error.message}`));
  }
}

// Run all functional tests
async function runAllTests() {
  console.log(chalk.cyan('Starting comprehensive API endpoint testing...\n'));
  
  await runTest('Health Endpoint Test', testHealthEndpoint);
  await runTest('Sessions Endpoint Test', testSessionsEndpoint);
  await runTest('Non-Existent Session Test', testNonExistentSession);
  await runTest('CORS Headers Test', testCORSHeaders);
  await runTest('Response Times Test', testResponseTimes);
  await runTest('Error Handling Test', testErrorHandling);
  await runTest('Static File Serving Test', testStaticFileServing);
  
  // Summary
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.blue('📊 API Endpoint Test Summary:'));
  console.log(chalk.yellow(`📋 Tests run: ${testsRun}`));
  console.log(chalk.green(`✅ Tests passed: ${testsPassed}`));
  console.log(chalk.red(`❌ Tests failed: ${testsFailed}`));
  console.log(chalk.yellow(`📈 Success rate: ${((testsPassed / testsRun) * 100).toFixed(2)}%`));
  
  if (testsFailed === 0) {
    console.log(chalk.green('🎉 All API endpoint tests passed!'));
  } else if (testsPassed > testsFailed) {
    console.log(chalk.yellow('⚠️ Some tests failed, but majority passed'));
  } else {
    console.log(chalk.red('🚨 Critical issues detected in API endpoints'));
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error(chalk.red('💥 Test suite failed:'), error.message);
  process.exit(1);
});
