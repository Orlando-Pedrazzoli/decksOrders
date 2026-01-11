import mongoose from "mongoose";

// Schema para variantes de cor
const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },      // Nome da cor: "Azul Marinho"
  colorCode: { type: String, required: true },  // Código hex: "#1e3a5f"
  images: [{ type: String }],                   // URLs das imagens desta variante
  stock: { type: Number, default: 0 },          // Stock específico desta variante
  price: { type: Number },                      // Preço específico (opcional)
  offerPrice: { type: Number },                 // Preço promocional (opcional)
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: Array, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  image: { type: Array, required: true },       // Imagens principais (ou do produto sem variantes)
  category: { type: String, required: true },
  
  // 🆕 STOCK - quantidade disponível (para produtos sem variantes)
  stock: { type: Number, default: 0 },
  
  // 🆕 VARIANTES DE COR
  variants: [variantSchema],
  
  // inStock será calculado automaticamente via virtual/middleware
  inStock: { type: Boolean, default: true },
  
}, { timestamps: true });

// 🎯 PRE-SAVE: Calcular inStock automaticamente baseado no stock
productSchema.pre('save', function(next) {
  // Se tem variantes, verificar se alguma tem stock > 0
  if (this.variants && this.variants.length > 0) {
    this.inStock = this.variants.some(v => v.stock > 0);
  } else {
    // Sem variantes, usar o stock geral
    this.inStock = this.stock > 0;
  }
  next();
});

// 🎯 MÉTODO: Obter stock total (soma de todas as variantes ou stock geral)
productSchema.methods.getTotalStock = function() {
  if (this.variants && this.variants.length > 0) {
    return this.variants.reduce((total, v) => total + v.stock, 0);
  }
  return this.stock;
};

// 🎯 MÉTODO: Obter stock de uma variante específica
productSchema.methods.getVariantStock = function(variantId) {
  if (!this.variants || this.variants.length === 0) {
    return this.stock;
  }
  const variant = this.variants.id(variantId);
  return variant ? variant.stock : 0;
};

// 🎯 MÉTODO: Decrementar stock
productSchema.methods.decrementStock = async function(quantity, variantId = null) {
  if (variantId && this.variants && this.variants.length > 0) {
    const variant = this.variants.id(variantId);
    if (variant) {
      variant.stock = Math.max(0, variant.stock - quantity);
    }
  } else {
    this.stock = Math.max(0, this.stock - quantity);
  }
  
  // Recalcular inStock
  if (this.variants && this.variants.length > 0) {
    this.inStock = this.variants.some(v => v.stock > 0);
  } else {
    this.inStock = this.stock > 0;
  }
  
  return this.save();
};

// 🎯 VIRTUAL: Stock total disponível
productSchema.virtual('totalStock').get(function() {
  if (this.variants && this.variants.length > 0) {
    return this.variants.reduce((total, v) => total + v.stock, 0);
  }
  return this.stock;
});

// Garantir que virtuals são incluídos em JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.models.product || mongoose.model('product', productSchema);

export default Product;