const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @route POST /api/orders
const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

  const totals = cart.computeTotals();
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (paymentMethod === 'COD' ? 7 : 5));

  const order = await Order.create({
    user: req.user._id,
    items: cart.items.map(i => ({
      product: i.product._id,
      name: i.name,
      image: i.image,
      price: i.price,
      qty: i.qty,
      size: i.size,
      color: i.color
    })),
    shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    itemsPrice: totals.subtotal,
    shippingPrice: totals.shipping,
    taxPrice: totals.tax,
    discountAmount: totals.discount,
    totalPrice: totals.total,
    couponCode: cart.couponCode,
    isPaid: paymentMethod !== 'COD',
    paidAt: paymentMethod !== 'COD' ? new Date() : null,
    estimatedDelivery
  });

  // Clear cart after order
  cart.items = []; cart.couponCode = null; cart.discountAmount = 0;
  await cart.save();

  res.status(201).json({ success: true, order });
};

// @route GET /api/orders/my
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
};

// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, order });
};

// @route GET /api/orders (admin)
const getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { status } : {};
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
};

// @route PUT /api/orders/:id/status (admin)
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.status = status;
  if (status === 'delivered') { order.isDelivered = true; order.deliveredAt = new Date(); }
  await order.save();
  res.json({ success: true, order });
};

// @route GET /api/orders/stats (admin)
const getOrderStats = async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const revenue = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);
  const statusCounts = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name');
  res.json({ success: true, totalOrders, totalRevenue: revenue[0]?.total || 0, statusCounts, recentOrders });
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getOrderStats };
