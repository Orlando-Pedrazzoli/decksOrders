// server/services/emailService.js - COM FALLBACK PARA EMAIL DO ENDEREÇO

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
    // ✅ SOLUÇÃO: Determinar qual email usar
    let emailToSend = user.email;

    // Se o email do usuário for inválido ou for o seu email, use o do endereço
    if (
      !user.email ||
      user.email === '' ||
      user.email === 'pedrazzoliorlando@gmail.com'
    ) {
      console.log('⚠️ Email do usuário inválido, usando email do endereço');
      emailToSend = address.email;
    }

    // ✅ VALIDAÇÃO FINAL: Verificar se temos um email válido
    if (!emailToSend || emailToSend === '') {
      console.error('❌ Nenhum email válido encontrado');
      console.error('❌ user.email:', user.email);
      console.error('❌ address.email:', address.email);
      return {
        success: false,
        error: 'Nenhum email válido encontrado para envio',
      };
    }

    console.log('📧 Enviando email via Gmail para:', emailToSend);
    console.log(
      '📧 Fonte do email:',
      user.email === emailToSend ? 'usuário' : 'endereço'
    );

    const transporter = createGmailTransporter();
    const emailHtml = createOrderEmailTemplate(order, user, products, address);

    const mailOptions = {
      from: {
        name: 'Elite Surfing',
        address: process.env.GMAIL_USER,
      },
      to: emailToSend, // ← Email correto (usuário ou endereço)
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

    console.log('✅ Email enviado via Gmail. ID:', result.messageId);
    console.log('✅ Email enviado para:', emailToSend);

    return {
      success: true,
      messageId: result.messageId,
      message: `Email enviado para ${emailToSend}`,
      recipient: emailToSend,
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

export default { sendOrderConfirmationEmail, sendSimpleEmail };
