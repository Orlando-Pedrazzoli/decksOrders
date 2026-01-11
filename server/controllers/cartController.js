import User from '../models/User.js';
import Product from '../models/Product.js';

// Update User CartData : /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const { userId, cartItems } = req.body;

    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }

    if (!cartItems || typeof cartItems !== 'object') {
      return res.json({ success: false, message: 'Invalid cart data' });
    }

    // 🎯 VALIDAR STOCK ANTES DE ATUALIZAR O CARRINHO
    const stockErrors = [];
    
    for (const [key, quantity] of Object.entries(cartItems)) {
      if (quantity <= 0) continue;
      
      // Key pode ser "productId" ou "productId_variantId"
      const [productId, variantId] = key.split('_');
      
      const product = await Product.findById(productId);
      
      if (!product) {
        stockErrors.push({
          productId,
          message: 'Produto não encontrado',
        });
        continue;
      }
      
      // Verificar stock
      let availableStock;
      let productName = product.name;
      
      if (variantId && product.variants && product.variants.length > 0) {
        // Produto com variante
        const variant = product.variants.id(variantId);
        if (!variant) {
          stockErrors.push({
            productId: key,
            productName,
            message: 'Variante não encontrada',
          });
          continue;
        }
        availableStock = variant.stock;
        productName = `${product.name} - ${variant.color}`;
      } else {
        // Produto sem variante
        availableStock = product.stock;
      }
      
      if (quantity > availableStock) {
        stockErrors.push({
          productId: key,
          productName,
          requestedQuantity: quantity,
          availableStock,
          message: availableStock === 0 
            ? `"${productName}" está esgotado`
            : `"${productName}" tem apenas ${availableStock} unidade(s) disponível(eis)`,
        });
      }
    }
    
    // Se houver erros de stock, retornar
    if (stockErrors.length > 0) {
      return res.json({
        success: false,
        message: 'Alguns produtos não têm stock suficiente',
        stockErrors,
      });
    }

    // Find user and update cart
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Update cart items
    user.cartItems = cartItems;
    await user.save();

    res.json({
      success: true,
      message: 'Cart Updated',
      cartItems: user.cartItems,
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

// 🆕 Verificar stock de um produto : /api/cart/check-stock
export const checkStock = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.json({ 
        success: false, 
        message: 'Produto não encontrado',
        available: false,
      });
    }
    
    let availableStock;
    let variantInfo = null;
    
    if (variantId && product.variants && product.variants.length > 0) {
      const variant = product.variants.id(variantId);
      if (!variant) {
        return res.json({ 
          success: false, 
          message: 'Variante não encontrada',
          available: false,
        });
      }
      availableStock = variant.stock;
      variantInfo = {
        color: variant.color,
        colorCode: variant.colorCode,
      };
    } else {
      availableStock = product.stock;
    }
    
    const isAvailable = quantity <= availableStock;
    
    res.json({
      success: true,
      available: isAvailable,
      availableStock,
      requestedQuantity: quantity,
      productName: product.name,
      variantInfo,
      message: isAvailable 
        ? 'Stock disponível' 
        : availableStock === 0 
          ? 'Produto esgotado'
          : `Apenas ${availableStock} unidade(s) disponível(eis)`,
    });
  } catch (error) {
    console.log('Check stock error:', error.message);
    res.json({ success: false, message: error.message });
  }
};

// 🆕 Validar carrinho completo antes do checkout : /api/cart/validate
export const validateCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    
    if (!cartItems || typeof cartItems !== 'object') {
      return res.json({ success: false, message: 'Carrinho inválido' });
    }
    
    const validationResults = [];
    let allValid = true;
    
    for (const [key, quantity] of Object.entries(cartItems)) {
      if (quantity <= 0) continue;
      
      const [productId, variantId] = key.split('_');
      const product = await Product.findById(productId);
      
      if (!product) {
        validationResults.push({
          key,
          valid: false,
          message: 'Produto não encontrado',
        });
        allValid = false;
        continue;
      }
      
      let availableStock;
      let productName = product.name;
      
      if (variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.id(variantId);
        if (!variant) {
          validationResults.push({
            key,
            productName,
            valid: false,
            message: 'Variante não encontrada',
          });
          allValid = false;
          continue;
        }
        availableStock = variant.stock;
        productName = `${product.name} - ${variant.color}`;
      } else {
        availableStock = product.stock;
      }
      
      const isValid = quantity <= availableStock;
      
      validationResults.push({
        key,
        productName,
        valid: isValid,
        requestedQuantity: quantity,
        availableStock,
        message: isValid 
          ? 'OK' 
          : availableStock === 0 
            ? 'Esgotado'
            : `Apenas ${availableStock} disponível(eis)`,
      });
      
      if (!isValid) allValid = false;
    }
    
    res.json({
      success: true,
      valid: allValid,
      results: validationResults,
      message: allValid 
        ? 'Todos os produtos estão disponíveis'
        : 'Alguns produtos não têm stock suficiente',
    });
  } catch (error) {
    console.log('Validate cart error:', error.message);
    res.json({ success: false, message: error.message });
  }
};