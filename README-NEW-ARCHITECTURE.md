# Champion Draft Arena - New Architecture

## 🎯 Overview

This document describes the completely overhauled architecture for Champion Draft Arena. The new system addresses all the major issues in the previous implementation with a clean, modular, and maintainable design.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SHARED TYPES PACKAGE                     │
├─────────────────────────────────────────────────────────────┤
│  • Common interfaces, types, enums                          │
│  • Draft sequence definitions                               │
│  • Event schemas with validation                            │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
┌───────────────▼────────────────┐ ┌────────▼─────────────────┐
│         SERVER SIDE            │ │      CLIENT SIDE         │
├────────────────────────────────┤ ├──────────────────────────┤
│                                │ │                          │
│ ┌─────────────────────────────┐│ │ ┌──────────────────────┐ │
│ │     Socket Handler          ││ │ │   State Management   │ │
│ │ • Connection management     ││ │ │ • Zustand store      │ │
│ │ • Event routing            ││ │ │ • Normalized state   │ │
│ │ • Authentication           ││ │ │ • Optimistic updates │ │
│ └─────────────────────────────┘│ │ └──────────────────────┘ │
│                                │ │                          │
│ ┌─────────────────────────────┐│ │ ┌──────────────────────┐ │
│ │    Draft Service            ││ │ │   Socket Service     │ │
│ │ • Game logic               ││ │ │ • Connection mgmt    │ │
│ │ • Phase transitions        ││ │ │ • Auto reconnection  │ │
│ │ • Validation rules         ││ │ │ • Event handling     │ │
│ └─────────────────────────────┘│ │ └──────────────────────┘ │
│                                │ │                          │
│ ┌─────────────────────────────┐│ │ ┌──────────────────────┐ │
│ │    Session Manager          ││ │ │   Component Layer    │ │
│ │ • Session lifecycle        ││ │ │ • Draft container    │ │
│ │ • Persistence              ││ │ │ • Reusable UI        │ │
│ │ • Cleanup & GC             ││ │ │ • Error boundaries   │ │
│ └─────────────────────────────┘│ │ └──────────────────────┘ │
│                                │ │                          │
│ ┌─────────────────────────────┐│ │                          │
│ │     Timer Service           ││ │                          │
│ │ • Phase timers             ││ │                          │
│ │ • Cleanup management       ││ │                          │
│ │ • Event emission           ││ │                          │
│ └─────────────────────────────┘│ │                          │
└────────────────────────────────┘ └──────────────────────────┘
```

## 🔧 Quick Start

### 1. Setup (First Time)
```bash
npm run setup
```
This will:
- Build the shared types package
- Install all dependencies
- Create environment files
- Set up necessary directories

### 2. Development
```bash
# Run both server and client
npm run dev:full

# Or run separately
npm run dev:server  # Server only
npm run dev         # Client only
```

### 3. Production Build
```bash
npm run build:all
```

## 📁 Project Structure

```
champ-draft-arena-main/
├── shared/                    # Shared types and utilities
│   ├── types/                 # Type definitions
│   ├── utils/                 # Validation utilities
│   └── package.json           # Shared package config
├── server/                    # Backend server
│   ├── src/
│   │   ├── services/          # Business logic services
│   │   │   ├── SessionManager.ts
│   │   │   ├── DraftService.ts
│   │   │   └── TimerService.ts
│   │   ├── handlers/          # Socket event handlers
│   │   │   └── SocketHandler.ts
│   │   └── index.ts           # Server entry point
│   └── package.json
├── src/                       # Frontend client
│   ├── stores/                # State management
│   │   └── draftStore.ts      # Zustand store
│   ├── hooks/                 # Custom hooks
│   │   └── useDraft.ts        # Draft functionality hook
│   ├── services/              # Client services
│   │   └── socketService.ts   # Socket client
│   ├── components/            # UI components
│   │   └── ErrorBoundary.tsx  # Error handling
│   ├── utils/                 # Utilities
│   │   └── errorUtils.ts      # Error handling utils
│   └── pages/
│       └── DraftNew.tsx       # New draft component
├── scripts/                   # Build and dev scripts
│   ├── setup.js               # Setup script
│   └── dev.js                 # Development runner
└── package.json               # Main package config
```

## 🚀 Key Improvements

### 1. **Modular Server Architecture**
- **SessionManager**: Handles draft session lifecycle and cleanup
- **DraftService**: Contains all game logic and validation
- **TimerService**: Manages all timing operations
- **SocketHandler**: Clean event handling and routing

### 2. **Proper State Management**
- **Zustand Store**: Lightweight, performant state management
- **Normalized State**: Consistent data structure
- **Computed Selectors**: Optimized re-renders
- **Action Creators**: Clear state mutations

### 3. **Shared Type System**
- **Single Source of Truth**: Types shared between client/server
- **Validation**: Built-in validation utilities
- **Type Safety**: Full TypeScript coverage

### 4. **Enhanced Error Handling**
- **Error Boundaries**: Graceful UI error recovery
- **Error Classification**: Structured error types
- **User-Friendly Messages**: Clear error communication
- **Retry Logic**: Automatic retry with exponential backoff

### 5. **Better Resource Management**
- **Automatic Cleanup**: Session expiry and garbage collection
- **Memory Management**: Proper timer cleanup
- **Connection Handling**: Robust reconnection logic

## 🔌 API Endpoints

### Health Check
```
GET /health
```
Returns server status and statistics.

### Session Management
```
GET /api/sessions           # List all sessions
GET /api/sessions/:draftId  # Get specific session
```

## 🎮 Usage Examples

### Creating a Draft
```typescript
import { useDraft } from '../hooks/useDraft';

function DraftComponent() {
  const {
    draftState,
    uiState,
    currentTeam,
    toggleReady,
    selectChampion,
    setPendingSelection,
  } = useDraft({
    draftId: 'my-draft-id',
    teamFromUrl: 'Blue Team',
  });
  
  // Component logic here...
}
```

### Error Handling
```typescript
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useErrorHandler } from '../utils/errorUtils';

function MyComponent() {
  const handleError = useErrorHandler();
  
  const riskyOperation = async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      handleError(error, { context: 'riskyOperation' });
    }
  };
  
  return (
    <ErrorBoundary>
      {/* Your component JSX */}
    </ErrorBoundary>
  );
}
```

## 🔧 Configuration

### Server Configuration (.env)
```bash
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
SESSION_CLEANUP_INTERVAL=300000
SESSION_EXPIRY_TIME=3600000
PHASE_TIMER_DURATION=30000
SWAP_PHASE_DURATION=60
SWAP_LOCK_TIME=20
```

### Client Configuration (.env)
```bash
VITE_SERVER_URL=http://localhost:3001
VITE_NODE_ENV=development
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

## 🧪 Testing

The new architecture makes testing much easier:

```typescript
// Example service test
import { DraftService } from '../services/DraftService';

describe('DraftService', () => {
  it('should toggle team ready state', () => {
    const service = new DraftService();
    const session = createMockSession();
    
    const result = service.toggleTeamReady(session, 'BLUE');
    
    expect(result.blueReady).toBe(true);
  });
});
```

## 🚀 Deployment

### Development
```bash
npm run dev:full
```

### Production
```bash
npm run build:all
npm start
```

### Docker (Future Enhancement)
```dockerfile
# Example Dockerfile structure
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm run setup
RUN npm run build:all
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔮 Future Enhancements

1. **Database Integration**: Replace in-memory storage with Redis/PostgreSQL
2. **Authentication**: Add user authentication and authorization
3. **Analytics**: Add draft statistics and analytics
4. **Broadcasting**: Enhanced spectator features
5. **Mobile Support**: Responsive design improvements
6. **Testing**: Comprehensive test suite
7. **Documentation**: API documentation with Swagger
8. **Monitoring**: Health checks and metrics
9. **Scaling**: Horizontal scaling with load balancers
10. **PWA**: Progressive Web App features

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3001
   lsof -ti:3001 | xargs kill -9
   ```

2. **Module Not Found**
   ```bash
   # Rebuild shared package
   cd shared && npm run build
   ```

3. **Connection Issues**
   - Check server is running on port 3001
   - Verify CORS settings in server/.env
   - Check browser console for errors

4. **State Not Updating**
   - Check Zustand DevTools
   - Verify socket connection status
   - Check for JavaScript errors

## 📚 Additional Resources

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)

---

## 🎉 Migration Complete!

Your Champion Draft Arena now has:
- ✅ **Clean Architecture** with proper separation of concerns
- ✅ **Type Safety** with shared type definitions
- ✅ **Better Error Handling** with graceful recovery
- ✅ **Improved Performance** with optimized state management
- ✅ **Easy Maintenance** with modular code structure
- ✅ **Better Testing** capabilities
- ✅ **Enhanced Developer Experience**

The new architecture is production-ready and scalable for future enhancements!
