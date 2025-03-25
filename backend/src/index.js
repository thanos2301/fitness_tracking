import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import dietRoutes from './routes/diet.js';
import supportRoutes from './routes/support.js';
import rehabilitationRouter from './routes/rehabilitation.js';
import formCheckRoutes from './routes/formCheck.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/diet', dietRoutes);
app.use('/support', supportRoutes);
app.use('/rehabilitation', rehabilitationRouter);
app.use('/form-check', formCheckRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'API is working' });
});

const connectWithRetry = async () => {
  const maxRetries = 5;
  let currentTry = 1;

  while (currentTry <= maxRetries) {
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
      return true;
    } catch (err) {
      console.log(`Database connection attempt ${currentTry} failed:`, err.message);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      currentTry++;
    }
  }
  return false;
};

const startServer = async () => {
  try {
    const isConnected = await connectWithRetry();
    if (!isConnected) {
      throw new Error('Failed to connect to database after multiple retries');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Available routes:');
      console.log('- /auth/*');
      console.log('- /diet/*');
      console.log('- /support/*');
      console.log('- /rehabilitation/*');
      console.log('- /form-check/*');
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
};

startServer();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Move the 404 handler to the end
app.use((req, res) => {
  console.log('404 for path:', req.path);
  res.status(404).json({ error: 'Route not found' });
});

// Handle cleanup
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});