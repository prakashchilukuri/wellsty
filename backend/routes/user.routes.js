const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// @route GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price discount brand');
  res.json({ success: true, user });
});

// @route PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar }, { new: true });
  res.json({ success: true, user });
});

// @route PUT /api/users/password
router.put('/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});

// @route GET/POST /api/users/addresses
router.get('/addresses', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses');
  res.json({ success: true, addresses: user.addresses });
});

router.post('/addresses', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach(a => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
});

router.delete('/addresses/:addressId', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});

// @route GET/PUT /api/users/wishlist
router.get('/wishlist', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price discount brand rating numReviews');
  res.json({ success: true, wishlist: user.wishlist });
});

router.put('/wishlist/:productId', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const idx = user.wishlist.indexOf(productId);
  let added;
  if (idx > -1) { user.wishlist.splice(idx, 1); added = false; }
  else { user.wishlist.push(productId); added = true; }
  await user.save();
  res.json({ success: true, added, wishlist: user.wishlist });
});

// Admin: get all users
router.get('/', protect, admin, async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users, total: users.length });
});

module.exports = router;
