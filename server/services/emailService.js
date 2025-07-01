// server/services/emailService.js - USANDO EMAILJS
import emailjs from '@emailjs/nodejs';

// Configuração do EmailJS
const EMAIL_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAIL_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAIL_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY; // Chave privada do EmailJS

// Template ID para confirmação de encomenda (você criará um novo template)
const ORDER_TEMPLATE_ID = process.env.EMAILJS_ORDER_TEMPLATE_ID;

// Função para enviar email de confirmação de encomenda
export const sendOrderConfirmationEmail = async (order, user, products) => {
  try {
    // Preparar dados dos produtos para o template
    const itemsList = order.items
      .map(item => {
        const product = products.find(
          p => p._id.toString() === item.product.toString()
        );
        if (!product) return '';

        return `${product.name} (Qtd: ${item.quantity}) - €${(
          product.offerPrice * item.quantity
        ).toFixed(2)}`;
      })
      .filter(Boolean)
      .join('\n');

    // Dados para o template do EmailJS
    const templateParams = {
      // Dados do usuário
      user_name: user.name,
      user_email: user.email,

      // Dados da encomenda
      order_id: order._id,
      order_date: new Date(order.createdAt).toLocaleDateString('pt-PT'),
      order_total: `€${order.amount.toFixed(2)}`,
      payment_method:
        order.paymentType === 'COD'
          ? 'Pagamento na Entrega'
          : 'Pagamento Online',
      order_status:
        order.status === 'Order Placed' ? 'Encomenda Efetuada' : order.status,

      // Lista de produtos
      items_list: itemsList,

      // Endereço (se disponível)
      delivery_address: order.address
        ? `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.zipcode}, ${order.address.country}`
        : 'Endereço não disponível',

      // Dados da empresa
      company_name: 'Elite Surfing',
      company_email: 'suporte@elitesurfing.pt',
      company_website: 'https://elitesurfing.pt',

      // Mensagem personalizada
      custom_message: `Obrigado pela sua compra! A sua encomenda #${order._id} foi processada com sucesso e está a ser preparada para envio.`,
    };

    // Enviar email usando EmailJS
    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      ORDER_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAIL_PUBLIC_KEY,
        privateKey: EMAIL_PRIVATE_KEY,
      }
    );

    console.log('Email de confirmação enviado via EmailJS:', response.status);
    return {
      success: true,
      status: response.status,
      text: response.text,
    };
  } catch (error) {
    console.error('Erro ao enviar email via EmailJS:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido',
    };
  }
};

// Função auxiliar para enviar emails simples (reutilizável)
export const sendSimpleEmail = async (templateId, templateParams) => {
  try {
    const response = await emailjs.send(
      EMAIL_SERVICE_ID,
      templateId,
      templateParams,
      {
        publicKey: EMAIL_PUBLIC_KEY,
        privateKey: EMAIL_PRIVATE_KEY,
      }
    );

    return { success: true, response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default { sendOrderConfirmationEmail, sendSimpleEmail };
