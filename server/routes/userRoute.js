// server/routes/userRoute.js
// 🆕 ATUALIZADO: Adicionado rota login-link-order

import express from 'express';
import {
  isAuth,
  login,
  logout,
  register,
  convertGuestToUser,
  checkEmailExists,
  loginAndLinkOrder,
} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();

// =============================================================================
// ROTAS PÚBLICAS
// =============================================================================
userRouter.post('/register', register);
userRouter.post('/login', login);

// 🆕 Rotas de Guest Checkout / Pós-Venda
userRouter.post('/convert-guest', convertGuestToUser);    // Criar conta a partir de guest
userRouter.post('/check-email', checkEmailExists);         // Verificar se email já existe
userRouter.post('/login-link-order', loginAndLinkOrder);   // 🆕 Login + vincular pedidos

// =============================================================================
// ROTAS PROTEGIDAS (requerem autenticação)
// =============================================================================
userRouter.get('/is-auth', authUser, isAuth);
userRouter.get('/logout', authUser, logout);

export default userRouter;