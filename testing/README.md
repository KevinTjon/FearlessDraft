# Champion Draft Arena - Production Testing Suite

This comprehensive testing suite is designed to thoroughly test your Champion Draft Arena application in production. It includes load testing, spam testing, functional testing, and continuous monitoring capabilities.

## 🚀 Quick Start

### 1. Setup Testing Environment

```bash
# Navigate to testing directory
cd testing/

# Install dependencies
npm install
```

### 2. Configure Your Production URL

Edit `config.js` and update the `PRODUCTION_URL` with your actual Render deployment URL:

```javascript
PRODUCTION_URL: 'https://your-actual-app-name.onrender.com',
```

### 3. Run Tests

```bash
# Run all tests in sequence
npm run test:all

# Or run individual test suites:
npm run test:endpoints    # API endpoint tests
npm run test:functional   # Core functionality tests
npm run test:load        # Load testing
npm run test:spam        # Spam/abuse testing
npm run test:websocket   # WebSocket load testing

# Start continuous health monitoring
npm run monitor
```

## 📋 Test Categories

### 1. API Endpoint Tests (`npm run test:endpoints`)
- ✅ Health endpoint validation
- ✅ Sessions API testing
- ✅ CORS header verification
- ✅ Response time analysis
- ✅ Error handling validation
- ✅ Static file serving (production)

### 2. Functional Tests (`npm run test:functional`)
- ✅ WebSocket connection establishment
- ✅ Draft session creation and joining
- ✅ Multiple players joining same draft
- ✅ Draft actions (champion select/ban)
- ✅ Disconnection and reconnection handling

### 3. Load Tests (`npm run test:load`)
- 🔥 Concurrent request handling (50 simultaneous requests)
- 📊 Response time under load
- 📈 Server performance assessment
- 🎯 Success rate analysis

### 4. Spam Tests (`npm run test:spam`)
- 🚨 Rapid request flooding (100ms intervals)
- 🛡️ Rate limiting detection
- ⚡ Server resilience under abuse
- 🔒 DDoS protection validation

### 5. WebSocket Load Tests (`npm run test:websocket`)
- 🔌 Multiple concurrent WebSocket connections
- 💬 Real-time message handling under load
- 🎮 Draft simulation with multiple players
- 📡 Connection stability testing

### 6. Health Monitoring (`npm run monitor`)
- 💓 Continuous health checks (5-second intervals)
- 📊 Real-time performance metrics
- 🚨 Downtime detection
- 📈 Long-term stability analysis

## 🎯 Testing Scenarios

### Scenario 1: Basic Production Validation
```bash
npm run test:endpoints && npm run test:functional
```
**Purpose**: Verify all core features work correctly in production

### Scenario 2: Performance & Load Testing
```bash
npm run test:load && npm run test:websocket
```
**Purpose**: Assess server performance under normal and high load

### Scenario 3: Security & Abuse Testing
```bash
npm run test:spam
```
**Purpose**: Test server resilience against malicious traffic

### Scenario 4: Long-term Monitoring
```bash
npm run monitor
```
**Purpose**: Monitor production health over extended periods

## 🔧 Configuration Options

### Test Parameters (config.js)
- `MAX_CONCURRENT_CONNECTIONS`: Maximum simultaneous connections (default: 50)
- `TEST_DURATION_MS`: How long to run load tests (default: 30 seconds)
- `SPAM_INTERVAL_MS`: Interval between spam requests (default: 100ms)
- `HEALTH_CHECK_INTERVAL`: Health monitoring frequency (default: 5 seconds)

### Command Line Options
- `--local` or `-l`: Test against local development server instead of production
- Example: `npm run test:load -- --local`

## 📊 Understanding Test Results

### Performance Benchmarks
- **Excellent**: <1s response time, >95% success rate
- **Good**: <3s response time, >80% success rate  
- **Needs Attention**: >3s response time or <80% success rate

### Expected Results for Free Render Plan
- Response times: 1-5 seconds (cold start may be slower)
- Success rate: >90% under normal load
- WebSocket connections: Should handle 20-50 concurrent users
- Spam resistance: Server should remain responsive

### Warning Signs
- 🚨 Response times >10 seconds consistently
- 🚨 Success rate <70%
- 🚨 WebSocket connections failing frequently
- 🚨 Server becoming unresponsive during spam tests

## 🛠️ Troubleshooting

### Common Issues

**Connection Refused Errors**
- Server may be down or URL incorrect
- Check your Render deployment status
- Verify the PRODUCTION_URL in config.js

**Timeout Errors**
- Render free plan has cold start delays (10-30 seconds)
- Wait for server to warm up before testing
- Consider running health monitor first

**WebSocket Connection Failures**
- Check if WebSocket transport is enabled on Render
- Verify CORS configuration
- Test with polling transport fallback

**Rate Limiting**
- Some failures during spam tests are expected and good!
- Rate limiting indicates proper security measures

## 📈 Production Recommendations

Based on test results, consider these optimizations:

### For Poor Performance:
1. **Upgrade Render Plan**: Move from free to paid plan
2. **Add Caching**: Implement Redis for session management
3. **CDN**: Use CDN for static assets
4. **Database**: Add persistent storage instead of memory-only

### For Security:
1. **Rate Limiting**: Implement proper rate limiting middleware
2. **Input Validation**: Add request validation and sanitization
3. **Monitoring**: Set up production monitoring (New Relic, DataDog)
4. **Logging**: Implement structured logging

### For Scalability:
1. **Load Balancing**: Use multiple server instances
2. **Session Clustering**: Implement Redis-based session clustering
3. **WebSocket Scaling**: Use Redis adapter for Socket.IO
4. **Auto-scaling**: Configure auto-scaling based on CPU/memory

## 🔍 Advanced Testing

### Custom Test Scenarios
You can modify the test scripts to simulate specific scenarios:

1. **Peak Traffic Simulation**: Increase `MAX_CONCURRENT_CONNECTIONS`
2. **Extended Load Testing**: Increase `TEST_DURATION_MS`
3. **Aggressive Spam Testing**: Decrease `SPAM_INTERVAL_MS`

### Integration with CI/CD
Add these tests to your deployment pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Production Tests
  run: |
    cd testing
    npm install
    npm run test:endpoints
    npm run test:functional
```

## 📞 Support

If you encounter issues or need help interpreting results:
1. Check the test output logs for specific error messages
2. Review your Render deployment logs
3. Verify your application configuration
4. Consider the limitations of the free Render plan

---

**Happy Testing! 🎉**

Remember: Testing in production should be done responsibly. These tests are designed to be safe, but always monitor your server during testing and be prepared to stop tests if issues arise.
