import express from 'express';
import {
  isAuth,
  login,
  logout,
  register,
} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();

// 1. Enhanced CORS Pre-Flight Handling
userRouter.options('*', (req, res) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://elitesurfing.vercel.app',
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Device-Type',
      'Access-Control-Expose-Headers': 'Authorization, Set-Cookie',
      Vary: 'Origin',
    });
  }
  res.status(204).end(); // 204 No Content for preflight
});

// 2. Device Detection Middleware
const detectDevice = (req, res, next) => {
  req.isMobile = /iPhone|iPad|iPod|Android/i.test(req.headers['user-agent']);
  req.isIOS = /iPhone|iPad|iPod/i.test(req.headers['user-agent']);
  next();
};

// 3. Registration Endpoint
userRouter.post('/register', detectDevice, register);

// 4. Login Endpoint with Mobile Support
userRouter.post('/login', detectDevice, login);

// 5. Authentication Check with Token Refresh
userRouter.get('/is-auth', authUser, (req, res) => {
  if (req.isMobile) {
    // Send fresh token in both header and body for mobile
    res.set('Authorization', `Bearer ${req.user.token}`);
    res.set('Cache-Control', 'no-store');

    return res.json({
      success: true,
      user: req.user,
      token: req.isIOS ? req.user.token : undefined, // Only for iOS
    });
  }
  isAuth(req, res);
});

// 6. Secure Logout Handling
userRouter.get('/logout', authUser, (req, res) => {
  // Clear HTTP-only cookie
  const cookieOptions = {
    httpOnly: true,
    secure: req.secure,
    sameSite: req.secure ? 'none' : 'lax',
    domain: req.secure ? '.elitesurfing.vercel.app' : undefined,
    path: '/',
  };

  res.clearCookie('auth_token', cookieOptions);

  // Mobile-specific cleanup
  if (req.isMobile) {
    res.removeHeader('Authorization');
    res.json({
      success: true,
      clearLocalToken: true, // Signal client to clear localStorage
    });
    return;
  }

  logout(req, res);
});

export default userRouter;
