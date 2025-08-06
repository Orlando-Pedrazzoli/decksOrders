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
  console.log('🔔 WEBHOOK STRIPE CHAMADO!');
  console.log('📥 Headers recebidos:', request.headers);
  console.log('📦 Body type:', typeof request.body);
  console.log('📦 Body length:', request.body?.length);

  try {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];

    console.log('🔐 Stripe signature presente:', !!sig);
    console.log(
      '🔐 Webhook secret configurado:',
      !!process.env.STRIPE_WEBHOOK_SECRET
    );

    let event;

    try {
      event = stripeInstance.webhooks.constructEvent(
        request.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log('✅ Webhook signature verified successfully');
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error.message);
      return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log('🎉 Stripe webhook event type:', event.type);
    console.log('🎉 Event data:', JSON.stringify(event.data.object, null, 2));

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { orderId, userId } = session.metadata || {};

        console.log('💳 PAGAMENTO CONFIRMADO!');
        console.log('💳 Session ID:', session.id);
        console.log('💳 Order ID from metadata:', orderId);
        console.log('💳 User ID from metadata:', userId);
        console.log('💳 Payment status:', session.payment_status);
        console.log('💳 Amount total:', session.amount_total);

        if (!orderId || !userId) {
          console.error('❌ ERRO: Metadata missing!', { orderId, userId });
          return response.status(400).json({ error: 'Missing metadata' });
        }

        try {
          console.log('🔍 Buscando pedido no banco:', orderId);

          // ✅ Marcar pedido como pago
          const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { isPaid: true },
            { new: true }
          );

          if (!updatedOrder) {
            console.error('❌ PEDIDO NÃO ENCONTRADO:', orderId);
            return response.status(404).json({ error: 'Order not found' });
          }

          console.log('✅ PEDIDO MARCADO COMO PAGO:', {
            orderId: updatedOrder._id,
            paymentType: updatedOrder.paymentType,
            amount: updatedOrder.amount,
            isPaid: updatedOrder.isPaid,
          });

          // ✅ Limpar carrinho
          console.log('🛒 Limpando carrinho do usuário:', userId);
          await User.findByIdAndUpdate(userId, { cartItems: {} });
          console.log('✅ Carrinho limpo com sucesso');

          // ✅ ENVIAR EMAIL - PASSO A PASSO
          console.log('📧 INICIANDO PROCESSO DE EMAIL...');

          try {
            console.log('📧 Passo 1: Buscando dados do usuário...');
            const user = await User.findById(userId).select('name email');
            console.log(
              '📧 Usuário encontrado:',
              user ? `${user.name} (${user.email})` : 'ERRO: não encontrado'
            );

            console.log('📧 Passo 2: Buscando dados do endereço...');
            const addressData = await Address.findById(updatedOrder.address);
            console.log(
              '📧 Endereço encontrado:',
              addressData
                ? `${addressData.city}, ${addressData.country}`
                : 'ERRO: não encontrado'
            );

            console.log('📧 Passo 3: Buscando produtos...');
            const productPromises = updatedOrder.items.map(
              async (item, index) => {
                console.log(`📧 Buscando produto ${index + 1}:`, item.product);
                const product = await Product.findById(item.product);
                console.log(
                  `📧 Produto ${index + 1} encontrado:`,
                  product ? product.name : 'ERRO: não encontrado'
                );
                return product;
              }
            );

            const products = await Promise.all(productPromises);
            const validProducts = products.filter(Boolean);
            console.log(
              '📧 Produtos válidos encontrados:',
              validProducts.length
            );

            // ✅ Verificar se temos todos os dados
            if (!user) {
              console.error('❌ EMAIL FALHOU: Usuário não encontrado');
              return response.json({ received: true });
            }

            if (!addressData) {
              console.error('❌ EMAIL FALHOU: Endereço não encontrado');
              return response.json({ received: true });
            }

            if (validProducts.length === 0) {
              console.error('❌ EMAIL FALHOU: Nenhum produto encontrado');
              return response.json({ received: true });
            }

            console.log(
              '📧 TODOS OS DADOS OK! Chamando sendOrderConfirmationEmail...'
            );
            console.log('📧 Dados do pedido:', {
              orderId: updatedOrder._id,
              amount: updatedOrder.amount,
              originalAmount: updatedOrder.originalAmount,
              discountAmount: updatedOrder.discountAmount,
              promoCode: updatedOrder.promoCode,
            });

            const emailResult = await sendOrderConfirmationEmail(
              updatedOrder,
              user,
              validProducts,
              addressData
            );

            console.log('📧 RESULTADO DO EMAIL:', emailResult);

            if (emailResult.success) {
              console.log(
                '📧 ✅ EMAIL ENVIADO COM SUCESSO PARA:',
                emailResult.recipient
              );
            } else {
              console.error(
                '📧 ❌ FALHA NO ENVIO DO EMAIL:',
                emailResult.error
              );
            }
          } catch (emailError) {
            console.error('❌ ERRO NO PROCESSAMENTO DO EMAIL:', emailError);
            console.error('❌ Stack trace:', emailError.stack);
          }

          console.log('🎉 PROCESSAMENTO COMPLETO DO PEDIDO STRIPE:', orderId);
        } catch (orderError) {
          console.error('❌ ERRO AO PROCESSAR PEDIDO:', orderError);
          console.error('❌ Stack trace:', orderError.stack);
          return response
            .status(500)
            .json({ error: 'Order processing failed' });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('❌ PAGAMENTO FALHOU:', paymentIntent.id);

        try {
          const sessions = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntent.id,
          });

          if (sessions.data.length > 0) {
            const { orderId } = sessions.data[0].metadata;
            console.log(
              '🗑️ Removendo pedido devido ao pagamento falhado:',
              orderId
            );
            await Order.findByIdAndDelete(orderId);
            console.log('✅ Pedido removido com sucesso');
          }
        } catch (error) {
          console.error('❌ Erro ao limpar pagamento falhado:', error);
        }
        break;
      }

      default:
        console.log(`⚠️ EVENTO NÃO TRATADO: ${event.type}`);
        break;
    }

    console.log('✅ WEBHOOK PROCESSADO COM SUCESSO');
    response.json({ received: true });
  } catch (error) {
    console.error('❌ ERRO GERAL NO WEBHOOK:', error);
    console.error('❌ Stack trace:', error.stack);
    response.status(500).json({ error: 'Webhook processing failed' });
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
