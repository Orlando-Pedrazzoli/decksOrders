import { sendOrderConfirmationEmail } from '../services/emailService.js';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';

// Substitua a função placeOrderCOD no orderController.js por esta:

export const placeOrderCOD = async (req, res) => {
  try {
    console.log('📧 Recebendo dados da encomenda:', req.body);

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

    console.log('📧 Dados detalhados:', {
      userId,
      itemsCount: items?.length,
      address,
      promoCode,
      discountApplied,
      originalAmount,
      discountAmount,
      finalAmount,
      discountPercentage,
    });

    if (!address || items.length === 0) {
      console.log('❌ Dados inválidos - address ou items vazios');
      return res.json({ success: false, message: 'Invalid data' });
    }

    // ✅ USAR VALORES DO FRONTEND (já calculados corretamente)
    let orderOriginalAmount = originalAmount;
    let orderFinalAmount = finalAmount || originalAmount;
    let orderDiscountAmount = discountAmount || 0;
    let orderDiscountPercentage = discountPercentage || 0;
    let validPromoCode = null;

    // Se não vieram do frontend, calcular aqui como backup
    if (!originalAmount) {
      orderOriginalAmount = await items.reduce(async (acc, item) => {
        const product = await Product.findById(item.product);
        return (await acc) + product.offerPrice * item.quantity;
      }, 0);

      orderFinalAmount = orderOriginalAmount;
      console.log('💰 Valor calculado no backend:', orderOriginalAmount);
    }

    // Validar promo code se aplicado
    if (promoCode && discountApplied) {
      if (promoCode.toUpperCase() === 'BROTHER') {
        validPromoCode = promoCode.toUpperCase();

        // Usar valores do frontend se vieram, senão calcular
        if (!discountAmount) {
          orderDiscountPercentage = 30;
          orderDiscountAmount =
            Math.round(orderOriginalAmount * 0.3 * 100) / 100;
          orderFinalAmount = orderOriginalAmount - orderDiscountAmount;
        }

        console.log('🎯 Promo code válido aplicado:', {
          code: validPromoCode,
          originalAmount: orderOriginalAmount,
          discountPercentage: orderDiscountPercentage,
          discountAmount: orderDiscountAmount,
          finalAmount: orderFinalAmount,
        });
      } else {
        console.log('❌ Promo code inválido:', promoCode);
      }
    }

    // Criar pedido com valores corretos
    const newOrder = await Order.create({
      userId,
      items,
      amount: orderFinalAmount, // ✅ Valor final correto
      originalAmount: orderOriginalAmount, // ✅ Valor original correto
      address,
      paymentType: 'COD',
      promoCode: validPromoCode,
      discountAmount: orderDiscountAmount, // ✅ Desconto correto
      discountPercentage: orderDiscountPercentage, // ✅ Percentagem correta
    });

    console.log('✅ Pedido criado com valores:', {
      orderId: newOrder._id,
      amount: newOrder.amount,
      originalAmount: newOrder.originalAmount,
      discountAmount: newOrder.discountAmount,
      promoCode: newOrder.promoCode,
    });

    // Limpar carrinho
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // Enviar email de confirmação
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
