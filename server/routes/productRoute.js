import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { 
  addProduct, 
  productList, 
  productById, 
  changeStock, 
  updateProduct, 
  deleteProduct,
  updateStockQuantity,
  decrementStock,
  getProductFamily
} from '../controllers/productController.js';

const productRouter = express.Router();

// Rotas públicas
productRouter.get('/list', productList);
productRouter.post('/id', productById);
productRouter.post('/family', getProductFamily);  // 🆕 Buscar produtos da mesma família

// Rotas protegidas (seller)
productRouter.post('/add', authSeller, upload.array("images"), addProduct);
productRouter.post('/stock', authSeller, changeStock);
productRouter.post('/update', authSeller, upload.array("images"), updateProduct);
productRouter.post('/delete', authSeller, deleteProduct);
productRouter.post('/update-stock', authSeller, updateStockQuantity);
productRouter.post('/decrement-stock', authSeller, decrementStock);

export default productRouter;