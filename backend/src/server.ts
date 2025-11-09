// Load environment variables FIRST (before any local imports)
import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { connectDatabase, initCloudinary } from './config';
import { errorHandler, notFoundHandler } from './middleware';
import routes from './routes';

// Initialize Cloudinary after dotenv is loaded
initCloudinary();

// Ensure upload directories exist
const uploadDirs = [
  'uploads',
  'uploads/images',
  'uploads/audio',
  'uploads/other',
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

const app: Application = express();
const PORT = Number(process.env.PORT) || 5000; // Default: 5000
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging (Development only)
if (NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api', routes);

// Serve Frontend (Production only)
if (NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');

  // Serve static files from frontend/dist
  app.use(express.static(frontendDistPath));

  // Handle React Router - send all non-API requests to index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Root route (Development only)
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'JOCH Bandpage API 🎸',
      version: '1.0.0',
      environment: NODE_ENV,
    });
  });
}

// Error Handlers (must be last!)
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server läuft auf http://localhost:${PORT}`);
      console.log(`📡 Environment: ${NODE_ENV}`);
      console.log(`🎸 JOCH Backend ist bereit!\n`);
    });
  } catch (error) {
    console.error('❌ Server Start fehlgeschlagen:', error);
    process.exit(1);
  }
};

startServer();

export default app;
