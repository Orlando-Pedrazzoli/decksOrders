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
  // 🆕 Novas funções
  updateStockQuantity,
  addVariant,
  updateVariant,
  deleteVariant,
  uploadVariantImages,
  decrementStock,
} from '../controllers/productController.js';

const productRouter = express.Router();

// Rotas existentes (mantendo GET no /id como estava)
productRouter.post('/add', upload.array(['images']), authSeller, addProduct);
productRouter.get('/list', productList);
productRouter.get('/id', productById);  // ← Mantém GET!
productRouter.post('/stock', authSeller, changeStock);
productRouter.post('/update', upload.array(['images']), authSeller, updateProduct);
productRouter.post('/delete', authSeller, deleteProduct);

// 🆕 Novas rotas para gestão de stock
productRouter.post('/update-stock', authSeller, updateStockQuantity);
productRouter.post('/decrement-stock', authSeller, decrementStock);

// 🆕 Novas rotas para gestão de variantes
productRouter.post('/add-variant', authSeller, addVariant);
productRouter.post('/update-variant', authSeller, updateVariant);
productRouter.post('/delete-variant', authSeller, deleteVariant);
productRouter.post('/upload-variant-images', authSeller, upload.array('images'), uploadVariantImages);

export default productRouter;