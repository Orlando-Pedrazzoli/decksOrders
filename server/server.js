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

// Configuração ESSENCIAL para o Vercel e proxies
app.set('trust proxy', 1);

const port = process.env.PORT || 4000;

await connectDB();
await connectCloudinary();

// Lista de origens permitidas - mais específica
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4000',
  'https://elitesurfing.pt',
  'https://www.elitesurfing.pt',
  'http://elitesurfing.pt',
  'http://www.elitesurfing.pt',
  'https://elitesurfingeu-backend.vercel.app',
];

// Configuração de CORS mais robusta
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requisições sem origin (ex: Postman, apps mobile)
      if (!origin) {
        console.log('⚠️ Request without origin - allowing');
        return callback(null, true);
      }

      console.log('🌐 Checking origin:', origin);

      if (allowedOrigins.includes(origin)) {
        console.log('✅ Origin allowed:', origin);
        callback(null, true);
      } else {
        console.log('❌ Origin blocked:', origin);
        console.log('📋 Allowed origins:', allowedOrigins);
        callback(new Error(`CORS: Origin ${origin} is not allowed`));
      }
    },
    credentials: true, // ESSENCIAL para cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'Set-Cookie',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200, // Para alguns browsers legados
  })
);

// Handle preflight OPTIONS requests explicitamente
app.options('*', (req, res) => {
  console.log('⚡ Preflight request from:', req.headers.origin);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,DELETE,OPTIONS,PATCH'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type,Authorization,Cookie,Set-Cookie,X-Requested-With,Accept,Origin'
  );
  res.sendStatus(200);
});

// 🚨 ORDEM CRÍTICA: Stripe Webhook PRIMEIRO (antes do express.json)!
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// Middlewares padrão
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware de debug aprimorado
app.use((req, res, next) => {
  console.log('\n=== REQUEST DEBUG ===');
  console.log('🚀 Method:', req.method);
  console.log('🔗 URL:', req.url);
  console.log('🌐 Origin:', req.headers.origin);
  console.log('🏠 Host:', req.headers.host);
  console.log('🍪 Cookies:', req.cookies);
  console.log(
    '📱 User-Agent:',
    req.headers['user-agent']?.substring(0, 50) + '...'
  );
  console.log('🔧 Content-Type:', req.headers['content-type']);

  // Log específico para requisições de autenticação
  if (req.url.includes('auth') || req.url.includes('login')) {
    console.log('🔐 Auth request detected');
    console.log('🔑 Token present:', !!req.cookies.token);
  }

  console.log('====================\n');
  next();
});

// Middleware para adicionar headers de segurança
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  // Headers de segurança
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');

  next();
});

// Rotas
app.get('/', (req, res) => {
  res.json({
    message: 'API is Working!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
  });
});

app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// Middleware de erro global aprimorado
app.use((err, req, res, next) => {
  console.error('💥 Global Error Handler:');
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.url);
  console.error('Request method:', req.method);
  console.error('Request origin:', req.headers.origin);

  // Se for erro de CORS, retornar mensagem específica
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS Error: Origin not allowed',
      origin: req.headers.origin,
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

// Rota 404
app.use('*', (req, res) => {
  console.log('❓ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

app.listen(port, () => {
  console.log('\n🚀 SERVER STARTED 🚀');
  console.log(`📡 Port: ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Trust Proxy: ${app.get('trust proxy')}`);
  console.log('✅ Allowed Origins:');
  allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
  console.log('========================\n');
});
