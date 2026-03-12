const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @route GET /api/cart
const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price stock');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  const totals = cart.computeTotals();
  res.json({ success: true, cart, totals });
};

// @route POST /api/cart
const addToCart = async (req, res) => {
  const { productId, qty = 1, size, color } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  
  const existingItem = cart.items.find(i => i.product.toString() === productId && i.size === size && i.color === color);
  if (existingItem) {
    existingItem.qty = Math.min(existingItem.qty + qty, 10);
  } else {
    cart.items.push({ product: productId, name: product.name, image: product.images[0], price: product.price, qty, size, color });
  }
  await cart.save();
  const totals = cart.computeTotals();
  res.json({ success: true, cart, totals, message: 'Added to cart' });
};

// @route PUT /api/cart/:itemId
const updateCartItem = async (req, res) => {
  const { qty } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  
  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  
  if (qty <= 0) {
    item.deleteOne();
  } else {
    item.qty = Math.min(qty, 10);
  }
  await cart.save();
  const totals = cart.computeTotals();
  res.json({ success: true, cart, totals });
};

// @route DELETE /api/cart/:itemId
const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
  await cart.save();
  const totals = cart.computeTotals();
  res.json({ success: true, cart, totals });
};

// @route DELETE /api/cart
const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) { cart.items = []; cart.couponCode = null; cart.discountAmount = 0; await cart.save(); }
  res.json({ success: true, message: 'Cart cleared' });
};

// @route POST /api/cart/coupon
const applyCoupon = async (req, res) => {
  const { code } = req.body;
  const coupons = { 'WELLSTY10': 10, 'FIRST20': 20, 'STYLE15': 15 }; // percent
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  
  const discount = coupons[code?.toUpperCase()];
  if (!discount) return res.status(400).json({ success: false, message: 'Invalid coupon code' });
  
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  cart.couponCode = code.toUpperCase();
  cart.discountAmount = Math.round(subtotal * discount / 100);
  await cart.save();
  const totals = cart.computeTotals();
  res.json({ success: true, discountPercent: discount, cart, totals, message: `${discount}% discount applied!` });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon };
