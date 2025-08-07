import { sendOrderConfirmationEmail } from '../services/emailService.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import stripe from 'stripe';

// =============================================================================
// PLACE ORDER COD
// =============================================================================
export const placeOrderCOD = async (req, res) => {
  try {
    console.log('📧 COD Order - Dados recebidos:', req.body);

    const {
      userId,
      items,
      address,
      promoCode,
      discountApplied,
      originalAmount,
      discountAmount,
      finalAmount,
      discountPercentage,
    } = req.body;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }

    // ✅ Usar valores do frontend ou calcular como backup
    let orderOriginalAmount = originalAmount;
    let orderFinalAmount = finalAmount || originalAmount;
    let orderDiscountAmount = discountAmount || 0;
    let orderDiscountPercentage = discountPercentage || 0;
    let validPromoCode = null;

    // Calcular valores se não vieram do frontend
    if (!originalAmount) {
      orderOriginalAmount = await items.reduce(async (acc, item) => {
        const product = await Product.findById(item.product);
        return (await acc) + product.offerPrice * item.quantity;
      }, 0);
      // Add Tax Charge (2%)
      orderOriginalAmount += Math.floor(orderOriginalAmount * 0.02);
      orderFinalAmount = orderOriginalAmount;
    }

    // Validar promo code
    if (promoCode && discountApplied && promoCode.toUpperCase() === 'BROTHER') {
      validPromoCode = promoCode.toUpperCase();
      if (!discountAmount) {
        orderDiscountPercentage = 30;
        orderDiscountAmount = Math.round(orderOriginalAmount * 0.3 * 100) / 100;
        orderFinalAmount = orderOriginalAmount - orderDiscountAmount;
      }
    }

    // Criar pedido
    const newOrder = await Order.create({
      userId,
      items,
      amount: orderFinalAmount,
      originalAmount: orderOriginalAmount,
      address,
      paymentType: 'COD',
      isPaid: false, // COD sempre false até entrega
      promoCode: validPromoCode,
      discountAmount: orderDiscountAmount,
      discountPercentage: orderDiscountPercentage,
    });

    console.log('✅ Pedido COD criado:', {
      orderId: newOrder._id,
      amount: newOrder.amount,
      isPaid: newOrder.isPaid,
    });

    // Limpar carrinho e enviar email
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    const user = await User.findById(userId).select('name email');
    const addressData = await Address.findById(address);
    const products = await Promise.all(
      items.map(async item => await Product.findById(item.product))
    );

    await sendOrderConfirmationEmail(newOrder, user, products, addressData);

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
  try {
    const { userId, items, address } = req.body;
    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }

    let productData = [];

    // Calculate Amount Using Items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add Tax Charge (2%)
    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'Online',
    });

    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // create line items for stripe
    const line_items = productData.map(item => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
        },
        quantity: item.quantity,
      };
    });

    // create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
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
