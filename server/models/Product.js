import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: Array, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  
  // 🆕 GROUP - Agrupamento de categorias (Decks, Leashes, Capas, Wax)
  group: { type: String, default: null },
  
  // STOCK - Quantidade disponível
  stock: { type: Number, default: 0 },
  
  // SISTEMA DE FAMÍLIA/COR
  productFamily: { type: String, default: null },  // Slug: "deck-jbay"
  color: { type: String, default: null },          // Nome: "Preto"
  colorCode: { type: String, default: null },      // Hex: "#000000"
  isMainVariant: { type: Boolean, default: true }, // Aparece na listagem?
  
  // Mantido por compatibilidade (calculado a partir do stock)
  inStock: { type: Boolean, default: true },
  
}, { timestamps: true });

// 🎯 Middleware: Atualizar inStock baseado no stock
productSchema.pre('save', function(next) {
  this.inStock = this.stock > 0;
  next();
});

productSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.stock !== undefined) {
    update.inStock = update.stock > 0;
  }
  next();
});

// 🎯 Index para busca rápida
productSchema.index({ productFamily: 1 });
productSchema.index({ isMainVariant: 1 });
productSchema.index({ group: 1 });      // 🆕 Index para busca por group
productSchema.index({ category: 1 });   // 🆕 Index para busca por categoria

const Product = mongoose.models.product || mongoose.model('product', productSchema);

export default Product;