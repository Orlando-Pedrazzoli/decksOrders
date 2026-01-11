import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);
    const images = req.files;
    let imagesUrl = await Promise.all(
      images.map(async item => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: 'image',
        });
        return result.secure_url;
      })
    );
    await Product.create({ ...productData, image: imagesUrl });
    res.json({ success: true, message: 'Product Added' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Product : /api/product/list
export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get single Product : /api/product/id
export const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: 'Stock Updated' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Update Product : /api/product/update
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.body;
    let productData = JSON.parse(req.body.productData);
    const images = req.files;

    // Buscar produto existente
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.json({ success: false, message: 'Produto não encontrado' });
    }

    // Se houver novas imagens, fazer upload
    let imagesUrl = existingProduct.image; // Manter imagens antigas por padrão
    if (images && images.length > 0) {
      // Excluir imagens antigas do Cloudinary
      for (const imageUrl of existingProduct.image) {
        try {
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.log('Erro ao excluir imagem antiga:', error.message);
        }
      }

      // Upload das novas imagens
      imagesUrl = await Promise.all(
        images.map(async item => {
          let result = await cloudinary.uploader.upload(item.path, {
            resource_type: 'image',
          });
          return result.secure_url;
        })
      );
    }

    // Atualizar produto
    await Product.findByIdAndUpdate(id, {
      ...productData,
      image: imagesUrl,
    });

    res.json({ success: true, message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Delete Product : /api/product/delete
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;

    // Buscar produto para obter URLs das imagens
    const product = await Product.findById(id);
    if (!product) {
      return res.json({ success: false, message: 'Produto não encontrado' });
    }

    // Excluir imagens do Cloudinary
    for (const imageUrl of product.image) {
      try {
        // Extrair public_id da URL do Cloudinary
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log('Erro ao excluir imagem do Cloudinary:', error.message);
      }
    }

    // Excluir produto do banco de dados
    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Produto excluído com sucesso',
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};