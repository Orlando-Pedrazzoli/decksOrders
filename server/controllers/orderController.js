import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
// Não precisamos mais do emailService.js se estivermos usando EmailJS diretamente aqui
// import { sendOrderConfirmationEmail } from '../services/emailService.js';
import Stripe from 'stripe'; // Certifique-se de que a importação do Stripe está aqui se não estiver no topo

// Place Order COD : /api/order/cod
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

    // ✅ MELHORIA: Envio de EMAIL via EmailJS com validações e logs aprimorados
    setTimeout(async () => {
      try {
        const user = await User.findById(userId).select('name email'); // Seleciona o email também, caso queira usá-lo no futuro
        const addressData = await Address.findById(address);

        // --- VALIDAÇÃO DE E-MAIL APRIMORADA ---
        let recipientEmail = addressData?.email; // Tenta pegar o email do endereço

        if (!recipientEmail || recipientEmail === '') {
          console.error(
            `❌ ERRO NO EMAILJS: Nenhum email válido encontrado para enviar para a encomenda ${newOrder._id}.`
          );
          console.error(
            `Detalhes: User Email: ${user?.email || 'N/A'}, Address Email: ${addressData?.email || 'N/A'}`
          );
          return; // Não prossegue com o envio do email se não houver um destinatário válido
        }
        // --- FIM DA VALIDAÇÃO ---

        console.log(
          `📧 Tentando enviar email de confirmação para: ${recipientEmail} (Encomenda ID: ${newOrder._id})`
        );

        const emailJsResponse = await fetch(
          'https://api.emailjs.com/api/v1.0/email/send',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // ✅ Usando variáveis de ambiente para IDs do EmailJS para melhor gerenciamento
              service_id: process.env.VITE_EMAILJS_SERVICE_ID,
              template_id: process.env.VITE_EMAILJS_TEMPLATE_ID,
              user_id: process.env.VITE_EMAILJS_PUBLIC_KEY,
              template_params: {
                to_email: recipientEmail,
                to_name: user?.name || 'Cliente', // Garante um nome fallback
                order_id: newOrder._id,
                total: `€${amount.toFixed(2)}`,
                date: new Date().toLocaleDateString('pt-PT'),
              },
            }),
          }
        );

        // ✅ Tratamento de respostas HTTP da API do EmailJS
        if (emailJsResponse.ok) {
          console.log(
            `✅ Email enviado com sucesso via EmailJS para: ${recipientEmail} (ID da Encomenda: ${newOrder._id})`
          );
        } else {
          const errorText = await emailJsResponse.text();
          console.error(
            `❌ ERRO NO EMAILJS: Falha ao enviar email para ${recipientEmail}. Status: ${emailJsResponse.status}. Resposta: ${errorText}`
          );
        }
      } catch (emailError) {
        // ✅ Log de erros de rede ou outros erros no processo de fetch
        console.error(
          `❌ ERRO NO EMAILJS (Catch Geral): Falha catastrófica ao enviar email para a encomenda ${newOrder._id}.`
        );
        console.error('Detalhes do erro:', emailError.message);
        // Opcional: logar o objeto de erro completo se precisar de mais detalhes em depuração
        // console.error(emailError);
      }
    }, 1000);

    return res.json({
      success: true,
      message: 'Order Placed Successfully',
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error('❌ Erro no placeOrderCOD:', error); // Log do erro principal
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
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY); // Usa Stripe importado

    // create line items for stripe

    const line_items = productData.map(item => {
      return {
        price_data: {
          currency: 'usd', // Considere usar sua VITE_CURRENCY aqui, se Stripe aceitar
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Preço em centavos
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
    console.error('❌ Erro no placeOrderStripe:', error);
    return res.json({ success: false, message: error.message });
  }
};
// Stripe Webhooks to Verify Payments Action : /stripe
export const stripeWebhooks = async (request, response) => {
  // Stripe Gateway Initialize
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY); // Usa Stripe importado

  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('❌ Erro no Webhook Stripe:', error.message);
    response.status(400).send(`Webhook Error: ${error.message}`);
    return; // Adicionado return para evitar que o código continue após erro 400
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
      console.log(`✅ Pagamento Stripe sucedido para Order ID: ${orderId}`);
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
      console.log(
        `❌ Pagamento Stripe falhou para Order ID: ${orderId}. Encomenda excluída.`
      );
      break;
    }

    default:
      console.warn(`⚠️ Evento Stripe não tratado: ${event.type}`); // Alterado para warn
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
    console.error('❌ Erro no getUserOrders:', error);
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
    console.error('❌ Erro no getAllOrders:', error);
    res.json({ success: false, message: error.message });
  }
};
