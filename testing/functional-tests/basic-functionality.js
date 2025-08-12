// Basic functionality testing - tests core draft features end-to-end
import { io } from 'socket.io-client';
import { CONFIG, getTargetUrl, createMockDraftSession } from '../config.js';
import chalk from 'chalk';

const TARGET_URL = getTargetUrl();
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

console.log(chalk.blue('🧪 Starting Basic Functionality Tests'));
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

// Test basic WebSocket connection
function testBasicWebSocketConnection() {
  return new Promise((resolve, reject) => {
    const socket = io(TARGET_URL, {
      timeout: CONFIG.SOCKET_TIMEOUT,
      transports: ['websocket', 'polling']
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Connection timeout'));
    }, CONFIG.SOCKET_TIMEOUT);

    socket.on('connect', () => {
      clearTimeout(timeout);
      console.log(chalk.gray(`   Connected with ID: ${socket.id}`));
      socket.disconnect();
      resolve();
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Connection failed: ${error.message}`));
    });
  });
}

// Test draft session creation and joining
function testDraftSessionJoining() {
  return new Promise((resolve, reject) => {
    const socket = io(TARGET_URL, {
      timeout: CONFIG.SOCKET_TIMEOUT,
      transports: ['websocket', 'polling']
    });

    const mockSession = createMockDraftSession();
    let playerJoinedReceived = false;
    let draftStateReceived = false;

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Test timeout - expected events not received'));
    }, 10000);

    socket.on('connect', () => {
      console.log(chalk.gray(`   Joining draft session: ${mockSession.id}`));
      
      socket.emit('join-draft', {
        draftId: mockSession.id,
        team: 'blue',
        playerName: 'TestPlayer1'
      });
    });

    socket.on('player-joined', (data) => {
      console.log(chalk.gray(`   Player joined event received: ${JSON.stringify(data)}`));
      playerJoinedReceived = true;
      
      if (playerJoinedReceived && draftStateReceived) {
        clearTimeout(timeout);
        socket.disconnect();
        resolve();
      }
    });

    socket.on('draft-state-updated', (data) => {
      console.log(chalk.gray(`   Draft state updated: Phase ${data.currentPhaseIndex || 0}`));
      draftStateReceived = true;
      
      if (playerJoinedReceived && draftStateReceived) {
        clearTimeout(timeout);
        socket.disconnect();
        resolve();
      }
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);
      socket.disconnect();
      reject(new Error(`Socket error: ${error}`));
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Connection failed: ${error.message}`));
    });
  });
}

// Test multiple players joining the same draft
function testMultiplePlayersJoining() {
  return new Promise((resolve, reject) => {
    const mockSession = createMockDraftSession();
    const sockets = [];
    let playersJoined = 0;
    const expectedPlayers = 2;

    const timeout = setTimeout(() => {
      sockets.forEach(s => s.disconnect());
      reject(new Error('Test timeout - not all players joined'));
    }, 15000);

    function createPlayer(playerNum, team) {
      const socket = io(TARGET_URL, {
        timeout: CONFIG.SOCKET_TIMEOUT,
        transports: ['websocket', 'polling']
      });
      
      sockets.push(socket);

      socket.on('connect', () => {
        socket.emit('join-draft', {
          draftId: mockSession.id,
          team: team,
          playerName: `TestPlayer${playerNum}`
        });
      });

      socket.on('player-joined', (data) => {
        playersJoined++;
        console.log(chalk.gray(`   Player ${playerNum} joined successfully (${playersJoined}/${expectedPlayers})`));
        
        if (playersJoined >= expectedPlayers) {
          clearTimeout(timeout);
          setTimeout(() => {
            sockets.forEach(s => s.disconnect());
            resolve();
          }, 1000);
        }
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        sockets.forEach(s => s.disconnect());
        reject(new Error(`Player ${playerNum} connection failed: ${error.message}`));
      });
    }

    // Create blue team player
    createPlayer(1, 'blue');
    
    // Create red team player with slight delay
    setTimeout(() => {
      createPlayer(2, 'red');
    }, 1000);
  });
}

// Test draft action (champion selection/ban)
function testDraftAction() {
  return new Promise((resolve, reject) => {
    const socket = io(TARGET_URL, {
      timeout: CONFIG.SOCKET_TIMEOUT,
      transports: ['websocket', 'polling']
    });

    const mockSession = createMockDraftSession();
    let actionProcessed = false;

    const timeout = setTimeout(() => {
      socket.disconnect();
      reject(new Error('Test timeout - draft action not processed'));
    }, 10000);

    socket.on('connect', () => {
      // First join the draft
      socket.emit('join-draft', {
        draftId: mockSession.id,
        team: 'blue',
        playerName: 'TestPlayer'
      });
    });

    socket.on('player-joined', () => {
      // After joining, attempt a draft action
      console.log(chalk.gray(`   Attempting champion ban...`));
      
      socket.emit('draft-action', {
        type: 'ban',
        championId: 1, // Assuming champion ID 1 exists
        team: 'blue'
      });
    });

    socket.on('draft-state-updated', (data) => {
      if (!actionProcessed) {
        actionProcessed = true;
        console.log(chalk.gray(`   Draft action processed, current phase: ${data.currentPhaseIndex || 0}`));
        clearTimeout(timeout);
        socket.disconnect();
        resolve();
      }
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);
      socket.disconnect();
      reject(new Error(`Socket error: ${error}`));
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Connection failed: ${error.message}`));
    });
  });
}

// Test session disconnection and reconnection
function testDisconnectionReconnection() {
  return new Promise((resolve, reject) => {
    const mockSession = createMockDraftSession();
    let socket = io(TARGET_URL, {
      timeout: CONFIG.SOCKET_TIMEOUT,
      transports: ['websocket', 'polling']
    });

    let disconnected = false;
    let reconnected = false;

    const timeout = setTimeout(() => {
      if (socket) socket.disconnect();
      reject(new Error('Test timeout - reconnection failed'));
    }, 15000);

    socket.on('connect', () => {
      if (!disconnected) {
        // First connection
        console.log(chalk.gray(`   Initial connection established`));
        socket.emit('join-draft', {
          draftId: mockSession.id,
          team: 'blue',
          playerName: 'TestPlayer'
        });
      } else {
        // Reconnection
        reconnected = true;
        console.log(chalk.gray(`   Successfully reconnected`));
        clearTimeout(timeout);
        socket.disconnect();
        resolve();
      }
    });

    socket.on('player-joined', () => {
      if (!disconnected) {
        // Simulate disconnection
        console.log(chalk.gray(`   Simulating disconnection...`));
        disconnected = true;
        socket.disconnect();
        
        // Attempt reconnection after short delay
        setTimeout(() => {
          console.log(chalk.gray(`   Attempting reconnection...`));
          socket = io(TARGET_URL, {
            timeout: CONFIG.SOCKET_TIMEOUT,
            transports: ['websocket', 'polling']
          });
          
          // Re-attach event handlers for reconnection
          socket.on('connect', () => {
            reconnected = true;
            console.log(chalk.gray(`   Successfully reconnected`));
            clearTimeout(timeout);
            socket.disconnect();
            resolve();
          });
          
          socket.on('connect_error', (error) => {
            clearTimeout(timeout);
            reject(new Error(`Reconnection failed: ${error.message}`));
          });
        }, 2000);
      }
    });

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Initial connection failed: ${error.message}`));
    });
  });
}

// Run all functional tests
async function runAllTests() {
  console.log(chalk.cyan('Starting comprehensive functionality testing...\n'));
  
  await runTest('Basic WebSocket Connection', testBasicWebSocketConnection);
  await runTest('Draft Session Joining', testDraftSessionJoining);
  await runTest('Multiple Players Joining', testMultiplePlayersJoining);
  await runTest('Draft Action Processing', testDraftAction);
  await runTest('Disconnection & Reconnection', testDisconnectionReconnection);
  
  // Summary
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.blue('📊 Functionality Test Summary:'));
  console.log(chalk.yellow(`📋 Tests run: ${testsRun}`));
  console.log(chalk.green(`✅ Tests passed: ${testsPassed}`));
  console.log(chalk.red(`❌ Tests failed: ${testsFailed}`));
  console.log(chalk.yellow(`📈 Success rate: ${((testsPassed / testsRun) * 100).toFixed(2)}%`));
  
  if (testsFailed === 0) {
    console.log(chalk.green('🎉 All functionality tests passed!'));
  } else if (testsPassed > testsFailed) {
    console.log(chalk.yellow('⚠️ Some tests failed, but core functionality works'));
  } else {
    console.log(chalk.red('🚨 Critical functionality issues detected'));
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️ Test interrupted by user'));
  process.exit(0);
});

// Run the tests
runAllTests().catch(error => {
  console.error(chalk.red('💥 Test suite failed:'), error.message);
  process.exit(1);
});
