// server/controllers/orderController.js
// 🎯 VERSÃO COM SUPORTE A STOCK + MB WAY + MULTIBANCO + GUEST CHECKOUT

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
// 🆕 FUNÇÃO PARA ENVIAR EMAIL - SUPORTA USER E GUEST
// =============================================================================
const sendClientEmail = async (order, userOrEmail) => {
  try {
    console.log('📧 Preparando email para cliente...');
    
    let user = null;
    let email = null;
    let customerName = null;
    
    // Determinar se é user registado ou guest
    if (typeof userOrEmail === 'string') {
      // É um email de guest
      email = userOrEmail;
      customerName = order.guestName || 'Cliente';
    } else if (userOrEmail?._id) {
      // É um objeto user
      user = userOrEmail;
      email = user.email;
      customerName = user.name;
    } else if (userOrEmail) {
      // É um userId string
      user = await User.findById(userOrEmail);
      if (user) {
        email = user.email;
        customerName = user.name;
      }
    }
    
    // Se é guest order, usar dados do pedido
    if (order.isGuestOrder && !email) {
      email = order.guestEmail;
      customerName = order.guestName || 'Cliente';
    }

    const address = await Address.findById(order.address);
    const productIds = order.items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    if (!email || !address) {
      console.error('❌ Dados insuficientes para enviar email');
      return;
    }

    // Criar objeto user fake para o template de email se for guest
    const emailUser = user || {
      _id: 'guest',
      name: customerName,
      email: email
    };

    const emailResult = await sendOrderConfirmationEmail(order, emailUser, products, address);
    
    if (emailResult.success) {
      console.log('✅ Email de confirmação enviado para:', emailResult.recipient);
    } else {
      console.error('❌ Falha no email:', emailResult.error);
    }

    // Notificação admin
    if (notifyAdminNewOrder) {
      try {
        console.log('🔔 Enviando notificação para admin...');
        const adminResult = await notifyAdminNewOrder(order, emailUser, products, address);
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
// 🆕 PLACE ORDER COD - SUPORTA GUEST
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
      // 🆕 Campos de guest
      isGuestOrder,
      guestEmail,
      guestName,
      guestPhone,
    } = req.body;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Dados inválidos' });
    }

    // 🆕 Validar: precisa de userId OU dados de guest
    if (!userId && !isGuestOrder) {
      return res.json({ success: false, message: 'Utilizador ou dados de guest necessários' });
    }

    if (isGuestOrder && !guestEmail) {
      return res.json({ success: false, message: 'Email é obrigatório para guest checkout' });
    }

    // Validar stock
    const stockValidation = await validateOrderStock(items);
    if (!stockValidation.valid) {
      return res.json({ 
        success: false, 
        message: 'Stock insuficiente: ' + stockValidation.errors.join(', ')
      });
    }

    // 🆕 Criar pedido com suporte a guest
    const orderData = {
      items,
      amount,
      address,
      paymentType: 'COD',
      isPaid: false,
      promoCode: promoCode || '',
      discountAmount: discountAmount || 0,
      discountPercentage: discountPercentage || 0,
      originalAmount,
    };

    if (isGuestOrder) {
      orderData.isGuestOrder = true;
      orderData.guestEmail = guestEmail;
      orderData.guestName = guestName || '';
      orderData.guestPhone = guestPhone || '';
      orderData.userId = null;
    } else {
      orderData.userId = userId;
      orderData.isGuestOrder = false;
    }

    const newOrder = await Order.create(orderData);

    console.log(`✅ Pedido COD criado (${isGuestOrder ? 'GUEST' : 'USER'}):`, newOrder._id);

    // Decrementar stock
    await decrementProductStock(items);

    // Limpar carrinho do user (se não for guest)
    if (userId) {
      await User.findByIdAndUpdate(userId, { cartItems: {} });
    }

    // Enviar email
    const emailRecipient = isGuestOrder ? guestEmail : userId;
    sendClientEmail(newOrder, emailRecipient).catch(err => {
      console.error('❌ Erro no envio de email (background):', err.message);
    });

    return res.json({
      success: true,
      message: 'Encomenda realizada com sucesso',
      orderId: newOrder._id,
      isGuestOrder: isGuestOrder || false,
    });
  } catch (error) {
    console.error('❌ Erro COD:', error);
    return res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// 🆕 PLACE ORDER STRIPE - SUPORTA GUEST
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
      // 🆕 Campos de guest
      isGuestOrder,
      guestEmail,
      guestName,
      guestPhone,
    } = req.body;

    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Dados inválidos' });
    }

    // 🆕 Validar: precisa de userId OU dados de guest
    if (!userId && !isGuestOrder) {
      return res.json({ success: false, message: 'Utilizador ou dados de guest necessários' });
    }

    if (isGuestOrder && !guestEmail) {
      return res.json({ success: false, message: 'Email é obrigatório para guest checkout' });
    }

    // Validar stock
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

    // 🆕 Criar pedido com suporte a guest
    const orderData = {
      items,
      amount,
      address,
      paymentType: 'Online',
      isPaid: false,
      promoCode: promoCode || '',
      discountAmount: discountAmount || 0,
      discountPercentage: discountPercentage || 0,
      originalAmount,
    };

    if (isGuestOrder) {
      orderData.isGuestOrder = true;
      orderData.guestEmail = guestEmail;
      orderData.guestName = guestName || '';
      orderData.guestPhone = guestPhone || '';
      orderData.userId = null;
    } else {
      orderData.userId = userId;
      orderData.isGuestOrder = false;
    }

    const order = await Order.create(orderData);

    console.log(`✅ Pedido Stripe criado (${isGuestOrder ? 'GUEST' : 'USER'}):`, order._id);

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

    // 🆕 Incluir dados de guest no metadata
    const sessionOptions = {
      line_items,
      mode: 'payment',
      payment_method_types,
      success_url: `${origin}/order-success/${order._id}?payment=stripe&method=${paymentMethod || 'card'}${isGuestOrder ? '&guest=true' : ''}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId || '',
        paymentMethod: paymentMethod || 'card',
        isGuestOrder: isGuestOrder ? 'true' : 'false',
        guestEmail: guestEmail || '',
      },
    };

    // 🆕 Pre-fill email para guest
    if (isGuestOrder && guestEmail) {
      sessionOptions.customer_email = guestEmail;
    }

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
// STRIPE WEBHOOKS - 🆕 COM SUPORTE A GUEST
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
      
      const { orderId, userId, paymentMethod, isGuestOrder, guestEmail } = session.metadata;
      
      if (session.payment_status === 'paid') {
        console.log(`💳 Pagamento ${paymentMethod} confirmado para pedido:`, orderId);
        
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId, 
          { isPaid: true },
          { new: true }
        ).populate('items.product');
        
        console.log('✅ Pedido marcado como pago:', orderId);
        
        // Decrementar stock
        if (updatedOrder) {
          await decrementProductStock(updatedOrder.items);
        }
        
        // Limpar carrinho (apenas se não for guest)
        if (userId && isGuestOrder !== 'true') {
          await User.findByIdAndUpdate(userId, { cartItems: {} });
        }

        // Enviar email
        if (updatedOrder) {
          const emailRecipient = isGuestOrder === 'true' ? guestEmail : userId;
          sendClientEmail(updatedOrder, emailRecipient).catch(err => {
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

        const { orderId, userId, paymentMethod, isGuestOrder, guestEmail } = session.data[0].metadata;
        
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId, 
          { isPaid: true },
          { new: true }
        ).populate('items.product');
        
        console.log(`✅ Pedido ${paymentMethod} marcado como pago:`, orderId);
        
        // Decrementar stock
        if (updatedOrder) {
          await decrementProductStock(updatedOrder.items);
        }
        
        // Limpar carrinho (apenas se não for guest)
        if (userId && isGuestOrder !== 'true') {
          await User.findByIdAndUpdate(userId, { cartItems: {} });
        }

        // Enviar email
        if (updatedOrder) {
          const emailRecipient = isGuestOrder === 'true' ? guestEmail : userId;
          sendClientEmail(updatedOrder, emailRecipient).catch(err => {
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
// GET USER ORDERS - 🆕 SUPORTA BUSCA POR EMAIL (GUEST)
// =============================================================================
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.query.userId || req.body.userId;
    const guestEmail = req.query.guestEmail || req.body.guestEmail;

    // 🆕 Permitir buscar por guestEmail OU userId
    let query;
    
    if (guestEmail) {
      // Buscar pedidos de guest por email
      query = {
        isGuestOrder: true,
        guestEmail: guestEmail,
        $or: [{ paymentType: 'COD' }, { isPaid: true }],
      };
    } else if (userId) {
      // Buscar pedidos de user registado
      query = {
        userId,
        $or: [{ paymentType: 'COD' }, { isPaid: true }],
      };
    } else {
      return res.json({ success: false, message: 'User ID ou Guest Email necessário' });
    }

    const orders = await Order.find(query)
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
// 🆕 GET SINGLE ORDER (PUBLIC - PARA PÁGINA DE SUCESSO)
// =============================================================================
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.json({ success: false, message: 'Order ID necessário' });
    }

    const order = await Order.findById(orderId)
      .populate({
        path: 'items.product',
        select: 'name image category offerPrice weight color colorCode',
      })
      .populate({
        path: 'address',
        select: 'firstName lastName street city state zipcode country email phone',
      });

    if (!order) {
      return res.json({ success: false, message: 'Pedido não encontrado' });
    }

    // Verificar se é um pedido válido para mostrar
    const isValidOrder = order.paymentType === 'COD' || order.isPaid === true;

    if (!isValidOrder) {
      return res.json({ 
        success: false, 
        message: 'Pedido ainda não confirmado',
        pending: true 
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Erro ao buscar pedido:', error);
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