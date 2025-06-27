// 1. CORREÇÃO DO server.js - Configuração de CORS e domínios

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

// CORREÇÃO: Domínios atualizados e mais específicos
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4000',
  'https://elitesurfing.pt',
  'https://www.elitesurfing.pt',
  'https://elitesurfingeu-backend.vercel.app',
  // Adicione também sem www se necessário
  'http://elitesurfing.pt',
  'http://www.elitesurfing.pt',
];

// CORREÇÃO: Configuração de CORS mais robusta
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requisições sem origin (Postman, apps mobile, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Origem bloqueada:', origin);
        // Em produção, você pode querer ser mais permissivo temporariamente
        // callback(null, true); // Temporário para debug
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'], // IMPORTANTE para cookies
  })
);

// Handle preflight OPTIONS requests
app.options('*', cors());

// 🚨 ORDEM CRÍTICA: Stripe Webhook PRIMEIRO!
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// Middlewares padrão
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware de debug para cookies
app.use((req, res, next) => {
  console.log('Cookies recebidos:', req.cookies);
  console.log('Origin:', req.headers.origin);
  console.log('User-Agent:', req.headers['user-agent']);
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
  console.log('Allowed Origins:', allowedOrigins);
});

// 2. CORREÇÃO DO userController.js - Configuração de cookies

import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Função helper para configuração de cookies
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction, // Apenas HTTPS em produção
    sameSite: isProduction ? 'none' : 'lax', // 'none' necessário para domínios cruzados em HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    // CRÍTICO: Configurar domain para seu domínio
    domain: isProduction ? '.elitesurfing.pt' : undefined, // Permite subdomínios
    // Alternativa mais específica:
    // domain: isProduction ? 'www.elitesurfing.pt' : undefined,
  };
};

// Register User : /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: 'Missing Details' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const cookieOptions = getCookieOptions();
    res.cookie('token', token, cookieOptions);

    return res.json({
      success: true,
      user: { email: user.email, name: user.name, id: user._id },
    });
  } catch (error) {
    console.log('Register error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// Login User : /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.json({
        success: false,
        message: 'Email and password are required',
      });

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    const cookieOptions = getCookieOptions();
    res.cookie('token', token, cookieOptions);

    return res.json({
      success: true,
      user: { email: user.email, name: user.name, id: user._id },
    });
  } catch (error) {
    console.log('Login error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// Check Auth : /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.log('IsAuth error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// Logout User : /api/user/logout
export const logout = async (req, res) => {
  try {
    const cookieOptions = getCookieOptions();
    // Remove maxAge e adiciona expires no passado para forçar remoção
    delete cookieOptions.maxAge;
    cookieOptions.expires = new Date(0);

    res.clearCookie('token', cookieOptions);

    return res.json({ success: true, message: 'Logged Out' });
  } catch (error) {
    console.log('Logout error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// 3. CORREÇÃO DO sellerController.js

import jwt from 'jsonwebtoken';

// Função helper para configuração de cookies do seller
const getSellerCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: isProduction ? '.elitesurfing.pt' : undefined,
  };
};

// Login Seller : /api/seller/login
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      password === process.env.SELLER_PASSWORD &&
      email === process.env.SELLER_EMAIL
    ) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      const cookieOptions = getSellerCookieOptions();
      res.cookie('sellerToken', token, cookieOptions);

      return res.json({ success: true, message: 'Logged In' });
    } else {
      return res.json({ success: false, message: 'Invalid Credentials' });
    }
  } catch (error) {
    console.log('Seller login error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// Seller isAuth : /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    console.log('Seller isAuth error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// Logout Seller : /api/seller/logout
export const sellerLogout = async (req, res) => {
  try {
    const cookieOptions = getSellerCookieOptions();
    delete cookieOptions.maxAge;
    cookieOptions.expires = new Date(0);

    res.clearCookie('sellerToken', cookieOptions);

    return res.json({ success: true, message: 'Logged Out' });
  } catch (error) {
    console.log('Seller logout error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// 4. VARIÁVEIS DE AMBIENTE NECESSÁRIAS (.env)

/*
Adicione estas variáveis no seu .env:

NODE_ENV=production
JWT_SECRET=seu_jwt_secret_aqui
SELLER_EMAIL=seu_email_seller
SELLER_PASSWORD=sua_senha_seller
STRIPE_SECRET_KEY=sua_stripe_key
STRIPE_WEBHOOK_SECRET=seu_webhook_secret

# Database
MONGODB_URI=sua_string_conexao_mongodb

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
*/

// 5. CONFIGURAÇÃO DO FRONTEND (axios/fetch)
// Adicione estas configurações no seu cliente React:

// Se usando axios, configure um interceptor:
/*
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://elitesurfingeu-backend.vercel.app'
  : 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // CRÍTICO: Envia cookies automaticamente
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para debug
api.interceptors.request.use(
  (config) => {
    console.log('Fazendo requisição para:', config.url);
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

export default api;
*/

// Se usando fetch, sempre inclua credentials:
/*
const fetchWithCredentials = async (url, options = {}) => {
  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://elitesurfingeu-backend.vercel.app'
    : 'http://localhost:4000';
    
  return fetch(`${API_URL}${url}`, {
    ...options,
    credentials: 'include', // CRÍTICO: Inclui cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
*/

// 6. CONFIGURAÇÕES VERCEL (vercel.json)
/*
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://www.elitesurfing.pt"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Cookie"
        }
      ]
    }
  ]
}
*/

// 7. CONFIGURAÇÃO DNS HOSTINGER
/*
Para garantir que o domínio funcione corretamente:

1. No painel da Hostinger, configure:
   - Tipo: CNAME
   - Nome: www
   - Valor: elitesurfing.vercel.app
   
2. Para o domínio raiz (sem www):
   - Tipo: A
   - Nome: @
   - Valor: 76.76.19.61 (IP do Vercel)
   
3. Adicione redirect de HTTP para HTTPS

Ou use apenas CNAME:
   - Tipo: CNAME  
   - Nome: @
   - Valor: elitesurfing.vercel.app
*/

// 8. PASSOS PARA TESTAR E RESOLVER:

/*
1. TESTE EM INCÓGNITO/PRIVADO:
   - Abra o navegador em modo incógnito
   - Teste login/logout
   - Verifique se os cookies são definidos

2. LIMPE COOKIES EXISTENTES:
   - F12 > Application > Cookies
   - Delete todos os cookies do seu domínio
   - Teste novamente

3. TESTE EM DIFERENTES DISPOSITIVOS:
   - Mobile
   - Desktop
   - Diferentes navegadores

4. LOGS PARA DEBUG:
   - Verifique os logs do Vercel
   - Verifique console do navegador
   - Verifique Network tab no DevTools

5. CONFIGURAÇÃO TEMPORÁRIA PARA DEBUG:
   - Temporarily set sameSite: 'lax' instead of 'none'
   - Test with domain: undefined temporarily
   - Check if cookies are being set at all
*/

// 9. TROUBLESHOOTING ESPECÍFICO:

/*
PROBLEMA: Logout não funciona no PC
SOLUÇÃO: Cookies não estão sendo limpos corretamente
- Verifique se o domain está correto na função de logout
- Use expires: new Date(0) além de clearCookie

PROBLEMA: Mobile faz logout automático
SOLUÇÃO: Cookies não estão sendo enviados em requisições subsequentes
- Verifique se withCredentials: true está configurado
- Verifique se sameSite: 'none' está configurado para HTTPS
- Verifique se secure: true está ativo em produção

PROBLEMA: Dados do usuário não carregam
SOLUÇÃO: Token não está sendo enviado ou validado
- Verifique middleware authUser
- Verifique se userId está sendo extraído corretamente
- Adicione logs para debug no middleware
*/
