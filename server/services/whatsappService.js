// server/services/whatsappService.js
// Serviço de notificações WhatsApp usando CallMeBot API
// Documentação: https://www.callmebot.com/blog/free-api-whatsapp-messages/

/**
 * Envia notificação WhatsApp usando CallMeBot API
 * @param {string} message - Mensagem a enviar
 * @returns {Object} Resultado do envio
 */
export const sendWhatsAppNotification = async (message) => {
  try {
    const phoneNumber = process.env.ADMIN_WHATSAPP_NUMBER;
    const apiKey = process.env.CALLMEBOT_API_KEY;

    if (!phoneNumber || !apiKey) {
      console.log('⚠️ WhatsApp não configurado (ADMIN_WHATSAPP_NUMBER ou CALLMEBOT_API_KEY em falta)');
      return { 
        success: false, 
        error: 'WhatsApp não configurado no .env' 
      };
    }

    console.log('📱 Enviando WhatsApp para:', phoneNumber);

    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // CallMeBot API URL
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodedMessage}&apikey=${apiKey}`;

    const response = await fetch(url, {
      method: 'GET',
      timeout: 10000, // 10 segundos timeout
    });

    const responseText = await response.text();
    console.log('📱 CallMeBot response:', responseText);

    // CallMeBot retorna texto com "Message queued" se sucesso
    if (response.ok && responseText.toLowerCase().includes('queued')) {
      console.log('✅ WhatsApp enviado com sucesso!');
      return { 
        success: true, 
        message: 'WhatsApp enviado',
        response: responseText 
      };
    } else {
      console.error('❌ WhatsApp falhou:', responseText);
      return { 
        success: false, 
        error: responseText 
      };
    }
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Formata mensagem de novo pedido para WhatsApp
 * @param {Object} order - Pedido
 * @param {Object} user - Usuário
 * @param {Array} products - Produtos
 * @param {Object} address - Endereço
 * @returns {string} Mensagem formatada
 */
export const formatNewOrderMessage = (order, user, products, address) => {
  const orderId = order._id.toString().slice(-8).toUpperCase();
  const customerName = order.isGuestOrder 
    ? (order.guestName || 'Guest') 
    : (user?.name || 'Cliente');
  const customerEmail = order.isGuestOrder 
    ? order.guestEmail 
    : (user?.email || address?.email || 'N/A');
  const customerPhone = order.isGuestOrder 
    ? (order.guestPhone || address?.phone) 
    : (address?.phone || 'N/A');

  // Listar produtos
  const productList = order.items
    .map(item => {
      const productId = item.product?._id || item.product;
      const product = products.find(p => p._id.toString() === productId.toString());
      if (!product) return `- Item (${item.quantity}x)`;
      return `• ${product.name} (${item.quantity}x) - €${((product.offerPrice || 0) * item.quantity).toFixed(2)}`;
    })
    .join('\n');

  const paymentStatus = order.paymentType === 'COD' 
    ? '💰 COD (Pagar na entrega)' 
    : '✅ PAGO Online';

  const guestTag = order.isGuestOrder ? ' [GUEST]' : '';

  const message = `🔔 *NOVO PEDIDO!*${guestTag}

📋 *Pedido:* #${orderId}
📅 *Data:* ${new Date().toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}
💳 *Pagamento:* ${paymentStatus}

👤 *Cliente:*
Nome: ${customerName}
Email: ${customerEmail}
Tel: ${customerPhone}

📍 *Morada:*
${address?.firstName || ''} ${address?.lastName || ''}
${address?.street || ''}
${address?.zipcode || ''} ${address?.city || ''}
${address?.country || 'Portugal'}

📦 *Produtos:*
${productList}

💰 *TOTAL: €${(order.amount || 0).toFixed(2)}*

🔗 Ver pedido: elitesurfing.pt/seller/orders`;

  return message;
};

/**
 * Envia atualização de status para o admin
 * @param {Object} order - Pedido
 * @param {string} customerName - Nome do cliente
 * @param {string} newStatus - Novo status
 */
export const sendStatusUpdateToAdmin = async (order, customerName, newStatus) => {
  const statusEmojis = {
    'Order Placed': '📋',
    'Processing': '⚙️',
    'Shipped': '🚚',
    'Out for Delivery': '📦',
    'Delivered': '✅',
    'Cancelled': '❌',
  };

  const emoji = statusEmojis[newStatus] || '📋';
  const orderId = order._id.toString().slice(-8).toUpperCase();

  const message = `${emoji} *STATUS ATUALIZADO*

📋 Pedido: #${orderId}
👤 Cliente: ${customerName}
📊 Novo Status: *${newStatus}*
📅 ${new Date().toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })}`;

  return await sendWhatsAppNotification(message);
};

export default { 
  sendWhatsAppNotification, 
  formatNewOrderMessage,
  sendStatusUpdateToAdmin 
};