import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config';
import { errorHandler, notFoundHandler } from './middleware';
import routes from './routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
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

// Root route
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'JOCH Bandpage API 🎸',
    version: '1.0.0',
    environment: NODE_ENV,
  });
});

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
