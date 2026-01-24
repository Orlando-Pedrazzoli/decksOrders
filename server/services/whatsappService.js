// server/services/whatsappService.js
// 🆕 ATUALIZADO: Adicionado formatStatusUpdateMessage e sendStatusUpdateWhatsApp

import https from 'https';

/**
 * Envia mensagem WhatsApp via CallMeBot
 * @param {string} message - Mensagem a enviar
 * @param {string} phoneNumber - Número de telefone (opcional, usa admin por padrão)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendWhatsAppNotification = async (message, phoneNumber = null) => {
  return new Promise((resolve) => {
    try {
      const PHONE_NUMBER = phoneNumber || process.env.ADMIN_WHATSAPP_NUMBER || '351912164220';
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
            resolve({ success: true });
          } else {
            console.error('❌ Erro no CallMeBot. Status:', res.statusCode);
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
 * Formata mensagem de novo pedido para WhatsApp (Admin)
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

// =============================================================================
// 🆕 FORMATAR MENSAGEM DE ATUALIZAÇÃO DE STATUS (PARA CLIENTE)
// =============================================================================

/**
 * Mapeia status para emoji e texto em português
 */
const getStatusEmoji = (status) => {
  const statusMap = {
    'Order Placed': { emoji: '📋', label: 'Pedido Recebido' },
    'Processing': { emoji: '🔄', label: 'Em Processamento' },
    'Shipped': { emoji: '🚚', label: 'Enviado' },
    'Out for Delivery': { emoji: '🏃', label: 'Saiu para Entrega' },
    'Delivered': { emoji: '✅', label: 'Entregue' },
    'Cancelled': { emoji: '❌', label: 'Cancelado' },
  };
  return statusMap[status] || { emoji: '📦', label: status };
};

/**
 * Formata mensagem de atualização de status para WhatsApp (Cliente)
 */
export const formatStatusUpdateMessage = (order, customerName, newStatus) => {
  const statusInfo = getStatusEmoji(newStatus);
  
  // Mensagem personalizada por status
  let statusMessage = '';
  switch (newStatus) {
    case 'Order Placed':
      statusMessage = 'O seu pedido foi recebido e está a aguardar processamento.';
      break;
    case 'Processing':
      statusMessage = 'Estamos a preparar o seu pedido com muito cuidado! 📦';
      break;
    case 'Shipped':
      statusMessage = 'O seu pedido foi enviado e está a caminho! Fique atento ao carteiro. 📬';
      break;
    case 'Out for Delivery':
      statusMessage = 'O seu pedido está a caminho da sua morada! Estará aí muito em breve! 🎉';
      break;
    case 'Delivered':
      statusMessage = 'O seu pedido foi entregue com sucesso! Esperamos que goste! ⭐';
      break;
    case 'Cancelled':
      statusMessage = 'O seu pedido foi cancelado. Se tiver dúvidas, contacte-nos.';
      break;
    default:
      statusMessage = 'O estado do seu pedido foi atualizado.';
  }

  const message = `
🏄 *ELITE SURFING*
━━━━━━━━━━━━━━━

${statusInfo.emoji} *ATUALIZAÇÃO DO PEDIDO*

Olá ${customerName}!

📋 *Pedido:* #${order._id.toString().slice(-8).toUpperCase()}

${statusInfo.emoji} *Novo Estado:* ${statusInfo.label}

${statusMessage}

💰 *Total:* €${order.amount.toFixed(2)}

━━━━━━━━━━━━━━━
🔗 Ver detalhes: elitesurfing.pt/my-orders
📧 Dúvidas: suporte@elitesurfing.pt
`.trim();

  return message;
};

// =============================================================================
// 🆕 ENVIAR WHATSAPP DE ATUALIZAÇÃO DE STATUS
// =============================================================================

/**
 * Envia WhatsApp de atualização de status para o cliente
 * NOTA: Só funciona se o cliente tiver registado o número no CallMeBot
 * Por isso, esta função é mais útil para notificar o ADMIN sobre mudanças
 */
export const sendStatusUpdateToAdmin = async (order, customerName, newStatus) => {
  try {
    const statusInfo = getStatusEmoji(newStatus);
    
    const adminMessage = `
📊 *STATUS ATUALIZADO*

📋 Pedido: #${order._id.toString().slice(-8).toUpperCase()}
👤 Cliente: ${customerName}
${statusInfo.emoji} Novo Status: ${statusInfo.label}
💰 Valor: €${order.amount.toFixed(2)}

✅ Cliente notificado por email.
`.trim();

    const result = await sendWhatsAppNotification(adminMessage);
    return result;
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp de status para admin:', error);
    return { success: false, error: error.message };
  }
};

export default { 
  sendWhatsAppNotification, 
  formatNewOrderMessage,
  formatStatusUpdateMessage,
  sendStatusUpdateToAdmin,
};