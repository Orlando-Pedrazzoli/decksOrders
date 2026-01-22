import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // ✅ userId agora é opcional para suportar guest checkout
    userId: { type: String, ref: 'user', default: null },
    
    // 🆕 CAMPOS PARA GUEST CHECKOUT
    isGuestOrder: { type: Boolean, default: false },
    guestEmail: { type: String, default: null },
    guestName: { type: String, default: null },
    guestPhone: { type: String, default: null },
    
    items: [
      {
        product: { type: String, required: true, ref: 'Product' },
        quantity: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: String, required: true, ref: 'address' },
    status: { type: String, default: 'Order Placed' },
    paymentType: { type: String, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    promoCode: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    originalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

// 🆕 Index para buscar pedidos por guestEmail (para converter depois)
orderSchema.index({ guestEmail: 1 });
orderSchema.index({ userId: 1 });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);

export default Order;