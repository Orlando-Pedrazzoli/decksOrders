// server/controllers/orderController.js
// 🎯 VERSÃO COM SUPORTE A STOCK + MB WAY + MULTIBANCO

import { sendOrderConfirmationEmail } from '../services/emailService.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import stripe from 'stripe';

// Importação segura do WhatsApp
let notifyAdminNewOrder = null;
try {
  const adminNotification = await import('../services/adminNotificationService.js');
  notifyAdminNewOrder = adminNotification.notifyAdminNewOrder;
  console.log('✅ Serviço de notificação admin carregado');
} catch (error) {
  console.log('⚠️ Serviço de notificação admin não disponível:', error.message);
}

// =============================================================================
// 🆕 FUNÇÃO PARA DECREMENTAR STOCK
// =============================================================================
const decrementProductStock = async (items) => {
  try {
    console.log('📦 Decrementando stock dos produtos...');
    
    for (const item of items) {
      const productId = item.product._id || item.product;
      const quantity = item.quantity;
      
      const product = await Product.findById(productId);
      
      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - quantity);
        
        await Product.findByIdAndUpdate(productId, {
          stock: newStock,
          inStock: newStock > 0
        });
        
        console.log(`  ✓ ${product.name}: ${product.stock} → ${newStock}`);
      }
    }
    
    console.log('✅ Stock atualizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao decrementar stock:', error.message);
    return false;
  }
};

// =============================================================================
// 🆕 FUNÇÃO PARA VALIDAR STOCK ANTES DE CRIAR PEDIDO
// =============================================================================
const validateOrderStock = async (items) => {
  const errors = [];
  
  for (const item of items) {
    const productId = item.product._id || item.product;
    const quantity = item.quantity;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      errors.push(`Produto não encontrado: ${productId}`);
      continue;
    }
    
    const availableStock = product.stock || 0;
    
    if (availableStock === 0) {
      errors.push(`${product.name} está esgotado`);
    } else if (quantity > availableStock) {
      errors.push(`${product.name}: apenas ${availableStock} disponível(eis), solicitado ${quantity}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// =============================================================================
// FUNÇÃO PARA ENVIAR EMAIL AO CLIENTE
// =============================================================================
const sendClientEmail = async (order, userId) => {
  try {
    console.log('📧 Preparando email para cliente...');
    
    const user = await User.findById(userId);
    const address = await Address.findById(order.address);
    const productIds = order.items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    if (!user || !address) {
      console.error('❌ Dados insuficientes para enviar email');
      return;
    }

    const emailResult = await sendOrderConfirmationEmail(order, user, products, address);
    
    if (emailResult.success) {
      console.log('✅ Email de confirmação enviado para:', emailResult.recipient);
    } else {
      console.error('❌ Falha no email:', emailResult.error);
    }

    if (notifyAdminNewOrder) {
      try {
        console.log('🔔 Enviando notificação para admin...');
        const adminResult = await notifyAdminNewOrder(order, user, products, address);
        console.log('🔔 Resultado notificação admin:', adminResult);
      } catch (adminError) {
        console.error('❌ Erro na notificação admin (não crítico):', adminError.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
  }
};

// =============================================================================
// PLACE ORDER COD
// =============================================================================
export const placeOrderCOD = async (req, res) => {
  try {
    const {
      userId,
      items,
      address,
      originalAmount,
      amount,
      discountAmount,
      discountPercentage,
      promoCode,
    } = req.body;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }

    // 🆕 VALIDAR STOCK ANTES DE CRIAR PEDIDO
    const stockValidation = await validateOrderStock(items);
    if (!stockValidation.valid) {
      return res.json({ 
        success: false, 
        message: 'Stock insuficiente: ' + stockValidation.errors.join(', ')
      });
    }

    const newOrder = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'COD',
      isPaid: false,
      promoCode: promoCode || '',
      discountAmount: discountAmount || 0,
      discountPercentage: discountPercentage || 0,
      originalAmount,
    });

    console.log('✅ Pedido COD criado:', newOrder._id);

    // 🆕 DECREMENTAR STOCK (COD decrementa imediatamente pois é confirmado)
    await decrementProductStock(items);

    // Clear user cart
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // Enviar email em background
    sendClientEmail(newOrder, userId).catch(err => {
      console.error('❌ Erro no envio de email (background):', err.message);
    });

    return res.json({
      success: true,
      message: 'Order Placed Successfully',
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error('❌ Erro COD:', error);
    return res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// PLACE ORDER STRIPE
// =============================================================================
export const placeOrderStripe = async (req, res) => {
  console.log('🚀 STRIPE FUNCTION STARTED!!!');

  try {
    const {
      userId,
      items,
      address,
      originalAmount,
      amount,
      discountAmount,
      discountPercentage,
      promoCode,
      paymentMethod,
    } = req.body;

    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }

    // 🆕 VALIDAR STOCK ANTES DE CRIAR PEDIDO
    const stockValidation = await validateOrderStock(items);
    if (!stockValidation.valid) {
      return res.json({ 
        success: false, 
        message: 'Stock insuficiente: ' + stockValidation.errors.join(', ')
      });
    }

    let productData = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
    }

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'Online',
      isPaid: false,
      promoCode: promoCode || '',
      discountAmount: discountAmount || 0,
      discountPercentage: discountPercentage || 0,
      originalAmount,
    });

    console.log('✅ Pedido Stripe criado:', order._id);

    // Stripe Gateway
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = productData.map(item => {
      let itemPrice = item.price;
      if (discountPercentage > 0) {
        itemPrice = item.price * (1 - discountPercentage / 100);
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: discountPercentage > 0
              ? `${item.name} (${discountPercentage}% OFF)`
              : item.name,
          },
          unit_amount: Math.floor(itemPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    let payment_method_types;
    
    switch (paymentMethod) {
      case 'mbway':
        payment_method_types = ['mb_way'];
        break;
      case 'multibanco':
        payment_method_types = ['multibanco'];
        break;
      case 'card':
      default:
        payment_method_types = ['card'];
        break;
    }

    const sessionOptions = {
      line_items,
      mode: 'payment',
      payment_method_types,
      success_url: `${origin}/order-success/${order._id}?payment=stripe&method=${paymentMethod || 'card'}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
        paymentMethod: paymentMethod || 'card',
      },
    };

    if (paymentMethod === 'mbway') {
      sessionOptions.payment_method_options = { mb_way: {} };
    }

    if (paymentMethod === 'multibanco') {
      sessionOptions.payment_method_options = { multibanco: {} };
    }

    const session = await stripeInstance.checkout.sessions.create(sessionOptions);

    console.log('✅ Sessão Stripe criada:', session.id);

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('❌ Erro Stripe completo:', error);
    return res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// STRIPE WEBHOOKS - 🆕 COM DECREMENTO DE STOCK
// =============================================================================
export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('❌ Webhook Error:', error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('✅ Checkout Session Completed:', session.id);
      
      const { orderId, userId, paymentMethod } = session.metadata;
      
      if (session.payment_status === 'paid') {
        console.log(`💳 Pagamento ${paymentMethod} confirmado para pedido:`, orderId);
        
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId, 
          { isPaid: true },
          { new: true }
        ).populate('items.product');
        
        console.log('✅ Pedido marcado como pago:', orderId);
        
        // 🆕 DECREMENTAR STOCK APÓS PAGAMENTO CONFIRMADO
        if (updatedOrder) {
          await decrementProductStock(updatedOrder.items);
        }
        
        // Clear user cart
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        // Enviar email
        if (updatedOrder) {
          sendClientEmail(updatedOrder, userId).catch(err => {
            console.error('❌ Erro no email Stripe (background):', err.message);
          });
        }
      } else if (session.payment_status === 'unpaid' && paymentMethod === 'multibanco') {
        console.log('⏳ Multibanco: Aguardando pagamento da referência para pedido:', orderId);
      }
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      console.log('💳 Pagamento confirmado (payment_intent.succeeded):', paymentIntentId);

      try {
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (!session.data || session.data.length === 0) {
          console.error('❌ Sessão não encontrada');
          break;
        }

        const { orderId, userId, paymentMethod } = session.data[0].metadata;
        
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId, 
          { isPaid: true },
          { new: true }
        ).populate('items.product');
        
        console.log(`✅ Pedido ${paymentMethod} marcado como pago:`, orderId);
        
        // 🆕 DECREMENTAR STOCK
        if (updatedOrder) {
          await decrementProductStock(updatedOrder.items);
        }
        
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        if (updatedOrder) {
          sendClientEmail(updatedOrder, userId).catch(err => {
            console.error('❌ Erro no email Stripe (background):', err.message);
          });
        }
      } catch (error) {
        console.error('❌ Erro no webhook:', error.message);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      console.log('❌ Pagamento falhou:', paymentIntentId);

      try {
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (session.data && session.data.length > 0) {
          const { orderId } = session.data[0].metadata;
          await Order.findByIdAndDelete(orderId);
          console.log('🗑️ Pedido deletado:', orderId);
        }
      } catch (error) {
        console.error('❌ Erro ao deletar pedido:', error.message);
      }
      break;
    }

    case 'source.chargeable': {
      const source = event.data.object;
      if (source.type === 'multibanco') {
        console.log('🏦 Multibanco referência gerada:', {
          reference: source.multibanco?.reference,
          entity: source.multibanco?.entity,
        });
      }
      break;
    }

    default:
      console.log(`ℹ️ Evento não tratado: ${event.type}`);
      break;
  }
  response.json({ received: true });
};

// =============================================================================
// GET USER ORDERS
// =============================================================================
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.query.userId || req.body.userId;

    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    })
      .populate({
        path: 'items.product',
        select: 'name image category offerPrice weight color colorCode',
      })
      .populate({
        path: 'address',
        select: 'firstName lastName street city state zipcode country email phone',
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error);
    res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// GET ALL ORDERS (SELLER/ADMIN)
// =============================================================================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    })
      .populate('items.product address')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// UPDATE ORDER STATUS (SELLER/ADMIN)
// =============================================================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.json({
        success: false,
        message: 'Order ID e Status são obrigatórios',
      });
    }

    const validStatuses = [
      'Order Placed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.json({ success: false, message: 'Status inválido' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.json({ success: false, message: 'Pedido não encontrado' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    )
      .populate('items.product address')
      .exec();

    console.log('✅ Status atualizado:', {
      orderId: updatedOrder._id,
      oldStatus: order.status,
      newStatus: status,
    });

    if (status === 'Delivered' && order.paymentType === 'COD') {
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      console.log('✅ Pedido COD marcado como pago (entregue)');
    }

    res.json({
      success: true,
      message: `Status atualizado para "${status}"`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    res.json({ success: false, message: error.message });
  }
};