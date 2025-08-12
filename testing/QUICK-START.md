# 🚀 Quick Start - Production Testing

## 1. Setup (First Time Only)
```bash
cd testing/
npm install
npm run setup
```
Follow the prompts to configure your production URL.

## 2. Quick Validation Tests
```bash
npm run test:quick
```
Runs API endpoints and basic functionality tests (~2 minutes).

## 3. Full Test Suite
```bash
npm run test:all
```
Runs comprehensive testing including load and spam tests (~5 minutes).

## 4. Individual Tests
```bash
npm run test:endpoints    # API tests
npm run test:functional   # Core features
npm run test:load        # Performance
npm run test:spam        # Abuse resistance
npm run test:websocket   # WebSocket load
```

## 5. Continuous Monitoring
```bash
npm run monitor
```
Monitors server health continuously (Ctrl+C to stop).

## 🎯 What Each Test Does

| Test | Purpose | Duration | What It Checks |
|------|---------|----------|----------------|
| **endpoints** | API validation | 30s | All endpoints work correctly |
| **functional** | Core features | 60s | Draft creation, WebSocket, player actions |
| **load** | Performance | 30s | Server handles concurrent requests |
| **websocket** | Real-time | 30s | Multiple WebSocket connections |
| **spam** | Security | 30s | Resilience against rapid requests |
| **monitor** | Health | Ongoing | Continuous server monitoring |

## 🚨 Expected Results (Render Free Plan)
- ✅ **Response times**: 1-5 seconds (first request may be slower)
- ✅ **Success rate**: >90%
- ✅ **WebSocket connections**: 20-50 concurrent users
- ✅ **Spam resistance**: Server stays responsive

## 🔧 Troubleshooting
- **Connection refused**: Check if your server is running and URL is correct
- **Timeouts**: Render free plan has cold starts - wait 30s and retry
- **Some failures during spam test**: This is normal and good (shows protection)

---
**Need help?** Check the full [README.md](README.md) for detailed documentation.
