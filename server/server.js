import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4000;

// Database and Cloudinary connections
await connectDB();
await connectCloudinary();

// Configure allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://elitesurfing.vercel.app',
];

// Stripe webhook handler (must come before body parser)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// Middleware configuration
app.use(express.json());
app.use(cookieParser());

// Enhanced CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization', 'Set-Cookie'],
  })
);

// Secure cookie detection middleware
app.use((req, res, next) => {
  req.secureCookies =
    req.secure || req.headers['x-forwarded-proto'] === 'https';
  next();
});

// iOS-specific headers middleware
app.use((req, res, next) => {
  const isIOS = /iPhone|iPad|iPod/i.test(req.headers['user-agent']);

  if (isIOS) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
  }
  next();
});

// CSRF protection middleware
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const origin = req.headers.origin || req.headers.referer;
    if (!allowedOrigins.includes(origin)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }
  next();
});

// Health check endpoint
app.get('/', (req, res) => res.send('API is Working'));

// API routes
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed Origins: ${allowedOrigins.join(', ')}`);
});
