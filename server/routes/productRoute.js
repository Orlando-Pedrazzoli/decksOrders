import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { 
  addProduct, 
  productList, 
  productById, 
  getProductById,
  getProductsByIds, // 🆕 Buscar múltiplos produtos por IDs
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
productRouter.post('/by-ids', getProductsByIds);          // 🆕 Buscar múltiplos produtos (DEVE vir antes de /:id)
productRouter.post('/id', productById);
productRouter.post('/family', getProductFamily);          // 🆕 Buscar família
productRouter.post('/check-stock', checkStock);           // 🆕 Verificar stock
productRouter.get('/:id', getProductById);                // 🆕 Buscar produto por ID (GET) - DEVE ser a última rota GET com parâmetro

// Rotas protegidas (seller/admin)
productRouter.post('/add', authSeller, upload.fields([
  { name: 'images', maxCount: 8 },
  { name: 'video', maxCount: 1 }
]), addProduct);

productRouter.post('/update', authSeller, upload.fields([
  { name: 'images', maxCount: 8 },
  { name: 'video', maxCount: 1 }
]), updateProduct);

productRouter.post('/delete', authSeller, deleteProduct);
productRouter.post('/stock', authSeller, changeStock);
productRouter.post('/update-stock', authSeller, updateStock);       // 🆕 Atualizar stock
productRouter.post('/decrement-stock', authSeller, decrementStock); // 🆕 Decrementar stock

export default productRouter;