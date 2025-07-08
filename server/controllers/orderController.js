import { sendOrderConfirmationEmail } from '../services/emailService.js';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';

export const placeOrderCOD = async (req, res) => {
  try {
    console.log('📧 Recebendo dados da encomenda:', req.body);

    const { userId, items, address, promoCode, discountApplied } = req.body;

    console.log('📧 userId:', userId);
    console.log('📧 items:', items);
    console.log('📧 address:', address);
    console.log('📧 promoCode:', promoCode);
    console.log('📧 discountApplied:', discountApplied);

    if (!address || items.length === 0) {
      console.log('❌ Dados inválidos - address ou items vazios');
      return res.json({ success: false, message: 'Invalid data' });
    }

    // Calcular valor original (antes do desconto)
    let originalAmount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    console.log('💰 Valor original calculado:', originalAmount);

    // ✅ NOVA LÓGICA DO PROMO CODE
    let finalAmount = originalAmount;
    let discountAmount = 0;
    let discountPercentage = 0;
    let validPromoCode = null;

    // Verificar e aplicar desconto se válido
    if (promoCode && discountApplied) {
      if (promoCode.toUpperCase() === 'BROTHER') {
        discountPercentage = 30;
        discountAmount = Math.round(originalAmount * 0.3 * 100) / 100; // Arredondar para 2 casas decimais
        finalAmount = originalAmount - discountAmount;
        validPromoCode = promoCode.toUpperCase();

        console.log('🎯 Promo code aplicado:', {
          code: validPromoCode,
          discountPercentage,
          discountAmount,
          finalAmount,
        });
      } else {
        console.log('❌ Promo code inválido:', promoCode);
      }
    }

    // Criar pedido com todos os dados
    const newOrder = await Order.create({
      userId,
      items,
      amount: finalAmount, // Valor final com desconto aplicado
      originalAmount, // Valor original antes do desconto
      address,
      paymentType: 'COD',
      promoCode: validPromoCode,
      discountAmount,
      discountPercentage,
    });

    console.log('✅ Pedido criado com sucesso:', newOrder._id);

    // Limpar carrinho
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // Enviar email de confirmação com dados completos
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
    console.error('❌ Erro ao processar pedido:', error);
    return res.json({ success: false, message: error.message });
  }
};

// Manter as outras funções como estão...
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

        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { isPaid: true },
          { new: true }
        );
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        const user = await User.findById(userId).select('name email');
        const addressData = await Address.findById(updatedOrder.address);
        const products = await Promise.all(
          updatedOrder.items.map(
            async item => await Product.findById(item.product)
          )
        );

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
