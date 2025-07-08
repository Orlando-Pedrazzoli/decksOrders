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
const port = process.env.PORT || 4001;

// 🔗 Conectar ao banco e cloudinary
await connectDB();
await connectCloudinary();

// 🟡 Webhook do Stripe precisa vir antes de qualquer parser!
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// 🟢 CORS deve vir antes de express.json()
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:4001',
      'http://localhost:3000',
      'https://elitesurfing.pt',
      'https://www.elitesurfing.pt',
      'https://elitesurfingeu-backend.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 🔧 Middlewares de parsing e cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ✅ Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Elite Surfing API is Working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 📦 Rotas principais
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// 🚨 Middleware de erro
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : error.message,
  });
});

// ❌ Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.originalUrl,
  });
});

// 🚀 Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Server started on PORT: ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
