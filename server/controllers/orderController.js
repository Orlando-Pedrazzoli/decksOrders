import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

// server/controllers/orderController.js - DEBUG PROFUNDO

export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;

    // ✅ DEBUG: Log do userId recebido
    console.log('🔍 DEBUG - UserID recebido:', userId);
    console.log('🔍 DEBUG - Tipo do userId:', typeof userId);

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }

    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Create order
    const newOrder = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'COD',
    });

    // Clear user cart
    await User.findByIdAndUpdate(userId, { cartItems: {} });

    // ✅ DEBUG PROFUNDO DO EMAIL
    setTimeout(async () => {
      try {
        console.log('🚀 Iniciando envio de email de confirmação...');
        console.log('📧 User ID para busca:', userId);

        // ✅ DEBUG: Buscar user com mais detalhes
        const user = await User.findById(userId);

        console.log('🔍 DEBUG - Usuário encontrado (RAW):', user);
        console.log('🔍 DEBUG - user._id:', user?._id);
        console.log('🔍 DEBUG - user.name:', user?.name);
        console.log('🔍 DEBUG - user.email:', user?.email);
        console.log(
          '🔍 DEBUG - user object keys:',
          user ? Object.keys(user.toObject()) : 'NULL'
        );

        if (!user) {
          console.error('❌ Usuário não encontrado para email. ID:', userId);
          return;
        }

        // ✅ DEBUG: Verificar se email existe
        if (!user.email || user.email === '') {
          console.error('❌ Email do usuário está vazio ou undefined');
          console.error(
            '❌ Usuário completo:',
            JSON.stringify(user.toObject(), null, 2)
          );
          return;
        }

        // ✅ VERIFICAÇÃO EXTRA: Buscar todos os usuários para comparar
        const allUsers = await User.find({}).select('name email').limit(5);
        console.log(
          '🔍 DEBUG - Todos os usuários no DB (primeiros 5):',
          allUsers.map(u => ({ id: u._id, name: u.name, email: u.email }))
        );

        // Get address data
        const addressData = await Address.findById(address);
        if (!addressData) {
          console.error('❌ Endereço não encontrado para email');
          return;
        }

        console.log('✅ Endereço encontrado:', {
          firstName: addressData.firstName,
          email: addressData.email,
        });

        // ✅ DECISÃO: Usar email do address se user.email estiver errado
        let emailToSend = user.email;

        // Se o email do usuário for o seu email (erro), use o email do endereço
        if (user.email === 'pedrazzoliorlando@gmail.com') {
          console.log(
            '⚠️ DETECTADO: Email do usuário é o email do admin, usando email do endereço'
          );
          emailToSend = addressData.email;
        }

        console.log('📧 Email final que será usado:', emailToSend);

        // Get products data
        const productIds = items.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });

        // Send email com o email correto
        const emailResult = await sendOrderConfirmationEmail(
          newOrder.toObject(),
          {
            ...user.toObject(),
            email: emailToSend, // ← Usar o email correto
          },
          products,
          addressData
        );

        if (emailResult.success) {
          console.log(
            `✅ Email enviado com sucesso para ${emailToSend} - ID: ${emailResult.messageId}`
          );
        } else {
          console.error('❌ Falha ao enviar email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Erro no processo de email:', emailError.message);
      }
    }, 1000);

    return res.json({
      success: true,
      message: 'Order Placed Successfully',
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error('❌ Erro na criação da encomenda:', error);
    return res.json({ success: false, message: error.message });
  }
};
// Place Order Stripe : /api/order/stripe
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
// Stripe Webhooks to Verify Payments Action : /stripe
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
