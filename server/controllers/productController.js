import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

// Add Product
const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);

    const images = req.files;
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const product = await Product.create({
      ...productData,
      image: imagesUrl,
    });

    res.json({ success: true, message: "Produto adicionado com sucesso", product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Product List
const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get single product by id
const productById = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Buscar produtos da mesma família (para bolinhas de cor)
const getProductFamily = async (req, res) => {
  try {
    const { productId, productFamily } = req.body;
    
    let familyId = productFamily;
    
    // Se não passou productFamily, buscar do produto
    if (!familyId && productId) {
      const product = await Product.findById(productId);
      if (product) {
        familyId = product.productFamily;
      }
    }
    
    // Se não tem família, retornar array vazio
    if (!familyId) {
      return res.json({ success: true, products: [] });
    }
    
    // Buscar todos os produtos da mesma família
    const products = await Product.find({ 
      productFamily: familyId 
    }).select('_id name color colorCode image offerPrice price stock inStock');
    
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Change inStock status (legacy - mantido para compatibilidade)
const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: "Stock atualizado" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.body;
    let productData = JSON.parse(req.body.productData);

    // Processar novas imagens se enviadas
    const images = req.files;
    let imagesUrl = [];

    if (images && images.length > 0) {
      imagesUrl = await Promise.all(
        images.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
    }

    // Se há novas imagens, usar elas; senão manter as existentes
    const updateData = {
      ...productData,
    };

    if (imagesUrl.length > 0) {
      // Buscar produto atual para deletar imagens antigas
      const existingProduct = await Product.findById(id);
      if (existingProduct && existingProduct.image) {
        // Deletar imagens antigas do Cloudinary
        for (const imageUrl of existingProduct.image) {
          try {
            const publicId = imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.log('Erro ao deletar imagem antiga:', err.message);
          }
        }
      }
      updateData.image = imagesUrl;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

    res.json({ success: true, message: "Produto atualizado com sucesso", product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;

    // Buscar produto para deletar imagens do Cloudinary
    const product = await Product.findById(id);
    if (product && product.image) {
      for (const imageUrl of product.image) {
        try {
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.log('Erro ao deletar imagem:', err.message);
        }
      }
    }

    await Product.findByIdAndDelete(id);
    res.json({ success: true, message: "Produto eliminado com sucesso" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Atualizar quantidade de stock
const updateStockQuantity = async (req, res) => {
  try {
    const { productId, stock } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Produto não encontrado" });
    }

    product.stock = stock;
    await product.save();

    res.json({ 
      success: true, 
      message: "Stock atualizado com sucesso",
      product 
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Decrementar stock (usado após venda)
const decrementStock = async (req, res) => {
  try {
    const { items } = req.body; // Array de { productId, quantity }

    const results = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        results.push({ 
          productId: item.productId, 
          success: false, 
          message: "Produto não encontrado" 
        });
        continue;
      }

      try {
        await product.decrementStock(item.quantity);
        results.push({ 
          productId: item.productId, 
          success: true, 
          newStock: product.stock 
        });
      } catch (err) {
        results.push({ 
          productId: item.productId, 
          success: false, 
          message: err.message 
        });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export { 
  addProduct, 
  productList, 
  productById, 
  changeStock, 
  updateProduct, 
  deleteProduct,
  updateStockQuantity,
  decrementStock,
  getProductFamily
};