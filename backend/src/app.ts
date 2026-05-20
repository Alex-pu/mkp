import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import prisma from './config/database';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3003',
      'http://localhost:3000',
      'http://localhost:5002',
      'http://10.0.2.2:8081', // Android emulator to host
      'exp://192.168.1.136:8081', // Expo Go
      /^exp:\/\/.*/, // All Expo Go origins
    ];
    
    if (!origin || allowedOrigins.some(allowed => 
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    )) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'DEGRADED',
      database: 'unreachable',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling
app.use(errorHandler);

export default app;