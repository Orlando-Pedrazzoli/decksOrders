import express from 'express';
import {
  isAuth,
  login,
  logout,
  register,
  convertGuestToUser,
  checkEmailExists,
} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();

// Rotas públicas
userRouter.post('/register', register);
userRouter.post('/login', login);

// 🆕 Rotas de Guest Checkout
userRouter.post('/convert-guest', convertGuestToUser);
userRouter.post('/check-email', checkEmailExists);

// Rotas protegidas
userRouter.get('/is-auth', authUser, isAuth);
userRouter.get('/logout', authUser, logout);

export default userRouter;