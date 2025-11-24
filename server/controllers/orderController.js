// server/controllers/orderController.js
// ATUALIZADO COM NOTIFICAÇÕES EMAIL + WHATSAPP PARA ADMIN

import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { notifyAdminNewOrder } from '../services/adminNotificationService.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import stripe from 'stripe';

// =============================================================================
// FUNÇÃO AUXILIAR: ENVIAR TODAS AS NOTIFICAÇÕES
// =============================================================================
const sendAllNotifications = async (order, userId) => {
  try {
    console.log('📧 Preparando notificações para pedido:', order._id);

    // Buscar dados necessários
    const user = await User.findById(userId);
    const address = await Address.findById(order.address);
    const productIds = order.items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    if (!user || !address) {
      console.error('❌ Dados insuficientes para enviar notificações');
      return;
    }

    // ✅ 1. EMAIL PARA O CLIENTE
    try {
      const emailResult = await sendOrderConfirmationEmail(order, user, products, address);
      if (emailResult.success) {
        console.log('✅ Email de confirmação enviado para cliente:', emailResult.recipient);
      } else {
        console.error('❌ Falha no email para cliente:', emailResult.error);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email para cliente:', error.message);
    }

    // ✅ 2. NOTIFICAÇÕES PARA O ADMIN (Email + WhatsApp)
    try {
      const adminResult = await notifyAdminNewOrder(order, user, products, address);
      console.log('🔔 Resultado notificações admin:', adminResult);
    } catch (error) {
      console.error('❌ Erro nas notificações para admin:', error.message);
    }

  } catch (error) {
    console.error('❌ Erro geral nas notificações:', error.message);
  }
};

// =============================================================================
// PLACE ORDER COD - COM NOTIFICAÇÕES
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

    console.log('✅ Pedido COD criado:', {
      orderId: newOrder._id,
      amount: newOrder.amount,
    });

    // Clear user cart
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // ✅ ENVIAR NOTIFICAÇÕES (não bloqueia a resposta)
    sendAllNotifications(newOrder, userId).catch(err => {
      console.error('❌ Erro nas notificações (background):', err.message);
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
// PLACE ORDER STRIPE - COM NOTIFICAÇÕES NO WEBHOOK
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
    } = req.body;

    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
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

    // ✅ CRIAR PEDIDO (ainda não pago)
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

    console.log('✅ Pedido Stripe criado:', {
      orderId: order._id,
      amount: order.amount,
    });

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

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/order-success/${order._id}?payment=stripe`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('❌ Erro Stripe:', error);
    return res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// STRIPE WEBHOOKS - COM NOTIFICAÇÕES APÓS PAGAMENTO CONFIRMADO
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
    console.error('❌ Webhook signature verification failed:', error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      console.log('💳 Pagamento Stripe confirmado:', paymentIntentId);

      try {
        // Getting Session Metadata
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (!session.data || session.data.length === 0) {
          console.error('❌ Sessão não encontrada para payment intent');
          break;
        }

        const { orderId, userId } = session.data[0].metadata;

        // Mark Payment as Paid
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId, 
          { isPaid: true },
          { new: true }
        );

        console.log('✅ Pedido marcado como pago:', orderId);

        // Clear user cart
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        // ✅ ENVIAR NOTIFICAÇÕES APÓS PAGAMENTO CONFIRMADO
        if (updatedOrder) {
          sendAllNotifications(updatedOrder, userId).catch(err => {
            console.error('❌ Erro nas notificações Stripe (background):', err.message);
          });
        }

      } catch (error) {
        console.error('❌ Erro ao processar payment_intent.succeeded:', error.message);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      console.log('❌ Pagamento Stripe falhou:', paymentIntentId);

      try {
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (session.data && session.data.length > 0) {
          const { orderId } = session.data[0].metadata;
          await Order.findByIdAndDelete(orderId);
          console.log('🗑️ Pedido deletado após falha no pagamento:', orderId);
        }
      } catch (error) {
        console.error('❌ Erro ao processar payment_intent.payment_failed:', error.message);
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
        select: 'name image category offerPrice weight',
      })
      .populate({
        path: 'address',
        select: 'firstName lastName street city state zipcode country email phone',
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
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

    const order = await Order.findById(orderId);

    if (!order) {
      return res.json({
        success: false,
        message: 'Pedido não encontrado',
      });
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

    // Se entregue e COD, marcar como pago
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