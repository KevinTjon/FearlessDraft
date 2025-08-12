// Setup script for production testing suite
import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import chalk from 'chalk';

console.log(chalk.blue('🔧 Champion Draft Arena - Testing Suite Setup'));
console.log(chalk.gray('─'.repeat(50)));

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function setup() {
  try {
    console.log(chalk.yellow('This setup will configure your testing environment.\n'));
    
    // Get production URL
    const productionUrl = await askQuestion(
      chalk.cyan('Enter your Render production URL (e.g., https://your-app.onrender.com): ')
    );
    
    if (!productionUrl.trim()) {
      console.log(chalk.red('❌ Production URL is required!'));
      process.exit(1);
    }
    
    // Validate URL format
    try {
      new URL(productionUrl);
    } catch (error) {
      console.log(chalk.red('❌ Invalid URL format! Please include https://'));
      process.exit(1);
    }
    
    // Get test intensity
    console.log(chalk.yellow('\nChoose testing intensity:'));
    console.log('1. Light (25 connections, 15s duration) - Safe for free plans');
    console.log('2. Medium (50 connections, 30s duration) - Default');
    console.log('3. Heavy (100 connections, 60s duration) - Paid plans only');
    
    const intensity = await askQuestion(chalk.cyan('Select intensity (1-3): '));
    
    let config = {
      connections: 50,
      duration: 30000,
      spamInterval: 100
    };
    
    switch (intensity) {
      case '1':
        config = { connections: 25, duration: 15000, spamInterval: 200 };
        console.log(chalk.green('✓ Light testing configuration selected'));
        break;
      case '2':
        config = { connections: 50, duration: 30000, spamInterval: 100 };
        console.log(chalk.green('✓ Medium testing configuration selected'));
        break;
      case '3':
        config = { connections: 100, duration: 60000, spamInterval: 50 };
        console.log(chalk.yellow('⚠️ Heavy testing configuration selected - ensure your server can handle this!'));
        break;
      default:
        console.log(chalk.yellow('⚠️ Invalid selection, using medium configuration'));
    }
    
    // Update config file
    const configPath = 'config.js';
    let configContent = readFileSync(configPath, 'utf8');
    
    // Replace production URL
    configContent = configContent.replace(
      /PRODUCTION_URL: '[^']*'/,
      `PRODUCTION_URL: '${productionUrl}'`
    );
    
    // Replace test parameters
    configContent = configContent.replace(
      /MAX_CONCURRENT_CONNECTIONS: \d+/,
      `MAX_CONCURRENT_CONNECTIONS: ${config.connections}`
    );
    
    configContent = configContent.replace(
      /TEST_DURATION_MS: \d+/,
      `TEST_DURATION_MS: ${config.duration}`
    );
    
    configContent = configContent.replace(
      /SPAM_INTERVAL_MS: \d+/,
      `SPAM_INTERVAL_MS: ${config.spamInterval}`
    );
    
    writeFileSync(configPath, configContent);
    
    console.log(chalk.green('\n✅ Configuration updated successfully!'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.blue('🚀 Ready to start testing!'));
    console.log(chalk.yellow('\nRecommended testing sequence:'));
    console.log(chalk.gray('1. npm run test:endpoints    # Verify API endpoints'));
    console.log(chalk.gray('2. npm run test:functional   # Test core features'));
    console.log(chalk.gray('3. npm run test:load        # Performance testing'));
    console.log(chalk.gray('4. npm run test:spam        # Abuse resistance'));
    console.log(chalk.gray('5. npm run monitor          # Long-term monitoring'));
    console.log(chalk.yellow('\nOr run all at once:'));
    console.log(chalk.gray('npm run test:all'));
    
    console.log(chalk.cyan('\n📖 For detailed instructions, see README.md'));
    
  } catch (error) {
    console.error(chalk.red('❌ Setup failed:'), error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup();
