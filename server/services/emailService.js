// server/services/emailService.js
// CORRIGIDO: Importação segura do OrderStatusUpdateEmail

import nodemailer from 'nodemailer';
import { createOrderEmailTemplate } from '../emails/OrderConfirmationEmail.js';

// Importação segura do template de status (não quebra se não existir)
let createStatusUpdateEmailTemplate = null;
let createStatusUpdateTextTemplate = null;

try {
  const statusModule = await import('../emails/OrderStatusUpdateEmail.js');
  createStatusUpdateEmailTemplate = statusModule.createStatusUpdateEmailTemplate;
  createStatusUpdateTextTemplate = statusModule.createStatusUpdateTextTemplate;
  console.log('✅ Template de status update carregado');
} catch (error) {
  console.log('⚠️ Template de status update não disponível:', error.message);
}

const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// =============================================================================
// ENVIAR EMAIL DE CONFIRMAÇÃO DE PEDIDO
// =============================================================================
export const sendOrderConfirmationEmail = async (
  order,
  user,
  products,
  address
) => {
  try {
    // Determinar qual email usar
    let emailToSend = user.email;

    // Se o email do usuário for inválido, use o do endereço
    if (!user.email || user.email === '') {
      console.log('⚠️ Email do usuário inválido, usando email do endereço');
      emailToSend = address.email;
    }

    // Validação final
    if (!emailToSend || emailToSend === '') {
      console.error('❌ Nenhum email válido encontrado');
      console.error('❌ user.email:', user.email);
      console.error('❌ address.email:', address.email);
      return {
        success: false,
        error: 'Nenhum email válido encontrado para envio',
      };
    }

    console.log('📧 Enviando email de confirmação via Gmail para:', emailToSend);

    const transporter = createGmailTransporter();
    const emailHtml = createOrderEmailTemplate(order, user, products, address);

    const mailOptions = {
      from: {
        name: 'Elite Surfing',
        address: process.env.GMAIL_USER,
      },
      to: emailToSend,
      subject: `Confirmação de Encomenda #${order._id} - Elite Surfing`,
      html: emailHtml,
      text: `
        Olá ${user.name},
        
        Obrigado pela sua compra! A sua encomenda #${order._id} foi processada com sucesso.
        
        Total: €${order.amount.toFixed(2)}
        Data: ${new Date(order.createdAt).toLocaleDateString('pt-PT')}
        
        Obrigado por escolher a Elite Surfing!
        www.elitesurfing.pt
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmação enviado. ID:', result.messageId);
    console.log('✅ Enviado para:', emailToSend);

    return {
      success: true,
      messageId: result.messageId,
      message: `Email enviado para ${emailToSend}`,
      recipient: emailToSend,
    };
  } catch (error) {
    console.error('❌ Erro ao enviar email de confirmação:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido no envio de email',
    };
  }
};

// =============================================================================
// ENVIAR EMAIL DE ATUALIZAÇÃO DE STATUS
// =============================================================================
export const sendOrderStatusUpdateEmail = async (order, newStatus, products = []) => {
  try {
    // Verificar se template está disponível
    if (!createStatusUpdateEmailTemplate) {
      console.log('⚠️ Template de status não disponível, pulando envio');
      return { success: false, error: 'Template não disponível' };
    }

    // Determinar email e nome do cliente
    let customerEmail = null;
    let customerName = 'Cliente';

    // 1. Se é guest order, usar dados do pedido
    if (order.isGuestOrder && order.guestEmail) {
      customerEmail = order.guestEmail;
      customerName = order.guestName || 'Cliente';
      console.log('📧 Enviando status update para guest:', customerEmail);
    }
    // 2. Se tem userId, buscar do usuário
    else if (order.userId) {
      const { default: User } = await import('../models/User.js');
      const user = await User.findById(order.userId);
      if (user) {
        customerEmail = user.email;
        customerName = user.name;
        console.log('📧 Enviando status update para user:', customerEmail);
      }
    }

    // 3. Fallback: usar email do endereço
    if (!customerEmail && order.address) {
      const { default: Address } = await import('../models/Address.js');
      const address = await Address.findById(order.address);
      if (address && address.email) {
        customerEmail = address.email;
        customerName = `${address.firstName} ${address.lastName}`;
        console.log('📧 Usando email do endereço:', customerEmail);
      }
    }

    // Validação final
    if (!customerEmail) {
      console.error('❌ Nenhum email encontrado para notificação de status');
      return {
        success: false,
        error: 'Nenhum email encontrado para o cliente',
      };
    }

    console.log('📧 Enviando atualização de status para:', customerEmail);
    console.log('📧 Novo status:', newStatus);

    const transporter = createGmailTransporter();

    // Criar templates
    const emailHtml = createStatusUpdateEmailTemplate(
      order, 
      customerName, 
      customerEmail, 
      newStatus, 
      products
    );
    const emailText = createStatusUpdateTextTemplate 
      ? createStatusUpdateTextTemplate(order, customerName, newStatus)
      : `Olá ${customerName}, o estado do seu pedido foi atualizado para: ${newStatus}`;

    // Mapear status para assunto do email
    const statusSubjects = {
      'Order Placed': 'Pedido Recebido',
      'Processing': 'Pedido em Processamento',
      'Shipped': 'Pedido Enviado!',
      'Out for Delivery': 'Pedido Saiu para Entrega!',
      'Delivered': 'Pedido Entregue!',
      'Cancelled': 'Pedido Cancelado',
    };

    const subjectStatus = statusSubjects[newStatus] || newStatus;

    const mailOptions = {
      from: {
        name: 'Elite Surfing',
        address: process.env.GMAIL_USER,
      },
      to: customerEmail,
      subject: `${subjectStatus} - Pedido #${order._id.toString().slice(-8).toUpperCase()} - Elite Surfing`,
      html: emailHtml,
      text: emailText,
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email de status enviado!');
    console.log('✅ Message ID:', result.messageId);
    console.log('✅ Destinatário:', customerEmail);

    return {
      success: true,
      messageId: result.messageId,
      recipient: customerEmail,
      status: newStatus,
    };
  } catch (error) {
    console.error('❌ Erro ao enviar email de status:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido',
    };
  }
};

// =============================================================================
// ENVIAR EMAIL SIMPLES (GENÉRICO)
// =============================================================================
export const sendSimpleEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createGmailTransporter();

    const result = await transporter.sendMail({
      from: {
        name: 'Elite Surfing',
        address: process.env.GMAIL_USER,
      },
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Erro no sendSimpleEmail:', error);
    return { success: false, error: error.message };
  }
};

export default { 
  sendOrderConfirmationEmail, 
  sendOrderStatusUpdateEmail,
  sendSimpleEmail 
};