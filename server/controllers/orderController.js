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

// Stripe Webhooks to Verify Payments Action : /stripe
export const stripeWebhooks = async (request, response) => {
  try {
    // Stripe Gateway Initialize
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
      console.error('❌ Erro na verificação do webhook:', error.message);
      return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log('🔔 Webhook recebido:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        // ✅ Melhor usar checkout.session.completed em vez de payment_intent.succeeded
        const session = event.data.object;
        const { orderId, userId } = session.metadata;

        console.log('✅ Pagamento confirmado:', { orderId, userId });

        // Mark Payment as Paid
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { isPaid: true },
          { new: true }
        ).populate('items.product address');

        if (updatedOrder) {
          // Clear user cart
          await User.findByIdAndUpdate(userId, { cartItems: {} });

          // 📧 Enviar email de confirmação (consistente com COD)
          try {
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
            console.log(
              '📧 Email de confirmação enviado para pedido Stripe:',
              orderId
            );
          } catch (emailError) {
            console.error(
              '❌ Erro ao enviar email de confirmação:',
              emailError
            );
            // Não falhar a operação por causa do email
          }

          console.log('✅ Pedido processado com sucesso:', orderId);
        } else {
          console.error('❌ Pedido não encontrado:', orderId);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        console.log('❌ Pagamento falhou:', paymentIntentId);

        try {
          // Getting Session Metadata
          const sessions = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId,
          });

          if (sessions.data.length > 0) {
            const { orderId } = sessions.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            console.log(
              '🗑️ Pedido removido devido ao pagamento falhado:',
              orderId
            );
          }
        } catch (error) {
          console.error('❌ Erro ao processar falha de pagamento:', error);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        // Para subscriptions futuras
        console.log('💳 Pagamento de fatura bem-sucedido');
        break;
      }

      default:
        console.log(`⚠️ Evento não tratado: ${event.type}`);
        break;
    }

    response.json({ received: true });
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    response.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId; // ✅ MUDANÇA AQUI
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
