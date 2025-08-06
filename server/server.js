// server.js
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
// ✅ CORRIGIDO: Importar apenas as funções necessárias (sem duplicatas)
import {
  stripeWebhooksVercel, // ✅ Usar apenas a versão otimizada
  debugEnvironment,
  webhookSimpleTest,
} from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4001;

/* =========================
   Conexões externas
   ========================= */
try {
  await connectDB();
  console.log('✅ Database connected successfully');
} catch (error) {
  console.error('❌ Database connection failed:', error);
}

try {
  await connectCloudinary();
  console.log('✅ Cloudinary connected successfully');
} catch (error) {
  console.error('❌ Cloudinary connection failed:', error);
}

/* =========================
   🔔 Stripe Webhook (RAW BODY)
   ⚠️ TEM de vir ANTES de express.json()
   ========================= */
// ✅ CORRIGIDO: Apenas uma rota de webhook (não duas)
app.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhooksVercel
);

// ✅ ADICIONAR: Webhook de teste (aceita JSON normal)
app.post('/webhook/test', express.json(), webhookSimpleTest);

// ✅ ADICIONAR: Webhook de teste via GET (para testar no navegador)
app.get('/webhook/test', webhookSimpleTest);

// Debug das variáveis
app.get('/debug/env', debugEnvironment);

/* =========================
   CORS (antes dos parsers normais)
   ========================= */
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

/* =========================
   Parsers normais e cookies
   (após o webhook)
   ========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/* =========================
   Logs simples (opcional)
   ========================= */
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.originalUrl}`
    );
    next();
  });
}

/* =========================
   Health-check
   ========================= */
app.get('/', (req, res) => {
  res.json({
    message: 'Elite Surfing API is Working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    routes: {
      user: '/api/user/*',
      seller: '/api/seller/*',
      product: '/api/product/*',
      cart: '/api/cart/*',
      address: '/api/address/*',
      order: '/api/order/*',
      reviews: '/api/reviews/*',
      webhook: '/webhook/stripe',
      debug: '/debug/env',
    },
  });
});

/* =========================
   Rotas principais
   ========================= */
console.log('📝 Registrando rotas...');

app.use('/api/user', userRouter);
console.log('✅ User routes registered');

app.use('/api/seller', sellerRouter);
console.log('✅ Seller routes registered');

app.use('/api/product', productRouter);
console.log('✅ Product routes registered');

app.use('/api/cart', cartRouter);
console.log('✅ Cart routes registered');

app.use('/api/address', addressRouter);
console.log('✅ Address routes registered');

app.use('/api/order', orderRouter);
console.log('✅ Order routes registered');

app.use('/api/reviews', reviewRouter);
console.log('✅ Review routes registered');

/* =========================
   404 handler
   ========================= */
app.use('*', (req, res) => {
  console.log('❌ Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedPath: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /debug/env',
      'POST /webhook/stripe',
      'GET /api/reviews/test',
      'GET /api/reviews/recent',
      'POST /api/reviews/eligible-orders',
    ],
  });
});

/* =========================
   Arranque do servidor:
   - Em Vercel: exporta o app (sem listen)
   - Local dev: faz listen
   ========================= */
const isVercel = !!process.env.VERCEL;
if (!isVercel) {
  app.listen(port, () => {
    console.log(`🚀 Server started on PORT: ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('📋 Available endpoints:');
    console.log('  - GET  /');
    console.log('  - GET  /debug/env');
    console.log('  - POST /webhook/stripe');
    console.log('  - GET  /api/reviews/test');
    console.log('  - GET  /api/reviews/recent');
    console.log('  - POST /api/reviews/eligible-orders');
    console.log('  - POST /api/reviews/create');
    console.log('🎯 Ready to handle requests!');
  });
}

/* =========================
   Export para Vercel (@vercel/node)
   ========================= */
export default app;
