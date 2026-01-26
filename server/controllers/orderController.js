// server/controllers/orderController.js
// VERSÃO CORRIGIDA - 26/01/2026
// ✅ COD removido
// ✅ Emails com AWAIT no webhook (fix para Vercel serverless)

import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import stripe from 'stripe';
import nodemailer from 'nodemailer';

// =============================================================================
// IMPORTAÇÃO DO SERVIÇO DE EMAIL PARA STATUS UPDATES
// =============================================================================
let sendOrderStatusUpdateEmail = null;

try {
  const emailService = await import('../services/emailService.js');
  sendOrderStatusUpdateEmail = emailService.sendOrderStatusUpdateEmail;
  console.log('✅ emailService carregado com sucesso');
} catch (error) {
  console.error('❌ ERRO ao carregar emailService:', error.message);
}

// =============================================================================
// FUNÇÃO PARA DECREMENTAR STOCK
// =============================================================================
const decrementProductStock = async (items) => {
  try {
    console.log('📦 Decrementando stock dos produtos...');
    
    for (const item of items) {
      const productId = item.product._id || item.product;
      const quantity = item.quantity;
      
      const product = await Product.findById(productId);
      
      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - quantity);
        
        await Product.findByIdAndUpdate(productId, {
          stock: newStock,
          inStock: newStock > 0
        });
        
        console.log(`  ✓ ${product.name}: ${product.stock} → ${newStock}`);
      }
    }
    
    console.log('✅ Stock atualizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao decrementar stock:', error.message);
    return false;
  }
};

// =============================================================================
// FUNÇÃO PARA VALIDAR STOCK ANTES DE CRIAR PEDIDO
// =============================================================================
const validateOrderStock = async (items) => {
  const errors = [];
  
  for (const item of items) {
    const productId = item.product._id || item.product;
    const quantity = item.quantity;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      errors.push(`Produto não encontrado: ${productId}`);
      continue;
    }
    
    const availableStock = product.stock || 0;
    
    if (availableStock === 0) {
      errors.push(`${product.name} está esgotado`);
    } else if (quantity > availableStock) {
      errors.push(`${product.name}: apenas ${availableStock} disponível(eis), solicitado ${quantity}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// =============================================================================
// GERAR HTML DO EMAIL DE CONFIRMAÇÃO PARA CLIENTE
// =============================================================================
const generateOrderConfirmationHTML = (order, customerName, products, address) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsHTML = order.items.map(item => {
    const product = products.find(p => p._id.toString() === (item.product._id || item.product).toString());
    const productName = product?.name || 'Produto';
    const productPrice = item.price || product?.offerPrice || 0;
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${productName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">€${(productPrice * item.quantity).toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏄 Elite Surfing</h1>
          <p style="color: #a0a0a0; margin: 10px 0 0 0;">Obrigado pela sua encomenda!</p>
        </div>
        
        <!-- Order Info -->
        <div style="padding: 30px;">
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px 0; color: #333;">📋 Detalhes do Pedido</h2>
            <p style="margin: 5px 0;"><strong>Nº Pedido:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>Data:</strong> ${orderDate}</p>
            <p style="margin: 5px 0;"><strong>Pagamento:</strong> ✅ Pago Online</p>
          </div>
          
          <!-- Customer Info -->
          <div style="background: #e8f4f8; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">👤 Dados do Cliente</h3>
            <p style="margin: 5px 0;"><strong>Nome:</strong> ${customerName}</p>
            <p style="margin: 5px 0;"><strong>Morada:</strong> ${address.street}, ${address.zipcode} ${address.city}, ${address.country}</p>
            ${address.phone ? `<p style="margin: 5px 0;"><strong>Telefone:</strong> ${address.phone}</p>` : ''}
          </div>
          
          <!-- Products Table -->
          <h3 style="color: #333;">📦 Produtos</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Produto</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qtd</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <!-- Total -->
          <div style="background: #1a1a2e; color: white; padding: 15px 20px; border-radius: 8px; text-align: right;">
            <span style="font-size: 18px;">Total: </span>
            <span style="font-size: 24px; font-weight: bold;">€${order.amount.toFixed(2)}</span>
          </div>
          
          ${order.promoCode ? `
          <p style="margin-top: 10px; color: #28a745; font-size: 14px;">
            🎉 Código promocional aplicado: <strong>${order.promoCode}</strong> (-${order.discountPercentage}%)
          </p>
          ` : ''}
          
          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
            <p>Dúvidas? Contacte-nos:</p>
            <p>📧 pedrazzoliorlando@gmail.com | 📱 +351 912 164 220</p>
            <p style="margin-top: 20px;">
              <a href="https://www.elitesurfing.pt" style="color: #1a1a2e;">www.elitesurfing.pt</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// =============================================================================
// GERAR HTML DO EMAIL PARA ADMIN
// =============================================================================
const generateAdminNotificationHTML = (order, customerName, customerEmail, customerPhone, products, address) => {
  const orderDate = new Date(order.createdAt).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const itemsHTML = order.items.map(item => {
    const product = products.find(p => p._id.toString() === (item.product._id || item.product).toString());
    const productName = product?.name || 'Produto';
    const productPrice = item.price || product?.offerPrice || 0;
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${(productPrice * item.quantity).toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 25px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔔 NOVO PEDIDO!</h1>
          <p style="color: #ffcccc; margin: 10px 0 0 0;">${order.isGuestOrder ? '👤 GUEST CHECKOUT' : '👤 Cliente Registado'}</p>
        </div>
        
        <div style="padding: 25px;">
          
          <!-- Order Info -->
          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>📋 Pedido:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
            <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${orderDate}</p>
            <p style="margin: 5px 0;"><strong>💳 Pagamento:</strong> ✅ PAGO Online</p>
          </div>
          
          <!-- Customer Info -->
          <div style="background: #d4edda; border: 1px solid #28a745; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #155724;">👤 Cliente</h3>
            <p style="margin: 5px 0;"><strong>Nome:</strong> ${customerName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${customerEmail}</p>
            ${customerPhone ? `<p style="margin: 5px 0;"><strong>Telefone:</strong> ${customerPhone}</p>` : ''}
          </div>
          
          <!-- Address -->
          <div style="background: #cce5ff; border: 1px solid #007bff; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #004085;">📍 Morada de Entrega</h3>
            <p style="margin: 5px 0;">${address.firstName} ${address.lastName}</p>
            <p style="margin: 5px 0;">${address.street}</p>
            <p style="margin: 5px 0;">${address.zipcode} ${address.city}</p>
            <p style="margin: 5px 0;">${address.country}</p>
            ${address.phone ? `<p style="margin: 5px 0;">📱 ${address.phone}</p>` : ''}
          </div>
          
          <!-- Products -->
          <h3 style="color: #333;">📦 Produtos</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">Produto</th>
                <th style="padding: 10px; text-align: center;">Qtd</th>
                <th style="padding: 10px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          ${order.promoCode ? `
          <p style="color: #28a745;"><strong>🎉 Código Promo:</strong> ${order.promoCode} (-${order.discountPercentage}%)</p>
          ` : ''}
          
          <!-- Total -->
          <div style="background: #007bff; color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <span style="font-size: 24px; font-weight: bold;">💰 TOTAL: €${order.amount.toFixed(2)}</span>
          </div>
          
          <!-- Action Button -->
          <div style="text-align: center; margin-top: 25px;">
            <a href="https://www.elitesurfing.pt/seller/orders" 
               style="display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              📋 Ver Pedido no Painel
            </a>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;
};

// =============================================================================
// FUNÇÃO PRINCIPAL PARA ENVIAR TODOS OS EMAILS
// =============================================================================
const sendAllOrderEmails = async (order, userOrEmail) => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║           📧 INICIANDO ENVIO DE EMAILS (PARALELO)             ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  try {
    // 1. IDENTIFICAR O DESTINATÁRIO
    console.log('📋 Order ID:', order?._id);
    console.log('📧 userOrEmail recebido:', userOrEmail);
    console.log('🛒 isGuestOrder:', order?.isGuestOrder);
    
    let customerEmail = null;
    let customerName = null;
    let customerPhone = null;
    
    // Determinar email e nome do cliente
    if (order.isGuestOrder) {
      customerEmail = order.guestEmail;
      customerName = order.guestName || 'Cliente';
      customerPhone = order.guestPhone || '';
      console.log('👤 Modo: GUEST');
    } else if (typeof userOrEmail === 'string') {
      if (userOrEmail.includes('@')) {
        customerEmail = userOrEmail;
        customerName = 'Cliente';
        console.log('👤 Modo: Email direto');
      } else {
        // É um userId - buscar user
        console.log('👤 Modo: Buscando user por ID...');
        const user = await User.findById(userOrEmail);
        if (user) {
          customerEmail = user.email;
          customerName = user.name;
          customerPhone = user.phone || '';
          console.log('👤 User encontrado:', user.name, '-', user.email);
        } else {
          console.error('❌ User não encontrado com ID:', userOrEmail);
        }
      }
    } else if (userOrEmail?._id) {
      customerEmail = userOrEmail.email;
      customerName = userOrEmail.name;
      customerPhone = userOrEmail.phone || '';
      console.log('👤 Modo: Objeto user');
    }
    
    // Fallback para guest
    if (!customerEmail && order.guestEmail) {
      customerEmail = order.guestEmail;
      customerName = order.guestName || 'Cliente';
      console.log('👤 Modo: Fallback guest');
    }
    
    console.log('');
    console.log('📧 Email final do cliente:', customerEmail);
    console.log('👤 Nome final:', customerName);
    console.log('📱 Telefone:', customerPhone || 'N/A');
    
    if (!customerEmail) {
      console.error('❌ ERRO: Nenhum email de cliente encontrado!');
      return { success: false, error: 'Email não encontrado' };
    }
    
    // 2. BUSCAR ADDRESS
    console.log('');
    console.log('📍 Buscando address:', order.address);
    const address = await Address.findById(order.address);
    
    if (!address) {
      console.error('❌ ERRO: Address não encontrado!');
      return { success: false, error: 'Address não encontrado' };
    }
    console.log('✅ Address encontrado:', address.city, address.country);
    
    // 3. BUSCAR PRODUTOS
    const productIds = order.items.map(item => item.product._id || item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    console.log('📦 Produtos encontrados:', products.length);
    
    // 4. CRIAR TRANSPORTER
    console.log('');
    console.log('📧 Criando transporter...');
    console.log('📧 GMAIL_USER:', process.env.GMAIL_USER ? '✅ Configurado' : '❌ NÃO CONFIGURADO');
    console.log('📧 GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Configurado' : '❌ NÃO CONFIGURADO');
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('❌ ERRO: Variáveis de email não configuradas!');
      return { success: false, error: 'Configuração de email incompleta' };
    }
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    
    // 5. PREPARAR EMAILS
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
    
    const clientHTML = generateOrderConfirmationHTML(order, customerName, products, address);
    const clientSubject = `✅ Confirmação do Pedido #${order._id.toString().slice(-8).toUpperCase()} - Elite Surfing`;
    
    const adminHTML = generateAdminNotificationHTML(order, customerName, customerEmail, customerPhone, products, address);
    const adminSubject = `🔔 NOVO PEDIDO #${order._id.toString().slice(-8).toUpperCase()} - €${order.amount.toFixed(2)}`;
    
    // 6. ENVIAR EMAILS EM PARALELO
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 ENVIANDO EMAILS EM PARALELO...');
    console.log('   → Cliente:', customerEmail);
    console.log('   → Admin:', adminEmail);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const [clientResult, adminResult] = await Promise.all([
      // Email para cliente
      transporter.sendMail({
        from: { name: 'Elite Surfing', address: process.env.GMAIL_USER },
        to: customerEmail,
        subject: clientSubject,
        html: clientHTML,
      }).then(r => ({ success: true, messageId: r.messageId }))
        .catch(e => ({ success: false, error: e.message })),
      
      // Email para admin
      transporter.sendMail({
        from: { name: 'Elite Surfing', address: process.env.GMAIL_USER },
        to: adminEmail,
        subject: adminSubject,
        html: adminHTML,
      }).then(r => ({ success: true, messageId: r.messageId }))
        .catch(e => ({ success: false, error: e.message })),
    ]);
    
    // 7. LOG DOS RESULTADOS
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📧 RESULTADO DOS EMAILS:');
    console.log('   Cliente:', clientResult.success ? `✅ ENVIADO (${clientResult.messageId})` : `❌ FALHOU (${clientResult.error})`);
    console.log('   Admin:', adminResult.success ? `✅ ENVIADO (${adminResult.messageId})` : `❌ FALHOU (${adminResult.error})`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    
    return {
      success: clientResult.success || adminResult.success,
      clientEmail: clientResult,
      adminEmail: adminResult
    };
    
  } catch (error) {
    console.error('');
    console.error('❌ ═══════════════════════════════════════════════════════');
    console.error('❌ ERRO GERAL EM sendAllOrderEmails:', error.message);
    console.error('❌ Stack:', error.stack);
    console.error('❌ ═══════════════════════════════════════════════════════');
    console.error('');
    return { success: false, error: error.message };
  }
};

// =============================================================================
// PLACE ORDER STRIPE - SUPORTA GUEST
// =============================================================================
export const placeOrderStripe = async (req, res) => {
  console.log('');
  console.log('💳 ═══════════════════════════════════════════════════');
  console.log('💳 NOVO PEDIDO STRIPE');
  console.log('💳 ═══════════════════════════════════════════════════');

  try {
    const {
      userId,
      items,
      address,
      originalAmount,
      amount,
      discountAmount,
      discountPercentage,
      promoCode,
      paymentMethod,
      isGuestOrder,
      guestEmail,
      guestName,
      guestPhone,
    } = req.body;

    const { origin } = req.headers;

    console.log('💳 isGuestOrder:', isGuestOrder);
    console.log('💳 guestEmail:', guestEmail);
    console.log('💳 userId:', userId);
    console.log('💳 paymentMethod:', paymentMethod);

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Dados inválidos' });
    }

    if (!userId && !isGuestOrder) {
      return res.json({ success: false, message: 'Utilizador ou dados de guest necessários' });
    }

    if (isGuestOrder && !guestEmail) {
      return res.json({ success: false, message: 'Email é obrigatório para guest checkout' });
    }

    // Validar stock
    const stockValidation = await validateOrderStock(items);
    if (!stockValidation.valid) {
      return res.json({ 
        success: false, 
        message: 'Stock insuficiente: ' + stockValidation.errors.join(', ')
      });
    }

    let productData = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
    }

    // Criar pedido
    const orderData = {
      items,
      amount,
      address,
      paymentType: 'Online',
      isPaid: false,
      promoCode: promoCode || '',
      discountAmount: discountAmount || 0,
      discountPercentage: discountPercentage || 0,
      originalAmount,
    };

    if (isGuestOrder) {
      orderData.isGuestOrder = true;
      orderData.guestEmail = guestEmail;
      orderData.guestName = guestName || '';
      orderData.guestPhone = guestPhone || '';
      orderData.userId = null;
    } else {
      orderData.userId = userId;
      orderData.isGuestOrder = false;
    }

    const order = await Order.create(orderData);
    console.log('✅ Pedido Stripe criado:', order._id);

    // Stripe Session
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = productData.map(item => {
      let itemPrice = item.price;
      if (discountPercentage > 0) {
        itemPrice = item.price * (1 - discountPercentage / 100);
      }
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: discountPercentage > 0 ? `${item.name} (${discountPercentage}% OFF)` : item.name,
          },
          unit_amount: Math.floor(itemPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    let payment_method_types;
    switch (paymentMethod) {
      case 'mbway':
        payment_method_types = ['mb_way'];
        break;
      case 'multibanco':
        payment_method_types = ['multibanco'];
        break;
      default:
        payment_method_types = ['card'];
    }

    const sessionOptions = {
      line_items,
      mode: 'payment',
      payment_method_types,
      success_url: `${origin}/order-success/${order._id}?payment=stripe&method=${paymentMethod || 'card'}${isGuestOrder ? '&guest=true' : ''}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId || '',
        paymentMethod: paymentMethod || 'card',
        isGuestOrder: isGuestOrder ? 'true' : 'false',
        guestEmail: guestEmail || '',
        guestName: guestName || '',
        guestPhone: guestPhone || '',
      },
    };

    if (isGuestOrder && guestEmail) {
      sessionOptions.customer_email = guestEmail;
    }

    if (paymentMethod === 'mbway') {
      sessionOptions.payment_method_options = { mb_way: {} };
    }
    if (paymentMethod === 'multibanco') {
      sessionOptions.payment_method_options = { multibanco: {} };
    }

    const session = await stripeInstance.checkout.sessions.create(sessionOptions);
    console.log('✅ Sessão Stripe criada:', session.id);

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('❌ Erro Stripe:', error);
    return res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// STRIPE WEBHOOKS - COM AWAIT NOS EMAILS (FIX VERCEL)
// =============================================================================
export const stripeWebhooks = async (request, response) => {
  console.log('');
  console.log('🔔 ═══════════════════════════════════════════════════');
  console.log('🔔 STRIPE WEBHOOK RECEBIDO');
  console.log('🔔 ═══════════════════════════════════════════════════');
  
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('🔔 Evento:', event.type);
  } catch (error) {
    console.error('❌ Webhook Signature Error:', error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('✅ Checkout Session Completed:', session.id);
      console.log('💳 Payment Status:', session.payment_status);
      
      const { orderId, userId, paymentMethod, isGuestOrder, guestEmail, guestName, guestPhone } = session.metadata;
      
      console.log('📋 Metadata:', { orderId, userId, isGuestOrder, guestEmail });
      
      if (session.payment_status === 'paid') {
        console.log('💰 Pagamento confirmado!');
        
        // Atualizar pedido como pago
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId, 
          { isPaid: true },
          { new: true }
        ).populate('items.product');
        
        if (!updatedOrder) {
          console.error('❌ Pedido não encontrado:', orderId);
          break;
        }
        
        console.log('✅ Pedido marcado como pago:', orderId);
        
        // Decrementar stock
        await decrementProductStock(updatedOrder.items);
        
        // Limpar carrinho (se não for guest)
        if (userId && isGuestOrder !== 'true') {
          await User.findByIdAndUpdate(userId, { cartItems: {} });
        }

        // ✅ CORREÇÃO: ENVIAR EMAILS COM AWAIT (antes de responder)
        console.log('');
        console.log('📧 Preparando envio de emails...');
        
        let emailRecipient;
        if (isGuestOrder === 'true') {
          emailRecipient = guestEmail || updatedOrder.guestEmail;
          console.log('📧 Modo: Guest - Email:', emailRecipient);
        } else {
          emailRecipient = userId;
          console.log('📧 Modo: User registado - ID:', emailRecipient);
        }
        
        if (emailRecipient) {
          // ✅ AWAIT - Espera os emails serem enviados ANTES de responder
          const emailResult = await sendAllOrderEmails(updatedOrder, emailRecipient);
          console.log('📧 Resultado dos emails:', JSON.stringify(emailResult, null, 2));
        } else {
          console.error('❌ Nenhum destinatário de email encontrado!');
        }
        
      } else if (session.payment_status === 'unpaid' && paymentMethod === 'multibanco') {
        console.log('⏳ Multibanco: Aguardando pagamento');
      }
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log('💳 Payment Intent Succeeded:', paymentIntent.id);

      try {
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });

        if (!sessions.data || sessions.data.length === 0) {
          console.log('⚠️ Sessão não encontrada para payment_intent');
          break;
        }

        const { orderId, userId, isGuestOrder, guestEmail } = sessions.data[0].metadata;
        
        // Verificar se já foi processado
        const existingOrder = await Order.findById(orderId);
        if (existingOrder?.isPaid) {
          console.log('⚠️ Pedido já processado, ignorando duplicado');
          break;
        }
        
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId, 
          { isPaid: true },
          { new: true }
        ).populate('items.product');
        
        if (!updatedOrder) {
          console.error('❌ Pedido não encontrado:', orderId);
          break;
        }
        
        console.log('✅ Pedido marcado como pago (payment_intent):', orderId);
        
        // Decrementar stock
        await decrementProductStock(updatedOrder.items);
        
        // Limpar carrinho
        if (userId && isGuestOrder !== 'true') {
          await User.findByIdAndUpdate(userId, { cartItems: {} });
        }

        // ⚠️ NÃO enviar emails aqui - já foram enviados no checkout.session.completed
        console.log('⚠️ Emails já enviados no checkout.session.completed, ignorando aqui');
      } catch (error) {
        console.error('❌ Erro no webhook payment_intent:', error.message);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.log('❌ Pagamento falhou:', paymentIntent.id);

      try {
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });

        if (sessions.data && sessions.data.length > 0) {
          const { orderId } = sessions.data[0].metadata;
          await Order.findByIdAndDelete(orderId);
          console.log('🗑️ Pedido deletado:', orderId);
        }
      } catch (error) {
        console.error('❌ Erro ao deletar pedido:', error.message);
      }
      break;
    }

    default:
      console.log('ℹ️ Evento não tratado:', event.type);
  }
  
  // ✅ Responder ao Stripe DEPOIS dos emails serem enviados
  response.json({ received: true });
};

// =============================================================================
// GET USER ORDERS
// =============================================================================
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.query.userId || req.body.userId;
    const guestEmail = req.query.guestEmail || req.body.guestEmail;

    let query;
    if (guestEmail) {
      query = {
        isGuestOrder: true,
        guestEmail: guestEmail,
        isPaid: true,
      };
    } else if (userId) {
      query = {
        userId,
        isPaid: true,
      };
    } else {
      return res.json({ success: false, message: 'User ID ou Guest Email necessário' });
    }

    const orders = await Order.find(query)
      .populate({
        path: 'items.product',
        select: 'name image category offerPrice weight color colorCode',
      })
      .populate({
        path: 'address',
        select: 'firstName lastName street city state zipcode country email phone',
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error);
    res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// GET SINGLE ORDER (PUBLIC)
// =============================================================================
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.json({ success: false, message: 'Order ID necessário' });
    }

    const order = await Order.findById(orderId)
      .populate({
        path: 'items.product',
        select: 'name image category offerPrice weight color colorCode',
      })
      .populate({
        path: 'address',
        select: 'firstName lastName street city state zipcode country email phone',
      });

    if (!order) {
      return res.json({ success: false, message: 'Pedido não encontrado' });
    }

    // Só mostra pedidos pagos
    if (!order.isPaid) {
      return res.json({ success: false, message: 'Pedido ainda não confirmado', pending: true });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Erro ao buscar pedido:', error);
    res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// GET ALL ORDERS (SELLER/ADMIN)
// =============================================================================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      isPaid: true,
    })
      .populate('items.product address')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// UPDATE ORDER STATUS (SELLER/ADMIN)
// =============================================================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.json({ success: false, message: 'Order ID e Status são obrigatórios' });
    }

    const validStatuses = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.json({ success: false, message: 'Status inválido' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.json({ success: false, message: 'Pedido não encontrado' });
    }

    const previousStatus = order.status;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('items.product').populate('address');

    console.log('✅ Status atualizado:', { orderId, oldStatus: previousStatus, newStatus: status });

    // Enviar notificação de status
    let notificationSent = false;
    if (previousStatus !== status && sendOrderStatusUpdateEmail) {
      const productIds = updatedOrder.items.map(item => item.product?._id || item.product);
      const products = await Product.find({ _id: { $in: productIds } });

      // ✅ Com await
      try {
        const result = await sendOrderStatusUpdateEmail(updatedOrder, status, products);
        if (result.success) {
          console.log('✅ Email de status enviado');
          notificationSent = true;
        }
      } catch (err) {
        console.error('❌ Erro ao enviar email de status:', err.message);
      }
    }

    res.json({
      success: true,
      message: `Status atualizado para "${status}"`,
      order: updatedOrder,
      notificationSent,
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    res.json({ success: false, message: error.message });
  }
};

// =============================================================================
// EXPORTAR FUNÇÃO COD VAZIA PARA NÃO QUEBRAR IMPORTS EXISTENTES
// =============================================================================
export const placeOrderCOD = async (req, res) => {
  return res.json({ 
    success: false, 
    message: 'Pagamento na entrega não está mais disponível. Por favor, use pagamento online.' 
  });
};