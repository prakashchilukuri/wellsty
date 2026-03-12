require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const products = [
  // ===== MEN'S FASHION =====
  { name: "Heavyweight Boxy Streetwear Tee", description: "Premium 300GSM cotton tee with a modern boxy fit, perfect for streetwear looks.", price: 1299, originalPrice: 1999, discount: 35, category: "mens-fashion", subcategory: "T-Shirts", brand: "Wellsty", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800"], sizes: ["S","M","L","XL","XXL"], colors: ["Black","White","Grey"], stock: 150, isFeatured: true, isTrending: true, rating: 4.5, numReviews: 234, material: "100% Cotton", tags: ["tshirt", "streetwear", "mens"] },
  { name: "Urban Cargo Trousers", description: "Versatile cargo pants with utility pockets and adjustable cuffs for the urban explorer.", price: 2499, originalPrice: 3499, discount: 29, category: "mens-fashion", subcategory: "Trousers", brand: "Wellsty", images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop"], sizes: ["28","30","32","34","36"], colors: ["Olive","Black","Khaki"], stock: 80, isFeatured: true, rating: 4.3, numReviews: 89, material: "Cotton Blend", tags: ["cargo", "pants", "mens"] },
  { name: "Oversized Acid Wash Hoodie", description: "Street-ready oversized hoodie with premium acid wash finish and kangaroo pocket.", price: 2199, originalPrice: 2999, discount: 27, category: "mens-fashion", subcategory: "Hoodies", brand: "Street Code", images: ["https://images.unsplash.com/photo-1556821840-3a63f15732cd?w=800&auto=format&fit=crop"], sizes: ["S","M","L","XL","XXL"], colors: ["Grey","Blue","Green"], stock: 120, isTrending: true, rating: 4.7, numReviews: 312, material: "Fleece Cotton", tags: ["hoodie", "oversized", "streetwear"] },
  { name: "Classic Slim Chino Pants", description: "Tailored slim-fit chinos crafted from premium stretch cotton for all-day comfort.", price: 1999, originalPrice: 2799, discount: 29, category: "mens-fashion", subcategory: "Trousers", brand: "Brooks Club", images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop"], sizes: ["28","30","32","34","36","38"], colors: ["Beige","Navy","Olive"], stock: 200, rating: 4.2, numReviews: 156, tags: ["chinos", "pants", "formal"] },
  { name: "Graphic Art Print Tee", description: "Limited edition artist collaboration tee with detailed front graphic print.", price: 999, originalPrice: 1499, discount: 33, category: "mens-fashion", subcategory: "T-Shirts", brand: "Wellsty", images: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&auto=format&fit=crop"], sizes: ["S","M","L","XL"], colors: ["White","Black"], stock: 50, isNewArrival: true, rating: 4.6, numReviews: 67, tags: ["graphic tee", "art", "limited"] },
  { name: "Denim Trucker Jacket", description: "Vintage-inspired denim trucker jacket with faded wash and distressed details.", price: 3499, originalPrice: 4999, discount: 30, category: "mens-fashion", subcategory: "Jackets", brand: "Denim Co", images: ["https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&auto=format&fit=crop"], sizes: ["S","M","L","XL","XXL"], colors: ["Blue","Black","Light Blue"], stock: 60, isFeatured: true, rating: 4.8, numReviews: 189, tags: ["denim", "jacket", "vintage"] },
  { name: "Relaxed Linen Shirt", description: "Breathable pure linen shirt with a relaxed fit, ideal for summer styling.", price: 1799, originalPrice: 2299, discount: 22, category: "mens-fashion", subcategory: "Shirts", brand: "Lino", images: ["https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop"], sizes: ["S","M","L","XL","XXL"], colors: ["White","Sky Blue","Cream"], stock: 90, isNewArrival: true, rating: 4.4, numReviews: 78, tags: ["linen", "shirt", "summer"] },
  { name: "Jogger Track Pants", description: "Premium fleece joggers with tapered fit and drawstring waistband.", price: 1499, originalPrice: 1999, discount: 25, category: "mens-fashion", subcategory: "Activewear", brand: "ActiveFlex", images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop"], sizes: ["S","M","L","XL","XXL"], colors: ["Black","Grey","Navy"], stock: 180, isTrending: true, rating: 4.3, numReviews: 245, tags: ["joggers", "activewear", "gym"] },

  // ===== WOMEN'S FASHION =====
  { name: "Floral Wrap Midi Dress", description: "Effortlessly chic wrap dress in vibrant floral print, perfect for any occasion.", price: 2299, originalPrice: 3499, discount: 34, category: "womens-fashion", subcategory: "Dresses", brand: "Bloom Collective", images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop"], sizes: ["XS","S","M","L","XL"], colors: ["Pink Floral","Blue Floral","Yellow Floral"], stock: 95, isFeatured: true, isTrending: true, rating: 4.8, numReviews: 423, tags: ["dress", "floral", "midi"] },
  { name: "High Waist Wide Leg Trousers", description: "Sophisticated wide-leg trousers with a flattering high waist and fluid drape.", price: 2199, originalPrice: 2999, discount: 27, category: "womens-fashion", subcategory: "Trousers", brand: "FemFit", images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop"], sizes: ["XS","S","M","L","XL","XXL"], colors: ["Black","Cream","Terracotta"], stock: 110, rating: 4.5, numReviews: 198, tags: ["wide leg", "trousers", "formal"] },
  { name: "Crop Knit Cardigan", description: "Soft ribbed knit crop cardigan, a wardrobe essential for layering.", price: 1699, originalPrice: 2199, discount: 23, category: "womens-fashion", subcategory: "Tops", brand: "Cozy Club", images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop"], sizes: ["XS","S","M","L","XL"], colors: ["Camel","Cream","Dusty Pink","Grey"], stock: 130, isTrending: true, isNewArrival: true, rating: 4.6, numReviews: 267, tags: ["cardigan", "knit", "crop"] },
  { name: "Satin Slip Skirt", description: "Luxurious satin slip skirt with a bias cut that flatters every silhouette.", price: 1999, originalPrice: 2799, discount: 29, category: "womens-fashion", subcategory: "Skirts", brand: "Silk & Co", images: ["https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop"], sizes: ["XS","S","M","L","XL"], colors: ["Champagne","Black","Dusty Rose"], stock: 75, isFeatured: true, rating: 4.7, numReviews: 145, tags: ["satin", "slip", "skirt"] },
  { name: "Printed Boho Maxi Dress", description: "Free-spirited boho maxi dress with intricate block print and smocked bodice.", price: 2799, originalPrice: 3999, discount: 30, category: "womens-fashion", subcategory: "Dresses", brand: "Bloom Collective", images: ["https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&auto=format&fit=crop"], sizes: ["S","M","L","XL"], colors: ["Burnt Orange","Teal","Deep Purple"], stock: 65, rating: 4.9, numReviews: 389, tags: ["boho", "maxi", "printed"] },
  { name: "Classic White Linen Blazer", description: "Structured linen blazer that transitions seamlessly from office to evening.", price: 3999, originalPrice: 5499, discount: 27, category: "womens-fashion", subcategory: "Blazers", brand: "Office Luxe", images: ["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&auto=format&fit=crop"], sizes: ["XS","S","M","L","XL"], colors: ["White","Ivory","Sage"], stock: 45, isFeatured: true, rating: 4.7, numReviews: 112, tags: ["blazer", "formal", "office"] },
  { name: "Puff Sleeve Crop Top", description: "Trendy puff sleeve crop top with elasticated cuffs, pairs perfectly with high waist bottoms.", price: 999, originalPrice: 1499, discount: 33, category: "womens-fashion", subcategory: "Tops", brand: "Trend Tribe", images: ["https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&auto=format&fit=crop"], sizes: ["XS","S","M","L","XL"], colors: ["Black","White","Lilac","Mint"], stock: 160, isTrending: true, rating: 4.4, numReviews: 334, tags: ["crop top", "puff sleeve", "trendy"] },

  // ===== FOOTWEAR =====
  { name: "Air Cushion Running Sneakers", description: "Lightweight running shoes with advanced air cushion sole for maximum comfort.", price: 3499, originalPrice: 4999, discount: 30, category: "footwear", subcategory: "Sneakers", brand: "SwiftStep", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop"], sizes: ["6","7","8","9","10","11","12"], colors: ["White/Blue","Black/Red","All White"], stock: 200, isFeatured: true, isTrending: true, rating: 4.8, numReviews: 567, tags: ["sneakers", "running", "athletic"] },
  { name: "Chunky Sole Platform Boots", description: "Bold platform boots with chunky lug sole, adding serious edge to any outfit.", price: 4499, originalPrice: 5999, discount: 25, category: "footwear", subcategory: "Boots", brand: "EdgeWalk", images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop"], sizes: ["5","6","7","8","9","10"], colors: ["Black","Brown","White"], stock: 60, isFeatured: true, rating: 4.7, numReviews: 189, tags: ["boots", "platform", "chunky"] },
  { name: "Premium Leather Derby Shoes", description: "Handcrafted leather derby shoes with Goodyear welt construction for lasting style.", price: 5999, originalPrice: 7999, discount: 25, category: "footwear", subcategory: "Formal", brand: "Heritage Craft", images: ["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop"], sizes: ["7","8","9","10","11","12"], colors: ["Tan","Black","Dark Brown"], stock: 40, rating: 4.9, numReviews: 94, tags: ["leather", "formal", "derby"] },
  { name: "Canvas Low Top Sneakers", description: "Classic canvas low top sneakers — effortless, timeless, endlessly versatile.", price: 1999, originalPrice: 2499, discount: 20, category: "footwear", subcategory: "Sneakers", brand: "Canvas & Co", images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop"], sizes: ["6","7","8","9","10","11"], colors: ["White","Black","Navy","Red"], stock: 300, isTrending: true, rating: 4.5, numReviews: 445, tags: ["canvas", "casual", "sneakers"] },
  { name: "Suede Chelsea Boots", description: "Minimalist suede chelsea boots with elastic side panels for easy wear.", price: 3999, originalPrice: 5499, discount: 27, category: "footwear", subcategory: "Boots", brand: "Suede Society", images: ["https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=800&auto=format&fit=crop"], sizes: ["6","7","8","9","10","11"], colors: ["Tan","Black","Navy"], stock: 80, isNewArrival: true, rating: 4.6, numReviews: 123, tags: ["chelsea", "suede", "boots"] },
  { name: "Sport Slip-On Mules", description: "Comfortable slip-on mules with memory foam insole and sporty silhouette.", price: 1499, originalPrice: 1999, discount: 25, category: "footwear", subcategory: "Casual", brand: "EasyWalk", images: ["https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop"], sizes: ["5","6","7","8","9","10","11"], colors: ["Beige","Black","White"], stock: 150, rating: 4.2, numReviews: 278, tags: ["mules", "slip-on", "casual"] },

  // ===== ACCESSORIES =====
  { name: "Rose Gold Minimalist Watch", description: "Elegant rose gold watch with a sunburst dial and genuine leather strap.", price: 4999, originalPrice: 6999, discount: 29, category: "accessories", subcategory: "Watches", brand: "Tempo", images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop"], sizes: ["One Size"], colors: ["Rose Gold","Silver","Gold"], stock: 45, isFeatured: true, rating: 4.9, numReviews: 312, tags: ["watch", "rose gold", "minimalist"] },
  { name: "Premium Canvas Backpack", description: "Sturdy waxed canvas backpack with laptop compartment and multiple organizer pockets.", price: 2999, originalPrice: 3999, discount: 25, category: "accessories", subcategory: "Bags", brand: "Nomad Packs", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop"], sizes: ["One Size"], colors: ["Olive","Black","Tan"], stock: 70, isFeatured: true, isTrending: true, rating: 4.7, numReviews: 198, tags: ["backpack", "canvas", "travel"] },
  { name: "Aviator Sunglasses", description: "Classic gold-frame aviator sunglasses with polarized UV400 protection lenses.", price: 1499, originalPrice: 2499, discount: 40, category: "accessories", subcategory: "Eyewear", brand: "Ray Vision", images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop"], sizes: ["One Size"], colors: ["Gold/Green","Silver/Grey","Black"], stock: 200, isTrending: true, rating: 4.6, numReviews: 445, tags: ["sunglasses", "aviator", "polarized"] },
  { name: "Genuine Leather Belt", description: "Full-grain leather belt with brushed silver buckle, handstitched for durability.", price: 1299, originalPrice: 1799, discount: 28, category: "accessories", subcategory: "Belts", brand: "Leather Lane", images: ["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop"], sizes: ["28","30","32","34","36","38"], colors: ["Black","Tan","Dark Brown"], stock: 120, rating: 4.5, numReviews: 167, tags: ["belt", "leather", "formal"] },
  { name: "Wool Blend Beanie", description: "Warm double-knit beanie in premium wool blend with ribbed cuff design.", price: 599, originalPrice: 999, discount: 40, category: "accessories", subcategory: "Hats", brand: "Nordic Knit", images: ["https://images.unsplash.com/photo-1510598155-b69aae7a5b86?w=800&auto=format&fit=crop"], sizes: ["One Size"], colors: ["Charcoal","Cream","Forest Green","Burgundy"], stock: 250, isTrending: true, rating: 4.4, numReviews: 334, tags: ["beanie", "wool", "winter"] },
  { name: "Sterling Silver Chain Necklace", description: "Delicate sterling silver chain necklace with a modern geometric pendant.", price: 1999, originalPrice: 2999, discount: 33, category: "accessories", subcategory: "Jewellery", brand: "Silver & Soul", images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop"], sizes: ["One Size"], colors: ["Silver","Gold Plated"], stock: 85, isNewArrival: true, rating: 4.8, numReviews: 156, tags: ["necklace", "silver", "jewellery"] },
  { name: "Structured Leather Tote", description: "Sophisticated structured tote in pebbled leather with gold hardware accents.", price: 5999, originalPrice: 7999, discount: 25, category: "accessories", subcategory: "Bags", brand: "Carryall", images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop"], sizes: ["One Size"], colors: ["Camel","Black","Burgundy"], stock: 35, isFeatured: true, rating: 4.9, numReviews: 89, tags: ["tote", "leather", "bag"] },

  // ===== BEAUTY =====
  { name: "24K Gold Serum", description: "Luxury anti-aging face serum infused with 24K gold particles and hyaluronic acid.", price: 2499, originalPrice: 3499, discount: 29, category: "beauty", subcategory: "Skincare", brand: "Golden Glow", images: ["https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&auto=format&fit=crop"], sizes: ["30ml","50ml"], colors: ["N/A"], stock: 90, isFeatured: true, rating: 4.8, numReviews: 234, tags: ["serum", "gold", "anti-aging"] },
  { name: "Matte Nude Lipstick Set", description: "Set of 6 highly pigmented matte nude lipsticks in perfectly curated shades.", price: 1499, originalPrice: 2499, discount: 40, category: "beauty", subcategory: "Makeup", brand: "Color Pop", images: ["https://images.unsplash.com/photo-1586495777744-4e6232bf2f5f?w=800&auto=format&fit=crop"], sizes: ["Set of 6"], colors: ["Nude Shades"], stock: 150, isTrending: true, rating: 4.6, numReviews: 412, tags: ["lipstick", "matte", "makeup"] },
  { name: "Vitamin C Brightening Moisturizer", description: "Daily use brightening moisturizer with 15% Vitamin C and niacinamide for glowing skin.", price: 1299, originalPrice: 1799, discount: 28, category: "beauty", subcategory: "Skincare", brand: "Glow Lab", images: ["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop"], sizes: ["50ml","100ml"], colors: ["N/A"], stock: 200, isNewArrival: true, rating: 4.7, numReviews: 389, tags: ["moisturizer", "vitamin c", "glow"] },
  { name: "Luxury Perfume Eau de Parfum", description: "Sophisticated oriental fragrance with notes of oud, rose, and vanilla amber.", price: 3999, originalPrice: 5999, discount: 33, category: "beauty", subcategory: "Fragrance", brand: "Noir Parfums", images: ["https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&auto=format&fit=crop"], sizes: ["50ml","100ml"], colors: ["N/A"], stock: 60, isFeatured: true, rating: 4.9, numReviews: 178, tags: ["perfume", "oud", "fragrance"] },
  { name: "Hydrating Hair Mask", description: "Deep conditioning hair mask with argan oil, keratin, and biotin for lustrous locks.", price: 899, originalPrice: 1299, discount: 31, category: "beauty", subcategory: "Haircare", brand: "Silky Strands", images: ["https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800&auto=format&fit=crop"], sizes: ["200ml","400ml"], colors: ["N/A"], stock: 180, isTrending: true, rating: 4.5, numReviews: 298, tags: ["hair mask", "argan", "conditioning"] },

  // ===== ELECTRONICS =====
  { name: "Wireless Noise-Cancelling Headphones", description: "Premium over-ear headphones with 40hr battery, hybrid ANC, and LDAC codec support.", price: 12999, originalPrice: 17999, discount: 28, category: "electronics", subcategory: "Audio", brand: "SoundHaven", images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop"], sizes: ["One Size"], colors: ["Midnight Black","Cloud White","Sage Green"], stock: 55, isFeatured: true, isTrending: true, rating: 4.8, numReviews: 567, tags: ["headphones", "anc", "wireless"] },
  { name: "Smart Fitness Watch", description: "Advanced smartwatch with health sensors, GPS, SpO2, stress tracking, and 7-day battery.", price: 8999, originalPrice: 12999, discount: 31, category: "electronics", subcategory: "Wearables", brand: "FitPulse", images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop"], sizes: ["42mm","46mm"], colors: ["Black","Silver","Rose Gold"], stock: 80, isFeatured: true, rating: 4.7, numReviews: 345, tags: ["smartwatch", "fitness", "GPS"] },
  { name: "True Wireless Earbuds Pro", description: "Premium TWS earbuds with 6hr playtime, wireless charging case, and IPX5 rating.", price: 5999, originalPrice: 7999, discount: 25, category: "electronics", subcategory: "Audio", brand: "SoundHaven", images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop"], sizes: ["One Size"], colors: ["Black","White"], stock: 120, isTrending: true, rating: 4.6, numReviews: 423, tags: ["earbuds", "tws", "wireless"] },
  { name: "Portable Bluetooth Speaker", description: "360° surround sound portable speaker with 24hr battery, IPX7 waterproof, and party mode.", price: 3499, originalPrice: 4999, discount: 30, category: "electronics", subcategory: "Audio", brand: "BoomBox", images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop"], sizes: ["One Size"], colors: ["Black","Blue","Red"], stock: 95, isNewArrival: true, rating: 4.5, numReviews: 234, tags: ["speaker", "bluetooth", "portable"] },
  { name: "USB-C Fast Charging Power Bank", description: "25000mAh power bank with 65W PD fast charge, dual USB-A and USB-C ports.", price: 2999, originalPrice: 3999, discount: 25, category: "electronics", subcategory: "Accessories", brand: "ChargeMate", images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop"], sizes: ["One Size"], colors: ["Black","White"], stock: 140, rating: 4.6, numReviews: 312, tags: ["power bank", "fast charge", "portable"] }
];

const adminUser = {
  name: "Admin User",
  email: "admin@wellsty.com",
  password: "admin123456",
  role: "admin"
};

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wellsty');
  console.log('✅ MongoDB Connected for seeding');
};

const seedDB = async () => {
  await connectDB();
  
  // Clear existing data
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await Cart.deleteMany({});
  console.log('🗑️  Cleared existing data');
  
  // Create admin user
  const admin = await User.create(adminUser);
  console.log(`👤 Admin created: ${admin.email} / admin123456`);

  // Create test user
  const testUser = await User.create({
    name: "Test User",
    email: "user@wellsty.com",
    password: "user123456",
    role: "user"
  });
  console.log(`👤 Test user created: ${testUser.email} / user123456`);
  
  // Create products
  const createdProducts = await Product.insertMany(products);
  console.log(`✅ ${createdProducts.length} products seeded`);
  
  console.log('\n🎉 Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin     : admin@wellsty.com / admin123456');
  console.log('Test User : user@wellsty.com  / user123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
};

seedDB().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
