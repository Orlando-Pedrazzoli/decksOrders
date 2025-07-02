// server/emails/OrderConfirmationEmail.js
export const createOrderEmailTemplate = (order, user, products, address) => {
  // Criar HTML dos items da encomenda
  const itemsHTML = order.items
    .map(item => {
      const product = products.find(
        p => p._id.toString() === item.product.toString()
      );
      if (!product) return '';

      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 15px; text-align: left;">
            <strong>${product.name}</strong><br>
            <small style="color: #666;">Categoria: ${product.category}</small>
          </td>
          <td style="padding: 15px; text-align: center;">${item.quantity}</td>
          <td style="padding: 15px; text-align: right;">€${product.offerPrice.toFixed(2)}</td>
          <td style="padding: 15px; text-align: right; font-weight: bold;">€${(product.offerPrice * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    })
    .filter(Boolean)
    .join('');

  // Template HTML completo
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmação de Encomenda</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Elite Surfing</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Confirmação de Encomenda</p>
      </div>

      <!-- Main Content -->
      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
        
        <!-- Greeting -->
        <h2 style="color: #333; margin-bottom: 20px;">Olá ${user.name}! 👋</h2>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
          Muito obrigado pela sua compra! A sua encomenda foi processada com sucesso e está a ser preparada para envio.
        </p>

        <!-- Order Info -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0; color: #495057;">📋 Detalhes da Encomenda</h3>
          <p style="margin: 5px 0;"><strong>Número da Encomenda:</strong> #${order._id}</p>
          <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date(order.createdAt).toLocaleDateString('pt-PT')}</p>
          <p style="margin: 5px 0;"><strong>Método de Pagamento:</strong> ${order.paymentType === 'COD' ? 'Pagamento na Entrega' : 'Pagamento Online'}</p>
          <p style="margin: 5px 0;"><strong>Estado:</strong> ${order.status === 'Order Placed' ? 'Encomenda Efetuada' : order.status}</p>
        </div>

        <!-- Items Table -->
        <h3 style="color: #333; margin-bottom: 15px;">🛒 Artigos Encomendados</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1px solid #ddd;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Produto</th>
              <th style="padding: 15px; text-align: center; border-bottom: 2px solid #dee2e6;">Qtd</th>
              <th style="padding: 15px; text-align: right; border-bottom: 2px solid #dee2e6;">Preço Unit.</th>
              <th style="padding: 15px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr style="background: #f8f9fa; font-weight: bold;">
              <td colspan="3" style="padding: 15px; text-align: right; border-top: 2px solid #dee2e6;">
                <strong>Total da Encomenda:</strong>
              </td>
              <td style="padding: 15px; text-align: right; border-top: 2px solid #dee2e6; color: #28a745; font-size: 18px;">
                €${order.amount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- Shipping Address -->
        ${
          address
            ? `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0; color: #495057;">🏠 Morada de Entrega</h3>
          <p style="margin: 0; line-height: 1.5;">
            ${address.firstName} ${address.lastName}<br>
            ${address.street}<br>
            ${address.city}, ${address.state} ${address.zipcode}<br>
            ${address.country}<br>
            <br>
            📧 ${address.email}<br>
            📱 ${address.phone}
          </p>
        </div>
        `
            : ''
        }

        <!-- Next Steps -->
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0; color: #1976d2;">📦 Próximos Passos</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Iremos processar e preparar a sua encomenda</li>
            <li style="margin-bottom: 8px;">Receberá um email de confirmação de envio com o código de rastreamento</li>
            <li style="margin-bottom: 8px;">O tempo estimado de entrega é de 2-5 dias úteis</li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee;">
          <p style="margin: 0 0 10px 0; color: #666;">
            Tem alguma questão sobre a sua encomenda?
          </p>
          <p style="margin: 0; color: #666;">
            Contacte-nos: <a href="mailto:suporte@elitesurfing.pt" style="color: #667eea;">suporte@elitesurfing.pt</a>
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          Obrigado por escolher a Elite Surfing! 🏄‍♂️<br>
          <a href="https://elitesurfing.pt" style="color: #667eea;">www.elitesurfing.pt</a>
        </p>
      </div>

    </body>
    </html>
  `;
};

export default { createOrderEmailTemplate };
