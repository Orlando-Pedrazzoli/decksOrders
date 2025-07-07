// server/services/emailService.js - VERSÃO CORRIGIDA COMPLETA

import nodemailer from 'nodemailer';
import { createOrderEmailTemplate } from '../emails/OrderConfirmationEmail.js';

const createGmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

export const sendOrderConfirmationEmail = async (
  order,
  user,
  products,
  address
) => {
  try {
    // ✅ VALIDAÇÃO: Verificar se o email do usuário existe
    if (!user.email || user.email === '') {
      console.error('❌ Email do usuário não fornecido:', user);
      return {
        success: false,
        error: 'Email do usuário não encontrado',
      };
    }

    console.log('📧 Enviando email via Gmail para:', user.email);
    console.log('📧 Dados do usuário:', {
      name: user.name,
      email: user.email,
      id: user._id,
    });

    const transporter = createGmailTransporter();

    // Gerar HTML do email
    const emailHtml = createOrderEmailTemplate(order, user, products, address);

    // ✅ CORREÇÃO: Configuração de email corrigida
    const mailOptions = {
      from: {
        name: 'Elite Surfing',
        address: process.env.GMAIL_USER, // ← Usar a variável de ambiente
      },
      to: user.email, // ← Este deve ser o email do cliente
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

    console.log('📧 Configuração do email:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    // Enviar email
    const result = await transporter.sendMail(mailOptions);

    console.log('✅ Email enviado via Gmail. ID:', result.messageId);
    console.log('✅ Email enviado para:', user.email);

    return {
      success: true,
      messageId: result.messageId,
      message: `Email enviado para ${user.email}`,
      recipient: user.email, // ← Para debug
    };
  } catch (error) {
    console.error('❌ Erro ao enviar email via Gmail:', error);
    console.error('❌ Email que tentou enviar para:', user?.email);
    return {
      success: false,
      error: error.message || 'Erro desconhecido no envio de email',
    };
  }
};

// ✅ FUNÇÃO AUXILIAR: Função para emails simples (necessária para o export)
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
    return { success: false, error: error.message };
  }
};

// ✅ EXPORT DEFAULT: Agora ambas as funções estão definidas
export default { sendOrderConfirmationEmail, sendSimpleEmail };
