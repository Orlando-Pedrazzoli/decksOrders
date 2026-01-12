import express from 'express';
import authUser from '../middlewares/authUser.js';
import { updateCart, getCart, validateCartStock } from '../controllers/cartController.js';

const cartRouter = express.Router();

// Rotas protegidas por autenticação
cartRouter.post('/update', authUser, updateCart);
cartRouter.post('/get', authUser, getCart);
cartRouter.post('/validate', validateCartStock); // 🆕 Validação de stock (pública)

export default cartRouter;