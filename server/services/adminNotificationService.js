// server/services/adminNotificationService.js
// Serviço centralizado de notificações para o Admin

import { sendSimpleEmail } from './emailService.js';
import { sendWhatsAppNotification, formatNewOrderMessage } from './whatsappService.js';

/**
 * Cria template de email para notificação de novo pedido ao admin
 */
const createAdminEmailTemplate = (order, user, products, address) => {
  const itemsHTML = order.items
    .map(item => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      if (!product) return '';
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${product.offerPrice.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">€${(product.offerPrice * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    })
    .filter(Boolean)
    .join('');

  const paymentBadge = order.paymentType === 'COD'
    ? '<span style="background: #ffc107; color: #000; padding: 5px 10px; border-radius: 4px; font-weight: bold;">💰 COD</span>'
    : '<span style="background: #28a745; color: #fff; padding: 5px 10px; border-radius: 4px; font-weight: bold;">💳 PAGO</span>';

  const discountHTML = order.promoCode ? `
    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <strong>🎫 Código Promocional:</strong> ${order.promoCode}<br>
      <strong>Desconto:</strong> ${order.discountPercentage}% (-€${order.discountAmount.toFixed(2)})
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Novo Pedido - Elite Surfing</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%); padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🔔 NOVO PEDIDO!</h1>
        <p style="color: #fff; margin: 10px 0 0 0; font-size: 14px;">Elite Surfing - Painel Admin</p>
      </div>

      <!-- Content -->
      <div style="background: white; padding: 25px; border: 1px solid #ddd; border-top: none;">
        
        <!-- Order Info -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <table style="width: 100%;">
            <tr>
              <td><strong>📋 Pedido:</strong></td>
              <td style="text-align: right; font-family: monospace; font-size: 16px;">#${order._id.toString().slice(-8).toUpperCase()}</td>
            </tr>
            <tr>
              <td><strong>📅 Data:</strong></td>
              <td style="text-align: right;">${new Date().toLocaleString('pt-PT')}</td>
            </tr>
            <tr>
              <td><strong>💳 Pagamento:</strong></td>
              <td style="text-align: right;">${paymentBadge}</td>
            </tr>
          </table>
        </div>

        <!-- Customer Info -->
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #2e7d32;">👤 Cliente</h3>
          <p style="margin: 5px 0;"><strong>Nome:</strong> ${user.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${address.email || user.email}</p>
          <p style="margin: 5px 0;"><strong>Telefone:</strong> ${address.phone}</p>
        </div>

        <!-- Address -->
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #e65100;">📍 Morada de Entrega</h3>
          <p style="margin: 0; line-height: 1.8;">
            ${address.firstName} ${address.lastName}<br>
            ${address.street}<br>
            ${address.zipcode} ${address.city}<br>
            ${address.state}, ${address.country}
          </p>
        </div>

        <!-- Products -->
        <h3 style="color: #333;">📦 Produtos</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Produto</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Qtd</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Preço</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        ${discountHTML}

        <!-- Total -->
        <div style="background: #1a237e; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="margin: 0; font-size: 28px;">💰 TOTAL: €${order.amount.toFixed(2)}</h2>
        </div>

        <!-- Action Button -->
        <div style="text-align: center; margin-top: 25px;">
          <a href="https://www.elitesurfing.pt/seller/orders" 
             style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Ver Pedido no Painel
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
        <p style="margin: 0; color: #666; font-size: 12px;">
          Elite Surfing - Notificação Automática de Pedidos
        </p>
      </div>

    </body>
    </html>
  `;
};

/**
 * Envia notificações para o admin (Email + WhatsApp)
 * @param {Object} order - Pedido criado
 * @param {Object} user - Usuário que fez o pedido
 * @param {Array} products - Lista de produtos do pedido
 * @param {Object} address - Endereço de entrega
 */
export const notifyAdminNewOrder = async (order, user, products, address) => {
  console.log('🔔 Iniciando notificações para o Admin...');

  const results = {
    email: { success: false },
    whatsapp: { success: false },
  };

  // ✅ 1. ENVIAR EMAIL PARA O ADMIN
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'pedrazzoliorlando@gmail.com';
    const emailHTML = createAdminEmailTemplate(order, user, products, address);
    
    const emailResult = await sendSimpleEmail(
      adminEmail,
      `🔔 NOVO PEDIDO #${order._id.toString().slice(-8).toUpperCase()} - €${order.amount.toFixed(2)}`,
      emailHTML,
      `Novo pedido recebido! Pedido #${order._id} - Total: €${order.amount.toFixed(2)} - Cliente: ${user.name}`
    );

    results.email = emailResult;
    
    if (emailResult.success) {
      console.log('✅ Email de notificação enviado para admin:', adminEmail);
    } else {
      console.error('❌ Falha ao enviar email para admin:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar email para admin:', error.message);
    results.email = { success: false, error: error.message };
  }

  // ✅ 2. ENVIAR WHATSAPP PARA O ADMIN
  try {
    const whatsappMessage = formatNewOrderMessage(order, user, products, address);
    const whatsappResult = await sendWhatsAppNotification(whatsappMessage);
    
    results.whatsapp = whatsappResult;
    
    if (whatsappResult.success) {
      console.log('✅ WhatsApp de notificação enviado para admin');
    } else {
      console.error('❌ Falha ao enviar WhatsApp para admin:', whatsappResult.error);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp para admin:', error.message);
    results.whatsapp = { success: false, error: error.message };
  }

  console.log('🔔 Notificações concluídas:', {
    email: results.email.success ? '✅' : '❌',
    whatsapp: results.whatsapp.success ? '✅' : '❌',
  });

  return results;
};

export default { notifyAdminNewOrder };