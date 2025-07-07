import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

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

    // ✅ CORREÇÃO: Melhor handling do envio de email
    setTimeout(async () => {
      try {
        console.log('🚀 Iniciando envio de email de confirmação...');
        console.log('📧 User ID:', userId);

        // ✅ CORREÇÃO: Buscar user com .select() para garantir que o email vem
        const user = await User.findById(userId).select('name email');
        if (!user) {
          console.error('❌ Usuário não encontrado para email. ID:', userId);
          return;
        }

        console.log('✅ Usuário encontrado:', {
          id: user._id,
          name: user.name,
          email: user.email, // ← Verificar se este campo existe
        });

        // ✅ VALIDAÇÃO: Verificar se email existe
        if (!user.email || user.email === '') {
          console.error('❌ Email do usuário está vazio ou undefined');
          return;
        }

        // Get address data
        const addressData = await Address.findById(address);
        if (!addressData) {
          console.error('❌ Endereço não encontrado para email');
          return;
        }

        console.log('✅ Endereço encontrado:', {
          firstName: addressData.firstName,
          email: addressData.email, // ← Este também tem email
        });

        // Get products data
        const productIds = items.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        if (!products.length) {
          console.error('❌ Produtos não encontrados para email');
          return;
        }

        console.log('✅ Produtos encontrados:', products.length);

        // ✅ DECISÃO: Usar email do usuário OU do endereço?
        const emailToSend = user.email || addressData.email;
        console.log('📧 Email que será usado:', emailToSend);

        // Send email
        const emailResult = await sendOrderConfirmationEmail(
          newOrder.toObject(),
          {
            ...user.toObject(),
            email: emailToSend, // ← Garantir que o email correto é usado
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
          console.error('❌ Email tentado:', emailToSend);
        }
      } catch (emailError) {
        console.error('❌ Erro no processo de email:', emailError.message);
        console.error('❌ Stack:', emailError.stack);
      }
    }, 1000);

    // Resposta imediata para o cliente
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
