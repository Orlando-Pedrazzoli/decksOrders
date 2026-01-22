import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: 'user' },
    items: [
      {
        product: { type: String, required: true, ref: 'Product' }, // ✅ Corrigido: 'product' → 'Product'
        quantity: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true }, // Valor final após desconto
    address: { type: String, required: true, ref: 'address' },
    status: { type: String, default: 'Order Placed' },
    paymentType: { type: String, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    promoCode: { type: String, default: null }, // Código promocional usado
    discountAmount: { type: Number, default: 0 }, // Valor do desconto aplicado em euros
    discountPercentage: { type: Number, default: 0 }, // Percentagem do desconto (ex: 30)
    originalAmount: { type: Number, required: true }, // Valor original antes do desconto
  },
  { timestamps: true }
);

const Order = mongoose.models.order || mongoose.model('order', orderSchema);

export default Order;