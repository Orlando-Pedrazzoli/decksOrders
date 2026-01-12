import User from '../models/User.js';
import Product from '../models/Product.js';

// Update User CartData : /api/cart/update
// 🎯 ATUALIZADO: Com validação de stock
export const updateCart = async (req, res) => {
  try {
    const { userId, cartItems } = req.body;

    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }

    if (!cartItems || typeof cartItems !== 'object') {
      return res.json({ success: false, message: 'Invalid cart data' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // 🆕 VALIDAR STOCK DE CADA ITEM
    const validatedCartItems = {};
    const stockWarnings = [];

    for (const [productId, quantity] of Object.entries(cartItems)) {
      if (quantity <= 0) continue; // Ignorar itens com quantidade 0

      const product = await Product.findById(productId);
      
      if (!product) {
        stockWarnings.push(`Produto não encontrado: ${productId}`);
        continue;
      }

      const availableStock = product.stock || 0;

      if (availableStock === 0) {
        stockWarnings.push(`${product.name} está esgotado`);
        continue;
      }

      if (quantity > availableStock) {
        // Ajustar para o máximo disponível
        validatedCartItems[productId] = availableStock;
        stockWarnings.push(`${product.name}: ajustado para ${availableStock} (stock máximo)`);
      } else {
        validatedCartItems[productId] = quantity;
      }
    }

    // Update cart items
    user.cartItems = validatedCartItems;
    await user.save();

    res.json({
      success: true,
      message: stockWarnings.length > 0 
        ? 'Carrinho atualizado com ajustes de stock' 
        : 'Cart Updated',
      cartItems: user.cartItems,
      warnings: stockWarnings,
    });
  } catch (error) {
    console.log('Cart update error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get User Cart : /api/cart/get
export const getCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }

    const user = await User.findById(userId).select('cartItems');

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      cartItems: user.cartItems || {},
    });
  } catch (error) {
    console.log('Get cart error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Validate Cart Stock : /api/cart/validate
export const validateCartStock = async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!cartItems || typeof cartItems !== 'object') {
      return res.json({ success: false, message: 'Invalid cart data' });
    }

    const validationResults = [];
    let allValid = true;

    for (const [productId, quantity] of Object.entries(cartItems)) {
      if (quantity <= 0) continue;

      const product = await Product.findById(productId);
      
      if (!product) {
        validationResults.push({
          productId,
          valid: false,
          reason: 'Produto não encontrado',
          availableStock: 0,
          requestedQuantity: quantity,
        });
        allValid = false;
        continue;
      }

      const availableStock = product.stock || 0;
      const isValid = quantity <= availableStock && availableStock > 0;

      if (!isValid) allValid = false;

      validationResults.push({
        productId,
        productName: product.name,
        valid: isValid,
        reason: availableStock === 0 
          ? 'Produto esgotado' 
          : quantity > availableStock 
            ? `Apenas ${availableStock} disponível(eis)` 
            : 'OK',
        availableStock,
        requestedQuantity: quantity,
      });
    }

    res.json({
      success: true,
      allValid,
      results: validationResults,
    });
  } catch (error) {
    console.log('Validate cart error:', error.message);
    res.json({ success: false, message: error.message });
  }
};