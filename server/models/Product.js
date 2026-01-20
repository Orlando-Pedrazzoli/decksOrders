import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    offerPrice: {
      type: Number,
      required: true,
    },
    image: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    // 🆕 Campo group para hierarquia
    group: {
      type: String,
      default: null,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    // Sistema de Família/Cor
    productFamily: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
    colorCode: {
      type: String,
      default: null,
    },
    // 🆕 Segunda cor para produtos bicolor
    colorCode2: {
      type: String,
      default: null,
    },
    isMainVariant: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para performance
productSchema.index({ category: 1, inStock: 1 });
productSchema.index({ productFamily: 1 });
productSchema.index({ group: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;