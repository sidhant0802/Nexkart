require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Seller = require('../models/Seller');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Wishlist = require('../models/Wishlist');

// ═══════════════════════════════════════════════════════
// BRAND DEFINITIONS
// ═══════════════════════════════════════════════════════

const BRANDS = [
  // ── Fashion Brands ──
  {
    name: "Nike",
    slug: "nike",
    logo: "https://logo.clearbit.com/nike.com",
    bannerImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200",
    description: "Just Do It. Nike delivers innovative products, experiences and services.",
    categories: ["men", "women", "footwear", "sportswear"],
    tagline: "Just Do It",
    featured: true,
  },
  {
    name: "Adidas",
    slug: "adidas",
    logo: "https://logo.clearbit.com/adidas.com",
    bannerImage: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200",
    description: "Impossible Is Nothing. German sportswear brand.",
    categories: ["men", "women", "footwear", "sportswear"],
    tagline: "Impossible Is Nothing",
    featured: true,
  },
  {
    name: "Puma",
    slug: "puma",
    logo: "https://logo.clearbit.com/puma.com",
    bannerImage: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1200",
    description: "Forever Faster. Athletic and casual footwear, apparel.",
    categories: ["men", "women", "footwear"],
    tagline: "Forever Faster",
    featured: true,
  },
  {
    name: "H&M",
    slug: "h-and-m",
    logo: "https://logo.clearbit.com/hm.com",
    bannerImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
    description: "Fashion and quality at the best price in a sustainable way.",
    categories: ["men", "women", "kids"],
    tagline: "Fashion for All",
    featured: true,
  },
  {
    name: "Zara",
    slug: "zara",
    logo: "https://logo.clearbit.com/zara.com",
    bannerImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200",
    description: "Spanish multinational fashion company.",
    categories: ["men", "women"],
    tagline: "Trendy Fashion",
    featured: true,
  },
  {
    name: "Levi's",
    slug: "levis",
    logo: "https://logo.clearbit.com/levi.com",
    bannerImage: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200",
    description: "Quality clothing including jeans, shirts, jackets.",
    categories: ["men", "women"],
    tagline: "Quality Never Goes Out of Style",
    featured: true,
  },

  // ── Electronics Brands ──
  {
    name: "Apple",
    slug: "apple",
    logo: "https://logo.clearbit.com/apple.com",
    bannerImage: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=1200",
    description: "Think Different. Premium electronics and accessories.",
    categories: ["electronics", "mobiles", "laptops"],
    tagline: "Think Different",
    featured: true,
  },
  {
    name: "Samsung",
    slug: "samsung",
    logo: "https://logo.clearbit.com/samsung.com",
    bannerImage: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200",
    description: "Do What You Can't. Korean multinational electronics.",
    categories: ["electronics", "mobiles", "laptops"],
    tagline: "Do What You Can't",
    featured: true,
  },
  {
    name: "OnePlus",
    slug: "oneplus",
    logo: "https://logo.clearbit.com/oneplus.com",
    bannerImage: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=1200",
    description: "Never Settle. Premium smartphones.",
    categories: ["electronics", "mobiles"],
    tagline: "Never Settle",
    featured: true,
  },
  {
    name: "Sony",
    slug: "sony",
    logo: "https://logo.clearbit.com/sony.com",
    bannerImage: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200",
    description: "Be Moved. Electronics, gaming, entertainment.",
    categories: ["electronics", "audio"],
    tagline: "Be Moved",
    featured: false,
  },

  // ── Home & Furniture ──
  {
    name: "IKEA",
    slug: "ikea",
    logo: "https://logo.clearbit.com/ikea.com",
    bannerImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200",
    description: "Swedish furniture and home accessories.",
    categories: ["home", "furniture"],
    tagline: "Designed for Everyday Life",
    featured: true,
  },
  {
    name: "Urban Ladder",
    slug: "urban-ladder",
    logo: "https://logo.clearbit.com/urbanladder.com",
    bannerImage: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200",
    description: "India's premier online furniture brand.",
    categories: ["home", "furniture"],
    tagline: "Furniture for Modern Living",
    featured: false,
  },
];

// ═══════════════════════════════════════════════════════
// PRODUCT TEMPLATES PER BRAND
// ═══════════════════════════════════════════════════════

const PRODUCT_TEMPLATES = {
  nike: {
    category: "men",
    products: [
      { title: "Nike Air Max 270 - Black/White", color: "Black", mrp: 12999, sell: 9499, sizes: "7,8,9,10,11", img: "1542291026-7eec264c27ff" },
      { title: "Nike Revolution 6 Running Shoes", color: "Grey", mrp: 4499, sell: 3149, sizes: "7,8,9,10,11", img: "1595950653106-6c9ebd614d3a" },
      { title: "Nike Air Force 1 '07 - White", color: "White", mrp: 8995, sell: 7196, sizes: "7,8,9,10,11", img: "1597248881519-db089d3744a5" },
      { title: "Nike Dri-FIT T-Shirt - Navy", color: "Navy", mrp: 1995, sell: 1396, sizes: "S,M,L,XL", img: "1581655353564-df123a1eb820" },
      { title: "Nike Sportswear Club Hoodie", color: "Black", mrp: 3995, sell: 2796, sizes: "S,M,L,XL,XXL", img: "1556821840-3a63f95609a7" },
      { title: "Nike Dri-FIT Training Shorts", color: "Grey", mrp: 1995, sell: 1496, sizes: "S,M,L,XL", img: "1591195853828-11db59a44f6b" },
      { title: "Nike Pegasus 40 Running Shoes", color: "Blue", mrp: 11995, sell: 9596, sizes: "8,9,10,11", img: "1606107557195-0e29a4b5b4aa" },
      { title: "Nike Tech Fleece Joggers", color: "Black", mrp: 8995, sell: 6296, sizes: "M,L,XL", img: "1593032465175-481ac7f401a0" },
      { title: "Nike Court Vision Low Sneakers", color: "White", mrp: 5495, sell: 3846, sizes: "7,8,9,10,11", img: "1542291026-7eec264c27ff" },
      { title: "Nike Sportswear Cap", color: "Black", mrp: 1495, sell: 1196, sizes: "FREE", img: "1521369909029-2afed882baee" },
      { title: "Nike Heritage Backpack 25L", color: "Black", mrp: 2995, sell: 2096, sizes: "FREE", img: "1553062407-98eeb64c6a62" },
      { title: "Nike Dri-FIT Training Socks 3-Pack", color: "White", mrp: 595, sell: 446, sizes: "M,L", img: "1586350977771-2a1ed3845c84" },
      { title: "Nike Phantom GT2 Football Shoes", color: "Red", mrp: 7995, sell: 5596, sizes: "8,9,10,11", img: "1517466787929-bc90951d0974" },
      { title: "Nike Yoga Mat - Purple", color: "Purple", mrp: 2495, sell: 1746, sizes: "FREE", img: "1599447332411-fd9b8e7d8316" },
      { title: "Nike Sportswear Windrunner Jacket", color: "Black", mrp: 5995, sell: 4196, sizes: "M,L,XL", img: "1591047139829-d91aecb6caea" },
      { title: "Nike Dri-FIT Polo T-Shirt", color: "White", mrp: 2295, sell: 1606, sizes: "S,M,L,XL", img: "1564584217132-2271feaeb3c5" },
      { title: "Nike Air Zoom Vomero 5", color: "Beige", mrp: 13995, sell: 10496, sizes: "8,9,10,11", img: "1606107557104-71c10ab8e72b" },
      { title: "Nike Brasilia Gym Sack", color: "Blue", mrp: 995, sell: 696, sizes: "FREE", img: "1622560480605-d83c853bc5c3" },
      { title: "Nike Pro Compression Shorts", color: "Black", mrp: 1495, sell: 1046, sizes: "S,M,L", img: "1585533650612-f8b5b4c0e5e6" },
      { title: "Nike Therma-FIT Vest", color: "Grey", mrp: 4495, sell: 3146, sizes: "M,L,XL", img: "1585336261022-680e295ce3fe" },
    ],
  },

  adidas: {
    category: "men",
    products: [
      { title: "Adidas Ultraboost 22 - Triple Black", color: "Black", mrp: 17999, sell: 12599, sizes: "8,9,10,11", img: "1556906781-9a412961c28c" },
      { title: "Adidas Stan Smith Sneakers", color: "White", mrp: 8999, sell: 7199, sizes: "7,8,9,10,11", img: "1539185441755-769473a23570" },
      { title: "Adidas Originals Trefoil T-Shirt", color: "Black", mrp: 1999, sell: 1399, sizes: "S,M,L,XL", img: "1564859228273-274232fdb516" },
      { title: "Adidas Tiro Track Pants", color: "Black", mrp: 3499, sell: 2449, sizes: "M,L,XL", img: "1571945153237-4929e783af4a" },
      { title: "Adidas Sportswear Hoodie", color: "Grey", mrp: 4499, sell: 3149, sizes: "S,M,L,XL", img: "1556821840-3a63f95609a7" },
      { title: "Adidas Predator Edge Football Boots", color: "Red", mrp: 9999, sell: 6999, sizes: "8,9,10,11", img: "1517466787929-bc90951d0974" },
      { title: "Adidas Galaxy 6 Running Shoes", color: "Blue", mrp: 4999, sell: 3499, sizes: "7,8,9,10,11", img: "1595341888016-a392ef81b7de" },
      { title: "Adidas Linear Backpack", color: "Black", mrp: 1999, sell: 1399, sizes: "FREE", img: "1553062407-98eeb64c6a62" },
      { title: "Adidas Performance Cap", color: "White", mrp: 999, sell: 699, sizes: "FREE", img: "1521369909029-2afed882baee" },
      { title: "Adidas Essential T-Shirt 3-Pack", color: "Multi", mrp: 2499, sell: 1749, sizes: "M,L,XL", img: "1521572163474-6864f9cf17ab" },
      { title: "Adidas Aeroready Training Shorts", color: "Navy", mrp: 1799, sell: 1259, sizes: "S,M,L,XL", img: "1591195853828-11db59a44f6b" },
      { title: "Adidas Pureboost 23", color: "Grey", mrp: 13999, sell: 9799, sizes: "8,9,10,11", img: "1606107557195-0e29a4b5b4aa" },
      { title: "Adidas Originals Hoodie", color: "Maroon", mrp: 4999, sell: 3499, sizes: "M,L,XL", img: "1556821840-3a63f95609a7" },
      { title: "Adidas Forum Low Sneakers", color: "White", mrp: 8999, sell: 6299, sizes: "8,9,10,11", img: "1542291026-7eec264c27ff" },
      { title: "Adidas Climalite Polo", color: "Blue", mrp: 2499, sell: 1749, sizes: "S,M,L,XL", img: "1564584217132-2271feaeb3c5" },
      { title: "Adidas Yoga Mat", color: "Black", mrp: 2199, sell: 1539, sizes: "FREE", img: "1599447332411-fd9b8e7d8316" },
      { title: "Adidas Originals Jacket", color: "Green", mrp: 5999, sell: 4199, sizes: "M,L,XL", img: "1591047139829-d91aecb6caea" },
      { title: "Adidas Crew Socks 3-Pack", color: "White", mrp: 699, sell: 489, sizes: "M,L", img: "1586350977771-2a1ed3845c84" },
      { title: "Adidas Gazelle Sneakers", color: "Blue", mrp: 8499, sell: 5949, sizes: "7,8,9,10,11", img: "1539185441755-769473a23570" },
      { title: "Adidas Compression Tights", color: "Black", mrp: 2499, sell: 1749, sizes: "S,M,L,XL", img: "1585533650612-f8b5b4c0e5e6" },
    ],
  },

  apple: {
    category: "electronics",
    products: [
      { title: "iPhone 15 Pro Max 256GB - Natural Titanium", color: "Titanium", mrp: 159900, sell: 144900, sizes: "FREE", img: "1592286927505-0428b1bdd5e3" },
      { title: "iPhone 15 128GB - Pink", color: "Pink", mrp: 79900, sell: 72900, sizes: "FREE", img: "1605236453806-b25e3b1a6f3d" },
      { title: "MacBook Pro 14\" M3 Pro 512GB", color: "Space Black", mrp: 199900, sell: 184900, sizes: "FREE", img: "1517336714731-489689fd1ca8" },
      { title: "MacBook Air M2 13\" 256GB", color: "Midnight", mrp: 114900, sell: 99900, sizes: "FREE", img: "1611186871348-b1ce696e52c9" },
      { title: "AirPods Pro 2nd Generation", color: "White", mrp: 26900, sell: 24900, sizes: "FREE", img: "1606220588913-b3aacb4d2f46" },
      { title: "AirPods Max - Space Gray", color: "Grey", mrp: 59900, sell: 54900, sizes: "FREE", img: "1606220945770-b5b6c2c55bf1" },
      { title: "iPad Pro 12.9\" M2 256GB Wi-Fi", color: "Silver", mrp: 112900, sell: 99900, sizes: "FREE", img: "1561154464-82e9adf32764" },
      { title: "iPad Air 5th Gen 64GB", color: "Blue", mrp: 59900, sell: 54900, sizes: "FREE", img: "1561154464-82e9adf32764" },
      { title: "Apple Watch Series 9 GPS 45mm", color: "Midnight", mrp: 45900, sell: 41900, sizes: "FREE", img: "1546868871-7041f2a55e12" },
      { title: "Apple Watch Ultra 2 49mm", color: "Titanium", mrp: 89900, sell: 84900, sizes: "FREE", img: "1551816230-ef5deaed4a26" },
      { title: "Apple Magic Keyboard", color: "White", mrp: 9900, sell: 8900, sizes: "FREE", img: "1587829741301-dc798b83add3" },
      { title: "Apple Magic Mouse", color: "White", mrp: 8500, sell: 7900, sizes: "FREE", img: "1527864550417-7fd91fc51a46" },
      { title: "Apple Pencil 2nd Generation", color: "White", mrp: 12900, sell: 11900, sizes: "FREE", img: "1561154464-82e9adf32764" },
      { title: "iPhone 15 Plus 256GB - Black", color: "Black", mrp: 99900, sell: 89900, sizes: "FREE", img: "1592286927505-0428b1bdd5e3" },
      { title: "Mac Mini M2 256GB", color: "Silver", mrp: 59900, sell: 54900, sizes: "FREE", img: "1517336714731-489689fd1ca8" },
      { title: "Apple TV 4K 128GB", color: "Black", mrp: 18900, sell: 16900, sizes: "FREE", img: "1593359677879-a4bb92f829d1" },
      { title: "Apple HomePod mini - White", color: "White", mrp: 10900, sell: 9900, sizes: "FREE", img: "1545454675-3531b543be5d" },
      { title: "AirTag 4-Pack", color: "Silver", mrp: 10900, sell: 9900, sizes: "FREE", img: "1614624532983-4ce03382d63d" },
      { title: "iPhone 14 128GB - Purple", color: "Purple", mrp: 69900, sell: 59900, sizes: "FREE", img: "1605236453806-b25e3b1a6f3d" },
      { title: "MagSafe Charger", color: "White", mrp: 4500, sell: 3990, sizes: "FREE", img: "1602080858428-57174f9431cf" },
    ],
  },

  samsung: {
    category: "electronics",
    products: [
      { title: "Samsung Galaxy S24 Ultra 512GB - Titanium Black", color: "Black", mrp: 144999, sell: 124999, sizes: "FREE", img: "1610945265064-0e34e5519bbf" },
      { title: "Samsung Galaxy S24+ 256GB", color: "Violet", mrp: 99999, sell: 84999, sizes: "FREE", img: "1610945265064-0e34e5519bbf" },
      { title: "Samsung Galaxy Z Fold 5 256GB", color: "Cream", mrp: 154999, sell: 134999, sizes: "FREE", img: "1567581935884-3349723552ca" },
      { title: "Samsung Galaxy Z Flip 5 256GB", color: "Mint", mrp: 99999, sell: 84999, sizes: "FREE", img: "1567581935884-3349723552ca" },
      { title: "Samsung Galaxy Buds 2 Pro", color: "Graphite", mrp: 17999, sell: 14999, sizes: "FREE", img: "1606220588913-b3aacb4d2f46" },
      { title: "Samsung Galaxy Watch 6 44mm", color: "Black", mrp: 32999, sell: 27999, sizes: "FREE", img: "1546868871-7041f2a55e12" },
      { title: "Samsung Galaxy Tab S9 Ultra 256GB", color: "Graphite", mrp: 108999, sell: 94999, sizes: "FREE", img: "1561154464-82e9adf32764" },
      { title: "Samsung 65\" QLED 4K Smart TV", color: "Black", mrp: 124999, sell: 99999, sizes: "FREE", img: "1593359677879-a4bb92f829d1" },
      { title: "Samsung 980 Pro 1TB SSD", color: "Black", mrp: 12999, sell: 8999, sizes: "FREE", img: "1587829741301-dc798b83add3" },
      { title: "Samsung Galaxy A54 5G 128GB", color: "Lime", mrp: 38999, sell: 31999, sizes: "FREE", img: "1610945265064-0e34e5519bbf" },
      { title: "Samsung Galaxy M14 5G 128GB", color: "Blue", mrp: 14999, sell: 12499, sizes: "FREE", img: "1610945265064-0e34e5519bbf" },
      { title: "Samsung Galaxy F54 5G 256GB", color: "Stardust Silver", mrp: 27999, sell: 23999, sizes: "FREE", img: "1610945265064-0e34e5519bbf" },
      { title: "Samsung 32\" Curved Monitor", color: "Black", mrp: 32999, sell: 27999, sizes: "FREE", img: "1527443195645-1133f7f28990" },
      { title: "Samsung Galaxy Watch FE 40mm", color: "Pink Gold", mrp: 19999, sell: 16999, sizes: "FREE", img: "1546868871-7041f2a55e12" },
      { title: "Samsung 55\" Crystal UHD TV", color: "Black", mrp: 64999, sell: 49999, sizes: "FREE", img: "1593359677879-a4bb92f829d1" },
      { title: "Samsung Wireless Charger", color: "White", mrp: 3999, sell: 2999, sizes: "FREE", img: "1602080858428-57174f9431cf" },
      { title: "Samsung Galaxy Book 3 Pro", color: "Graphite", mrp: 109999, sell: 94999, sizes: "FREE", img: "1517336714731-489689fd1ca8" },
      { title: "Samsung Soundbar 2.1 Ch", color: "Black", mrp: 15999, sell: 12999, sizes: "FREE", img: "1545454675-3531b543be5d" },
      { title: "Samsung Galaxy S23 FE 256GB", color: "Mint", mrp: 49999, sell: 41999, sizes: "FREE", img: "1610945265064-0e34e5519bbf" },
      { title: "Samsung 49\" Odyssey Gaming Monitor", color: "Black", mrp: 89999, sell: 74999, sizes: "FREE", img: "1527443195645-1133f7f28990" },
    ],
  },

  oneplus: {
    category: "electronics",
    products: [
      { title: "OnePlus 12 5G 256GB - Flowy Emerald", color: "Green", mrp: 64999, sell: 54999, sizes: "FREE", img: "1567581935884-3349723552ca" },
      { title: "OnePlus 12R 5G 128GB - Cool Blue", color: "Blue", mrp: 39999, sell: 32999, sizes: "FREE", img: "1567581935884-3349723552ca" },
      { title: "OnePlus 11 5G 256GB - Titan Black", color: "Black", mrp: 56999, sell: 47999, sizes: "FREE", img: "1567581935884-3349723552ca" },
      { title: "OnePlus Nord CE 4 5G 256GB", color: "Celadon Marble", mrp: 28999, sell: 24999, sizes: "FREE", img: "1567581935884-3349723552ca" },
      { title: "OnePlus Nord 4 5G 256GB", color: "Obsidian Midnight", mrp: 32999, sell: 27999, sizes: "FREE", img: "1567581935884-3349723552ca" },
      { title: "OnePlus Buds 3", color: "Metallic Gray", mrp: 5499, sell: 4499, sizes: "FREE", img: "1606220588913-b3aacb4d2f46" },
      { title: "OnePlus Buds Pro 2", color: "Obsidian Black", mrp: 11999, sell: 9999, sizes: "FREE", img: "1606220588913-b3aacb4d2f46" },
      { title: "OnePlus Watch 2 - Black Steel", color: "Black", mrp: 24999, sell: 21999, sizes: "FREE", img: "1546868871-7041f2a55e12" },
      { title: "OnePlus Pad 256GB", color: "Halo Green", mrp: 39999, sell: 33999, sizes: "FREE", img: "1561154464-82e9adf32764" },
      { title: "OnePlus 80W SuperVOOC Charger", color: "White", mrp: 2499, sell: 1999, sizes: "FREE", img: "1602080858428-57174f9431cf" },
      { title: "OnePlus Nord Buds 2", color: "Thunder Gray", mrp: 2999, sell: 2299, sizes: "FREE", img: "1606220588913-b3aacb4d2f46" },
      { title: "OnePlus 10 Pro 5G 128GB", color: "Volcanic Black", mrp: 49999, sell: 41999, sizes: "FREE", img: "1567581935884-3349723552ca" },
      { title: "OnePlus 50W Wireless Charger", color: "Black", mrp: 4499, sell: 3499, sizes: "FREE", img: "1602080858428-57174f9431cf" },
      { title: "OnePlus Bullets Wireless Z2", color: "Magico Black", mrp: 1999, sell: 1499, sizes: "FREE", img: "1606220588913-b3aacb4d2f46" },
      { title: "OnePlus Nord CE 3 Lite 5G", color: "Pastel Lime", mrp: 19999, sell: 16999, sizes: "FREE", img: "1567581935884-3349723552ca" },
      { title: "OnePlus Tempered Glass Screen Guard", color: "Clear", mrp: 999, sell: 599, sizes: "FREE", img: "1602080858428-57174f9431cf" },
      { title: "OnePlus Sandstone Bumper Case", color: "Black", mrp: 1999, sell: 1499, sizes: "FREE", img: "1602080858428-57174f9431cf" },
      { title: "OnePlus 12R 5G 256GB - Iron Gray", color: "Iron Gray", mrp: 45999, sell: 38999, sizes: "FREE", img: "1567581935884-3349723552ca" },
      { title: "OnePlus Watch GPS 47mm", color: "Moonlight Silver", mrp: 16999, sell: 13999, sizes: "FREE", img: "1546868871-7041f2a55e12" },
      { title: "OnePlus 65W Warp Charge Adapter", color: "White", mrp: 2999, sell: 2299, sizes: "FREE", img: "1602080858428-57174f9431cf" },
    ],
  },

  "h-and-m": {
    category: "women",
    products: [
      { title: "H&M Cotton T-Shirt - White", color: "White", mrp: 799, sell: 499, sizes: "S,M,L,XL", img: "1521572163474-6864f9cf17ab" },
      { title: "H&M Skinny Jeans - Dark Blue", color: "Blue", mrp: 1999, sell: 1399, sizes: "S,M,L,XL", img: "1542272604-787c3835535d" },
      { title: "H&M Floral Summer Dress", color: "Pink", mrp: 2499, sell: 1749, sizes: "S,M,L,XL", img: "1572804013309-59a88b7e92f1" },
      { title: "H&M Oversized Hoodie - Grey", color: "Grey", mrp: 1999, sell: 1399, sizes: "S,M,L,XL,XXL", img: "1556821840-3a63f95609a7" },
      { title: "H&M Knit Cardigan - Beige", color: "Beige", mrp: 2299, sell: 1599, sizes: "S,M,L", img: "1591047139829-d91aecb6caea" },
      { title: "H&M Linen Blend Shirt", color: "White", mrp: 1499, sell: 1049, sizes: "S,M,L,XL", img: "1564859228273-274232fdb516" },
      { title: "H&M Wide-Leg Trousers", color: "Black", mrp: 2499, sell: 1749, sizes: "S,M,L", img: "1591195853828-11db59a44f6b" },
      { title: "H&M Slim Fit Blazer", color: "Navy", mrp: 4999, sell: 3499, sizes: "M,L,XL", img: "1591047139829-d91aecb6caea" },
      { title: "H&M Crop Top - Pastel Pink", color: "Pink", mrp: 699, sell: 489, sizes: "XS,S,M,L", img: "1521572163474-6864f9cf17ab" },
      { title: "H&M Maxi Dress - Floral", color: "Multi", mrp: 2999, sell: 2099, sizes: "S,M,L,XL", img: "1572804013309-59a88b7e92f1" },
      { title: "H&M Pleated Midi Skirt", color: "Black", mrp: 1999, sell: 1399, sizes: "S,M,L", img: "1591195853828-11db59a44f6b" },
      { title: "H&M Denim Jacket - Light Blue", color: "Blue", mrp: 2999, sell: 2099, sizes: "S,M,L,XL", img: "1591047139829-d91aecb6caea" },
      { title: "H&M Ribbed Sweater", color: "Cream", mrp: 1999, sell: 1399, sizes: "S,M,L", img: "1556821840-3a63f95609a7" },
      { title: "H&M Yoga Leggings", color: "Black", mrp: 1499, sell: 1049, sizes: "XS,S,M,L,XL", img: "1585533650612-f8b5b4c0e5e6" },
      { title: "H&M Cotton Pajama Set", color: "Pink", mrp: 1999, sell: 1399, sizes: "S,M,L,XL", img: "1556821840-3a63f95609a7" },
      { title: "H&M Wrap Dress - Polka Dots", color: "Black", mrp: 2499, sell: 1749, sizes: "S,M,L", img: "1572804013309-59a88b7e92f1" },
      { title: "H&M Mom Jeans - Light Wash", color: "Blue", mrp: 2299, sell: 1599, sizes: "26,28,30,32", img: "1542272604-787c3835535d" },
      { title: "H&M Puff Sleeve Blouse", color: "White", mrp: 1799, sell: 1259, sizes: "XS,S,M,L", img: "1564859228273-274232fdb516" },
      { title: "H&M Knit Beanie", color: "Burgundy", mrp: 599, sell: 419, sizes: "FREE", img: "1521369909029-2afed882baee" },
      { title: "H&M Canvas Sneakers", color: "White", mrp: 2299, sell: 1599, sizes: "5,6,7,8,9", img: "1542291026-7eec264c27ff" },
    ],
  },

  zara: {
    category: "women",
    products: [
      { title: "Zara Floral Print Wrap Dress - Multicolor", color: "Multi", mrp: 5990, sell: 3590, sizes: "S,M,L", img: "1490481651871-ab68de25d43d" },
      { title: "Zara Oversized Blazer - Beige", color: "Beige", mrp: 7990, sell: 5590, sizes: "S,M,L,XL", img: "1591047139829-d91aecb6caea" },
      { title: "Zara High-Waisted Jeans", color: "Blue", mrp: 3990, sell: 2790, sizes: "26,28,30,32", img: "1542272604-787c3835535d" },
      { title: "Zara Silk Blouse - Cream", color: "Cream", mrp: 4990, sell: 3490, sizes: "XS,S,M,L", img: "1564859228273-274232fdb516" },
      { title: "Zara Leather Tote Bag", color: "Black", mrp: 8990, sell: 6290, sizes: "FREE", img: "1553062407-98eeb64c6a62" },
      { title: "Zara Chunky Sole Sneakers", color: "White", mrp: 5990, sell: 4190, sizes: "5,6,7,8,9", img: "1542291026-7eec264c27ff" },
      { title: "Zara Wool Coat - Camel", color: "Camel", mrp: 12990, sell: 9090, sizes: "S,M,L", img: "1591047139829-d91aecb6caea" },
      { title: "Zara Pleated Midi Skirt", color: "Olive", mrp: 3990, sell: 2790, sizes: "S,M,L", img: "1591195853828-11db59a44f6b" },
      { title: "Zara Ribbed Knit Top", color: "Pink", mrp: 2990, sell: 2090, sizes: "S,M,L", img: "1521572163474-6864f9cf17ab" },
      { title: "Zara Wide-Leg Pants", color: "Black", mrp: 4990, sell: 3490, sizes: "S,M,L,XL", img: "1591195853828-11db59a44f6b" },
      { title: "Zara Cropped Denim Jacket", color: "Blue", mrp: 5990, sell: 4190, sizes: "S,M,L", img: "1591047139829-d91aecb6caea" },
      { title: "Zara Statement Earrings", color: "Gold", mrp: 1990, sell: 1390, sizes: "FREE", img: "1535632787350-4e68ef0ac584" },
      { title: "Zara Pointed Heels - Nude", color: "Nude", mrp: 5990, sell: 4190, sizes: "5,6,7,8,9", img: "1542291026-7eec264c27ff" },
      { title: "Zara Linen Jumpsuit", color: "Khaki", mrp: 6990, sell: 4890, sizes: "S,M,L", img: "1572804013309-59a88b7e92f1" },
      { title: "Zara Faux Fur Coat", color: "Brown", mrp: 9990, sell: 6990, sizes: "S,M,L", img: "1591047139829-d91aecb6caea" },
      { title: "Zara Cashmere Sweater", color: "Grey", mrp: 7990, sell: 5590, sizes: "S,M,L", img: "1556821840-3a63f95609a7" },
      { title: "Zara Bodycon Mini Dress", color: "Black", mrp: 4990, sell: 3490, sizes: "XS,S,M,L", img: "1572804013309-59a88b7e92f1" },
      { title: "Zara Strappy Sandals", color: "Black", mrp: 3990, sell: 2790, sizes: "5,6,7,8", img: "1542291026-7eec264c27ff" },
      { title: "Zara Cargo Pants", color: "Khaki", mrp: 4990, sell: 3490, sizes: "S,M,L", img: "1591195853828-11db59a44f6b" },
      { title: "Zara Crossbody Bag", color: "Brown", mrp: 5990, sell: 4190, sizes: "FREE", img: "1553062407-98eeb64c6a62" },
    ],
  },

  puma: {
    category: "men",
    products: [
      { title: "Puma RS-X Sneakers - White/Red", color: "White", mrp: 8999, sell: 6299, sizes: "7,8,9,10,11", img: "1608231387042-66d1773070a5" },
      { title: "Puma Suede Classic XXI", color: "Blue", mrp: 6499, sell: 4549, sizes: "7,8,9,10,11", img: "1539185441755-769473a23570" },
      { title: "Puma Future Rider Sneakers", color: "Black", mrp: 5999, sell: 4199, sizes: "7,8,9,10,11", img: "1542291026-7eec264c27ff" },
      { title: "Puma Essential Logo T-Shirt", color: "Black", mrp: 1499, sell: 1049, sizes: "S,M,L,XL", img: "1581655353564-df123a1eb820" },
      { title: "Puma Track Pants - Navy", color: "Navy", mrp: 2999, sell: 2099, sizes: "M,L,XL", img: "1571945153237-4929e783af4a" },
      { title: "Puma Sportswear Hoodie", color: "Grey", mrp: 3499, sell: 2449, sizes: "M,L,XL", img: "1556821840-3a63f95609a7" },
      { title: "Puma King Football Boots", color: "Black", mrp: 8999, sell: 6299, sizes: "8,9,10,11", img: "1517466787929-bc90951d0974" },
      { title: "Puma Ferrari Cap", color: "Red", mrp: 1999, sell: 1399, sizes: "FREE", img: "1521369909029-2afed882baee" },
      { title: "Puma Backpack 25L", color: "Black", mrp: 2499, sell: 1749, sizes: "FREE", img: "1553062407-98eeb64c6a62" },
      { title: "Puma Smash V2 Sneakers", color: "White", mrp: 4499, sell: 3149, sizes: "7,8,9,10,11", img: "1539185441755-769473a23570" },
      { title: "Puma Cell Endura Shoes", color: "Yellow", mrp: 7999, sell: 5599, sizes: "8,9,10,11", img: "1606107557195-0e29a4b5b4aa" },
      { title: "Puma Polo T-Shirt", color: "Navy", mrp: 1999, sell: 1399, sizes: "S,M,L,XL", img: "1564584217132-2271feaeb3c5" },
      { title: "Puma Training Shorts", color: "Black", mrp: 1499, sell: 1049, sizes: "S,M,L,XL", img: "1591195853828-11db59a44f6b" },
      { title: "Puma Crew Socks 3-Pack", color: "White", mrp: 599, sell: 419, sizes: "M,L", img: "1586350977771-2a1ed3845c84" },
      { title: "Puma Reversible Beanie", color: "Black", mrp: 999, sell: 699, sizes: "FREE", img: "1521369909029-2afed882baee" },
      { title: "Puma Padded Jacket", color: "Black", mrp: 5999, sell: 4199, sizes: "M,L,XL", img: "1591047139829-d91aecb6caea" },
      { title: "Puma Performance Tights", color: "Black", mrp: 1999, sell: 1399, sizes: "S,M,L", img: "1585533650612-f8b5b4c0e5e6" },
      { title: "Puma Crossbody Bag", color: "Black", mrp: 1499, sell: 1049, sizes: "FREE", img: "1553062407-98eeb64c6a62" },
      { title: "Puma Slide Sandals", color: "Black", mrp: 1999, sell: 1399, sizes: "8,9,10,11", img: "1542291026-7eec264c27ff" },
      { title: "Puma Yoga Mat", color: "Pink", mrp: 1999, sell: 1399, sizes: "FREE", img: "1599447332411-fd9b8e7d8316" },
    ],
  },

  levis: {
    category: "men",
    products: [
      { title: "Levi's 501 Original Fit Jeans - Dark Blue", color: "Blue", mrp: 4499, sell: 3149, sizes: "30,32,34,36", img: "1542272604-787c3835535d" },
      { title: "Levi's 511 Slim Fit Jeans - Black", color: "Black", mrp: 3999, sell: 2799, sizes: "30,32,34,36", img: "1542272604-787c3835535d" },
      { title: "Levi's Trucker Jacket - Light Wash", color: "Blue", mrp: 5999, sell: 4199, sizes: "M,L,XL", img: "1591047139829-d91aecb6caea" },
      { title: "Levi's Logo T-Shirt - White", color: "White", mrp: 1499, sell: 1049, sizes: "S,M,L,XL", img: "1521572163474-6864f9cf17ab" },
      { title: "Levi's Skinny Fit Jeans", color: "Grey", mrp: 4499, sell: 3149, sizes: "30,32,34", img: "1542272604-787c3835535d" },
      { title: "Levi's Western Shirt - Denim", color: "Blue", mrp: 3499, sell: 2449, sizes: "M,L,XL", img: "1564859228273-274232fdb516" },
      { title: "Levi's Tapered Fit Jeans", color: "Indigo", mrp: 4999, sell: 3499, sizes: "30,32,34,36", img: "1542272604-787c3835535d" },
      { title: "Levi's Sherpa Trucker Jacket", color: "Brown", mrp: 8999, sell: 6299, sizes: "M,L,XL", img: "1591047139829-d91aecb6caea" },
      { title: "Levi's Sportswear Hoodie", color: "Black", mrp: 3999, sell: 2799, sizes: "M,L,XL", img: "1556821840-3a63f95609a7" },
      { title: "Levi's Bootcut Jeans", color: "Blue", mrp: 4499, sell: 3149, sizes: "30,32,34,36", img: "1542272604-787c3835535d" },
      { title: "Levi's Chino Shorts", color: "Khaki", mrp: 2499, sell: 1749, sizes: "30,32,34", img: "1591195853828-11db59a44f6b" },
      { title: "Levi's Polo T-Shirt", color: "Navy", mrp: 1999, sell: 1399, sizes: "S,M,L,XL", img: "1564584217132-2271feaeb3c5" },
      { title: "Levi's Distressed Jeans", color: "Light Blue", mrp: 5499, sell: 3849, sizes: "30,32,34", img: "1542272604-787c3835535d" },
      { title: "Levi's Wool Cap", color: "Grey", mrp: 999, sell: 699, sizes: "FREE", img: "1521369909029-2afed882baee" },
      { title: "Levi's Leather Belt", color: "Black", mrp: 1999, sell: 1399, sizes: "32,34,36,38", img: "1553062407-98eeb64c6a62" },
      { title: "Levi's Cargo Pants", color: "Olive", mrp: 4999, sell: 3499, sizes: "30,32,34,36", img: "1591195853828-11db59a44f6b" },
      { title: "Levi's Flannel Shirt", color: "Red Plaid", mrp: 3499, sell: 2449, sizes: "M,L,XL", img: "1564859228273-274232fdb516" },
      { title: "Levi's Crew Neck Sweater", color: "Navy", mrp: 3999, sell: 2799, sizes: "M,L,XL", img: "1556821840-3a63f95609a7" },
      { title: "Levi's Cotton Joggers", color: "Black", mrp: 2999, sell: 2099, sizes: "M,L,XL", img: "1571945153237-4929e783af4a" },
      { title: "Levi's Backpack", color: "Black", mrp: 2499, sell: 1749, sizes: "FREE", img: "1553062407-98eeb64c6a62" },
    ],
  },

  sony: {
    category: "electronics",
    products: [
      { title: "Sony WH-1000XM5 Wireless Headphones", color: "Black", mrp: 34990, sell: 26990, sizes: "FREE", img: "1583394838336-acd977736f90" },
      { title: "Sony WF-1000XM5 Earbuds", color: "Silver", mrp: 26990, sell: 21990, sizes: "FREE", img: "1606220588913-b3aacb4d2f46" },
      { title: "Sony Bravia 65\" 4K Smart TV", color: "Black", mrp: 134990, sell: 99990, sizes: "FREE", img: "1593359677879-a4bb92f829d1" },
      { title: "Sony PlayStation 5 Slim", color: "White", mrp: 54990, sell: 49990, sizes: "FREE", img: "1606144042614-b2417e99c4e3" },
      { title: "Sony Alpha 7 IV Camera", color: "Black", mrp: 224990, sell: 199990, sizes: "FREE", img: "1502920917128-1aa500764cbd" },
      { title: "Sony SRS-XB13 Bluetooth Speaker", color: "Blue", mrp: 4990, sell: 3490, sizes: "FREE", img: "1545454675-3531b543be5d" },
      { title: "Sony WH-CH720N Headphones", color: "Black", mrp: 11990, sell: 8990, sizes: "FREE", img: "1583394838336-acd977736f90" },
      { title: "Sony PS5 DualSense Controller", color: "White", mrp: 6990, sell: 5490, sizes: "FREE", img: "1606144042614-b2417e99c4e3" },
      { title: "Sony Soundbar HT-S400", color: "Black", mrp: 22990, sell: 17990, sizes: "FREE", img: "1545454675-3531b543be5d" },
      { title: "Sony Linkbuds S Earbuds", color: "Beige", mrp: 19990, sell: 14990, sizes: "FREE", img: "1606220588913-b3aacb4d2f46" },
      { title: "Sony Cyber-Shot Compact Camera", color: "Silver", mrp: 38990, sell: 29990, sizes: "FREE", img: "1502920917128-1aa500764cbd" },
      { title: "Sony Xperia 1 V 256GB", color: "Black", mrp: 109990, sell: 94990, sizes: "FREE", img: "1610945265064-0e34e5519bbf" },
      { title: "Sony FE 50mm f/1.8 Lens", color: "Black", mrp: 24990, sell: 19990, sizes: "FREE", img: "1502920917128-1aa500764cbd" },
      { title: "Sony Bravia 55\" OLED TV", color: "Black", mrp: 184990, sell: 149990, sizes: "FREE", img: "1593359677879-a4bb92f829d1" },
      { title: "Sony WI-C100 Neckband", color: "Black", mrp: 2990, sell: 1990, sizes: "FREE", img: "1583394838336-acd977736f90" },
      { title: "Sony PS5 Pulse 3D Headset", color: "White", mrp: 9990, sell: 7990, sizes: "FREE", img: "1583394838336-acd977736f90" },
      { title: "Sony SRS-XE200 Bluetooth Speaker", color: "Black", mrp: 12990, sell: 9990, sizes: "FREE", img: "1545454675-3531b543be5d" },
      { title: "Sony Memory Card 128GB", color: "Black", mrp: 3990, sell: 2490, sizes: "FREE", img: "1587829741301-dc798b83add3" },
      { title: "Sony Blu-ray Player", color: "Black", mrp: 14990, sell: 11990, sizes: "FREE", img: "1593359677879-a4bb92f829d1" },
      { title: "Sony FX30 Cinema Camera", color: "Black", mrp: 184990, sell: 159990, sizes: "FREE", img: "1502920917128-1aa500764cbd" },
    ],
  },

  ikea: {
    category: "home",
    products: [
      { title: "IKEA MALM Bed Frame Queen", color: "White", mrp: 24990, sell: 19990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "IKEA POÄNG Armchair", color: "Beige", mrp: 12990, sell: 9990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "IKEA BILLY Bookcase", color: "White", mrp: 7990, sell: 5990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "IKEA HEMNES Dresser 8-Drawer", color: "Brown", mrp: 22990, sell: 17990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "IKEA KIVIK Sofa 3-Seater", color: "Grey", mrp: 49990, sell: 39990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "IKEA LACK Coffee Table", color: "Black", mrp: 2990, sell: 1990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "IKEA STRANDMON Wing Chair", color: "Green", mrp: 24990, sell: 19990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "IKEA FRIHETEN Sofa Bed", color: "Dark Grey", mrp: 39990, sell: 31990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "IKEA PAX Wardrobe", color: "White", mrp: 34990, sell: 27990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "IKEA RIBBA Picture Frame Set", color: "Black", mrp: 1490, sell: 990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "IKEA FÖRBÄTTRA Cabinet Knobs", color: "Brass", mrp: 990, sell: 690, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "IKEA KALLAX Shelf Unit", color: "Black", mrp: 11990, sell: 8990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "IKEA NORRÅKER Dining Table", color: "Birch", mrp: 18990, sell: 14990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "IKEA EKEDALEN Dining Chair", color: "Brown", mrp: 4990, sell: 3490, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "IKEA SKURUP Pendant Lamp", color: "Black", mrp: 2990, sell: 1990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "IKEA ÄPPLARÖ Garden Table", color: "Brown", mrp: 14990, sell: 11990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "IKEA SLÄKT Bunk Bed", color: "White", mrp: 19990, sell: 14990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "IKEA NORDLI Modular Storage", color: "White", mrp: 16990, sell: 12990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "IKEA MALM Desk", color: "White", mrp: 9990, sell: 7490, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "IKEA FRAKTA Storage Bag Large", color: "Blue", mrp: 990, sell: 590, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
    ],
  },

  "urban-ladder": {
    category: "home",
    products: [
      { title: "Urban Ladder Apollo Sofa - Brown", color: "Brown", mrp: 54990, sell: 39990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Esther Wing Chair", color: "Grey", mrp: 22990, sell: 16990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Boston King Bed", color: "Walnut", mrp: 49990, sell: 36990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "Urban Ladder Cohen 6-Seater Dining", color: "Teak", mrp: 64990, sell: 47990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "Urban Ladder Brisbane Bookshelf", color: "Mahogany", mrp: 18990, sell: 13990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Murphy Coffee Table", color: "Brown", mrp: 12990, sell: 9490, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Rhodes 3-Seater Sofa", color: "Beige", mrp: 44990, sell: 32990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Holmes Wardrobe", color: "Walnut", mrp: 38990, sell: 28990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "Urban Ladder Adolph TV Unit", color: "Brown", mrp: 19990, sell: 14990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Isabella Recliner", color: "Black", mrp: 32990, sell: 23990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Garner Study Table", color: "White", mrp: 14990, sell: 10990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Nicolas Console Table", color: "Walnut", mrp: 16990, sell: 12490, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Casper Bed", color: "Grey", mrp: 42990, sell: 31490, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "Urban Ladder Ellington Dresser", color: "Mahogany", mrp: 26990, sell: 19990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "Urban Ladder Faulkner Bedside Table", color: "Walnut", mrp: 9990, sell: 7290, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Greta Floor Lamp", color: "Black", mrp: 6990, sell: 4990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Eliza Bar Cabinet", color: "Black", mrp: 24990, sell: 17990, sizes: "FREE", img: "1555041469-a586c61ea9bc" },
      { title: "Urban Ladder Peggy Side Table", color: "Brown", mrp: 7990, sell: 5790, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Andre Shoe Rack", color: "Walnut", mrp: 11990, sell: 8990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
      { title: "Urban Ladder Vivienne Office Chair", color: "Black", mrp: 18990, sell: 13990, sizes: "FREE", img: "1567538096630-e0c55bd6374c" },
    ],
  },
};

// ═══════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

function getImageUrl(imgId) {
  return `https://images.unsplash.com/photo-${imgId}?w=600&q=80`;
}

async function ensureCategory(categoryId, name, parentId = null, level = 1) {
  let cat = await Category.findOne({ categoryId });
  if (!cat) {
    cat = await Category.create({
      name,
      categoryId,
      parentCategory: parentId,
      level,
    });
    console.log(`✅ Created category: ${name}`);
  }
  return cat;
}

// ═══════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════

async function seedDatabase() {
  try {
    console.log("\n🔄 Connecting to database...");
    await connectDB();

    console.log("\n🗑️  Cleaning existing data...");
    await Product.deleteMany({});
    await Brand.deleteMany({});
    await Review.deleteMany({});
    await CartItem.deleteMany({});
    await Cart.updateMany({}, { 
      $set: { 
        cartItems: [], 
        couponCode: null, 
        couponPrice: 0,
        totalMrpPrice: 0,
        totalSellingPrice: 0
      } 
    });
    await Wishlist.updateMany({}, { $set: { products: [] } });
    console.log("✅ Cleaned products, brands, reviews, carts");

    // Get a default seller (must exist)
    const seller = await Seller.findOne();
    if (!seller) {
      throw new Error("❌ No seller found! Please create a seller first.");
    }
    console.log(`✅ Using seller: ${seller.email || seller._id}`);

    // Create categories
    console.log("\n📁 Setting up categories...");
    const categories = {
      men: await ensureCategory("men", "Men", null, 1),
      women: await ensureCategory("women", "Women", null, 1),
      electronics: await ensureCategory("electronics", "Electronics", null, 1),
      home: await ensureCategory("home-and-furniture", "Home & Furniture", null, 1), 
    };

    // Create brands
    console.log("\n🏷️  Creating brands...");
    const brandMap = {};
    for (const brandData of BRANDS) {
      const brand = await Brand.create(brandData);
      brandMap[brand.slug] = brand;
      console.log(`✅ Created brand: ${brand.name}`);
    }

    // Create products for each brand
    console.log("\n📦 Creating products...");
    let totalProducts = 0;

    for (const [brandSlug, data] of Object.entries(PRODUCT_TEMPLATES)) {
      const brand = brandMap[brandSlug];
      const category = categories[data.category];

      if (!brand || !category) {
        console.log(`⚠️  Skipping ${brandSlug} (brand or category missing)`);
        continue;
      }

      const products = data.products.map((p) => {
        const discount = Math.round(((p.mrp - p.sell) / p.mrp) * 100);
        return {
          title: p.title,
          description: `${p.title}. Premium quality from ${brand.name}. ${brand.description}`,
          mrpPrice: p.mrp,
          sellingPrice: p.sell,
          discountPercent: discount,
          quantity: 50,
          color: p.color,
          brand: brand.slug,
          brandRef: brand._id,
          images: [getImageUrl(p.img), getImageUrl(p.img)],
          numRatings: 0,
          averageRating: 0,
          category: category._id,
          seller: seller._id,
          sizes: p.sizes,
          reviews: [],
        };
      });

      await Product.insertMany(products);
      
      // Update brand product count
      await Brand.findByIdAndUpdate(brand._id, { productCount: products.length });
      
      console.log(`✅ Added ${products.length} products for ${brand.name}`);
      totalProducts += products.length;
    }

    console.log("\n═══════════════════════════════════════════");
    console.log(`🎉 SEEDING COMPLETE!`);
    console.log(`   Brands:   ${Object.keys(brandMap).length}`);
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Reviews:  0 (all products start fresh)`);
    console.log("═══════════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();