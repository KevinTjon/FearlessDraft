#!/usr/bin/env node
// Development script to run both server and client concurrently

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Champion Draft Arena in development mode...\n');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function logWithPrefix(prefix, color, data) {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    console.log(`${color}[${prefix}]${colors.reset} ${line}`);
  });
}

// Start server
console.log('🔧 Starting server...');
const server = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '../server'),
  stdio: 'pipe',
  shell: true
});

server.stdout.on('data', (data) => {
  logWithPrefix('SERVER', colors.blue, data);
});

server.stderr.on('data', (data) => {
  logWithPrefix('SERVER', colors.red, data);
});

server.on('close', (code) => {
  console.log(`${colors.red}[SERVER]${colors.reset} Process exited with code ${code}`);
  process.exit(code);
});

// Wait a bit for server to start, then start client
setTimeout(() => {
  console.log('🎨 Starting client...');
  const client = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
    shell: true
  });

  client.stdout.on('data', (data) => {
    logWithPrefix('CLIENT', colors.green, data);
  });

  client.stderr.on('data', (data) => {
    logWithPrefix('CLIENT', colors.yellow, data);
  });

  client.on('close', (code) => {
    console.log(`${colors.yellow}[CLIENT]${colors.reset} Process exited with code ${code}`);
    server.kill();
    process.exit(code);
  });
}, 2000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  process.exit(0);
});
