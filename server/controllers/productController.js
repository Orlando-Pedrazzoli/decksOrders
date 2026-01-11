import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/Product.js';

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);
    const images = req.files;
    
    // Upload das imagens principais
    let imagesUrl = await Promise.all(
      images.map(async item => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: 'image',
        });
        return result.secure_url;
      })
    );
    
    // 🎯 Processar variantes se existirem
    let variants = [];
    if (productData.variants && productData.variants.length > 0) {
      variants = productData.variants.map(variant => ({
        color: variant.color,
        colorCode: variant.colorCode,
        images: variant.images || [],
        stock: parseInt(variant.stock) || 0,
        price: variant.price ? parseFloat(variant.price) : undefined,
        offerPrice: variant.offerPrice ? parseFloat(variant.offerPrice) : undefined,
      }));
    }
    
    // Criar produto
    const newProduct = await Product.create({ 
      ...productData, 
      image: imagesUrl,
      stock: parseInt(productData.stock) || 0,
      variants,
    });
    
    res.json({ 
      success: true, 
      message: 'Produto adicionado com sucesso',
      product: newProduct,
    });
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

// 🆕 Update Stock Quantity : /api/product/update-stock
export const updateStockQuantity = async (req, res) => {
  try {
    const { id, stock, variantId } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.json({ success: false, message: 'Produto não encontrado' });
    }
    
    if (variantId) {
      // Atualizar stock de uma variante específica
      const variant = product.variants.id(variantId);
      if (!variant) {
        return res.json({ success: false, message: 'Variante não encontrada' });
      }
      variant.stock = parseInt(stock) || 0;
    } else {
      // Atualizar stock geral
      product.stock = parseInt(stock) || 0;
    }
    
    await product.save(); // Isso irá recalcular inStock via pre-save
    
    res.json({ 
      success: true, 
      message: 'Stock atualizado com sucesso',
      product,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Add Variant : /api/product/add-variant
export const addVariant = async (req, res) => {
  try {
    const { id, variant } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.json({ success: false, message: 'Produto não encontrado' });
    }
    
    // Verificar se já existe uma variante com a mesma cor
    const existingVariant = product.variants.find(
      v => v.color.toLowerCase() === variant.color.toLowerCase()
    );
    
    if (existingVariant) {
      return res.json({ 
        success: false, 
        message: 'Já existe uma variante com esta cor' 
      });
    }
    
    product.variants.push({
      color: variant.color,
      colorCode: variant.colorCode,
      images: variant.images || [],
      stock: parseInt(variant.stock) || 0,
      price: variant.price ? parseFloat(variant.price) : undefined,
      offerPrice: variant.offerPrice ? parseFloat(variant.offerPrice) : undefined,
    });
    
    await product.save();
    
    res.json({ 
      success: true, 
      message: 'Variante adicionada com sucesso',
      product,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Update Variant : /api/product/update-variant
export const updateVariant = async (req, res) => {
  try {
    const { id, variantId, variantData } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.json({ success: false, message: 'Produto não encontrado' });
    }
    
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.json({ success: false, message: 'Variante não encontrada' });
    }
    
    // Atualizar campos da variante
    if (variantData.color) variant.color = variantData.color;
    if (variantData.colorCode) variant.colorCode = variantData.colorCode;
    if (variantData.images) variant.images = variantData.images;
    if (variantData.stock !== undefined) variant.stock = parseInt(variantData.stock) || 0;
    if (variantData.price !== undefined) variant.price = parseFloat(variantData.price) || undefined;
    if (variantData.offerPrice !== undefined) variant.offerPrice = parseFloat(variantData.offerPrice) || undefined;
    
    await product.save();
    
    res.json({ 
      success: true, 
      message: 'Variante atualizada com sucesso',
      product,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Delete Variant : /api/product/delete-variant
export const deleteVariant = async (req, res) => {
  try {
    const { id, variantId } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.json({ success: false, message: 'Produto não encontrado' });
    }
    
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.json({ success: false, message: 'Variante não encontrada' });
    }
    
    // Remover imagens da variante do Cloudinary
    for (const imageUrl of variant.images) {
      try {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log('Erro ao excluir imagem da variante:', error.message);
      }
    }
    
    // Usar pull para remover a variante
    product.variants.pull(variantId);
    await product.save();
    
    res.json({ 
      success: true, 
      message: 'Variante removida com sucesso',
      product,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Upload Variant Images : /api/product/upload-variant-images
export const uploadVariantImages = async (req, res) => {
  try {
    const { id, variantId } = req.body;
    const images = req.files;
    
    if (!images || images.length === 0) {
      return res.json({ success: false, message: 'Nenhuma imagem enviada' });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.json({ success: false, message: 'Produto não encontrado' });
    }
    
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.json({ success: false, message: 'Variante não encontrada' });
    }
    
    // Upload das novas imagens
    const newImagesUrl = await Promise.all(
      images.map(async item => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: 'image',
        });
        return result.secure_url;
      })
    );
    
    // Adicionar às imagens existentes da variante
    variant.images = [...variant.images, ...newImagesUrl];
    await product.save();
    
    res.json({ 
      success: true, 
      message: 'Imagens adicionadas com sucesso',
      images: variant.images,
      product,
    });
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

    // 🎯 Processar variantes se existirem no update
    let updateData = {
      ...productData,
      image: imagesUrl,
    };
    
    if (productData.stock !== undefined) {
      updateData.stock = parseInt(productData.stock) || 0;
    }
    
    if (productData.variants) {
      updateData.variants = productData.variants.map(variant => ({
        ...variant,
        stock: parseInt(variant.stock) || 0,
        price: variant.price ? parseFloat(variant.price) : undefined,
        offerPrice: variant.offerPrice ? parseFloat(variant.offerPrice) : undefined,
      }));
    }

    // Atualizar produto
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    
    // Forçar recálculo do inStock
    await updatedProduct.save();

    res.json({ 
      success: true, 
      message: 'Produto atualizado com sucesso',
      product: updatedProduct,
    });
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

    // Excluir imagens principais do Cloudinary
    for (const imageUrl of product.image) {
      try {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log('Erro ao excluir imagem do Cloudinary:', error.message);
      }
    }
    
    // 🎯 Excluir imagens das variantes também
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        for (const imageUrl of variant.images) {
          try {
            const publicId = imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.log('Erro ao excluir imagem de variante:', error.message);
          }
        }
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

// 🆕 Decrement Stock After Purchase : /api/product/decrement-stock
export const decrementStock = async (req, res) => {
  try {
    const { items } = req.body; // Array de { productId, variantId?, quantity }
    
    const results = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        results.push({
          productId: item.productId,
          success: false,
          message: 'Produto não encontrado',
        });
        continue;
      }
      
      await product.decrementStock(item.quantity, item.variantId);
      
      results.push({
        productId: item.productId,
        variantId: item.variantId,
        success: true,
        newStock: item.variantId 
          ? product.variants.id(item.variantId)?.stock 
          : product.stock,
      });
    }
    
    res.json({
      success: true,
      message: 'Stock decrementado com sucesso',
      results,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};