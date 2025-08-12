#!/usr/bin/env node

// Simple deployment preparation script
import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Preparing for deployment...');

try {
  // Clean any existing builds
  console.log('🧹 Cleaning previous builds...');
  if (existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }
  if (existsSync('server/dist')) {
    execSync('rm -rf server/dist', { stdio: 'inherit' });
  }
  if (existsSync('shared/dist')) {
    execSync('rm -rf shared/dist', { stdio: 'inherit' });
  }

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci', { stdio: 'inherit' });
  execSync('cd shared && npm ci', { stdio: 'inherit' });
  execSync('cd server && npm ci', { stdio: 'inherit' });

  // Build all packages
  console.log('🔨 Building application...');
  execSync('npm run build:all', { stdio: 'inherit' });

  console.log('✅ Deployment preparation complete!');
  console.log('📁 Built files:');
  console.log('  - Frontend: dist/');
  console.log('  - Backend: server/dist/');
  console.log('  - Shared: shared/dist/');

} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message);
  process.exit(1);
}
