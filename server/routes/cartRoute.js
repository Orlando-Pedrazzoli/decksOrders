import express from 'express';
import authUser from '../middlewares/authUser.js';
import { updateCart, getCart, checkStock, validateCart } from '../controllers/cartController.js';

const cartRouter = express.Router();

// Rotas protegidas (user)
cartRouter.post('/update', authUser, updateCart);
cartRouter.get('/get', authUser, getCart);

// Rotas públicas (para validação de stock)
cartRouter.post('/check-stock', checkStock);
cartRouter.post('/validate', validateCart);

export default cartRouter;