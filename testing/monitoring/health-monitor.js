// Health monitoring script - continuously monitors server health and performance
import axios from 'axios';
import { CONFIG, getTargetUrl } from '../config.js';
import chalk from 'chalk';

const TARGET_URL = getTargetUrl();
let monitoringActive = true;
let healthChecks = 0;
let successfulChecks = 0;
let failedChecks = 0;
let totalResponseTime = 0;
let lastHealthData = null;

console.log(chalk.green('💓 Starting Health Monitor'));
console.log(chalk.gray(`Target: ${TARGET_URL}`));
console.log(chalk.gray(`Check Interval: ${CONFIG.HEALTH_CHECK_INTERVAL / 1000}s`));
console.log(chalk.gray('Press Ctrl+C to stop monitoring'));
console.log(chalk.gray('─'.repeat(50)));

// Perform a single health check
async function performHealthCheck() {
  healthChecks++;
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${TARGET_URL}${CONFIG.ENDPOINTS.HEALTH}`, {
      timeout: CONFIG.SOCKET_TIMEOUT
    });
    
    const responseTime = Date.now() - startTime;
    totalResponseTime += responseTime;
    successfulChecks++;
    
    const healthData = response.data;
    lastHealthData = healthData;
    
    // Color code based on response time
    let responseColor = chalk.green;
    if (responseTime > 2000) responseColor = chalk.red;
    else if (responseTime > 1000) responseColor = chalk.yellow;
    
    console.log(
      chalk.gray(`[${new Date().toLocaleTimeString()}]`) + 
      chalk.green(' ✓ HEALTHY ') + 
      responseColor(`${responseTime}ms`)
    );
    
    // Display detailed health info
    if (healthData.connectedClients !== undefined) {
      console.log(chalk.gray(`   Connected clients: ${healthData.connectedClients}`));
    }
    if (healthData.activeSessions !== undefined) {
      console.log(chalk.gray(`   Active sessions: ${healthData.activeSessions}`));
    }
    if (healthData.uptime !== undefined) {
      console.log(chalk.gray(`   Server uptime: ${healthData.uptime}`));
    }
    
  } catch (error) {
    failedChecks++;
    const responseTime = Date.now() - startTime;
    totalResponseTime += responseTime;
    
    console.log(
      chalk.gray(`[${new Date().toLocaleTimeString()}]`) + 
      chalk.red(' ✗ UNHEALTHY ') + 
      chalk.red(`${responseTime}ms`)
    );
    
    if (error.response) {
      console.log(chalk.red(`   HTTP ${error.response.status}: ${error.response.statusText}`));
    } else if (error.code === 'ECONNREFUSED') {
      console.log(chalk.red(`   Connection refused - server may be down`));
    } else if (error.code === 'ECONNABORTED') {
      console.log(chalk.red(`   Request timeout - server not responding`));
    } else {
      console.log(chalk.red(`   Error: ${error.message}`));
    }
  }
  
  // Display running statistics every 10 checks
  if (healthChecks % 10 === 0) {
    displayStatistics();
  }
}

// Display monitoring statistics
function displayStatistics() {
  const averageResponseTime = totalResponseTime / healthChecks;
  const successRate = (successfulChecks / healthChecks) * 100;
  
  console.log(chalk.cyan('\n📊 Monitoring Statistics:'));
  console.log(chalk.yellow(`   Total checks: ${healthChecks}`));
  console.log(chalk.green(`   Successful: ${successfulChecks}`));
  console.log(chalk.red(`   Failed: ${failedChecks}`));
  console.log(chalk.yellow(`   Success rate: ${successRate.toFixed(2)}%`));
  console.log(chalk.yellow(`   Avg response time: ${averageResponseTime.toFixed(2)}ms`));
  
  if (lastHealthData) {
    console.log(chalk.blue(`   Last health data:`));
    Object.entries(lastHealthData).forEach(([key, value]) => {
      console.log(chalk.gray(`     ${key}: ${value}`));
    });
  }
  
  console.log(chalk.gray('─'.repeat(50)));
}

// Monitor server health continuously
async function startMonitoring() {
  console.log(chalk.yellow('🚀 Health monitoring started...\n'));
  
  while (monitoringActive) {
    await performHealthCheck();
    
    // Wait for next check interval
    await new Promise(resolve => setTimeout(resolve, CONFIG.HEALTH_CHECK_INTERVAL));
  }
}

// Graceful shutdown
function stopMonitoring() {
  monitoringActive = false;
  console.log(chalk.yellow('\n⏹️ Stopping health monitor...'));
  displayStatistics();
  
  // Final assessment
  const successRate = (successfulChecks / healthChecks) * 100;
  const averageResponseTime = totalResponseTime / healthChecks;
  
  console.log(chalk.cyan('\n🏁 Final Health Assessment:'));
  
  if (successRate >= 99 && averageResponseTime < 1000) {
    console.log(chalk.green('🎉 Server health: EXCELLENT'));
  } else if (successRate >= 95 && averageResponseTime < 3000) {
    console.log(chalk.yellow('⚠️ Server health: GOOD'));
  } else if (successRate >= 80) {
    console.log(chalk.yellow('⚠️ Server health: ACCEPTABLE'));
  } else {
    console.log(chalk.red('🚨 Server health: POOR - Needs attention'));
  }
  
  console.log(chalk.gray('Health monitoring stopped.'));
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', stopMonitoring);
process.on('SIGTERM', stopMonitoring);

// Start monitoring
startMonitoring().catch(error => {
  console.error(chalk.red('💥 Health monitoring failed:'), error.message);
  process.exit(1);
});
