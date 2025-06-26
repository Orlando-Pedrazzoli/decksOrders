import express from 'express';
import authUser from '../middlewares/authUser.js';
import { addAddress, getAddress } from '../controllers/addressController.js';

const addressRouter = express.Router();

addressRouter.post('/add', authUser, addAddress);
// Mudança para POST para que o authUser funcione corretamente
addressRouter.post('/get', authUser, getAddress);

export default addressRouter;
