// Spam testing script - tests server resilience against rapid requests
import axios from 'axios';
import { CONFIG, getTargetUrl } from '../config.js';
import chalk from 'chalk';

const TARGET_URL = getTargetUrl();
let requestCount = 0;
let successCount = 0;
let errorCount = 0;
let rateLimitCount = 0;
let timeoutCount = 0;

console.log(chalk.red('🚨 Starting SPAM Test - Testing Server Resilience'));
console.log(chalk.gray(`Target: ${TARGET_URL}`));
console.log(chalk.gray(`Spam Interval: ${CONFIG.SPAM_INTERVAL_MS}ms`));
console.log(chalk.gray(`Duration: ${CONFIG.TEST_DURATION_MS / 1000}s`));
console.log(chalk.gray('─'.repeat(50)));

// Spam health endpoint
async function spamHealthEndpoint() {
  try {
    requestCount++;
    const startTime = Date.now();
    
    const response = await axios.get(`${TARGET_URL}${CONFIG.ENDPOINTS.HEALTH}`, {
      timeout: 2000 // Shorter timeout for spam testing
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200) {
      successCount++;
      if (requestCount % 10 === 0) {
        console.log(chalk.green(`✓ Request ${requestCount}: ${responseTime}ms`));
      }
    } else if (response.status === 429) {
      rateLimitCount++;
      console.log(chalk.yellow(`⚠️ Rate limited: Request ${requestCount}`));
    } else {
      errorCount++;
      console.log(chalk.red(`✗ Error ${response.status}: Request ${requestCount}`));
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      timeoutCount++;
      console.log(chalk.magenta(`⏱️ Timeout: Request ${requestCount}`));
    } else {
      errorCount++;
      console.log(chalk.red(`✗ Error: Request ${requestCount} - ${error.message}`));
    }
  }
}

// Spam sessions endpoint
async function spamSessionsEndpoint() {
  try {
    requestCount++;
    const startTime = Date.now();
    
    const response = await axios.get(`${TARGET_URL}${CONFIG.ENDPOINTS.SESSIONS}`, {
      timeout: 2000
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.status === 200) {
      successCount++;
      if (requestCount % 10 === 0) {
        console.log(chalk.green(`✓ Sessions ${requestCount}: ${responseTime}ms (${response.data.count} sessions)`));
      }
    } else if (response.status === 429) {
      rateLimitCount++;
      console.log(chalk.yellow(`⚠️ Rate limited: Sessions ${requestCount}`));
    } else {
      errorCount++;
      console.log(chalk.red(`✗ Sessions error ${response.status}: Request ${requestCount}`));
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      timeoutCount++;
      console.log(chalk.magenta(`⏱️ Sessions timeout: Request ${requestCount}`));
    } else {
      errorCount++;
      console.log(chalk.red(`✗ Sessions error: Request ${requestCount} - ${error.message}`));
    }
  }
}

// Run spam test
async function runSpamTest() {
  const testStartTime = Date.now();
  
  console.log(chalk.yellow('🔥 Initiating spam attack...'));
  
  const spamInterval = setInterval(async () => {
    // Alternate between endpoints for more realistic spam
    if (Math.random() > 0.5) {
      spamHealthEndpoint();
    } else {
      spamSessionsEndpoint();
    }
  }, CONFIG.SPAM_INTERVAL_MS);
  
  // Stop after test duration
  setTimeout(() => {
    clearInterval(spamInterval);
    
    const testDuration = Date.now() - testStartTime;
    
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.red('🚨 SPAM Test Results:'));
    console.log(chalk.blue(`📊 Total requests sent: ${requestCount}`));
    console.log(chalk.green(`✓ Successful responses: ${successCount}`));
    console.log(chalk.red(`✗ Error responses: ${errorCount}`));
    console.log(chalk.yellow(`⚠️ Rate limited: ${rateLimitCount}`));
    console.log(chalk.magenta(`⏱️ Timeouts: ${timeoutCount}`));
    console.log(chalk.yellow(`📈 Success rate: ${((successCount / requestCount) * 100).toFixed(2)}%`));
    console.log(chalk.yellow(`🚀 Requests per second: ${(requestCount / (testDuration / 1000)).toFixed(2)}`));
    
    // Server resilience assessment
    if (successCount > 0 && errorCount < requestCount * 0.5) {
      console.log(chalk.green('🛡️ Server resilience: GOOD - Handled spam well'));
    } else if (successCount > 0) {
      console.log(chalk.yellow('⚠️ Server resilience: MODERATE - Some issues under spam'));
    } else {
      console.log(chalk.red('🚨 Server resilience: POOR - Failed under spam'));
    }
    
    if (rateLimitCount > 0) {
      console.log(chalk.blue('ℹ️ Rate limiting detected - This is good for production!'));
    }
    
    process.exit(0);
  }, CONFIG.TEST_DURATION_MS);
}

// Run the spam test
runSpamTest().catch(console.error);
