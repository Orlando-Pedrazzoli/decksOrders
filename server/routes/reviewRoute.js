import express from 'express';
import authUser from '../middlewares/authUser.js';
import {
  createReview,
  getProductReviews,
  getEligibleOrders,
  getUserReviews,
  getRecentReviews,
  debugOrders, // ✅ Função de debug temporária
} from '../controllers/reviewController.js';

const reviewRouter = express.Router();

// ✅ ROTAS PÚBLICAS (sem autenticação)
reviewRouter.get('/product/:productId', getProductReviews);
reviewRouter.get('/recent', getRecentReviews);

// ✅ ROTAS PROTEGIDAS (requerem login)
reviewRouter.post('/create', authUser, createReview);
reviewRouter.post('/eligible-orders', authUser, getEligibleOrders);
reviewRouter.post('/my-reviews', authUser, getUserReviews);

// ✅ ROTAS DE DEBUG/TESTE (remover em produção)
reviewRouter.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Review routes are working!',
    timestamp: new Date().toISOString(),
    routes: [
      'GET /api/reviews/test',
      'GET /api/reviews/recent',
      'GET /api/reviews/product/:productId',
      'POST /api/reviews/create',
      'POST /api/reviews/eligible-orders',
      'POST /api/reviews/my-reviews',
      'POST /api/reviews/debug',
    ],
  });
});

reviewRouter.post('/debug', authUser, debugOrders);

export default reviewRouter;
