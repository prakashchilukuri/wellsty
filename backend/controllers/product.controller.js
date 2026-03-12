const Product = require('../models/Product');

// @route GET /api/products
const getProducts = async (req, res) => {
  const { category, brand, minPrice, maxPrice, sort, search, page = 1, limit = 12, featured, trending, newArrival } = req.query;
  
  let query = {};
  if (category) query.category = category;
  if (brand) query.brand = { $in: brand.split(',') };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (featured === 'true') query.isFeatured = true;
  if (trending === 'true') query.isTrending = true;
  if (newArrival === 'true') query.isNewArrival = true;
  if (search) query.$text = { $search: search };

  let sortOption = {};
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'rating') sortOption = { rating: -1 };
  else if (sort === 'newest') sortOption = { createdAt: -1 };
  else if (sort === 'discount') sortOption = { discount: -1 };
  else sortOption = { isFeatured: -1, createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query).sort(sortOption).skip(skip).limit(Number(limit)).select('-reviews');
  
  res.json({
    success: true,
    products,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total
  });
};

// @route GET /api/products/:id
const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

// @route POST /api/products (admin)
const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
};

// @route PUT /api/products/:id (admin)
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
};

// @route DELETE /api/products/:id (admin)
const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product deleted' });
};

// @route POST /api/products/:id/reviews
const addReview = async (req, res) => {
  const { rating, title, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  
  // Check if user already reviewed
  const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) return res.status(400).json({ success: false, message: 'Already reviewed' });
  
  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    avatar: req.user.avatar,
    rating: Number(rating),
    title,
    comment
  });
  product.updateRating();
  await product.save();
  res.status(201).json({ success: true, message: 'Review added' });
};

// @route GET /api/products/stats (admin)
const getStats = async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const lowStock = await Product.countDocuments({ stock: { $lt: 10 } });
  const categories = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  res.json({ success: true, totalProducts, lowStock, categories });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getStats };
