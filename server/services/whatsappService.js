// server/services/whatsappService.js
// Serviço de notificação WhatsApp via CallMeBot (GRATUITO)

/**
 * Envia mensagem WhatsApp via CallMeBot
 * @param {string} message - Mensagem a enviar
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendWhatsAppNotification = async (message) => {
  try {
    // ✅ CONFIGURAÇÃO - Substitua pela sua API Key do CallMeBot
    const PHONE_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER || '351912164220';
    const API_KEY = process.env.CALLMEBOT_API_KEY; // Você vai adicionar no Vercel

    if (!API_KEY) {
      console.error('❌ CALLMEBOT_API_KEY não configurada no .env');
      return { success: false, error: 'API Key não configurada' };
    }

    // Encode da mensagem para URL
    const encodedMessage = encodeURIComponent(message);

    // URL da API do CallMeBot
    const url = `https://api.callmebot.com/whatsapp.php?phone=${PHONE_NUMBER}&text=${encodedMessage}&apikey=${API_KEY}`;

    console.log('📱 Enviando notificação WhatsApp...');

    // Fazer requisição
    const response = await fetch(url);
    const responseText = await response.text();

    if (response.ok) {
      console.log('✅ WhatsApp enviado com sucesso!');
      console.log('📱 Resposta:', responseText);
      return { success: true };
    } else {
      console.error('❌ Erro no CallMeBot:', responseText);
      return { success: false, error: responseText };
    }
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Formata mensagem de novo pedido para WhatsApp
 * @param {Object} order - Pedido
 * @param {Object} user - Usuário
 * @param {Array} products - Lista de produtos
 * @param {Object} address - Endereço
 * @returns {string} - Mensagem formatada
 */
export const formatNewOrderMessage = (order, user, products, address) => {
  // Criar lista de itens
  const itemsList = order.items
    .map(item => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      if (!product) return null;
      return `• ${product.name} x${item.quantity} - €${(product.offerPrice * item.quantity).toFixed(2)}`;
    })
    .filter(Boolean)
    .join('\n');

  // Tipo de pagamento
  const paymentType = order.paymentType === 'COD' 
    ? '💰 Pagamento na Entrega' 
    : '💳 Stripe (Pago)';

  // Desconto se houver
  const discountInfo = order.promoCode 
    ? `\n🎫 Código: ${order.promoCode} (-${order.discountPercentage}%)`
    : '';

  // Montar mensagem
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