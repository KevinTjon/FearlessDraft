#!/usr/bin/env node
// Setup script for the new architecture

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Champion Draft Arena with new architecture...\n');

function runCommand(command, cwd = process.cwd()) {
  console.log(`📦 Running: ${command}`);
  try {
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    console.log('✅ Success!\n');
  } catch (error) {
    console.error(`❌ Error running: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function createDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

// Step 1: Build shared package
console.log('1️⃣ Building shared types package...');
runCommand('npm install', path.join(__dirname, '../shared'));
runCommand('npm run build', path.join(__dirname, '../shared'));

// Step 2: Install server dependencies
console.log('2️⃣ Installing server dependencies...');
runCommand('npm install', path.join(__dirname, '../server'));

// Step 3: Build server
console.log('3️⃣ Building server...');
runCommand('npm run build', path.join(__dirname, '../server'));

// Step 4: Install client dependencies
console.log('4️⃣ Installing client dependencies...');
runCommand('npm install', path.join(__dirname, '..'));

// Step 5: Create necessary directories
console.log('5️⃣ Creating necessary directories...');
createDirectory(path.join(__dirname, '../logs'));
createDirectory(path.join(__dirname, '../temp'));

// Step 6: Create environment files if they don't exist
console.log('6️⃣ Setting up environment files...');

const serverEnvPath = path.join(__dirname, '../server/.env');
if (!fs.existsSync(serverEnvPath)) {
  const serverEnvContent = `# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Session Configuration
SESSION_CLEANUP_INTERVAL=300000
SESSION_EXPIRY_TIME=3600000

# Timer Configuration
PHASE_TIMER_DURATION=30000
SWAP_PHASE_DURATION=60
SWAP_LOCK_TIME=20
`;
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('📝 Created server/.env file');
}

const clientEnvPath = path.join(__dirname, '../.env');
if (!fs.existsSync(clientEnvPath)) {
  const clientEnvContent = `# Client Configuration
VITE_SERVER_URL=http://localhost:3001
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
`;
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('📝 Created client .env file');
}

console.log('✨ Setup complete!\n');
console.log('🎯 Next steps:');
console.log('   1. Start the server: npm run dev:server');
console.log('   2. Start the client: npm run dev');
console.log('   3. Open http://localhost:5173 in your browser\n');
console.log('📚 Documentation:');
console.log('   - Server API: http://localhost:3001/health');
console.log('   - Sessions API: http://localhost:3001/api/sessions');
console.log('');
