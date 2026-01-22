import express from 'express';
import authUser from '../middlewares/authUser.js';
import { addAddress, getAddress, addGuestAddress } from '../controllers/addressController.js';

const addressRouter = express.Router();

// =============================================================================
// 🆕 ROTA PÚBLICA (GUEST CHECKOUT) - Deve vir ANTES das rotas protegidas
// =============================================================================
addressRouter.post('/guest', addGuestAddress);

// =============================================================================
// ROTAS ORIGINAIS (PROTEGIDAS)
// =============================================================================
addressRouter.post('/add', authUser, addAddress);
addressRouter.post('/get', authUser, getAddress);

export default addressRouter;