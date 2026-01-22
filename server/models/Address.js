import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  // ✅ userId agora é opcional para suportar guest checkout
  userId: { type: String, required: false, default: null },
  
  // 🆕 Flag para identificar moradas de guest
  isGuestAddress: { type: Boolean, default: false },
  
  // Campos originais mantidos
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
});

// Index para performance
addressSchema.index({ userId: 1 });

const Address =
  mongoose.models.address || mongoose.model('address', addressSchema);

export default Address;