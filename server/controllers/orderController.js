import { sendOrderConfirmationEmail } from '../services/emailService.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import stripe from 'stripe';

// =============================================================================
// PLACE ORDER COD - USANDO MODELO Order COMPLETO
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
      paymentType,
      isPaid,
    } = req.body;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }

    // ✅ CRIAR PEDIDO COM TODOS OS CAMPOS DO MODELO
    const newOrder = await Order.create({
      userId,
      items,
      amount, // Valor final após desconto
      address,
      paymentType: 'COD',
      isPaid: false, // COD sempre false até entrega
      promoCode: promoCode || '',
      discountAmount: discountAmount || 0,
      discountPercentage: discountPercentage || 0,
      originalAmount, // OBRIGATÓRIO
    });

    console.log('✅ Pedido COD criado:', {
      orderId: newOrder._id,
      amount: newOrder.amount,
      originalAmount: newOrder.originalAmount,
      discountAmount: newOrder.discountAmount,
    });

    // Clear user cart
    await User.findByIdAndUpdate(userId, { cartItems: {} });

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
// PLACE ORDER STRIPE - CORRIGIDO PARA RECEBER TODOS OS CAMPOS
// =============================================================================
export const placeOrderStripe = async (req, res) => {
  console.log('🚀 STRIPE FUNCTION STARTED!!!');
  console.log('Body received:', req.body);

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
      paymentType,
      isPaid,
    } = req.body;

    const { origin } = req.headers;

    console.log('🔍 All fields extracted:', {
      userId,
      items,
      address,
      originalAmount,
      amount,
      discountAmount,
      discountPercentage,
      promoCode,
    });

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
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

    console.log('🔍 Creating order with:', {
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

    // ✅ CRIAR PEDIDO COM TODOS OS CAMPOS DO MODELO
    const order = await Order.create({
      userId,
      items,
      amount, // Valor final após desconto
      address,
      paymentType: 'Online',
      isPaid: false, // Sempre false - webhook vai marcar como true
      promoCode: promoCode || '',
      discountAmount: discountAmount || 0,
      discountPercentage: discountPercentage || 0,
      originalAmount, // OBRIGATÓRIO
    });

    console.log('✅ Pedido Stripe criado:', {
      orderId: order._id,
      amount: order.amount,
      originalAmount: order.originalAmount,
      discountAmount: order.discountAmount,
    });

    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // create line items for stripe
    const line_items = productData.map(item => {
      // Se há desconto, aplicar proporcionalmente
      let itemPrice = item.price;
      if (discountPercentage > 0) {
        itemPrice = item.price * (1 - discountPercentage / 100);
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name:
              discountPercentage > 0
                ? `${item.name} (${discountPercentage}% OFF)`
                : item.name,
          },
          unit_amount: Math.floor(itemPrice) * 100,
        },
        quantity: item.quantity,
      };
    });

    // create session
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
    console.error('❌ Erro Stripe completo:', error);
    return res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// STRIPE WEBHOOKS
// =============================================================================
export const stripeWebhooks = async (request, response) => {
  // Stripe Gateway Initialize
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
    response.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId, userId } = session.data[0].metadata;
      // Mark Payment as Paid
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      // Clear user cart
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }

    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }
  response.json({ received: true });
};

// =============================================================================
// GET USER ORDERS - HÍBRIDO (funciona com GET e POST)
// =============================================================================
export const getUserOrders = async (req, res) => {
  try {
    // ✅ HÍBRIDO: Tentar múltiplas formas de pegar userId
    const userId =
      req.user?.id || req.user?._id || req.query.userId || req.body.userId;

    console.log('🔍 Tentando buscar pedidos...');
    console.log('🔍 req.user:', req.user);
    console.log('🔍 req.query:', req.query);
    console.log('🔍 req.body:', req.body);
    console.log('🔍 userId extraído:', userId);

    if (!userId) {
      console.log('❌ userId não encontrado');
      return res.json({ success: false, message: 'User ID is required' });
    }

    console.log('🔍 Fetching orders for user:', userId);

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
        select:
          'firstName lastName street city state zipcode country email phone',
      })
      .sort({ createdAt: -1 });

    console.log(`📋 Orders found for user ${userId}:`, orders.length);

    // Log de cada pedido para debug
    orders.forEach((order, index) => {
      console.log(`📦 Order ${index + 1}:`, {
        id: order._id,
        paymentType: order.paymentType,
        isPaid: order.isPaid,
        amount: order.amount,
        status: order.status,
      });
    });

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
