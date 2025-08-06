// orderController.js - Versão Corrigida
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';

// ✅ Inicializar Stripe instance globalmente
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place Order COD : /api/order/cod
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

    if (!address || items.length === 0) {
      console.log('❌ Dados inválidos - address ou items vazios');
      return res.json({ success: false, message: 'Invalid data' });
    }

    // ✅ Cálculos de valores (mesmo código anterior)
    let orderOriginalAmount = originalAmount;
    let orderFinalAmount = finalAmount || originalAmount;
    let orderDiscountAmount = discountAmount || 0;
    let orderDiscountPercentage = discountPercentage || 0;
    let validPromoCode = null;

    if (!originalAmount) {
      orderOriginalAmount = await items.reduce(async (acc, item) => {
        const product = await Product.findById(item.product);
        return (await acc) + product.offerPrice * item.quantity;
      }, 0);
      orderFinalAmount = orderOriginalAmount;
    }

    if (promoCode && discountApplied) {
      if (promoCode.toUpperCase() === 'BROTHER') {
        validPromoCode = promoCode.toUpperCase();
        if (!discountAmount) {
          orderDiscountPercentage = 30;
          orderDiscountAmount =
            Math.round(orderOriginalAmount * 0.3 * 100) / 100;
          orderFinalAmount = orderOriginalAmount - orderDiscountAmount;
        }
      }
    }

    // ✅ CORRIGIDO: Para COD, isPaid deve ser false (correto)
    const newOrder = await Order.create({
      userId,
      items,
      amount: orderFinalAmount,
      originalAmount: orderOriginalAmount,
      address,
      paymentType: 'COD',
      isPaid: false, // ✅ Explicitamente false para COD
      promoCode: validPromoCode,
      discountAmount: orderDiscountAmount,
      discountPercentage: orderDiscountPercentage,
    });

    console.log('✅ Pedido COD criado:', {
      orderId: newOrder._id,
      amount: newOrder.amount,
      isPaid: newOrder.isPaid, // false para COD
      paymentType: newOrder.paymentType,
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
    console.error('❌ Erro ao processar pedido COD:', error);
    return res.json({ success: false, message: error.message });
  }
};

// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    console.log('💳 Recebendo dados da encomenda Stripe:', req.body);

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

    // Calcular valores se não vieram do frontend
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
    if (promoCode && discountApplied) {
      if (promoCode.toUpperCase() === 'BROTHER') {
        validPromoCode = promoCode.toUpperCase();
        if (!discountAmount) {
          orderDiscountPercentage = 30;
          orderDiscountAmount =
            Math.round(orderOriginalAmount * 0.3 * 100) / 100;
          orderFinalAmount = orderOriginalAmount - orderDiscountAmount;
        }
      }
    }

    // ✅ CORRIGIDO: Para Stripe, isPaid inicia como false e é atualizado pelo webhook
    const order = await Order.create({
      userId,
      items,
      amount: orderFinalAmount,
      originalAmount: orderOriginalAmount,
      address,
      paymentType: 'Online',
      isPaid: false, // ✅ Inicia como false, webhook vai atualizar para true
      promoCode: validPromoCode,
      discountAmount: orderDiscountAmount,
      discountPercentage: orderDiscountPercentage,
    });

    console.log('✅ Pedido Stripe criado (aguardando pagamento):', {
      orderId: order._id,
      amount: order.amount,
      isPaid: order.isPaid, // false inicialmente
      paymentType: order.paymentType,
    });

    // Create line items for stripe
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

    // ✅ Usar a instância stripe definida no topo
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
    console.error('❌ Erro ao processar pedido Stripe:', error);
    return res.json({ success: false, message: error.message });
  }
};

// ✅ WEBHOOK STRIPE CORRIGIDO
export const stripeWebhooks = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // ✅ CORRIGIDO: Usar a instância stripe definida no topo
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log('❌ Stripe signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('🎉 Evento Stripe recebido:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session?.metadata?.orderId;

    if (!orderId) {
      console.log('⚠️ orderId ausente no metadata');
      return res.status(400).send('orderId missing in session metadata');
    }

    try {
      // ✅ ATUALIZAR O PEDIDO COMO PAGO
      const updated = await Order.findByIdAndUpdate(
        orderId,
        {
          isPaid: true, // ✅ Aqui é onde o pagamento é marcado como pago
          paidAt: new Date(),
          paymentInfo: {
            id: session.payment_intent,
            status: session.payment_status,
            email: session.customer_details?.email || '',
          },
        },
        { new: true } // Retorna o documento atualizado
      );

      if (!updated) {
        console.log('❌ Order não encontrada:', orderId);
        return res.status(404).send('Order not found');
      }

      console.log('✅ Pedido Stripe atualizado como pago:', {
        orderId: updated._id,
        isPaid: updated.isPaid, // Agora deve ser true
        paidAt: updated.paidAt,
        paymentType: updated.paymentType,
      });

      // ✅ Enviar email de confirmação após pagamento bem-sucedido
      try {
        const user = await User.findById(updated.userId).select('name email');
        const addressData = await Address.findById(updated.address);
        const products = await Promise.all(
          updated.items.map(async item => await Product.findById(item.product))
        );

        await sendOrderConfirmationEmail(updated, user, products, addressData);
        console.log(
          '📧 Email de confirmação enviado para pedido Stripe:',
          orderId
        );
      } catch (emailError) {
        console.error(
          '❌ Erro ao enviar email de confirmação:',
          emailError.message
        );
        // Não falha a resposta do webhook por causa do email
      }

      res.status(200).json({ received: true, orderId, isPaid: true });
    } catch (err) {
      console.error('❌ Erro ao atualizar pedido:', err.message);
      res.status(500).send('Erro ao atualizar pedido');
    }
  } else {
    console.log('ℹ️ Evento Stripe ignorado:', event.type);
    res.status(200).json({ received: true });
  }
};

// Resto das funções permanecem iguais...
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }

    console.log('🔍 Fetching orders for user:', userId);

    const orders = await Order.find({
      userId,
      $or: [
        { paymentType: 'COD' }, // COD sempre mostra (isPaid: false)
        { paymentType: 'Online', isPaid: true }, // Stripe só quando pago (isPaid: true)
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

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { paymentType: 'COD' }, // COD sempre mostra
        { isPaid: true }, // Stripe/Online só quando pago
      ],
    })
      .populate('items.product address')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
