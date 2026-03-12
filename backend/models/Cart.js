const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  qty: { type: Number, default: 1, min: 1 },
  size: String,
  color: String
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 }
}, { timestamps: true });

// Compute totals
cartSchema.methods.computeTotals = function() {
  const subtotal = this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const discount = this.discountAmount || 0;
  const total = subtotal + shipping + tax - discount;
  return { subtotal, shipping, tax, discount, total };
};

module.exports = mongoose.model('Cart', cartSchema);
