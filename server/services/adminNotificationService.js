// server/services/adminNotificationService.js
// Serviço centralizado de notificações para o Admin
// CORRIGIDO: Melhor tratamento de erros e logging

import { sendSimpleEmail } from './emailService.js';

// Importação segura do WhatsApp
let sendWhatsAppNotification = null;
let formatNewOrderMessage = null;

try {
  const whatsappModule = await import('./whatsappService.js');
  sendWhatsAppNotification = whatsappModule.sendWhatsAppNotification;
  formatNewOrderMessage = whatsappModule.formatNewOrderMessage;
  console.log('✅ WhatsApp service carregado no adminNotificationService');
} catch (error) {
  console.log('⚠️ WhatsApp service não disponível:', error.message);
}

/**
 * Cria template de email para notificação de novo pedido ao admin
 */
const createAdminEmailTemplate = (order, user, products, address) => {
  // Validação de segurança
  if (!order || !user || !address) {
    console.error('❌ Dados incompletos para template de email admin');
    return '<p>Erro: Dados incompletos</p>';
  }

  const itemsHTML = order.items
    .map(item => {
      const productId = item.product?._id || item.product;
      const product = products.find(p => p._id.toString() === productId.toString());
      if (!product) {
        console.log('⚠️ Produto não encontrado:', productId);
        return '';
      }
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${(product.offerPrice || 0).toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">€${((product.offerPrice || 0) * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    })
    .filter(Boolean)
    .join('');

  const paymentBadge = order.paymentType === 'COD'
    ? '<span style="background: #ffc107; color: #000; padding: 5px 10px; border-radius: 4px; font-weight: bold;">💰 COD - Aguarda Pagamento</span>'
    : '<span style="background: #28a745; color: #fff; padding: 5px 10px; border-radius: 4px; font-weight: bold;">💳 PAGO ONLINE</span>';

  const guestBadge = order.isGuestOrder 
    ? '<span style="background: #17a2b8; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px;">GUEST</span>'
    : '';

  const discountHTML = order.promoCode ? `
    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <strong>🎫 Código Promocional:</strong> ${order.promoCode}<br>
      <strong>Desconto:</strong> ${order.discountPercentage || 0}% (-€${(order.discountAmount || 0).toFixed(2)})
    </div>
  ` : '';

  // Dados do cliente
  const customerName = order.isGuestOrder ? (order.guestName || 'Guest') : (user.name || 'Cliente');
  const customerEmail = order.isGuestOrder ? order.guestEmail : (address.email || user.email);
  const customerPhone = order.isGuestOrder ? (order.guestPhone || address.phone) : address.phone;

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
              <td style="text-align: right; font-family: monospace; font-size: 16px;">#${order._id.toString().slice(-8).toUpperCase()} ${guestBadge}</td>
            </tr>
            <tr>
              <td><strong>📅 Data:</strong></td>
              <td style="text-align: right;">${new Date().toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}</td>
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
          <p style="margin: 5px 0;"><strong>Nome:</strong> ${customerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${customerEmail || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Telefone:</strong> ${customerPhone || 'N/A'}</p>
        </div>

        <!-- Address -->
        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #e65100;">📍 Morada de Entrega</h3>
          <p style="margin: 0; line-height: 1.8;">
            ${address.firstName || ''} ${address.lastName || ''}<br>
            ${address.street || ''}<br>
            ${address.zipcode || ''} ${address.city || ''}<br>
            ${address.state || ''}, ${address.country || 'Portugal'}
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
          <h2 style="margin: 0; font-size: 28px;">💰 TOTAL: €${(order.amount || 0).toFixed(2)}</h2>
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
          Elite Surfing - Notificação Automática de Pedidos<br>
          ${new Date().toISOString()}
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
  console.log('═══════════════════════════════════════════════════');
  console.log('🔔 INICIANDO NOTIFICAÇÕES PARA ADMIN');
  console.log('═══════════════════════════════════════════════════');
  console.log('📋 Order ID:', order?._id);
  console.log('👤 User:', user?.name || user?.email || 'Guest');
  console.log('📦 Products count:', products?.length || 0);
  console.log('📍 Address:', address?.city || 'N/A');

  const results = {
    email: { success: false, error: null },
    whatsapp: { success: false, error: null },
  };

  // Validação de dados
  if (!order) {
    console.error('❌ ERRO: Order é null/undefined');
    return results;
  }

  if (!address) {
    console.error('❌ ERRO: Address é null/undefined');
    return results;
  }

  // ✅ 1. ENVIAR EMAIL PARA O ADMIN
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SELLER_EMAIL || 'pedrazzoliorlando@gmail.com';
    console.log('📧 Admin Email configurado:', adminEmail);
    
    const emailHTML = createAdminEmailTemplate(order, user, products, address);
    
    const subject = `🔔 NOVO PEDIDO #${order._id.toString().slice(-8).toUpperCase()} - €${(order.amount || 0).toFixed(2)} - ${order.isGuestOrder ? 'GUEST' : 'USER'}`;
    
    console.log('📧 Enviando email com subject:', subject);
    
    const emailResult = await sendSimpleEmail(
      adminEmail,
      subject,
      emailHTML,
      `Novo pedido recebido!\n\nPedido: #${order._id}\nTotal: €${(order.amount || 0).toFixed(2)}\nCliente: ${user?.name || order.guestName || 'Guest'}\nEmail: ${user?.email || order.guestEmail || 'N/A'}\n\nAcesse: https://www.elitesurfing.pt/seller/orders`
    );

    results.email = emailResult;
    
    if (emailResult.success) {
      console.log('✅ EMAIL ADMIN ENVIADO COM SUCESSO!');
      console.log('✅ Message ID:', emailResult.messageId);
    } else {
      console.error('❌ FALHA NO EMAIL ADMIN:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ EXCEÇÃO AO ENVIAR EMAIL ADMIN:', error.message);
    console.error('❌ Stack:', error.stack);
    results.email = { success: false, error: error.message };
  }

  // ✅ 2. ENVIAR WHATSAPP PARA O ADMIN
  if (sendWhatsAppNotification && formatNewOrderMessage) {
    try {
      console.log('📱 Preparando notificação WhatsApp...');
      
      const whatsappMessage = formatNewOrderMessage(order, user, products, address);
      console.log('📱 Mensagem formatada, enviando...');
      
      const whatsappResult = await sendWhatsAppNotification(whatsappMessage);
      
      results.whatsapp = whatsappResult;
      
      if (whatsappResult.success) {
        console.log('✅ WHATSAPP ADMIN ENVIADO COM SUCESSO!');
      } else {
        console.error('❌ FALHA NO WHATSAPP ADMIN:', whatsappResult.error);
      }
    } catch (error) {
      console.error('❌ EXCEÇÃO AO ENVIAR WHATSAPP ADMIN:', error.message);
      results.whatsapp = { success: false, error: error.message };
    }
  } else {
    console.log('⚠️ WhatsApp service não disponível, pulando...');
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('🔔 RESULTADO DAS NOTIFICAÇÕES:');
  console.log('   📧 Email:', results.email.success ? '✅ ENVIADO' : `❌ FALHOU (${results.email.error})`);
  console.log('   📱 WhatsApp:', results.whatsapp.success ? '✅ ENVIADO' : `❌ FALHOU (${results.whatsapp.error})`);
  console.log('═══════════════════════════════════════════════════');

  return results;
};

export default { notifyAdminNewOrder };