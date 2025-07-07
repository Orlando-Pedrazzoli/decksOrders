// server/services/emailService.js - VERSÃO TESTE HARDCODED
import nodemailer from 'nodemailer';
import { createOrderEmailTemplate } from '../emails/OrderConfirmationEmail.js';

// Configurar transporter do Gmail
const createGmailTransporter = () => {
  // TEMPORÁRIO: Valores hardcoded para teste
  const gmailUser = process.env.GMAIL_USER || 'pedrazzoliorlando@gmail.com';
  const gmailPassword = process.env.GMAIL_APP_PASSWORD || 'euisyrtbqwftnavv';

  console.log('🔍 Gmail Config:');
  console.log('User from env:', process.env.GMAIL_USER);
  console.log('User final:', gmailUser);
  console.log('Password from env exists:', !!process.env.GMAIL_APP_PASSWORD);
  console.log('Password final exists:', !!gmailPassword);

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });
};

// Função para enviar email de confirmação de encomenda
export const sendOrderConfirmationEmail = async (
  order,
  user,
  products,
  address
) => {
  try {
    console.log('📧 Enviando email via Gmail para:', user.email);

    const transporter = createGmailTransporter();

    // Gerar HTML do email
    const emailHtml = createOrderEmailTemplate(order, user, products, address);

    // Enviar email usando Gmail SMTP
    const result = await transporter.sendMail({
      from: 'Elite Surfing <pedrazzoliorlando@gmail.com>',
      to: user.email,
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
    });

    console.log('✅ Email enviado via Gmail. ID:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      message: `Email enviado para ${user.email}`,
    };
  } catch (error) {
    console.error('❌ Erro ao enviar email via Gmail:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido no envio de email',
    };
  }
};

export const sendSimpleEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createGmailTransporter();

    const result = await transporter.sendMail({
      from: 'Elite Surfing <pedrazzoliorlando@gmail.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default { sendOrderConfirmationEmail, sendSimpleEmail };
