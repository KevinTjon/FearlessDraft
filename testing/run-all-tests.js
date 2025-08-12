// Comprehensive test runner - executes all tests in sequence with reporting
import { spawn } from 'child_process';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Champion Draft Arena - Comprehensive Test Suite'));
console.log(chalk.gray(`Started at: ${new Date().toLocaleString()}`));
console.log(chalk.gray('─'.repeat(60)));

const tests = [
  {
    name: 'API Endpoints Test',
    command: 'npm',
    args: ['run', 'test:endpoints'],
    description: 'Testing all API endpoints for functionality and performance'
  },
  {
    name: 'Functional Test',
    command: 'npm',
    args: ['run', 'test:functional'],
    description: 'Testing core draft functionality and WebSocket features'
  },
  {
    name: 'Load Test',
    command: 'npm',
    args: ['run', 'test:load'],
    description: 'Testing server performance under normal load'
  },
  {
    name: 'WebSocket Load Test',
    command: 'npm',
    args: ['run', 'test:websocket'],
    description: 'Testing real-time features under concurrent connections'
  },
  {
    name: 'Spam/Abuse Test',
    command: 'npm',
    args: ['run', 'test:spam'],
    description: 'Testing server resilience against rapid requests'
  }
];

let currentTest = 0;
const results = [];

function runTest(test) {
  return new Promise((resolve) => {
    console.log(chalk.yellow(`\n🔄 Running: ${test.name}`));
    console.log(chalk.gray(`   ${test.description}`));
    
    const startTime = Date.now();
    const process = spawn(test.command, test.args, { 
      stdio: 'inherit',
      shell: true 
    });
    
    process.on('close', (code) => {
      const duration = Date.now() - startTime;
      const result = {
        name: test.name,
        success: code === 0,
        duration: duration,
        code: code
      };
      
      results.push(result);
      
      if (code === 0) {
        console.log(chalk.green(`✅ ${test.name} completed successfully (${(duration/1000).toFixed(2)}s)`));
      } else {
        console.log(chalk.red(`❌ ${test.name} failed with code ${code} (${(duration/1000).toFixed(2)}s)`));
      }
      
      resolve(result);
    });
    
    process.on('error', (error) => {
      console.error(chalk.red(`💥 Failed to start ${test.name}:`, error.message));
      results.push({
        name: test.name,
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      resolve({ success: false, error: error.message });
    });
  });
}

async function runAllTests() {
  console.log(chalk.cyan(`\n🚀 Starting ${tests.length} test suites...\n`));
  
  for (const test of tests) {
    await runTest(test);
    
    // Small delay between tests to let server recover
    if (currentTest < tests.length - 1) {
      console.log(chalk.gray('\n⏳ Waiting 3 seconds before next test...'));
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    currentTest++;
  }
  
  // Generate comprehensive report
  console.log(chalk.gray('\n' + '='.repeat(60)));
  console.log(chalk.blue('📊 COMPREHENSIVE TEST REPORT'));
  console.log(chalk.gray('='.repeat(60)));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(chalk.yellow(`📋 Tests Run: ${results.length}`));
  console.log(chalk.green(`✅ Successful: ${successful}`));
  console.log(chalk.red(`❌ Failed: ${failed}`));
  console.log(chalk.yellow(`⏱️  Total Duration: ${(totalDuration/1000).toFixed(2)}s`));
  console.log(chalk.yellow(`📈 Success Rate: ${((successful/results.length)*100).toFixed(2)}%`));
  
  console.log(chalk.gray('\n📋 Detailed Results:'));
  results.forEach((result, index) => {
    const status = result.success ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
    const duration = chalk.gray(`(${(result.duration/1000).toFixed(2)}s)`);
    console.log(`${index + 1}. ${status} ${result.name} ${duration}`);
    
    if (!result.success && result.error) {
      console.log(chalk.red(`   Error: ${result.error}`));
    }
  });
  
  // Overall assessment
  console.log(chalk.gray('\n🎯 Overall Assessment:'));
  if (successful === results.length) {
    console.log(chalk.green('🎉 EXCELLENT: All tests passed! Your production server is performing well.'));
  } else if (successful >= results.length * 0.8) {
    console.log(chalk.yellow('⚠️  GOOD: Most tests passed, but some issues detected. Review failed tests.'));
  } else if (successful >= results.length * 0.6) {
    console.log(chalk.yellow('⚠️  ACCEPTABLE: Significant issues detected. Server needs optimization.'));
  } else {
    console.log(chalk.red('🚨 CRITICAL: Major issues detected. Server requires immediate attention.'));
  }
  
  // Recommendations
  console.log(chalk.gray('\n💡 Recommendations:'));
  
  const failedTests = results.filter(r => !r.success);
  if (failedTests.some(t => t.name.includes('API Endpoints'))) {
    console.log(chalk.yellow('   • Check server deployment and API endpoint configuration'));
  }
  if (failedTests.some(t => t.name.includes('Functional'))) {
    console.log(chalk.yellow('   • Review WebSocket configuration and core application logic'));
  }
  if (failedTests.some(t => t.name.includes('Load'))) {
    console.log(chalk.yellow('   • Consider upgrading server resources or optimizing performance'));
  }
  if (failedTests.some(t => t.name.includes('Spam'))) {
    console.log(chalk.yellow('   • Implement rate limiting and abuse protection'));
  }
  
  if (successful === results.length) {
    console.log(chalk.green('   • All systems operational! Consider setting up continuous monitoring.'));
  }
  
  console.log(chalk.gray('\n📖 For detailed analysis, review individual test outputs above.'));
  console.log(chalk.gray(`Completed at: ${new Date().toLocaleString()}`));
  console.log(chalk.gray('='.repeat(60)));
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️ Test suite interrupted by user'));
  console.log(chalk.gray('Partial results may be available above.'));
  process.exit(1);
});

// Run all tests
runAllTests().catch(error => {
  console.error(chalk.red('💥 Test suite failed:'), error.message);
  process.exit(1);
});
