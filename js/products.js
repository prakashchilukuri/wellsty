const products = [
    {
        id: 1,
        title: "Heavyweight Boxy Tee",
        category: "Fashion",
        price: 45.00,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        description: "Premium 300GSM cotton tee with a modern boxy fit."
    },
    {
        id: 2,
        title: "Urban Cargo Pants",
        category: "Fashion",
        price: 85.00,
        image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800",
        description: "Versatile cargo pants with utility pockets and adjustable cuffs."
    },
    {
        id: 3,
        title: "Rose Gold Analogue Watch",
        category: "Accessories",
        price: 145.00,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1976",
        description: "Elegant rose gold watch with a minimalist face."
    },
    {
        id: 4,
        title: "Canvas Travel Backpack",
        category: "Accessories",
        price: 85.00,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
        description: "Durable canvas backpack perfect for daily commute or travel."
    },
    {
        id: 5,
        title: "Classic Aviator Shades",
        category: "Accessories",
        price: 35.00,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
        description: "Timeless aviator design with UV protection."
    }
];

// Helper to get products by category
function getProductsByCategory(category) {
    return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

// Helper to get product by ID
function getProductById(id) {
    return products.find(p => p.id === parseInt(id));
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { products, getProductsByCategory, getProductById };
}
