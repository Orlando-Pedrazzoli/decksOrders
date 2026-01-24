// server/emails/OrderStatusUpdateEmail.js
// 🆕 Template de email para notificação de atualização de status

/**
 * Mapeia status para português e emoji
 */
const getStatusInfo = (status) => {
  const statusMap = {
    'Order Placed': {
      label: 'Pedido Recebido',
      emoji: '📋',
      color: '#3B82F6', // blue
      message: 'O seu pedido foi recebido e está a aguardar processamento.',
      icon: '📦'
    },
    'Processing': {
      label: 'Em Processamento',
      emoji: '🔄',
      color: '#F59E0B', // amber
      message: 'O seu pedido está a ser preparado pela nossa equipa.',
      icon: '⚙️'
    },
    'Shipped': {
      label: 'Enviado',
      emoji: '🚚',
      color: '#8B5CF6', // purple
      message: 'O seu pedido foi enviado e está a caminho!',
      icon: '📬'
    },
    'Out for Delivery': {
      label: 'Saiu para Entrega',
      emoji: '🏃',
      color: '#6366F1', // indigo
      message: 'O seu pedido está a caminho da sua morada. Esteja atento!',
      icon: '🛵'
    },
    'Delivered': {
      label: 'Entregue',
      emoji: '✅',
      color: '#10B981', // green
      message: 'O seu pedido foi entregue com sucesso. Obrigado pela sua compra!',
      icon: '🎉'
    },
    'Cancelled': {
      label: 'Cancelado',
      emoji: '❌',
      color: '#EF4444', // red
      message: 'O seu pedido foi cancelado. Se tiver dúvidas, contacte-nos.',
      icon: '🚫'
    },
  };

  return statusMap[status] || {
    label: status,
    emoji: '📦',
    color: '#6B7280',
    message: 'O estado do seu pedido foi atualizado.',
    icon: '📦'
  };
};

/**
 * Cria template HTML para email de atualização de status
 */
export const createStatusUpdateEmailTemplate = (order, customerName, customerEmail, newStatus, products = []) => {
  const statusInfo = getStatusInfo(newStatus);
  
  // Criar lista de produtos se disponível
  const productsHTML = products.length > 0 ? `
    <div style="margin-top: 20px;">
      <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 16px;">📦 Produtos do Pedido</h3>
      <div style="background: #f8f9fa; border-radius: 8px; padding: 15px;">
        ${order.items.map(item => {
          const product = products.find(p => p._id.toString() === (item.product._id || item.product).toString());
          if (!product) return '';
          return `
            <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #e9ecef;">
              <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600; color: #333;">${product.name}</p>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">Qtd: ${item.quantity}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-weight: 600; color: #333;">€${(product.offerPrice * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          `;
        }).join('')}
        <div style="padding-top: 15px; text-align: right; border-top: 2px solid #dee2e6; margin-top: 10px;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${statusInfo.color};">
            Total: €${order.amount.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  ` : '';

  // Timeline de status
  const allStatuses = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentIndex = allStatuses.indexOf(newStatus);
  
  const timelineHTML = newStatus !== 'Cancelled' ? `
    <div style="margin: 30px 0;">
      <h3 style="margin: 0 0 20px 0; color: #495057; font-size: 16px; text-align: center;">📍 Progresso do Pedido</h3>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 10px;">
        ${allStatuses.map((status, index) => {
          const info = getStatusInfo(status);
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return `
            <div style="text-align: center; flex: 1;">
              <div style="
                width: 40px; 
                height: 40px; 
                border-radius: 50%; 
                background: ${isCompleted ? info.color : '#e9ecef'}; 
                color: ${isCompleted ? 'white' : '#adb5bd'};
                display: inline-flex; 
                align-items: center; 
                justify-content: center;
                font-size: 18px;
                ${isCurrent ? 'box-shadow: 0 0 0 4px ' + info.color + '40;' : ''}
              ">
                ${info.emoji}
              </div>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: ${isCompleted ? '#333' : '#adb5bd'}; font-weight: ${isCurrent ? '600' : '400'};">
                ${info.label}
              </p>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : '';

  // Template HTML completo
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Atualização do Pedido - Elite Surfing</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      
      <!-- Container Principal -->
      <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header com cor do status -->
        <div style="background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%); padding: 30px; text-align: center;">
          <div style="font-size: 50px; margin-bottom: 10px;">${statusInfo.icon}</div>
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
            ${statusInfo.label}
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
            Pedido #${order._id.toString().slice(-8).toUpperCase()}
          </p>
        </div>

        <!-- Conteúdo Principal -->
        <div style="padding: 30px;">
          
          <!-- Saudação -->
          <p style="font-size: 16px; margin: 0 0 20px 0;">
            Olá <strong>${customerName}</strong>,
          </p>
          
          <!-- Mensagem do Status -->
          <div style="background: ${statusInfo.color}15; border-left: 4px solid ${statusInfo.color}; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
            <p style="margin: 0; color: #333; font-size: 15px;">
              ${statusInfo.emoji} ${statusInfo.message}
            </p>
          </div>

          <!-- Timeline -->
          ${timelineHTML}

          <!-- Detalhes do Pedido -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 16px;">📋 Detalhes do Pedido</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Número do Pedido:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600; font-family: monospace;">#${order._id.toString().slice(-8).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Data do Pedido:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 500;">${new Date(order.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Método de Pagamento:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 500;">${order.paymentType === 'COD' ? '💰 Pagamento na Entrega' : '💳 Pago Online'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Total:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 700; color: ${statusInfo.color}; font-size: 18px;">€${order.amount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <!-- Lista de Produtos -->
          ${productsHTML}

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://elitesurfing.pt/my-orders" 
               style="display: inline-block; background: ${statusInfo.color}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Ver Meus Pedidos
            </a>
          </div>

          <!-- Dicas por Status -->
          ${newStatus === 'Shipped' ? `
            <div style="background: #EEF2FF; border: 1px solid #C7D2FE; padding: 20px; border-radius: 12px; margin-top: 20px;">
              <h4 style="margin: 0 0 10px 0; color: #4F46E5;">📬 Dicas de Entrega</h4>
              <ul style="margin: 0; padding-left: 20px; color: #4338CA; font-size: 14px;">
                <li style="margin-bottom: 8px;">Mantenha o seu telefone por perto</li>
                <li style="margin-bottom: 8px;">Verifique se a morada está correta</li>
                <li>O tempo estimado de entrega é de 2-5 dias úteis</li>
              </ul>
            </div>
          ` : ''}

          ${newStatus === 'Delivered' ? `
            <div style="background: #ECFDF5; border: 1px solid #A7F3D0; padding: 20px; border-radius: 12px; margin-top: 20px;">
              <h4 style="margin: 0 0 10px 0; color: #059669;">⭐ A sua opinião é importante!</h4>
              <p style="margin: 0; color: #047857; font-size: 14px;">
                Esperamos que esteja satisfeito com a sua compra! Se tiver um momento, 
                adoraríamos ouvir a sua opinião sobre os produtos.
              </p>
              <div style="text-align: center; margin-top: 15px;">
                <a href="https://elitesurfing.pt/write-review" 
                   style="display: inline-block; background: #10B981; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">
                  Deixar Avaliação
                </a>
              </div>
            </div>
          ` : ''}

          <!-- Contacto -->
          <div style="text-align: center; padding: 25px 0 10px 0; border-top: 1px solid #e9ecef; margin-top: 30px;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
              Tem alguma questão sobre o seu pedido?
            </p>
            <p style="margin: 0;">
              <a href="mailto:suporte@elitesurfing.pt" style="color: ${statusInfo.color}; text-decoration: none; font-weight: 500;">
                suporte@elitesurfing.pt
              </a>
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #666; font-size: 13px;">
            Obrigado por escolher a Elite Surfing! 🏄‍♂️
          </p>
          <p style="margin: 10px 0 0 0;">
            <a href="https://elitesurfing.pt" style="color: ${statusInfo.color}; text-decoration: none; font-size: 13px;">
              www.elitesurfing.pt
            </a>
          </p>
        </div>

      </div>

      <!-- Texto Legal -->
      <p style="text-align: center; color: #999; font-size: 11px; margin-top: 20px;">
        Este email foi enviado automaticamente. Por favor, não responda diretamente.
      </p>

    </body>
    </html>
  `;
};

/**
 * Cria versão texto simples do email
 */
export const createStatusUpdateTextTemplate = (order, customerName, newStatus) => {
  const statusInfo = getStatusInfo(newStatus);
  
  return `
Olá ${customerName},

${statusInfo.emoji} ATUALIZAÇÃO DO SEU PEDIDO

O estado do seu pedido #${order._id.toString().slice(-8).toUpperCase()} foi atualizado para:

${statusInfo.label}

${statusInfo.message}

---
DETALHES DO PEDIDO
Número: #${order._id.toString().slice(-8).toUpperCase()}
Data: ${new Date(order.createdAt).toLocaleDateString('pt-PT')}
Total: €${order.amount.toFixed(2)}
---

Para ver todos os detalhes, visite:
https://elitesurfing.pt/my-orders

Tem dúvidas? Contacte-nos: suporte@elitesurfing.pt

Obrigado por escolher a Elite Surfing!
www.elitesurfing.pt
  `.trim();
};

export default { 
  createStatusUpdateEmailTemplate, 
  createStatusUpdateTextTemplate,
  getStatusInfo 
};