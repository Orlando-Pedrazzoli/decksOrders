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

// Configuração ESSENCIAL para o Vercel
app.set('trust proxy', 1);

const port = process.env.PORT || 4000;

await connectDB();
await connectCloudinary();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4000',
  'https://elitesurfing.pt',
  'https://www.elitesurfing.pt',
  'https://elitesurfingeu-backend.vercel.app',
];

// Configuração de CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Origem bloqueada:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 🚨 ORDEM CRÍTICA: Stripe Webhook PRIMEIRO!
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// Middlewares padrão
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware de debug para cookies (opcional)
app.use((req, res, next) => {
  console.log('Cookies recebidos:', req.cookies);
  next();
});

// Rotas
app.get('/', (req, res) => res.send('API is Working'));
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
