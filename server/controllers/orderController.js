import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

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

    // Send confirmation email in background
    setTimeout(async () => {
      try {
        console.log('🚀 Iniciando envio de email de confirmação...');

        // Get user data
        const user = await User.findById(userId).select('name email');
        if (!user) {
          console.error('❌ Usuário não encontrado para email');
          return;
        }

        // Get address data
        const addressData = await Address.findById(address);
        if (!addressData) {
          console.error('❌ Endereço não encontrado para email');
          return;
        }

        // Get products data
        const productIds = items.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        if (!products.length) {
          console.error('❌ Produtos não encontrados para email');
          return;
        }

        console.log('📧 Enviando email para:', addressData.email);

        // ✅ OPÇÃO 1: Usar o emailService existente (RECOMENDADO)
        const emailResult = await sendOrderConfirmationEmail(
          newOrder.toObject(),
          {
            name: user.name,
            email: addressData.email, // ← USAR EMAIL DO ENDEREÇO
          },
          products,
          addressData
        );

        if (emailResult.success) {
          console.log(`✅ Email enviado com sucesso para ${addressData.email}`);
        } else {
          console.error('❌ Falha ao enviar email:', emailResult.error);

          // ✅ OPÇÃO 2: Fallback com nodemailer direto
          try {
            console.log('🔄 Tentando envio direto com nodemailer...');

            // Import dinâmico para evitar crash do servidor
            const nodemailer = await import('nodemailer');

            const transporter = nodemailer.default.createTransporter({
              service: 'gmail',
              auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
              },
            });

            const result = await transporter.sendMail({
              from: {
                name: 'Elite Surfing',
                address: process.env.GMAIL_USER,
              },
              to: addressData.email,
              subject: `Confirmação de Encomenda #${newOrder._id} - Elite Surfing`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #358f61;">Obrigado pela sua compra!</h2>
                  <p>Olá <strong>${user.name}</strong>,</p>
                  <p>A sua encomenda foi processada com sucesso.</p>
                  
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Detalhes da Encomenda</h3>
                    <p><strong>Número:</strong> #${newOrder._id}</p>
                    <p><strong>Total:</strong> €${amount.toFixed(2)}</p>
                    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-PT')}</p>
                    <p><strong>Método de Pagamento:</strong> Pagamento na Entrega</p>
                  </div>
                  
                  <p>Obrigado por escolher a Elite Surfing!</p>
                  <p><a href="https://elitesurfing.pt" style="color: #358f61;">www.elitesurfing.pt</a></p>
                </div>
              `,
              text: `
                Olá ${user.name},
                
                Obrigado pela sua compra! A sua encomenda #${newOrder._id} foi processada com sucesso.
                
                Total: €${amount.toFixed(2)}
                Data: ${new Date().toLocaleDateString('pt-PT')}
                
                Obrigado por escolher a Elite Surfing!
                www.elitesurfing.pt
              `,
            });

            console.log('✅ EMAIL ENVIADO COM FALLBACK!');
            console.log('📧 Para:', addressData.email);
            console.log('📧 ID da mensagem:', result.messageId);
          } catch (fallbackError) {
            console.error('❌ ERRO NO FALLBACK:', fallbackError.message);
          }
        }
      } catch (emailError) {
        console.error(
          '❌ Erro geral no processo de email:',
          emailError.message
        );
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

    // Stripe implementation...
    return res.json({ success: true, url: 'stripe-url' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
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
