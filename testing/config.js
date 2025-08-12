// Testing configuration - modify these values for your production URL
export const CONFIG = {
  // Production URL - replace with your actual Render deployment URL
  PRODUCTION_URL: 'https://your-app-name.onrender.com',
  
  // Local testing URL (fallback)
  LOCAL_URL: 'http://localhost:3001',
  
  // Test parameters
  MAX_CONCURRENT_CONNECTIONS: 50,
  TEST_DURATION_MS: 30000, // 30 seconds
  REQUEST_INTERVAL_MS: 1000, // 1 second between requests
  SPAM_INTERVAL_MS: 100, // 100ms for spam testing
  
  // Health check settings
  HEALTH_CHECK_INTERVAL: 5000, // 5 seconds
  
  // Socket.IO settings
  SOCKET_TIMEOUT: 5000,
  
  // API endpoints to test
  ENDPOINTS: {
    HEALTH: '/health',
    SESSIONS: '/api/sessions',
    SESSION_BY_ID: '/api/sessions/:id'
  }
};

// Get the target URL (production by default, local for development)
export function getTargetUrl() {
  const args = process.argv.slice(2);
  const useLocal = args.includes('--local') || args.includes('-l');
  
  if (useLocal) {
    console.log('🔧 Using LOCAL URL for testing');
    return CONFIG.LOCAL_URL;
  }
  
  console.log('🚀 Using PRODUCTION URL for testing');
  return CONFIG.PRODUCTION_URL;
}

// Utility function to create test session data
export function createMockDraftSession() {
  const sessionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id: sessionId,
    blueTeamName: `Blue-${sessionId.slice(-6)}`,
    redTeamName: `Red-${sessionId.slice(-6)}`,
    gameMode: 'FEARLESS',
    bestOf: 1
  };
}
