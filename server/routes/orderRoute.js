import express from 'express';
import authUser from '../middlewares/authUser.js';
import authSeller from '../middlewares/authSeller.js';
import {
  getAllOrders,
  getUserOrders,
  placeOrderCOD,
  placeOrderStripe,
  updateOrderStatus,
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// User routes
orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.post('/user', authUser, getUserOrders);
orderRouter.post('/stripe', authUser, placeOrderStripe);

// Seller/Admin routes
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.post('/status', authSeller, updateOrderStatus); // ✅ NOVA ROTA

export default orderRouter;