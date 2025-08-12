// Basic load testing script - tests server capacity with normal requests
import axios from 'axios';
import { CONFIG, getTargetUrl, createMockDraftSession } from '../config.js';
import chalk from 'chalk';

const TARGET_URL = getTargetUrl();
let successCount = 0;
let errorCount = 0;
let totalResponseTime = 0;

console.log(chalk.blue('🔥 Starting Basic Load Test'));
console.log(chalk.gray(`Target: ${TARGET_URL}`));
console.log(chalk.gray(`Duration: ${CONFIG.TEST_DURATION_MS / 1000}s`));
console.log(chalk.gray(`Max Connections: ${CONFIG.MAX_CONCURRENT_CONNECTIONS}`));
console.log(chalk.gray('─'.repeat(50)));

// Test health endpoint under load
async function testHealthEndpoint() {
  try {
    const startTime = Date.now();
    const response = await axios.get(`${TARGET_URL}${CONFIG.ENDPOINTS.HEALTH}`, {
      timeout: CONFIG.SOCKET_TIMEOUT
    });
    
    const responseTime = Date.now() - startTime;
    totalResponseTime += responseTime;
    
    if (response.status === 200) {
      successCount++;
      console.log(chalk.green(`✓ Health check: ${responseTime}ms`));
    } else {
      errorCount++;
      console.log(chalk.red(`✗ Health check failed: ${response.status}`));
    }
  } catch (error) {
    errorCount++;
    console.log(chalk.red(`✗ Health check error: ${error.message}`));
  }
}

// Test sessions API under load
async function testSessionsEndpoint() {
  try {
    const startTime = Date.now();
    const response = await axios.get(`${TARGET_URL}${CONFIG.ENDPOINTS.SESSIONS}`, {
      timeout: CONFIG.SOCKET_TIMEOUT
    });
    
    const responseTime = Date.now() - startTime;
    totalResponseTime += responseTime;
    
    if (response.status === 200) {
      successCount++;
      console.log(chalk.green(`✓ Sessions API: ${responseTime}ms (${response.data.count} sessions)`));
    } else {
      errorCount++;
      console.log(chalk.red(`✗ Sessions API failed: ${response.status}`));
    }
  } catch (error) {
    errorCount++;
    console.log(chalk.red(`✗ Sessions API error: ${error.message}`));
  }
}

// Run concurrent requests
async function runLoadTest() {
  const promises = [];
  const testStartTime = Date.now();
  
  // Create concurrent requests
  for (let i = 0; i < CONFIG.MAX_CONCURRENT_CONNECTIONS; i++) {
    // Alternate between health and sessions endpoints
    if (i % 2 === 0) {
      promises.push(testHealthEndpoint());
    } else {
      promises.push(testSessionsEndpoint());
    }
    
    // Small delay to avoid overwhelming the server immediately
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  // Wait for all requests to complete or timeout
  await Promise.allSettled(promises);
  
  const testDuration = Date.now() - testStartTime;
  const averageResponseTime = totalResponseTime / (successCount + errorCount) || 0;
  
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.blue('📊 Load Test Results:'));
  console.log(chalk.green(`✓ Successful requests: ${successCount}`));
  console.log(chalk.red(`✗ Failed requests: ${errorCount}`));
  console.log(chalk.yellow(`⏱️  Average response time: ${averageResponseTime.toFixed(2)}ms`));
  console.log(chalk.yellow(`⏱️  Total test duration: ${testDuration}ms`));
  console.log(chalk.yellow(`📈 Success rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(2)}%`));
  
  // Performance assessment
  if (averageResponseTime < 1000 && successCount / (successCount + errorCount) > 0.95) {
    console.log(chalk.green('🎉 Server performance: EXCELLENT'));
  } else if (averageResponseTime < 3000 && successCount / (successCount + errorCount) > 0.8) {
    console.log(chalk.yellow('⚠️  Server performance: ACCEPTABLE'));
  } else {
    console.log(chalk.red('🚨 Server performance: NEEDS ATTENTION'));
  }
}

// Run the test
runLoadTest().catch(console.error);
