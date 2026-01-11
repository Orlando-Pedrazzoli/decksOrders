import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: Array, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  
  // 🆕 STOCK - quantidade disponível
  stock: { type: Number, default: 0 },
  
  // 🆕 SISTEMA DE FAMÍLIA DE PRODUTOS
  // Produtos com o mesmo productFamily são variações de cor do mesmo produto base
  // Ex: "deck-jbay" agrupa "Deck J-Bay Preto", "Deck J-Bay Azul", etc.
  productFamily: { type: String, default: null, index: true },
  
  // Cor deste produto específico
  color: { type: String, default: null },      // "Preto", "Azul", "Vermelho"
  colorCode: { type: String, default: null },  // "#000000", "#3B82F6", "#EF4444"
  
  // inStock será calculado automaticamente
  inStock: { type: Boolean, default: true },
  
}, { timestamps: true });

// 🎯 PRE-SAVE: Calcular inStock automaticamente baseado no stock
productSchema.pre('save', function(next) {
  this.inStock = this.stock > 0;
  next();
});

// 🎯 MÉTODO: Decrementar stock
productSchema.methods.decrementStock = async function(quantity) {
  if (this.stock < quantity) {
    throw new Error(`Stock insuficiente. Disponível: ${this.stock}, Pedido: ${quantity}`);
  }
  
  this.stock = Math.max(0, this.stock - quantity);
  this.inStock = this.stock > 0;
  
  return this.save();
};

// 🎯 INDEX: Para buscar produtos da mesma família rapidamente
productSchema.index({ productFamily: 1, color: 1 });
productSchema.index({ category: 1 });

// Garantir que virtuals são incluídos em JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.models.product || mongoose.model('product', productSchema);

export default Product;