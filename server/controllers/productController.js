import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);
    const images = req.files?.images || [];
    const videoFile = req.files?.video?.[0] || null;
    
    // Upload das imagens
    let imagesUrl = await Promise.all(
      images.map(async item => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: 'image',
        });
        return result.secure_url;
      })
    );
    
    // 🆕 Upload do vídeo (se existir)
    let videoUrl = null;
    if (videoFile) {
      const videoResult = await cloudinary.uploader.upload(videoFile.path, {
        resource_type: 'video',
        folder: 'products/videos',
      });
      videoUrl = videoResult.secure_url;
    }
    
    // 🎯 Calcular inStock baseado no stock
    const stock = productData.stock || 0;
    const inStock = stock > 0;
    
    await Product.create({ 
      ...productData, 
      image: imagesUrl,
      video: videoUrl,
      stock,
      inStock,
    });
    
    res.json({ success: true, message: 'Produto adicionado com sucesso' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Product List : /api/product/list
// 🎯 ATUALIZADO: Retorna apenas produtos principais (isMainVariant: true)
export const productList = async (req, res) => {
  try {
    const { all } = req.query; // ?all=true para admin ver todos
    
    let query = {};
    if (!all) {
      // Por defeito, só mostra produtos principais
      query = { isMainVariant: { $ne: false } }; // true ou null/undefined
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
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

// 🆕 Get Single Product by ID (GET) : /api/product/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.json({ success: false, message: 'Produto não encontrado' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Get Products by IDs (múltiplos) : /api/product/by-ids
export const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.json({ success: false, message: 'IDs array is required' });
    }

    // Limitar a 50 produtos por request para evitar abuse
    const limitedIds = ids.slice(0, 50);

    const products = await Product.find({ 
      _id: { $in: limitedIds } 
    });

    res.json({ 
      success: true, 
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products by IDs:', error);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Get Products by Family : /api/product/family
export const getProductFamily = async (req, res) => {
  try {
    const { familySlug } = req.body;
    
    if (!familySlug) {
      return res.json({ success: false, message: 'Family slug é obrigatório' });
    }
    
    const products = await Product.find({ 
      productFamily: familySlug 
    }).sort({ isMainVariant: -1, createdAt: 1 }); // Principal primeiro
    
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Check Stock : /api/product/check-stock
export const checkStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ success: false, message: 'Produto não encontrado' });
    }
    
    const available = product.stock >= quantity;
    
    res.json({ 
      success: true, 
      available,
      stock: product.stock,
      message: available ? 'Stock disponível' : `Apenas ${product.stock} unidade(s) disponível(eis)`
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Update Stock : /api/product/update-stock
export const updateStock = async (req, res) => {
  try {
    const { productId, stock } = req.body;
    
    const newStock = Math.max(0, parseInt(stock) || 0);
    
    await Product.findByIdAndUpdate(productId, { 
      stock: newStock,
      inStock: newStock > 0
    });
    
    res.json({ success: true, message: 'Stock atualizado' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Decrement Stock (após compra) : /api/product/decrement-stock
export const decrementStock = async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await Product.findByIdAndUpdate(item.productId, {
          stock: newStock,
          inStock: newStock > 0
        });
      }
    }
    
    res.json({ success: true, message: 'Stock decrementado' });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Change Product inStock : /api/product/stock (mantido para compatibilidade)
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    
    // Se inStock for false, setar stock para 0
    const updateData = { inStock };
    if (!inStock) {
      updateData.stock = 0;
    }
    
    await Product.findByIdAndUpdate(id, updateData);
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
    const images = req.files?.images || [];
    const videoFile = req.files?.video?.[0] || null;

    // Buscar produto existente
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.json({ success: false, message: 'Produto não encontrado' });
    }

    // Se houver novas imagens, fazer upload
    let imagesUrl = existingProduct.image;
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

    // 🆕 Se houver novo vídeo, fazer upload
    let videoUrl = existingProduct.video;
    if (videoFile) {
      // Excluir vídeo antigo do Cloudinary (se existir)
      if (existingProduct.video) {
        try {
          const videoPublicId = existingProduct.video.split('/').slice(-2).join('/').split('.')[0];
          await cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' });
        } catch (error) {
          console.log('Erro ao excluir vídeo antigo:', error.message);
        }
      }

      // Upload do novo vídeo
      const videoResult = await cloudinary.uploader.upload(videoFile.path, {
        resource_type: 'video',
        folder: 'products/videos',
      });
      videoUrl = videoResult.secure_url;
    }
    
    // 🆕 Se pediu para remover o vídeo
    if (productData.removeVideo && existingProduct.video) {
      try {
        const videoPublicId = existingProduct.video.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' });
      } catch (error) {
        console.log('Erro ao excluir vídeo:', error.message);
      }
      videoUrl = null;
      delete productData.removeVideo;
    }

    // 🎯 Calcular inStock baseado no stock
    if (productData.stock !== undefined) {
      productData.inStock = productData.stock > 0;
    }

    // Atualizar produto
    await Product.findByIdAndUpdate(id, {
      ...productData,
      image: imagesUrl,
      video: videoUrl,
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

    const product = await Product.findById(id);
    if (!product) {
      return res.json({ success: false, message: 'Produto não encontrado' });
    }

    // Excluir imagens do Cloudinary
    for (const imageUrl of product.image) {
      try {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log('Erro ao excluir imagem do Cloudinary:', error.message);
      }
    }

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