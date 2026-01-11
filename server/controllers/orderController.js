// server/controllers/orderController.js
// VERSÃO SIMPLIFICADA SEM VARIANTES

import { sendOrderConfirmationEmail } from '../services/emailService.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import stripe from 'stripe';

// =============================================================================
// IMPORTAÇÃO SEGURA DO WHATSAPP (não quebra se não existir)
// =============================================================================
let notifyAdminNewOrder = null;
try {
  const adminNotification = await import('../services/adminNotificationService.js');
  notifyAdminNewOrder = adminNotification.notifyAdminNewOrder;
  console.log('✅ Serviço de notificação admin carregado');
} catch (error) {
  console.log('⚠️ Serviço de notificação admin não disponível:', error.message);
}

// =============================================================================
// 🆕 FUNÇÃO PARA VALIDAR E DECREMENTAR STOCK (SIMPLIFICADA)
// =============================================================================
const validateAndDecrementStock = async (items) => {
  const stockErrors = [];
  const decrementOperations = [];
  
  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      stockErrors.push({
        productId: item.product,
        message: 'Produto não encontrado',
      });
      continue;
    }
    
    const availableStock = product.stock || 0;
    
    if (item.quantity > availableStock) {
      stockErrors.push({
        productId: item.product,
        productName: product.name,
        requestedQuantity: item.quantity,
        availableStock,
        message: availableStock === 0 
          ? `"${product.name}" está esgotado`
          : `"${product.name}" tem apenas ${availableStock} unidade(s)`,
      });
    } else {
      decrementOperations.push({
        product,
        quantity: item.quantity,
      });
    }
  }
  
  return { stockErrors, decrementOperations };
};

const executeStockDecrement = async (decrementOperations) => {
  for (const op of decrementOperations) {
    try {
      await op.product.decrementStock(op.quantity);
      console.log(`📦 Stock decrementado: ${op.product.name} (-${op.quantity})`);
    } catch (error) {
      console.error(`❌ Erro ao decrementar stock de ${op.product.name}:`, error.message);
    }
  }
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
// PLACE ORDER COD - COM VALIDAÇÃO DE STOCK
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

    // 🎯 VALIDAR STOCK ANTES DE CRIAR O PEDIDO
    const { stockErrors, decrementOperations } = await validateAndDecrementStock(items);
    
    if (stockErrors.length > 0) {
      return res.json({
        success: false,
        message: 'Alguns produtos não têm stock suficiente',
        stockErrors,
      });
    }

    // ✅ CRIAR PEDIDO
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

    // 🎯 DECREMENTAR STOCK APÓS CRIAR O PEDIDO
    await executeStockDecrement(decrementOperations);

    // Clear user cart
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // ✅ ENVIAR EMAIL (em background)
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
// PLACE ORDER STRIPE - COM VALIDAÇÃO DE STOCK
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

    // 🎯 VALIDAR STOCK ANTES DE CRIAR O PEDIDO
    const { stockErrors } = await validateAndDecrementStock(items);
    
    if (stockErrors.length > 0) {
      return res.json({
        success: false,
        message: 'Alguns produtos não têm stock suficiente',
        stockErrors,
      });
    }

    let productData = [];

    // Preparar productData para Stripe
    for (const item of items) {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
    }

    // ✅ CRIAR PEDIDO (marcado como não pago)
    const newOrder = await Order.create({
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

    console.log('✅ Pedido Stripe criado:', newOrder._id);

    // ✅ CONFIGURAR STRIPE
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // ✅ CONFIGURAR PAYMENT METHOD TYPES baseado na escolha do usuário
    let payment_method_types = ['card'];
    
    if (paymentMethod === 'mbway') {
      payment_method_types = ['card'];
      console.log('📱 MB Way selecionado (via Stripe)');
    } else if (paymentMethod === 'multibanco') {
      payment_method_types = ['multibanco'];
      console.log('🏦 Multibanco selecionado');
    }

    // ✅ CRIAR STRIPE CHECKOUT SESSION
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types,
      line_items: productData.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId,
        paymentMethod: paymentMethod,
        items: JSON.stringify(items),
      },
      ...(paymentMethod === 'multibanco' && {
        payment_method_options: {
          multibanco: {
            expires_after_days: 7,
          },
        },
      }),
    });

    console.log('✅ Stripe Session criada:', session.id);

    return res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Erro Stripe:', error);
    return res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// STRIPE WEBHOOKS
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
  } catch (err) {
    console.error('⚠️ Webhook Error:', err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📨 Webhook recebido: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { orderId, userId, paymentMethod, items } = session.metadata;

      console.log('✅ Checkout completado:', { orderId, paymentMethod });

      if (session.payment_status === 'paid') {
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { isPaid: true },
          { new: true }
        );
        
        console.log('💰 Pedido marcado como pago:', orderId);

        // 🎯 DECREMENTAR STOCK APÓS PAGAMENTO CONFIRMADO
        if (items) {
          try {
            const parsedItems = JSON.parse(items);
            const { decrementOperations } = await validateAndDecrementStock(parsedItems);
            await executeStockDecrement(decrementOperations);
            console.log('📦 Stock decrementado após pagamento Stripe');
          } catch (stockError) {
            console.error('❌ Erro ao decrementar stock:', stockError.message);
          }
        }
        
        // Clear user cart
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        // ✅ ENVIAR EMAIL APÓS PAGAMENTO CONFIRMADO
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
        );
        
        console.log(`✅ Pedido ${paymentMethod} marcado como pago:`, orderId);
        
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
          await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' });
          console.log('🗑️ Pedido marcado como cancelado:', orderId);
        }
      } catch (error) {
        console.error('❌ Erro ao cancelar pedido:', error.message);
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
    const userId =
      req.user?.id || req.user?._id || req.query.userId || req.body.userId;

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
      return res.json({
        success: false,
        message: 'Status inválido',
      });
    }

    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      return res.json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    // 🎯 SE CANCELAR, DEVOLVER STOCK
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      console.log('🔄 Devolvendo stock para pedido cancelado:', orderId);
      
      for (const item of order.items) {
        const product = await Product.findById(item.product._id || item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
          console.log(`📦 Stock devolvido: ${product.name} (+${item.quantity})`);
        }
      }
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

    // Se o status for "Delivered" e for COD, marcar como pago
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