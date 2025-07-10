import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: 'user' },
    orderId: { type: String, required: true, ref: 'order' },
    productId: { type: String, required: true, ref: 'product' },

    // Dados do review
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxlength: 100 },
    comment: { type: String, required: true, maxlength: 500 },

    // Informações do usuário (para exibição)
    userName: { type: String, required: true },
    userLocation: { type: String, default: 'Portugal' },

    // Status e moderação
    isApproved: { type: Boolean, default: true }, // Auto-aprovado por padrão
    isVerifiedPurchase: { type: Boolean, default: true }, // Sempre true pois vem de pedidos

    // Helpful votes (opcional para futuro)
    helpfulVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Índices para performance
reviewSchema.index({ productId: 1, isApproved: 1 });
reviewSchema.index({ userId: 1, orderId: 1, productId: 1 }, { unique: true }); // Previne reviews duplicados

const Review = mongoose.models.review || mongoose.model('review', reviewSchema);

export default Review;
