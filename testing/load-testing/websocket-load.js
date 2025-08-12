// WebSocket load testing - tests Socket.IO connections and real-time features
import { io } from 'socket.io-client';
import { CONFIG, getTargetUrl, createMockDraftSession } from '../config.js';
import chalk from 'chalk';

const TARGET_URL = getTargetUrl();
let activeConnections = 0;
let successfulConnections = 0;
let failedConnections = 0;
let messagesReceived = 0;
let messagesSent = 0;

console.log(chalk.cyan('🔌 Starting WebSocket Load Test'));
console.log(chalk.gray(`Target: ${TARGET_URL}`));
console.log(chalk.gray(`Max Connections: ${CONFIG.MAX_CONCURRENT_CONNECTIONS}`));
console.log(chalk.gray(`Duration: ${CONFIG.TEST_DURATION_MS / 1000}s`));
console.log(chalk.gray('─'.repeat(50)));

// Create a single WebSocket connection for testing
function createWebSocketConnection(connectionId) {
  return new Promise((resolve) => {
    const socket = io(TARGET_URL, {
      timeout: CONFIG.SOCKET_TIMEOUT,
      transports: ['websocket', 'polling']
    });

    const connectionData = {
      id: connectionId,
      socket: socket,
      connected: false,
      messagesReceived: 0,
      messagesSent: 0
    };

    socket.on('connect', () => {
      activeConnections++;
      successfulConnections++;
      connectionData.connected = true;
      console.log(chalk.green(`✓ Connection ${connectionId} established`));
      
      // Join a test draft session
      const mockSession = createMockDraftSession();
      socket.emit('join-draft', {
        draftId: mockSession.id,
        team: connectionId % 2 === 0 ? 'blue' : 'red',
        playerName: `TestPlayer${connectionId}`
      });
      
      connectionData.messagesSent++;
      messagesSent++;
    });

    socket.on('disconnect', () => {
      activeConnections--;
      console.log(chalk.yellow(`⚠️ Connection ${connectionId} disconnected`));
    });

    socket.on('connect_error', (error) => {
      failedConnections++;
      console.log(chalk.red(`✗ Connection ${connectionId} failed: ${error.message}`));
    });

    // Listen for various draft events
    socket.on('draft-state-updated', (data) => {
      connectionData.messagesReceived++;
      messagesReceived++;
      if (connectionId <= 3) { // Only log first few connections to avoid spam
        console.log(chalk.blue(`📨 Connection ${connectionId} received draft state update`));
      }
    });

    socket.on('player-joined', (data) => {
      connectionData.messagesReceived++;
      messagesReceived++;
      if (connectionId <= 3) {
        console.log(chalk.blue(`📨 Connection ${connectionId} received player joined`));
      }
    });

    socket.on('error', (error) => {
      console.log(chalk.red(`✗ Connection ${connectionId} error: ${error}`));
    });

    // Simulate periodic activity
    const activityInterval = setInterval(() => {
      if (connectionData.connected) {
        // Simulate champion selection or ban
        const mockAction = {
          type: Math.random() > 0.5 ? 'select' : 'ban',
          championId: Math.floor(Math.random() * 100) + 1,
          team: connectionId % 2 === 0 ? 'blue' : 'red'
        };
        
        socket.emit('draft-action', mockAction);
        connectionData.messagesSent++;
        messagesSent++;
      }
    }, 5000 + Math.random() * 5000); // Random interval between 5-10 seconds

    // Clean up after test duration
    setTimeout(() => {
      clearInterval(activityInterval);
      if (socket.connected) {
        socket.disconnect();
      }
      resolve(connectionData);
    }, CONFIG.TEST_DURATION_MS);
  });
}

// Run WebSocket load test
async function runWebSocketLoadTest() {
  const connections = [];
  const testStartTime = Date.now();

  console.log(chalk.yellow('🚀 Creating WebSocket connections...'));

  // Create connections with staggered timing to avoid overwhelming the server
  for (let i = 0; i < CONFIG.MAX_CONCURRENT_CONNECTIONS; i++) {
    connections.push(createWebSocketConnection(i + 1));
    
    // Small delay between connection attempts
    if (i % 5 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Wait for all connections to complete their lifecycle
  const results = await Promise.allSettled(connections);
  
  const testDuration = Date.now() - testStartTime;

  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.cyan('🔌 WebSocket Load Test Results:'));
  console.log(chalk.green(`✓ Successful connections: ${successfulConnections}`));
  console.log(chalk.red(`✗ Failed connections: ${failedConnections}`));
  console.log(chalk.blue(`📨 Total messages sent: ${messagesSent}`));
  console.log(chalk.blue(`📬 Total messages received: ${messagesReceived}`));
  console.log(chalk.yellow(`⏱️ Test duration: ${(testDuration / 1000).toFixed(2)}s`));
  console.log(chalk.yellow(`📈 Connection success rate: ${((successfulConnections / CONFIG.MAX_CONCURRENT_CONNECTIONS) * 100).toFixed(2)}%`));
  
  if (messagesReceived > 0) {
    console.log(chalk.yellow(`💬 Avg messages per connection: ${(messagesReceived / successfulConnections).toFixed(2)}`));
  }

  // WebSocket performance assessment
  if (successfulConnections >= CONFIG.MAX_CONCURRENT_CONNECTIONS * 0.9 && messagesReceived > messagesSent * 0.5) {
    console.log(chalk.green('🎉 WebSocket performance: EXCELLENT'));
  } else if (successfulConnections >= CONFIG.MAX_CONCURRENT_CONNECTIONS * 0.7) {
    console.log(chalk.yellow('⚠️ WebSocket performance: ACCEPTABLE'));
  } else {
    console.log(chalk.red('🚨 WebSocket performance: NEEDS ATTENTION'));
  }

  console.log(chalk.gray('Test completed. Exiting...'));
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️ Test interrupted by user'));
  process.exit(0);
});

// Run the test
runWebSocketLoadTest().catch(console.error);
