import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import nodemailer from 'nodemailer'; // ✅ IMPORT CORRETO

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

    // ✅ EMAIL DIRETO E SIMPLES
    setTimeout(async () => {
      try {
        console.log('🚀 Iniciando envio de email de confirmação...');

        const user = await User.findById(userId).select('name');
        const addressData = await Address.findById(address);

        console.log('📧 Email do endereço:', addressData.email);

        // ✅ CONFIGURAÇÃO CORRETA DO NODEMAILER
        const transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });

        // ✅ ENVIO DIRETO
        const result = await transporter.sendMail({
          from: {
            name: 'Elite Surfing',
            address: process.env.GMAIL_USER,
          },
          to: addressData.email,
          subject: `Confirmação de Encomenda #${newOrder._id} - Elite Surfing`,
          html: `
            <h2>Obrigado pela sua compra!</h2>
            <p>Olá ${user.name},</p>
            <p>A sua encomenda #${newOrder._id} foi processada com sucesso.</p>
            <p><strong>Total: €${amount.toFixed(2)}</strong></p>
            <p>Data: ${new Date().toLocaleDateString('pt-PT')}</p>
            <br>
            <p>Obrigado por escolher a Elite Surfing!</p>
            <p><a href="https://elitesurfing.pt">www.elitesurfing.pt</a></p>
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

        console.log('✅ EMAIL ENVIADO COM SUCESSO!');
        console.log('📧 Para:', addressData.email);
        console.log('📧 ID da mensagem:', result.messageId);
      } catch (emailError) {
        console.error('❌ ERRO NO EMAIL:', emailError.message);
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

    // Stripe implementation would go here...

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
