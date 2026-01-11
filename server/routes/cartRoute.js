import express from 'express';
import authUser from '../middlewares/authUser.js';
import { 
  updateCart, 
  getCart,
  // 🆕 Novas funções
  checkStock,
  validateCart,
} from '../controllers/cartController.js';

const cartRouter = express.Router();

// Rotas existentes
cartRouter.post('/update', authUser, updateCart);
cartRouter.post('/get', authUser, getCart);

// 🆕 Novas rotas para verificação de stock
cartRouter.post('/check-stock', checkStock); // Público para verificar stock antes de adicionar
cartRouter.post('/validate', authUser, validateCart); // Validar carrinho completo antes do checkout

export default cartRouter;