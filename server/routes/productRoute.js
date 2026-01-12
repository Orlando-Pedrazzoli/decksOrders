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
  getProductFamily,
  checkStock,
  updateStock,
  decrementStock,
} from '../controllers/productController.js';

const productRouter = express.Router();

// Rotas públicas
productRouter.get('/list', productList);
productRouter.post('/id', productById);
productRouter.post('/family', getProductFamily);      // 🆕 Buscar família
productRouter.post('/check-stock', checkStock);       // 🆕 Verificar stock

// Rotas protegidas (seller/admin)
productRouter.post('/add', authSeller, upload.array('images'), addProduct);
productRouter.post('/update', authSeller, upload.array('images'), updateProduct);
productRouter.post('/delete', authSeller, deleteProduct);
productRouter.post('/stock', authSeller, changeStock);
productRouter.post('/update-stock', authSeller, updateStock);       // 🆕 Atualizar stock
productRouter.post('/decrement-stock', authSeller, decrementStock); // 🆕 Decrementar stock

export default productRouter;