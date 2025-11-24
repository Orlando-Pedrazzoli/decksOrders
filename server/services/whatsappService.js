// server/services/whatsappService.js
// Serviço de notificação WhatsApp via CallMeBot (GRATUITO)
// CORRIGIDO: Usando https nativo para compatibilidade com Node.js

import https from 'https';

/**
 * Envia mensagem WhatsApp via CallMeBot
 * @param {string} message - Mensagem a enviar
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendWhatsAppNotification = async (message) => {
  return new Promise((resolve) => {
    try {
      const PHONE_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '351912164220';
      const API_KEY = process.env.CALLMEBOT_API_KEY;

      console.log('📱 Configuração WhatsApp:', {
        phone: PHONE_NUMBER,
        apiKeyExists: !!API_KEY,
      });

      if (!API_KEY) {
        console.error('❌ CALLMEBOT_API_KEY não configurada no .env');
        resolve({ success: false, error: 'API Key não configurada' });
        return;
      }

      // Encode da mensagem para URL
      const encodedMessage = encodeURIComponent(message);

      // URL da API do CallMeBot
      const url = `https://api.callmebot.com/whatsapp.php?phone=${PHONE_NUMBER}&text=${encodedMessage}&apikey=${API_KEY}`;

      console.log('📱 Enviando notificação WhatsApp...');

      // Fazer requisição usando https nativo
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ WhatsApp enviado com sucesso!');
            console.log('📱 Resposta:', data);
            resolve({ success: true });
          } else {
            console.error('❌ Erro no CallMeBot. Status:', res.statusCode);
            console.error('❌ Resposta:', data);
            resolve({ success: false, error: `Status ${res.statusCode}: ${data}` });
          }
        });

      }).on('error', (error) => {
        console.error('❌ Erro na requisição WhatsApp:', error.message);
        resolve({ success: false, error: error.message });
      });

    } catch (error) {
      console.error('❌ Erro ao enviar WhatsApp:', error.message);
      resolve({ success: false, error: error.message });
    }
  });
};

/**
 * Formata mensagem de novo pedido para WhatsApp
 */
export const formatNewOrderMessage = (order, user, products, address) => {
  const itemsList = order.items
    .map(item => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      if (!product) return null;
      return `• ${product.name} x${item.quantity} - €${(product.offerPrice * item.quantity).toFixed(2)}`;
    })
    .filter(Boolean)
    .join('\n');

  const paymentType = order.paymentType === 'COD' 
    ? '💰 Pagamento na Entrega' 
    : '💳 Stripe (Pago)';

  const discountInfo = order.promoCode 
    ? `\n🎫 Código: ${order.promoCode} (-${order.discountPercentage}%)`
    : '';

  const message = `
🛒 *NOVO PEDIDO - ELITE SURFING*

📋 *Pedido:* #${order._id.toString().slice(-8).toUpperCase()}
📅 *Data:* ${new Date().toLocaleString('pt-PT')}

👤 *Cliente:* ${user.name}
📧 *Email:* ${address.email || user.email}
📱 *Telefone:* ${address.phone}

📍 *Morada:*
${address.firstName} ${address.lastName}
${address.street}
${address.zipcode} ${address.city}
${address.country}

📦 *Produtos:*
${itemsList}

💰 *Pagamento:* ${paymentType}${discountInfo}
💵 *Total:* €${order.amount.toFixed(2)}

🔗 Ver pedido: https://www.elitesurfing.pt/seller/orders
`.trim();

  return message;
};

export default { sendWhatsAppNotification, formatNewOrderMessage };