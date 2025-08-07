// server.js - Baseado no código que funciona
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
import reviewRouter from './routes/reviewRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4001;

// ✅ Conexões (igual ao código que funciona)
await connectDB();
await connectCloudinary();

console.log('✅ Database connected successfully');
console.log('✅ Cloudinary connected successfully');

// ✅ Middleware configuration (baseado no código que funciona)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4001',
  'http://localhost:3000',
  'https://elitesurfing.pt',
  'https://www.elitesurfing.pt',
  'https://elitesurfingeu-backend.vercel.app',
];

app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ✅ Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Elite Surfing API is Working - CLEAN VERSION',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0', // ✅ Nova versão para confirmar deploy
    webhook: '/webhook/stripe',
    webhookEvents: [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
    ],
  });
});

// ✅ Rotas principais
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/reviews', reviewRouter);

console.log('✅ All routes registered');

// ✅ 404 handler (no final)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.originalUrl,
  });
});

// ✅ Server startup
const isVercel = !!process.env.VERCEL;
if (!isVercel) {
  app.listen(port, () => {
    console.log(`🚀 Server running on PORT: ${port}`);
    console.log('🎯 Webhook: /webhook/stripe');
  });
}

export default app;
