require("dotenv").config();
const connectDB   = require("./src/config/db");
const Banner      = require("./src/models/Banner");
const SectionItem = require("./src/models/SectionItem");

// ── BANNERS ───────────────────────────────────────────────
const BANNERS = [
  {
    title: "New Season", highlight: "Fashion Drop",
    subtitle: "Explore 50,000+ styles from top vendors",
    badge: "🔥 Trending Now", cta: "Shop Fashion",
    ctaLink: "/products/women_western_wear",
    secondCta: "View Deals", secondLink: "/products/men_t_shirts",
    image: "https://www.libas.in/cdn/shop/files/eoss-desktop.jpg?v=1719849154&width=1920",
    overlay: "from-black/80 via-black/40 to-transparent", accent: "#6366f1",
    stats: [{ val: "50K+", label: "Products" }, { val: "2K+", label: "Vendors" }, { val: "70%", label: "Max Off" }],
    isActive: true, order: 0,
  },
  {
    title: "Top Electronics", highlight: "Best Deals",
    subtitle: "Mobiles, Laptops, Gadgets at lowest prices",
    badge: "⚡ Flash Sale", cta: "Shop Electronics",
    ctaLink: "/products/mobiles", secondCta: "View All", secondLink: "/products/laptops",
    image: "https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/5e7c1ff0288b8a72.jpg?q=20",
    overlay: "from-black/80 via-black/40 to-transparent", accent: "#06b6d4",
    stats: [{ val: "500+", label: "Brands" }, { val: "1M+", label: "Orders" }, { val: "4.8★", label: "Rating" }],
    isActive: true, order: 1,
  },
  {
    title: "Festival Season", highlight: "Ethnic Wear",
    subtitle: "Sarees, Lehengas & Traditional outfits",
    badge: "✨ Festive Special", cta: "Shop Now",
    ctaLink: "/products/women_sarees", secondCta: "Explore", secondLink: "/products/women_lehenga_cholis",
    image: "https://assets.myntassets.com/h_720,q_90,w_540/v1/assets/images/22866694/2023/4/24/98951db4-e0a5-47f8-a1be-353863d24dc01682349679664KaliniOrangeSilkBlendEthnicWovenDesignFestiveSareewithMatchi2.jpg",
    overlay: "from-black/80 via-black/40 to-transparent", accent: "#f59e0b",
    stats: [{ val: "10K+", label: "Styles" }, { val: "Free", label: "Delivery" }, { val: "7-Day", label: "Returns" }],
    isActive: true, order: 2,
  },
];

// ── ELECTRONICS ───────────────────────────────────────────
// isActive = shows on home scroll
// showInViewAll = shows on /all-electronics page
const ELECTRONICS = [
  // Computing
  { name: "Laptop",      categoryId: "laptops",             subcategory: "Computing",       image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=85",     section: "electronics", isActive: true,  showInViewAll: true, order: 0  },
  { name: "Desktop",     categoryId: "desktops",            subcategory: "Computing",       image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&q=85",     section: "electronics", isActive: false, showInViewAll: true, order: 1  },
  { name: "Tablet",      categoryId: "tablets",             subcategory: "Computing",       image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=85",        section: "electronics", isActive: true,  showInViewAll: true, order: 2  },
  { name: "Monitor",     categoryId: "desktops",            subcategory: "Computing",       image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=85",     section: "electronics", isActive: false, showInViewAll: true, order: 3  },

  // Mobile
  { name: "Mobile",      categoryId: "mobiles",             subcategory: "Mobile",          image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=85",     section: "electronics", isActive: true,  showInViewAll: true, order: 4  },

  // Audio
  { name: "Headphones",  categoryId: "headphones_headsets", subcategory: "Audio",           image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=85",     section: "electronics", isActive: true,  showInViewAll: true, order: 5  },
  { name: "Earbuds",     categoryId: "earbuds",             subcategory: "Audio",           image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=85",     section: "electronics", isActive: true,  showInViewAll: true, order: 6  },
  { name: "Speaker",     categoryId: "speakers",            subcategory: "Audio",           image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=85",     section: "electronics", isActive: true,  showInViewAll: true, order: 7  },

  // Wearables
  { name: "Smartwatch",  categoryId: "smart_watches",       subcategory: "Wearables",       image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=85",     section: "electronics", isActive: true,  showInViewAll: true, order: 8  },

  // TV & Camera
  { name: "TV",          categoryId: "television",          subcategory: "TV & Camera",     image: "https://images.unsplash.com/photo-1593359677879-a4bb92f4834a?w=400&q=85",     section: "electronics", isActive: true,  showInViewAll: true, order: 9  },
  { name: "Camera",      categoryId: "cameras",             subcategory: "TV & Camera",     image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=85",     section: "electronics", isActive: false, showInViewAll: true, order: 10 },

  // Gaming
  { name: "Gaming",      categoryId: "gaming",              subcategory: "Gaming",          image: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=400&q=85",     section: "electronics", isActive: true,  showInViewAll: true, order: 11 },

  // View All extra items
  { name: "iPhone Deals",   categoryId: "mobiles",          subcategory: "Deals",           image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80",  section: "electronics", isActive: false, showInViewAll: true, order: 12, discount: "30% OFF" },
  { name: "Laptop Sale",    categoryId: "laptops",          subcategory: "Deals",           image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",  section: "electronics", isActive: false, showInViewAll: true, order: 13, discount: "40% OFF" },
  { name: "Headphone Loot", categoryId: "headphones_headsets", subcategory: "Deals",        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",  section: "electronics", isActive: false, showInViewAll: true, order: 14, discount: "50% OFF" },
  { name: "Watch Bonanza",  categoryId: "smart_watches",    subcategory: "Deals",           image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",  section: "electronics", isActive: false, showInViewAll: true, order: 15, discount: "35% OFF" },
  { name: "TV Mega Sale",   categoryId: "television",       subcategory: "Deals",           image: "https://images.unsplash.com/photo-1593359677879-a4bb92f4834a?w=400&q=80",  section: "electronics", isActive: false, showInViewAll: true, order: 16, discount: "45% OFF" },
  { name: "Speaker Sale",   categoryId: "speakers",         subcategory: "Deals",           image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",  section: "electronics", isActive: false, showInViewAll: true, order: 17, discount: "55% OFF" },
  { name: "Camera Drop",    categoryId: "cameras",          subcategory: "Deals",           image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",  section: "electronics", isActive: false, showInViewAll: true, order: 18, discount: "25% OFF" },
  { name: "Tablet Steal",   categoryId: "tablets",          subcategory: "Deals",           image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80",  section: "electronics", isActive: false, showInViewAll: true, order: 19, discount: "40% OFF" },
  { name: "Gaming Bonanza", categoryId: "gaming",           subcategory: "Deals",           image: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=400&q=80",  section: "electronics", isActive: false, showInViewAll: true, order: 20, discount: "30% OFF" },
  { name: "Earbuds Sale",   categoryId: "earbuds",          subcategory: "Deals",           image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",  section: "electronics", isActive: false, showInViewAll: true, order: 21, discount: "60% OFF" },
];

// ── MEN ───────────────────────────────────────────────────
const MEN = [
  // Topwear
  { name: "T-Shirts",      categoryId: "men_t_shirts",                   subcategory: "Topwear",      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=85",    section: "men", isActive: true,  showInViewAll: true, order: 0  },
  { name: "Shirts",        categoryId: "men_casual_shirts",              subcategory: "Topwear",      image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=85",    section: "men", isActive: true,  showInViewAll: true, order: 1  },
  { name: "Hoodies",       categoryId: "men_topwear",                    subcategory: "Topwear",      image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=85",       section: "men", isActive: true,  showInViewAll: true, order: 2  },
  { name: "Jackets",       categoryId: "men_topwear",                    subcategory: "Topwear",      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=85",       section: "men", isActive: false, showInViewAll: true, order: 3  },
  { name: "Formal Shirts", categoryId: "men_formal_shirts",              subcategory: "Topwear",      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 4  },
  { name: "Polos",         categoryId: "men_t_shirts",                   subcategory: "Topwear",      image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 5  },

  // Bottomwear
  { name: "Jeans",         categoryId: "men_bottomwear",                 subcategory: "Bottomwear",   image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=85",       section: "men", isActive: true,  showInViewAll: true, order: 6  },
  { name: "Trousers",      categoryId: "men_bottomwear",                 subcategory: "Bottomwear",   image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=85",    section: "men", isActive: true,  showInViewAll: true, order: 7  },
  { name: "Shorts",        categoryId: "men_bottomwear",                 subcategory: "Bottomwear",   image: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 8  },
  { name: "Track Pants",   categoryId: "men_bottomwear",                 subcategory: "Bottomwear",   image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 9  },

  // Footwear
  { name: "Sneakers",      categoryId: "men_footwear",                   subcategory: "Footwear",     image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85",       section: "men", isActive: true,  showInViewAll: true, order: 10 },
  { name: "Formal Shoes",  categoryId: "men_footwear",                   subcategory: "Footwear",     image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 11 },
  { name: "Sandals",       categoryId: "men_footwear",                   subcategory: "Footwear",     image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 12 },
  { name: "Sports Shoes",  categoryId: "men_footwear",                   subcategory: "Footwear",     image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 13 },

  // Accessories
  { name: "Watches",       categoryId: "smart_watches",                  subcategory: "Accessories",  image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=85",    section: "men", isActive: true,  showInViewAll: true, order: 14 },
  { name: "Sunglasses",    categoryId: "men_fashion_accessories",        subcategory: "Accessories",  image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=85",    section: "men", isActive: true,  showInViewAll: true, order: 15 },
  { name: "Wallets",       categoryId: "men_fashion_accessories",        subcategory: "Accessories",  image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 16 },
  { name: "Belts",         categoryId: "men_fashion_accessories",        subcategory: "Accessories",  image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 17 },
  { name: "Caps & Hats",   categoryId: "men_fashion_accessories",        subcategory: "Accessories",  image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 18 },

  // Grooming
  { name: "Perfumes",      categoryId: "men_personal_care_and_grooming", subcategory: "Grooming",     image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=85",    section: "men", isActive: true,  showInViewAll: true, order: 19 },
  { name: "Grooming Kits", categoryId: "men_personal_care_and_grooming", subcategory: "Grooming",     image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 20 },

  // Indian & Festive
  { name: "Kurtas",        categoryId: "men_indian_and_festive_wear",    subcategory: "Indian Wear",  image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 21 },
  { name: "Sherwanis",     categoryId: "men_indian_and_festive_wear",    subcategory: "Indian Wear",  image: "https://images.unsplash.com/photo-1583391733981-3f0bcf3c2c30?w=400&q=85",    section: "men", isActive: false, showInViewAll: true, order: 22 },
];

// ── WOMEN ─────────────────────────────────────────────────
const WOMEN = [
  // Indian Wear
  { name: "Sarees",        categoryId: "women_sarees",                   subcategory: "Indian Wear",        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=85",  section: "women", isActive: true,  showInViewAll: true, order: 0  },
  { name: "Kurtis",        categoryId: "women_indian_and_fusion_wear",   subcategory: "Indian Wear",        image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=85",  section: "women", isActive: true,  showInViewAll: true, order: 1  },
  { name: "Lehenga",       categoryId: "women_lehenga_cholis",           subcategory: "Indian Wear",        image: "https://images.unsplash.com/photo-1583391733981-3f0bcf3c2c30?w=400&q=85",  section: "women", isActive: true,  showInViewAll: true, order: 2  },
  { name: "Anarkalis",     categoryId: "women_indian_and_fusion_wear",   subcategory: "Indian Wear",        image: "https://images.unsplash.com/photo-1583391734975-d97f2c287d91?w=400&q=85",  section: "women", isActive: false, showInViewAll: true, order: 3  },
  { name: "Suits",         categoryId: "women_indian_and_fusion_wear",   subcategory: "Indian Wear",        image: "https://images.unsplash.com/photo-1583391733961-7be890e44e08?w=400&q=85",  section: "women", isActive: false, showInViewAll: true, order: 4  },

  // Western
  { name: "Dresses",       categoryId: "women_western_wear",             subcategory: "Western Wear",       image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=85",  section: "women", isActive: true,  showInViewAll: true, order: 5  },
  { name: "Tops",          categoryId: "women_western_wear",             subcategory: "Western Wear",       image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=85",  section: "women", isActive: true,  showInViewAll: true, order: 6  },
  { name: "Jeans",         categoryId: "women_western_wear",             subcategory: "Western Wear",       image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400&q=85",  section: "women", isActive: false, showInViewAll: true, order: 7  },
  { name: "Skirts",        categoryId: "women_skirts_palazzos",          subcategory: "Western Wear",       image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=85",  section: "women", isActive: false, showInViewAll: true, order: 8  },
  { name: "Co-Ords",       categoryId: "women_western_wear",             subcategory: "Western Wear",       image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=85",  section: "women", isActive: false, showInViewAll: true, order: 9  },

  // Footwear & Bags
  { name: "Heels",         categoryId: "women_footwear",                 subcategory: "Footwear & Bags",    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=85",    section: "women", isActive: true,  showInViewAll: true, order: 10 },
  { name: "Flats",         categoryId: "women_footwear",                 subcategory: "Footwear & Bags",    image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=85",  section: "women", isActive: false, showInViewAll: true, order: 11 },
  { name: "Boots",         categoryId: "women_footwear",                 subcategory: "Footwear & Bags",    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85",    section: "women", isActive: false, showInViewAll: true, order: 12 },
  { name: "Handbags",      categoryId: "women_handbags_bags_wallets",    subcategory: "Footwear & Bags",    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=85",    section: "women", isActive: true,  showInViewAll: true, order: 13 },
  { name: "Backpacks",     categoryId: "women_handbags_bags_wallets",    subcategory: "Footwear & Bags",    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=85",    section: "women", isActive: false, showInViewAll: true, order: 14 },
  { name: "Clutches",      categoryId: "women_handbags_bags_wallets",    subcategory: "Footwear & Bags",    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=85",  section: "women", isActive: false, showInViewAll: true, order: 15 },

  // Jewellery & Beauty
  { name: "Jewellery",     categoryId: "women_jewellery",                subcategory: "Jewellery & Beauty", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=85", section: "women", isActive: true,  showInViewAll: true, order: 16 },
  { name: "Necklaces",     categoryId: "women_jewellery",                subcategory: "Jewellery & Beauty", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=85", section: "women", isActive: false, showInViewAll: true, order: 17 },
  { name: "Earrings",      categoryId: "women_jewellery",                subcategory: "Jewellery & Beauty", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=400&q=85", section: "women", isActive: false, showInViewAll: true, order: 18 },
  { name: "Makeup",        categoryId: "women_beauty_personal_care",     subcategory: "Jewellery & Beauty", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=85", section: "women", isActive: true,  showInViewAll: true, order: 19 },
  { name: "Skincare",      categoryId: "women_beauty_personal_care",     subcategory: "Jewellery & Beauty", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=85",  section: "women", isActive: false, showInViewAll: true, order: 20 },
  { name: "Perfumes",      categoryId: "women_beauty_personal_care",     subcategory: "Jewellery & Beauty", image: "https://images.unsplash.com/photo-1557170334-a9086d21c41b?w=400&q=85",  section: "women", isActive: false, showInViewAll: true, order: 21 },

  // Sports
  { name: "Sports Wear",   categoryId: "women_sports_active_wear",       subcategory: "Sports",             image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=85", section: "women", isActive: false, showInViewAll: true, order: 22 },
  { name: "Yoga Wear",     categoryId: "women_sports_active_wear",       subcategory: "Sports",             image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=85",  section: "women", isActive: false, showInViewAll: true, order: 23 },

  // Lingerie
  { name: "Loungewear",    categoryId: "women_lingerie_sleepwear",       subcategory: "Lingerie",           image: "https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=400&q=85",  section: "women", isActive: false, showInViewAll: true, order: 24 },
];

// ── FASHION ───────────────────────────────────────────────
const FASHION = [
  // Trending
  { name: "Streetwear",    categoryId: "men_topwear",              subcategory: "Trending",  image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=85",    section: "fashion", isActive: true,  showInViewAll: true, order: 0  },
  { name: "Athleisure",    categoryId: "women_sports_active_wear", subcategory: "Trending",  image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=85", section: "fashion", isActive: true,  showInViewAll: true, order: 1  },
  { name: "Y2K Style",     categoryId: "women_western_wear",       subcategory: "Trending",  image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=85", section: "fashion", isActive: false, showInViewAll: true, order: 2  },
  { name: "Minimalist",    categoryId: "men_t_shirts",             subcategory: "Trending",  image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=85", section: "fashion", isActive: true,  showInViewAll: true, order: 3  },
  { name: "Oversized",     categoryId: "men_topwear",              subcategory: "Trending",  image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&q=85",    section: "fashion", isActive: false, showInViewAll: true, order: 4  },
  { name: "Vintage",       categoryId: "women_western_wear",       subcategory: "Trending",  image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=85", section: "fashion", isActive: false, showInViewAll: true, order: 5  },

  // Occasion
  { name: "Wedding",       categoryId: "women_lehenga_cholis",     subcategory: "Occasion",  image: "https://images.unsplash.com/photo-1583391733981-3f0bcf3c2c30?w=400&q=85", section: "fashion", isActive: true,  showInViewAll: true, order: 6  },
  { name: "Party Wear",    categoryId: "women_western_wear",       subcategory: "Occasion",  image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=85", section: "fashion", isActive: true,  showInViewAll: true, order: 7  },
  { name: "Office Wear",   categoryId: "men_formal_shirts",        subcategory: "Occasion",  image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=85", section: "fashion", isActive: true,  showInViewAll: true, order: 8  },
  { name: "Festive",       categoryId: "women_sarees",             subcategory: "Occasion",  image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=85", section: "fashion", isActive: false, showInViewAll: true, order: 9  },
  { name: "Date Night",    categoryId: "women_western_wear",       subcategory: "Occasion",  image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=85", section: "fashion", isActive: false, showInViewAll: true, order: 10 },
  { name: "Vacation",      categoryId: "women_western_wear",       subcategory: "Occasion",  image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=85", section: "fashion", isActive: false, showInViewAll: true, order: 11 },
  { name: "Casual",        categoryId: "men_t_shirts",             subcategory: "Occasion",  image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=85", section: "fashion", isActive: true,  showInViewAll: true, order: 12 },
  { name: "Sports",        categoryId: "men_footwear",             subcategory: "Occasion",  image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85",    section: "fashion", isActive: true,  showInViewAll: true, order: 13 },

  // Lifestyle
  { name: "Fitness Gear",  categoryId: "women_sports_active_wear", subcategory: "Lifestyle", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=85", section: "fashion", isActive: false, showInViewAll: true, order: 14 },
  { name: "Yoga Wear",     categoryId: "women_sports_active_wear", subcategory: "Lifestyle", image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=85",  section: "fashion", isActive: false, showInViewAll: true, order: 15 },
  { name: "Loungewear",    categoryId: "men_innerwear_and_sleepwear", subcategory: "Lifestyle", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&q=85", section: "fashion", isActive: false, showInViewAll: true, order: 16 },
  { name: "Travel Bags",   categoryId: "women_handbags_bags_wallets", subcategory: "Lifestyle", image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&q=85", section: "fashion", isActive: false, showInViewAll: true, order: 17 },
  { name: "Backpacks",     categoryId: "men_fashion_accessories",  subcategory: "Lifestyle", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=85",   section: "fashion", isActive: false, showInViewAll: true, order: 18 },
];

// ── LIGHTNING DEALS ───────────────────────────────────────
const LIGHTNING = [
  // Electronics Deals
  { name: "iPhone Deals",    categoryId: "mobiles",                      discount: "Up to 30%", subcategory: "Electronics", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=85",  section: "lightning", isActive: true, showInViewAll: true, order: 0  },
  { name: "Laptop Sale",     categoryId: "laptops",                      discount: "Up to 40%", subcategory: "Electronics", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=85",  section: "lightning", isActive: true, showInViewAll: true, order: 1  },
  { name: "Headphone Loot",  categoryId: "headphones_headsets",          discount: "Up to 50%", subcategory: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=85",  section: "lightning", isActive: true, showInViewAll: true, order: 2  },
  { name: "Watch Bonanza",   categoryId: "smart_watches",                discount: "Up to 35%", subcategory: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=85",  section: "lightning", isActive: true, showInViewAll: true, order: 3  },
  { name: "TV Mega Sale",    categoryId: "television",                   discount: "Up to 45%", subcategory: "Electronics", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f4834a?w=400&q=85",  section: "lightning", isActive: true, showInViewAll: true, order: 4  },
  { name: "Speaker Sale",    categoryId: "speakers",                     discount: "Up to 55%", subcategory: "Electronics", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=85",  section: "lightning", isActive: true, showInViewAll: true, order: 5  },
  { name: "Camera Drop",     categoryId: "cameras",                      discount: "Up to 25%", subcategory: "Electronics", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 6  },
  { name: "Tablet Steal",    categoryId: "tablets",                      discount: "Up to 40%", subcategory: "Electronics", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 7  },
  { name: "Gaming Bonanza",  categoryId: "gaming",                       discount: "Up to 30%", subcategory: "Electronics", image: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 8  },
  { name: "Earbuds Sale",    categoryId: "earbuds",                      discount: "Up to 60%", subcategory: "Electronics", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 9  },

  // Fashion Deals
  { name: "Fashion Deals",   categoryId: "men_topwear",                  discount: "Up to 60%", subcategory: "Fashion",     image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=85",  section: "lightning", isActive: true, showInViewAll: true, order: 10 },
  { name: "Saree Special",   categoryId: "women_sarees",                 discount: "Up to 70%", subcategory: "Fashion",     image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=85",  section: "lightning", isActive: true, showInViewAll: true, order: 11 },
  { name: "Footwear Sale",   categoryId: "men_footwear",                 discount: "Up to 50%", subcategory: "Fashion",     image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85",    section: "lightning", isActive: true, showInViewAll: true, order: 12 },
  { name: "Bag Bonanza",     categoryId: "women_handbags_bags_wallets",  discount: "Up to 55%", subcategory: "Fashion",     image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=85",    section: "lightning", isActive: true, showInViewAll: true, order: 13 },
  { name: "Jeans Sale",      categoryId: "men_bottomwear",               discount: "Up to 45%", subcategory: "Fashion",     image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=85",    section: "lightning", isActive: false,showInViewAll: true, order: 14 },
  { name: "Dress Deals",     categoryId: "women_western_wear",           discount: "Up to 65%", subcategory: "Fashion",     image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 15 },
  { name: "Lehenga Sale",    categoryId: "women_lehenga_cholis",         discount: "Up to 50%", subcategory: "Fashion",     image: "https://images.unsplash.com/photo-1583391733981-3f0bcf3c2c30?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 16 },
  { name: "Shirts Steal",    categoryId: "men_casual_shirts",            discount: "Up to 55%", subcategory: "Fashion",     image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 17 },

  // Beauty Deals
  { name: "Makeup Mega",     categoryId: "women_beauty_personal_care",   discount: "Up to 40%", subcategory: "Beauty",      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 18 },
  { name: "Skincare Sale",   categoryId: "women_beauty_personal_care",   discount: "Up to 35%", subcategory: "Beauty",      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 19 },
  { name: "Perfume Bonanza", categoryId: "women_beauty_personal_care",   discount: "Up to 50%", subcategory: "Beauty",      image: "https://images.unsplash.com/photo-1557170334-a9086d21c41b?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 20 },
  { name: "Hair Care Deals", categoryId: "women_beauty_personal_care",   discount: "Up to 30%", subcategory: "Beauty",      image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 21 },

  // Accessories
  { name: "Jewellery Steal", categoryId: "women_jewellery",              discount: "Up to 60%", subcategory: "Accessories", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 22 },
  { name: "Sunglasses Sale", categoryId: "men_fashion_accessories",      discount: "Up to 45%", subcategory: "Accessories", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 23 },
  { name: "Wallet Wonders",  categoryId: "men_fashion_accessories",      discount: "Up to 40%", subcategory: "Accessories", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=85",  section: "lightning", isActive: false,showInViewAll: true, order: 24 },
];

// ── FURNITURE ─────────────────────────────────────────────
const FURNITURE = [
  { name: "Sofas",      categoryId: "home_furniture",      subcategory: "Living Room", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=85",    section: "furniture", isActive: true,  showInViewAll: true, order: 0 },
  { name: "Beds",       categoryId: "home_furniture",      subcategory: "Bedroom",     image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=85",  section: "furniture", isActive: true,  showInViewAll: true, order: 1 },
  { name: "Dining",     categoryId: "home_furniture",      subcategory: "Dining",      image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=400&q=85",  section: "furniture", isActive: true,  showInViewAll: true, order: 2 },
  { name: "Wardrobes",  categoryId: "home_furniture",      subcategory: "Bedroom",     image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=85",  section: "furniture", isActive: true,  showInViewAll: true, order: 3 },
  { name: "Office",     categoryId: "home_furniture",      subcategory: "Office",      image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&q=85",  section: "furniture", isActive: true,  showInViewAll: true, order: 4 },
  { name: "Lighting",   categoryId: "home_furnishing",     subcategory: "Decor",       image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=85",  section: "furniture", isActive: true,  showInViewAll: true, order: 5 },
  { name: "Decor",      categoryId: "home_furnishing",     subcategory: "Decor",       image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=85",  section: "furniture", isActive: true,  showInViewAll: true, order: 6 },
  { name: "Kitchen",    categoryId: "kitchen_dining",      subcategory: "Kitchen",     image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=85",     section: "furniture", isActive: true,  showInViewAll: true, order: 7 },
  { name: "Bath",       categoryId: "home_furnishing",     subcategory: "Bath",        image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=85",     section: "furniture", isActive: false, showInViewAll: true, order: 8 },
  { name: "Garden",     categoryId: "home_garden_outdoor", subcategory: "Outdoor",     image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=85",  section: "furniture", isActive: false, showInViewAll: true, order: 9 },
];

async function seed() {
  try {
    await connectDB();
    console.log("🔗 Connected to DB");

    // Banners
    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.insertMany(BANNERS);
      console.log(`✅ Seeded ${BANNERS.length} banners`);
    } else {
      console.log(`⏭️  Banners already exist (${bannerCount}), skipping`);
    }

    // Clear & re-seed all section items
    const existing = await SectionItem.countDocuments();
    if (existing > 0) {
      await SectionItem.deleteMany({});
      console.log(`🗑️  Cleared ${existing} old items`);
    }

    const ALL = [...ELECTRONICS, ...MEN, ...WOMEN, ...FASHION, ...LIGHTNING, ...FURNITURE];
    await SectionItem.insertMany(ALL);

    console.log(`\n✅ Seeded ${ALL.length} total items:`);
    console.log(`   Electronics : ${ELECTRONICS.length} (${ELECTRONICS.filter(i=>i.isActive).length} on home scroll)`);
    console.log(`   Men         : ${MEN.length} (${MEN.filter(i=>i.isActive).length} on home scroll)`);
    console.log(`   Women       : ${WOMEN.length} (${WOMEN.filter(i=>i.isActive).length} on home scroll)`);
    console.log(`   Fashion     : ${FASHION.length} (${FASHION.filter(i=>i.isActive).length} on home scroll)`);
    console.log(`   Lightning   : ${LIGHTNING.length} (${LIGHTNING.filter(i=>i.isActive).length} on home scroll)`);
    console.log(`   Furniture   : ${FURNITURE.length} (${FURNITURE.filter(i=>i.isActive).length} on home scroll)`);
    console.log(`\n🎉 Nexkart seeding complete!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();