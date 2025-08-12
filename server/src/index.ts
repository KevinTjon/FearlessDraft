// Main server entry point - clean and modular
import { createServer } from 'http';
import { Server } from 'socket.io';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { SessionManager } from './services/SessionManager.js';
import { DraftService } from './services/DraftService.js';
import { TimerService } from './services/TimerService.js';
import { SocketHandler } from './handlers/SocketHandler.js';

const app = express();
const httpServer = createServer(app);

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req: Request, res: Response) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

// Initialize services
const sessionManager = new SessionManager();
const draftService = new DraftService();
const timerService = new TimerService();

// Initialize socket handler
const socketHandler = new SocketHandler(io, sessionManager, draftService, timerService);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const stats = socketHandler.getStats();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    ...stats
  });
});

// API endpoint to get session info (useful for debugging)
app.get('/api/sessions/:draftId', (req: Request, res: Response) => {
  const session = sessionManager.getSession(req.params.draftId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// API endpoint to get all sessions (admin/debug use)
app.get('/api/sessions', (req: Request, res: Response) => {
  const sessions = sessionManager.getAllSessions();
  res.json({
    count: sessions.length,
    sessions: sessions.map(s => ({
      id: s.id,
      blueTeamName: s.blueTeamName,
      redTeamName: s.redTeamName,
      inProgress: s.inProgress,
      currentPhaseIndex: s.currentPhaseIndex,
      createdAt: s.createdAt,
      blueConnected: s.blueConnected,
      redConnected: s.redConnected
    }))
  });
});

// Graceful shutdown handling
const cleanup = () => {
  console.log('Shutting down server...');
  
  // Cleanup services
  socketHandler.destroy();
  timerService.destroy();
  sessionManager.destroy();
  
  // Close server
  httpServer.close(() => {
    console.log('Server shut down gracefully');
    process.exit(0);
  });
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Champion Draft Arena Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔧 Sessions API available at http://localhost:${PORT}/api/sessions`);
});