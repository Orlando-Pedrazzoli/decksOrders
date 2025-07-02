// server/services/emailService.js - VERSÃO SIMPLIFICADA
import { Resend } from 'resend';
import { createOrderEmailTemplate } from '../emails/OrderConfirmationEmail.js';

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Função para enviar email de confirmação de encomenda
export const sendOrderConfirmationEmail = async (
  order,
  user,
  products,
  address
) => {
  try {
    console.log('📧 Tentando enviar email para:', user.email);

    // Gerar HTML do email
    const emailHtml = createOrderEmailTemplate(order, user, products, address);

    // Enviar email usando Resend
    const { data, error } = await resend.emails.send({
      from: 'Elite Surfing <onboarding@resend.dev>', // Domínio de teste
      to: [user.email],
      subject: `Confirmação de Encomenda #${order._id} - Elite Surfing`,
      html: emailHtml,
      // Versão texto simples
      text: `
        Olá ${user.name},
        
        Obrigado pela sua compra! A sua encomenda #${order._id} foi processada com sucesso.
        
        Total: €${order.amount.toFixed(2)}
        Data: ${new Date(order.createdAt).toLocaleDateString('pt-PT')}
        
        Um email detalhado foi enviado para ${user.email}.
        
        Obrigado por escolher a Elite Surfing!
        www.elitesurfing.pt
      `,
    });

    if (error) {
      console.error('❌ Erro Resend:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Email enviado via Resend. ID:', data.id);
    return {
      success: true,
      id: data.id,
      message: `Email enviado para ${user.email}`,
    };
  } catch (error) {
    console.error('❌ Erro ao enviar email via Resend:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido no envio de email',
    };
  }
};

// Função auxiliar para emails simples
export const sendSimpleEmail = async (to, subject, html, text = null) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Elite Surfing <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default { sendOrderConfirmationEmail, sendSimpleEmail };
