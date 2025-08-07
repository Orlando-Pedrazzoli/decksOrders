import { sendOrderConfirmationEmail } from '../services/emailService.js';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';

// ✅ Inicializar Stripe instance globalmente
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    console.log('💳 Stripe Order - Dados recebidos:', req.body);

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

    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }

    let productData = [];
    let orderOriginalAmount = originalAmount;
    let orderFinalAmount = finalAmount || originalAmount;
    let orderDiscountAmount = discountAmount || 0;
    let orderDiscountPercentage = discountPercentage || 0;
    let validPromoCode = null;

    // Calcular valores e preparar productData
    if (!originalAmount) {
      orderOriginalAmount = await items.reduce(async (acc, item) => {
        const product = await Product.findById(item.product);
        productData.push({
          name: product.name,
          price: product.offerPrice,
          quantity: item.quantity,
        });
        return (await acc) + product.offerPrice * item.quantity;
      }, 0);
      orderFinalAmount = orderOriginalAmount;
    } else {
      // Preparar productData para Stripe
      await Promise.all(
        items.map(async item => {
          const product = await Product.findById(item.product);
          productData.push({
            name: product.name,
            price: product.offerPrice,
            quantity: item.quantity,
          });
        })
      );
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
    const order = await Order.create({
      userId,
      items,
      amount: orderFinalAmount,
      originalAmount: orderOriginalAmount,
      address,
      paymentType: 'Online',
      isPaid: false, // Webhook vai atualizar para true
      promoCode: validPromoCode,
      discountAmount: orderDiscountAmount,
      discountPercentage: orderDiscountPercentage,
    });

    console.log('✅ Pedido Stripe criado:', {
      orderId: order._id,
      amount: order.amount,
      isPaid: order.isPaid,
    });

    // Criar line items para Stripe
    const line_items = productData.map(item => {
      let unitPrice = item.price;

      if (validPromoCode && orderDiscountPercentage > 0) {
        unitPrice = item.price * (1 - orderDiscountPercentage / 100);
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: validPromoCode
              ? `${item.name} (${orderDiscountPercentage}% OFF)`
              : item.name,
          },
          unit_amount: Math.floor(unitPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    // Criar sessão Stripe
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/order-success/${order._id}?payment=stripe`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
        promoCode: validPromoCode || '',
        originalAmount: orderOriginalAmount.toString(),
        discountAmount: orderDiscountAmount.toString(),
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('❌ Erro Stripe:', error);
    return res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// STRIPE WEBHOOK - USANDO LÓGICA QUE FUNCIONA
// =============================================================================
export const stripeWebhooks = async (req, res) => {
  console.log('🎯 WEBHOOK - Timestamp:', new Date().toISOString());

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Event recebido:', event.type);
  } catch (error) {
    console.log('❌ Webhook Error:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // ✅ USAR A LÓGICA DO CÓDIGO QUE FUNCIONA
  switch (event.type) {
    case 'payment_intent.succeeded': {
      console.log('💰 Payment Intent Succeeded!');

      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      try {
        // Getting Session Metadata (igual ao código que funciona)
        const session = await stripe.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (session.data.length === 0) {
          console.log('❌ Nenhuma session encontrada');
          return res.status(400).send('No session found');
        }

        const { orderId, userId } = session.data[0].metadata;
        console.log('📦 Metadata:', { orderId, userId });

        if (!orderId) {
          console.log('❌ orderId ausente');
          return res.status(400).send('orderId missing');
        }

        // ✅ Mark Payment as Paid (igual ao código que funciona)
        const updated = await Order.findByIdAndUpdate(orderId, {
          isPaid: true,
          paidAt: new Date(),
          paymentInfo: {
            id: paymentIntentId,
            status: 'paid',
          },
        });

        if (!updated) {
          console.log('❌ Order não encontrada:', orderId);
          return res.status(404).send('Order not found');
        }

        console.log('✅ SUCESSO! Pedido marcado como pago:', orderId);

        // ✅ Clear user cart (igual ao código que funciona)
        await User.findByIdAndUpdate(userId, { cartItems: {} });
        console.log('🛒 Carrinho limpo');

        // Enviar email de confirmação
        try {
          const user = await User.findById(userId).select('name email');
          const addressData = await Address.findById(updated.address);
          const products = await Promise.all(
            updated.items.map(
              async item => await Product.findById(item.product)
            )
          );

          await sendOrderConfirmationEmail(
            updated,
            user,
            products,
            addressData
          );
          console.log('📧 Email enviado');
        } catch (emailError) {
          console.error('❌ Erro no email:', emailError.message);
        }

        break;
      } catch (error) {
        console.error('❌ Erro ao processar payment_intent.succeeded:', error);
        return res.status(500).send('Error processing payment');
      }
    }

    case 'payment_intent.payment_failed': {
      console.log('❌ Payment Failed!');

      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      try {
        const session = await stripe.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (session.data.length > 0) {
          const { orderId } = session.data[0].metadata;

          if (orderId) {
            // ✅ Delete failed order (igual ao código que funciona)
            await Order.findByIdAndDelete(orderId);
            console.log('🗑️ Pedido falhado removido:', orderId);
          }
        }

        break;
      } catch (error) {
        console.error('❌ Erro ao processar payment failed:', error);
      }
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
      break;
  }

  res.json({ received: true });
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
      $or: [
        { paymentType: 'COD' }, // COD sempre mostra
        { paymentType: 'Online', isPaid: true }, // Stripe só quando pago
      ],
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
      $or: [{ paymentType: 'COD' }, { paymentType: 'Online', isPaid: true }],
    })
      .populate('items.product address')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
