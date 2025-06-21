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

// 1. Database and Cloudinary connections
await connectDB();
await connectCloudinary();

// 2. Configure allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://elitesurfing.vercel.app',
];

// 3. Stripe webhook handler (must come before body parser)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// 4. Enhanced middleware configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 5. Safari-specific cookie middleware
app.use((req, res, next) => {
  res.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.set('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// 6. CORS configuration with iOS support
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Device-Type', // For mobile detection
    ],
    exposedHeaders: ['Set-Cookie', 'Authorization'],
  })
);

// 7. Secure cookie detection
app.use((req, res, next) => {
  req.isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  req.isIOS = /iPhone|iPad|iPod/i.test(req.headers['user-agent']);
  next();
});

// 8. Cookie configuration middleware
app.use((req, res, next) => {
  res.setCookie = (name, value, options = {}) => {
    const defaults = {
      httpOnly: true,
      secure: req.isSecure,
      sameSite: req.isSecure ? 'none' : 'lax',
      path: '/',
      domain: req.isSecure ? '.elitesurfing.vercel.app' : undefined,
    };

    if (req.isIOS) {
      defaults.partitioned = true; // Critical for Safari ITP
    }

    res.cookie(name, value, { ...defaults, ...options });
  };
  next();
});

// 9. API routes
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// 10. Safari cookie workaround endpoint
app.get('/api/auth/cookie-setter', (req, res) => {
  res.setCookie('safari_workaround', '1', {
    maxAge: 86400, // 1 day
  });
  res.sendStatus(200);
});

// 11. Error handling
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 12. Server startup
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(
    `Cookie domain: ${
      process.env.NODE_ENV === 'production'
        ? '.elitesurfing.vercel.app'
        : 'localhost'
    }`
  );
});
