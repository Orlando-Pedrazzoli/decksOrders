import User from "../models/User.js";
import Product from "../models/Product.js";

// Update User Cart
const updateCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const userId = req.userId;

    // 🎯 Validar stock antes de atualizar
    const stockErrors = [];
    
    for (const [productId, quantity] of Object.entries(cartItems)) {
      if (quantity <= 0) continue;
      
      const product = await Product.findById(productId);
      
      if (!product) {
        stockErrors.push({
          productId,
          message: `Produto não encontrado`
        });
        continue;
      }
      
      const availableStock = product.stock || 0;
      
      if (quantity > availableStock) {
        stockErrors.push({
          productId,
          productName: product.name,
          requested: quantity,
          available: availableStock,
          message: `${product.name}: apenas ${availableStock} disponível`
        });
      }
    }

    // Se há erros de stock, retornar mas ainda atualizar o carrinho
    // (o frontend decide o que fazer)
    await User.findByIdAndUpdate(userId, { cartItems });

    if (stockErrors.length > 0) {
      return res.json({ 
        success: false, 
        message: "Alguns produtos excedem o stock disponível",
        stockErrors,
        cartItems 
      });
    }

    res.json({ success: true, message: "Carrinho atualizado" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get User Cart
const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "Usuário não encontrado" });
    }

    res.json({ success: true, cartItems: user.cartItems || {} });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Verificar stock de um produto
const checkStock = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.json({ 
        success: false, 
        available: false,
        message: "Produto não encontrado" 
      });
    }

    const availableStock = product.stock || 0;
    const isAvailable = availableStock >= quantity;

    res.json({ 
      success: true, 
      available: isAvailable,
      stock: availableStock,
      requested: quantity,
      message: isAvailable 
        ? "Stock disponível" 
        : `Apenas ${availableStock} unidade(s) disponível(eis)`
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Validar carrinho completo antes do checkout
const validateCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    
    if (!cartItems || Object.keys(cartItems).length === 0) {
      return res.json({ 
        success: true, 
        valid: true, 
        message: "Carrinho vazio" 
      });
    }

    const results = [];
    let allValid = true;

    for (const [productId, quantity] of Object.entries(cartItems)) {
      if (quantity <= 0) continue;

      const product = await Product.findById(productId);
      
      if (!product) {
        results.push({
          productId,
          valid: false,
          message: "Produto não encontrado"
        });
        allValid = false;
        continue;
      }

      const availableStock = product.stock || 0;
      const isValid = availableStock >= quantity;

      if (!isValid) {
        allValid = false;
      }

      results.push({
        productId,
        productName: product.name,
        requested: quantity,
        available: availableStock,
        valid: isValid,
        message: isValid 
          ? "OK" 
          : `Apenas ${availableStock} unidade(s) disponível(eis)`
      });
    }

    res.json({ 
      success: true, 
      valid: allValid,
      results 
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export { updateCart, getCart, checkStock, validateCart };