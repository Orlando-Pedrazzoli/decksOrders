import express from 'express';
import {
  isAuth,
  login,
  logout,
  register,
} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();

// Enhanced CORS pre-flight for all routes
userRouter.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// Registration with device detection
userRouter.post(
  '/register',
  (req, res, next) => {
    req.isMobile = /iPhone|iPad|iPod|Android/i.test(req.headers['user-agent']);
    next();
  },
  register
);

// Login with mobile support
userRouter.post(
  '/login',
  (req, res, next) => {
    req.isMobile = /iPhone|iPad|iPod|Android/i.test(req.headers['user-agent']);
    next();
  },
  login
);

// Authentication check with dual token support
userRouter.get('/is-auth', authUser, (req, res) => {
  if (req.isMobile && req.user) {
    res.set('Authorization', `Bearer ${req.user.token}`);
  }
  isAuth(req, res);
});

// Logout with cookie clearing
userRouter.get('/logout', authUser, (req, res) => {
  // Clear cookie
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: req.secure,
    sameSite: 'none',
    domain: req.secure ? '.elitesurfing.vercel.app' : undefined,
  });

  // Clear mobile token header
  if (req.isMobile) {
    res.removeHeader('Authorization');
  }

  logout(req, res);
});

export default userRouter;
