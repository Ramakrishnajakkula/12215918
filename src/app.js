require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const urlRoutes = require('./routes/url.routes');
const { Log } = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await Log('backend', 'info', 'server', 'Starting URL Shortener Microservice...');
    
    await connectDB();
    
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    app.set('trust proxy', true);
    
    app.use(async (req, res, next) => {
      await Log('backend', 'debug', 'request', `${req.method} ${req.path} - IP: ${req.ip}`);
      next();
    });
    
    app.get('/health', async (req, res) => {
      await Log('backend', 'info', 'health-check', 'Health check requested');
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'URL Shortener Microservice',
        version: '1.0.0'
      });
    });
    
    app.use('/', urlRoutes);
    
    app.use(async (req, res) => {
      await Log('backend', 'warn', 'server', `404 - Route not found: ${req.method} ${req.path}`);
      res.status(404).json({
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: 'The requested route does not exist',
          timestamp: new Date().toISOString()
        }
      });
    });
    
    app.use(async (error, req, res, next) => {
      await Log('backend', 'error', 'server', `Unhandled error: ${error.message}`);
      
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An internal server error occurred',
          timestamp: new Date().toISOString()
        }
      });
    });
    
    app.listen(PORT, async () => {
      await Log('backend', 'info', 'server', `Server running on port ${PORT}`);
      await Log('backend', 'info', 'server', `Health check available at: http://localhost:${PORT}/health`);
      await Log('backend', 'info', 'server', `Environment: ${process.env.NODE_ENV || 'development'}`);
      await Log('backend', 'info', 'server', 'URL Shortener Microservice successfully started');
    });
    
  } catch (error) {
    await Log('backend', 'fatal', 'server', `Failed to start server: ${error.message}`);
    await Log('backend', 'fatal', 'server', `Server startup error details: ${error.stack}`);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  await Log('backend', 'info', 'server', 'SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  await Log('backend', 'info', 'server', 'SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  await Log('backend', 'fatal', 'server', `Uncaught exception: ${error.message}`);
  await Log('backend', 'fatal', 'server', `Uncaught exception stack: ${error.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  await Log('backend', 'fatal', 'server', `Unhandled rejection: ${reason}`);
  await Log('backend', 'fatal', 'server', `Unhandled rejection at promise: ${promise}`);
  process.exit(1);
});

startServer();
