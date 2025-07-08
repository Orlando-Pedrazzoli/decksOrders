import { sendOrderConfirmationEmail } from '../services/emailService.js';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';

export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }

    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    const newOrder = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'COD',
    });

    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // EMAIL SUPER SIMPLES com fetch
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
    return res.json({ success: false, message: error.message });
  }
};
// Place Order Stripe : /api/order/stripe
export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('❌ Erro ao verificar webhook Stripe:', error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      try {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        const { orderId, userId } = sessionList.data[0].metadata;

        // Atualiza status do pedido e limpa o carrinho
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { isPaid: true },
          { new: true }
        );
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        // Busca dados para envio de email
        const user = await User.findById(userId).select('name email');
        const addressData = await Address.findById(updatedOrder.address);
        const products = await Promise.all(
          updatedOrder.items.map(
            async item => await Product.findById(item.product)
          )
        );

        // Envia email de confirmação
        await sendOrderConfirmationEmail(
          updatedOrder,
          user,
          products,
          addressData
        );

        console.log('✅ Email de confirmação enviado após pagamento Stripe');
      } catch (err) {
        console.error(
          '❌ Erro ao processar payment_intent.succeeded:',
          err.message
        );
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      try {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        const { orderId } = sessionList.data[0].metadata;

        await Order.findByIdAndDelete(orderId);
        console.log(`⚠️ Pedido ${orderId} cancelado após falha de pagamento`);
      } catch (err) {
        console.error(
          '❌ Erro ao processar payment_intent.payment_failed:',
          err.message
        );
      }
      break;
    }

    default:
      console.warn(`⚠️ Evento não tratado: ${event.type}`);
      break;
  }

  response.json({ received: true });
};

// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    })
      .populate('items.product address')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get All Orders ( for seller / admin) : /api/order/seller
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
export const placeOrderStripe = async (req, res) => {
  return res.status(503).json({
    success: false,
    message: 'Pagamento via Stripe temporariamente desativado.',
  });
};
