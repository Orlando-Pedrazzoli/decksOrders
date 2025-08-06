import { sendOrderConfirmationEmail } from '../services/emailService.js';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';

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
      console.log('❌ Dados inválidos - address ou items vazios');
      return res.json({ success: false, message: 'Invalid data' });
    }

    let productData = [];

    // ✅ USAR VALORES DO FRONTEND (consistente com COD)
    let orderOriginalAmount = originalAmount;
    let orderFinalAmount = finalAmount || originalAmount;
    let orderDiscountAmount = discountAmount || 0;
    let orderDiscountPercentage = discountPercentage || 0;
    let validPromoCode = null;

    // Se não vieram do frontend, calcular aqui como backup
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
      console.log('💰 Valor calculado no backend:', orderOriginalAmount);
    } else {
      // Se veio do frontend, ainda precisamos do productData para o Stripe
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

    // Validar promo code se aplicado (consistente com COD)
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

        console.log('🎯 Promo code Stripe válido aplicado:', {
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

    console.log('💳 Valores finais Stripe:', {
      originalAmount: orderOriginalAmount,
      finalAmount: orderFinalAmount,
    });

    // Criar pedido com valores corretos
    const order = await Order.create({
      userId,
      items,
      amount: orderFinalAmount, // ✅ Valor final sem taxa
      originalAmount: orderOriginalAmount, // ✅ Valor original
      address,
      paymentType: 'Online',
      promoCode: validPromoCode,
      discountAmount: orderDiscountAmount, // ✅ Desconto aplicado
      discountPercentage: orderDiscountPercentage, // ✅ Percentagem
    });

    console.log('✅ Pedido Stripe criado:', {
      orderId: order._id,
      amount: order.amount,
      originalAmount: order.originalAmount,
      discountAmount: order.discountAmount,
      promoCode: order.promoCode,
    });

    // Stripe Gateway Initialize
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create line items for stripe (baseado no valor final com desconto)
    const line_items = productData.map(item => {
      // Calcular preço unitário com desconto aplicado proporcionalmente
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
          unit_amount: Math.floor(unitPrice * 100), // Stripe usa centavos
        },
        quantity: item.quantity,
      };
    });

    // Create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: 'payment',
      // ✅ CORRIGIDO: Redirecionar para order-success com orderId
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

// ✅ WEBHOOK STRIPE OTIMIZADO: /webhook/stripe
export const stripeWebhooks = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log('❌ Stripe signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('🎉 Evento recebido:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session?.metadata?.orderId;

    if (!orderId) {
      console.log('⚠️ orderId ausente no metadata');
      return res.status(400).send('orderId missing in session metadata');
    }

    try {
      const updated = await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
        paidAt: new Date(),
        paymentInfo: {
          id: session.payment_intent,
          status: session.payment_status,
          email: session.customer_details?.email || '',
        },
      });

      if (!updated) {
        console.log('❌ Order não encontrada:', orderId);
        return res.status(404).send('Order not found');
      }

      console.log('✅ Pedido atualizado como pago:', orderId);
      res.status(200).json({ received: true });
    } catch (err) {
      console.error('❌ Erro ao atualizar pedido:', err.message);
      res.status(500).send('Erro ao atualizar pedido');
    }
  } else {
    // Se for outro tipo de evento, apenas responde
    res.status(200).json({ received: true });
  }
};

// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: 'User ID is required' });
    }

    console.log('🔍 Fetching orders for user:', userId);

    // ✅ Query corrigida para incluir pedidos Stripe pagos
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

    // Log detalhado para debug
    orders.forEach((order, index) => {
      console.log(`📦 Order ${index + 1}:`, {
        id: order._id,
        paymentType: order.paymentType,
        isPaid: order.isPaid,
        amount: order.amount,
        status: order.status,
        itemsCount: order.items?.length || 0,
      });
    });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
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
