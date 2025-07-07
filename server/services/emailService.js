// server/services/emailService.js - VERSÃO CORRIGIDA
import nodemailer from 'nodemailer';
import { createOrderEmailTemplate } from '../emails/OrderConfirmationEmail.js';

// Configurar transporter do Gmail
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    // ← SEM "er" no final!
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
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
      // Versão texto simples
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

// Função auxiliar para emails simples
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
