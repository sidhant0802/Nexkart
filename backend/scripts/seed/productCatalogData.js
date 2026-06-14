// backend/productCatalogData.js
// Master product catalog (no seller, no price — those go in listings)
module.exports = [
  // ══════════ APPLE ══════════
  { brand: "apple", category: "mobiles", title: "Apple iPhone 15 Pro Max 256GB", description: "A17 Pro chip, Titanium design, 48MP camera with 5x Telephoto", color: "Natural Titanium",
    images: ["https://images.unsplash.com/photo-1696446702183-be9605969db1?w=800","https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"] },
  { brand: "apple", category: "mobiles", title: "Apple iPhone 15 Pro 128GB", description: "A17 Pro chip with titanium build, ProMotion 120Hz display", color: "Blue Titanium",
    images: ["https://images.unsplash.com/photo-1696423263905-5b5e1b4ec1c8?w=800"] },
  { brand: "apple", category: "mobiles", title: "Apple iPhone 15 128GB", description: "Dynamic Island, 48MP camera, USB-C, A16 Bionic", color: "Pink",
    images: ["https://images.unsplash.com/photo-1592286927505-1def25115558?w=800"] },
  { brand: "apple", category: "mobiles", title: "Apple iPhone 14 128GB", description: "A15 Bionic, advanced dual-camera system, all-day battery life", color: "Midnight",
    images: ["https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800"] },
  { brand: "apple", category: "laptops", title: "Apple MacBook Air M2 13-inch 256GB", description: "M2 chip, Liquid Retina display, 18-hour battery, fanless design", color: "Space Grey",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"] },
  { brand: "apple", category: "laptops", title: "Apple MacBook Pro M3 14-inch 512GB", description: "M3 chip, Liquid Retina XDR, up to 22 hours battery", color: "Space Black",
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"] },
  { brand: "apple", category: "headphones_headsets", title: "Apple AirPods Pro 2nd Gen", description: "Active Noise Cancellation, Adaptive Audio, MagSafe Charging Case", color: "White",
    images: ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800"] },
  { brand: "apple", category: "smart_watches", title: "Apple Watch Series 9 GPS 45mm", description: "S9 SiP, Double Tap gesture, Always-On Retina display", color: "Midnight",
    images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800"] },

  // ══════════ SAMSUNG ══════════
  { brand: "samsung", category: "mobiles", title: "Samsung Galaxy S24 Ultra 5G 256GB", description: "200MP camera, S Pen, Galaxy AI, Snapdragon 8 Gen 3", color: "Titanium Black",
    images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800"] },
  { brand: "samsung", category: "mobiles", title: "Samsung Galaxy S24 5G 128GB", description: "Galaxy AI, 50MP camera, Snapdragon 8 Gen 3", color: "Cobalt Violet",
    images: ["https://images.unsplash.com/photo-1707226789318-bcd86b59ee0b?w=800"] },
  { brand: "samsung", category: "mobiles", title: "Samsung Galaxy A54 5G 128GB", description: "50MP OIS Camera, Super AMOLED 120Hz, 5000mAh battery", color: "Awesome Lime",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"] },
  { brand: "samsung", category: "mobiles", title: "Samsung Galaxy M14 5G 128GB", description: "6000mAh battery, 50MP triple camera, Exynos 1330", color: "Smoky Teal",
    images: ["https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800"] },
  { brand: "samsung", category: "headphones_headsets", title: "Samsung Galaxy Buds2 Pro", description: "Intelligent ANC, 24-bit Hi-Fi sound, 360 Audio", color: "Graphite",
    images: ["https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800"] },
  { brand: "samsung", category: "smart_watches", title: "Samsung Galaxy Watch6 44mm", description: "Sleep coaching, Body composition, Wear OS", color: "Graphite",
    images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800"] },
  { brand: "samsung", category: "home_furniture", title: "Samsung 1.5 Ton 3 Star Inverter Split AC", description: "Convertible 5-in-1, Anti-Bacterial Filter, Copper Coil", color: "White",
    images: ["https://images.unsplash.com/photo-1631545806609-c0fa4ddd4a1d?w=800"] },
  { brand: "samsung", category: "home_furniture", title: "Samsung 55 inch Crystal 4K UHD Smart TV", description: "Crystal Processor 4K, Tizen OS, Q-Symphony, HDR10+", color: "Black",
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800"] },

  // ══════════ ONEPLUS ══════════
  { brand: "oneplus", category: "mobiles", title: "OnePlus 12 5G 256GB", description: "Snapdragon 8 Gen 3, 50MP Hasselblad Camera, 100W SUPERVOOC", color: "Silky Black",
    images: ["https://images.unsplash.com/photo-1707227036313-3e2b893c8b34?w=800"] },
  { brand: "oneplus", category: "mobiles", title: "OnePlus 11R 5G 128GB", description: "Snapdragon 8+ Gen 1, 100W SUPERVOOC, 120Hz AMOLED", color: "Galactic Silver",
    images: ["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800"] },
  { brand: "oneplus", category: "mobiles", title: "OnePlus Nord CE 3 Lite 5G 128GB", description: "108MP Camera, 67W SUPERVOOC, 5000mAh Battery", color: "Pastel Lime",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"] },
  { brand: "oneplus", category: "headphones_headsets", title: "OnePlus Buds Pro 2", description: "Spatial Audio, 48dB Adaptive Noise Cancellation, MelodyBoost", color: "Obsidian Black",
    images: ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800"] },

  // ══════════ XIAOMI ══════════
  { brand: "xiaomi", category: "mobiles", title: "Xiaomi 14 5G 256GB", description: "Snapdragon 8 Gen 3, Leica Optics, 90W HyperCharge", color: "Jade Green",
    images: ["https://images.unsplash.com/photo-1707227036313-3e2b893c8b34?w=800"] },
  { brand: "xiaomi", category: "mobiles", title: "Redmi Note 13 Pro 5G", description: "200MP OIS Camera, Snapdragon 7s Gen 2, 120Hz AMOLED", color: "Coral Purple",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"] },
  { brand: "xiaomi", category: "smart_watches", title: "Xiaomi Smart Band 8", description: "1.62-inch AMOLED, 16-day battery, 150+ workout modes", color: "Graphite Black",
    images: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800"] },

  // ══════════ REALME ══════════
  { brand: "realme", category: "mobiles", title: "Realme 12 Pro+ 5G 256GB", description: "Periscope Telephoto Camera, Snapdragon 7s Gen 2, 67W SUPERVOOC", color: "Submarine Blue",
    images: ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800"] },
  { brand: "realme", category: "mobiles", title: "Realme Narzo 60 Pro 5G", description: "100MP Pro Light Camera, Dimensity 7050, 67W SUPERVOOC", color: "Cosmic Black",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"] },

  // ══════════ GOOGLE ══════════
  { brand: "google", category: "mobiles", title: "Google Pixel 8 Pro 256GB", description: "Tensor G3, Magic Eraser, Best Take, Pro Triple Camera", color: "Obsidian",
    images: ["https://images.unsplash.com/photo-1696446702183-be9605969db1?w=800"] },
  { brand: "google", category: "mobiles", title: "Google Pixel 8 128GB", description: "Tensor G3, Magic Eraser, 6.2-inch Actua display", color: "Hazel",
    images: ["https://images.unsplash.com/photo-1592286927505-1def25115558?w=800"] },

  // ══════════ NOTHING ══════════
  { brand: "nothing", category: "mobiles", title: "Nothing Phone (2) 256GB", description: "Glyph Interface, Snapdragon 8+ Gen 1, 50MP Dual Camera", color: "White",
    images: ["https://images.unsplash.com/photo-1696446702290-39a72f8e2d10?w=800"] },
  { brand: "nothing", category: "mobiles", title: "Nothing Phone (2a) 128GB", description: "Glyph Interface, Dimensity 7200 Pro, 120Hz AMOLED", color: "Black",
    images: ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800"] },

  // ══════════ VIVO ══════════
  { brand: "vivo", category: "mobiles", title: "Vivo X100 Pro 5G", description: "ZEISS APO Telephoto, Dimensity 9300, 100W FlashCharge", color: "Asteroid Black",
    images: ["https://images.unsplash.com/photo-1707226789318-bcd86b59ee0b?w=800"] },
  { brand: "vivo", category: "mobiles", title: "Vivo V30 Pro 5G", description: "50MP ZEISS Multifocal Portrait Camera, Aura Light Portrait", color: "Andaman Blue",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"] },

  // ══════════ OPPO ══════════
  { brand: "oppo", category: "mobiles", title: "OPPO Reno 11 Pro 5G", description: "50MP Telephoto Portrait, Snapdragon 8+ Gen 1, 80W SUPERVOOC", color: "Pearl White",
    images: ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800"] },

  // ══════════ MOTOROLA ══════════
  { brand: "motorola", category: "mobiles", title: "Motorola Edge 50 Pro 5G", description: "125W TurboPower, 144Hz pOLED, IP68", color: "Vegan Leather Black",
    images: ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800"] },
  { brand: "motorola", category: "mobiles", title: "Motorola G84 5G", description: "50MP OIS Camera, 5000mAh Battery, pOLED Display", color: "Marshmallow Blue",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"] },

  // ══════════ POCO ══════════
  { brand: "poco", category: "mobiles", title: "POCO X6 Pro 5G", description: "Dimensity 8300-Ultra, 64MP OIS Camera, 67W TurboCharge", color: "Yellow",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"] },

  // ══════════ IQOO ══════════
  { brand: "iqoo", category: "mobiles", title: "iQOO 12 5G 256GB", description: "Snapdragon 8 Gen 3, BMW M Motorsport, 120W FlashCharge", color: "Legend",
    images: ["https://images.unsplash.com/photo-1707227036313-3e2b893c8b34?w=800"] },

  // ══════════ DELL ══════════
  { brand: "dell", category: "laptops", title: "Dell XPS 13 Plus", description: "Intel Core i7-1360P, 16GB RAM, 512GB SSD, 13.4-inch OLED", color: "Platinum Silver",
    images: ["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"] },
  { brand: "dell", category: "laptops", title: "Dell Inspiron 15 3520", description: "Intel Core i5-1235U, 8GB RAM, 512GB SSD, Windows 11", color: "Carbon Black",
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"] },
  { brand: "dell", category: "laptops", title: "Dell G15 5530 Gaming Laptop", description: "Intel Core i7-13650HX, RTX 4060, 16GB DDR5", color: "Dark Shadow Grey",
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"] },

  // ══════════ HP ══════════
  { brand: "hp", category: "laptops", title: "HP Pavilion 15 Laptop", description: "AMD Ryzen 7 7730U, 16GB RAM, 512GB SSD, 15.6-inch FHD", color: "Natural Silver",
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"] },
  { brand: "hp", category: "laptops", title: "HP Victus 15 Gaming Laptop", description: "Intel Core i5-12450H, RTX 2050, 16GB RAM, 144Hz Display", color: "Mica Silver",
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"] },
  { brand: "hp", category: "laptops", title: "HP 15s Laptop", description: "Intel Core i3-1215U, 8GB RAM, 512GB SSD, Windows 11", color: "Natural Silver",
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"] },

  // ══════════ ASUS ══════════
  { brand: "asus", category: "laptops", title: "ASUS ROG Strix G16 Gaming", description: "Intel Core i7-13650HX, RTX 4060, 16GB DDR5, 165Hz", color: "Eclipse Gray",
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"] },
  { brand: "asus", category: "laptops", title: "ASUS Vivobook 15", description: "Intel Core i5-1235U, 16GB RAM, 512GB SSD, FHD Display", color: "Quiet Blue",
    images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800"] },

  // ══════════ LENOVO ══════════
  { brand: "lenovo", category: "laptops", title: "Lenovo IdeaPad Slim 3", description: "AMD Ryzen 5 7530U, 8GB RAM, 512GB SSD, FHD", color: "Arctic Grey",
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"] },
  { brand: "lenovo", category: "laptops", title: "Lenovo Legion 5 Gaming", description: "AMD Ryzen 7 7735HS, RTX 4060, 16GB RAM, 165Hz", color: "Storm Grey",
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"] },

  // ══════════ ACER ══════════
  { brand: "acer", category: "laptops", title: "Acer Aspire 5", description: "Intel Core i5-1335U, 16GB RAM, 512GB SSD, 15.6-inch", color: "Pure Silver",
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"] },

  // ══════════ SONY ══════════
  { brand: "sony", category: "headphones_headsets", title: "Sony WH-1000XM5 Wireless", description: "Industry-leading Noise Cancellation, 30hr battery, LDAC", color: "Black",
    images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800"] },
  { brand: "sony", category: "headphones_headsets", title: "Sony WF-1000XM5 Earbuds", description: "Industry-leading Noise Cancellation, 8mm Driver, 24hr Battery", color: "Silver",
    images: ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800"] },
  { brand: "sony", category: "home_furniture", title: "Sony Bravia 55-inch 4K Google TV", description: "X1 Processor, Triluminos Pro, Acoustic Multi-Audio", color: "Black",
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800"] },

  // ══════════ BOSE ══════════
  { brand: "bose", category: "headphones_headsets", title: "Bose QuietComfort Ultra Headphones", description: "Immersive Audio, World-class Noise Cancellation", color: "Black",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"] },
  { brand: "bose", category: "headphones_headsets", title: "Bose QuietComfort 45", description: "Acclaimed noise cancellation, 24-hour battery", color: "Triple Black",
    images: ["https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"] },

  // ══════════ JBL ══════════
  { brand: "jbl", category: "headphones_headsets", title: "JBL Tune 770NC", description: "Adaptive Noise Cancelling, 70hr Battery, Pure Bass", color: "Black",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"] },
  { brand: "jbl", category: "headphones_headsets", title: "JBL Flip 6 Bluetooth Speaker", description: "Powerful JBL Original Pro Sound, IP67, 12hr playtime", color: "Squad",
    images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800"] },

  // ══════════ BOAT ══════════
  { brand: "boat", category: "headphones_headsets", title: "boAt Rockerz 450 Bluetooth Headphones", description: "40mm drivers, 15hr playtime, BT v5.0", color: "Luscious Black",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"] },
  { brand: "boat", category: "headphones_headsets", title: "boAt Airdopes 141 TWS", description: "42hr playtime, ENx Tech, IPX4, BT v5.1", color: "Bold Black",
    images: ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800"] },
  { brand: "boat", category: "smart_watches", title: "boAt Wave Call Smart Watch", description: "BT Calling, 1.69-inch HD, 700+ Watch Faces", color: "Active Black",
    images: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800"] },

  // ══════════ NOISE ══════════
  { brand: "noise", category: "smart_watches", title: "Noise ColorFit Pro 4", description: "1.72-inch TFT-LCD, BT Calling, 60+ Sports Modes", color: "Jet Black",
    images: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800"] },
  { brand: "noise", category: "smart_watches", title: "Noise ColorFit Ultra 3", description: "1.96-inch AMOLED, BT Calling, AI Voice Assistant", color: "Silver Grey",
    images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800"] },

  // ══════════ FIRE-BOLTT ══════════
  { brand: "fire-boltt", category: "smart_watches", title: "Fire-Boltt Ninja Call Pro Plus", description: "1.83-inch HD, BT Calling, 100+ Sports Modes", color: "Black",
    images: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800"] },

  // ══════════ LG ══════════
  { brand: "lg", category: "home_furniture", title: "LG 55-inch OLED C3 4K Smart TV", description: "α9 AI Processor Gen6, Dolby Vision IQ, NVIDIA G-SYNC", color: "Dark Titan Silver",
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800"] },
  { brand: "lg", category: "home_furniture", title: "LG 1.5 Ton 5 Star AI DUAL Inverter Split AC", description: "AI Convertible 6-in-1, Stabilizer Free, 4-Way Swing", color: "White",
    images: ["https://images.unsplash.com/photo-1631545806609-c0fa4ddd4a1d?w=800"] },

  // ══════════ DAIKIN ══════════
  { brand: "daikin", category: "home_furniture", title: "Daikin 1.5 Ton 5 Star Inverter Split AC", description: "Copper Coil, Triple Display, Coanda Airflow", color: "White",
    images: ["https://images.unsplash.com/photo-1631545806609-c0fa4ddd4a1d?w=800"] },

  // ══════════ VOLTAS ══════════
  { brand: "voltas", category: "home_furniture", title: "Voltas 1.5 Ton 3 Star Inverter Split AC", description: "Adjustable Mode, 4-in-1 Adjustable Cooling, Copper", color: "White",
    images: ["https://images.unsplash.com/photo-1631545806609-c0fa4ddd4a1d?w=800"] },

  // ══════════ NIKE ══════════
  { brand: "nike", category: "men_footwear", title: "Nike Air Jordan 1 Mid", description: "Iconic basketball silhouette, premium leather upper", color: "White Black Red", sizes: "7,8,9,10,11",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"] },
  { brand: "nike", category: "men_footwear", title: "Nike Air Force 1 '07", description: "Classic AF1, Leather upper, Iconic style", color: "Triple White", sizes: "7,8,9,10,11",
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"] },
  { brand: "nike", category: "men_sneakers", title: "Nike Air Max 90", description: "Visible Air cushioning, Iconic 90s design", color: "White Grey", sizes: "7,8,9,10,11",
    images: ["https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800"] },
  { brand: "nike", category: "men_t_shirts", title: "Nike Sportswear Club T-Shirt", description: "100% cotton, Embroidered Swoosh, Regular fit", color: "Black", sizes: "S,M,L,XL,XXL",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"] },

  // ══════════ ADIDAS ══════════
  { brand: "adidas", category: "men_footwear", title: "Adidas Ultraboost 22", description: "BOOST midsole, Primeknit+ upper, Continental rubber outsole", color: "Core Black", sizes: "7,8,9,10,11",
    images: ["https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=800"] },
  { brand: "adidas", category: "men_sneakers", title: "Adidas Stan Smith Sneakers", description: "Classic tennis shoe, Vegan leather upper", color: "White Green", sizes: "7,8,9,10,11",
    images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800"] },
  { brand: "adidas", category: "men_t_shirts", title: "Adidas Essentials 3-Stripes T-Shirt", description: "Cotton jersey, Regular fit, Iconic 3 Stripes", color: "Black", sizes: "S,M,L,XL,XXL",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"] },

  // ══════════ PUMA ══════════
  { brand: "puma", category: "men_footwear", title: "Puma RS-X Sneakers", description: "Bold chunky design, Comfortable cushioning", color: "White Multi", sizes: "7,8,9,10,11",
    images: ["https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800"] },
  { brand: "puma", category: "men_t_shirts", title: "Puma Essentials Logo T-Shirt", description: "Cotton, Regular fit, No.1 Logo Print", color: "Navy", sizes: "S,M,L,XL,XXL",
    images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800"] },

  // ══════════ REEBOK ══════════
  { brand: "reebok", category: "men_footwear", title: "Reebok Classic Leather Sneakers", description: "Soft leather upper, EVA midsole", color: "White", sizes: "7,8,9,10,11",
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"] },

  // ══════════ LEVI'S ══════════
  { brand: "levi-s", category: "men", title: "Levi's 511 Slim Fit Jeans", description: "Stretch denim, Mid-rise, Classic 5-pocket", color: "Dark Indigo", sizes: "30,32,34,36",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"] },
  { brand: "levi-s", category: "men", title: "Levi's 501 Original Fit Jeans", description: "Iconic straight leg, Button fly, 100% cotton", color: "Stonewash", sizes: "30,32,34,36",
    images: ["https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800"] },

  // ══════════ ALLEN SOLLY ══════════
  { brand: "allen-solly", category: "men_formal_shirts", title: "Allen Solly Slim Fit Formal Shirt", description: "100% Cotton, Spread Collar, Long Sleeves", color: "Light Blue", sizes: "S,M,L,XL,XXL",
    images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800"] },
  { brand: "allen-solly", category: "men_casual_shirts", title: "Allen Solly Casual Check Shirt", description: "Cotton blend, Slim fit, Button-down collar", color: "Navy Check", sizes: "S,M,L,XL,XXL",
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"] },

  // ══════════ PETER ENGLAND ══════════
  { brand: "peter-england", category: "men_formal_shirts", title: "Peter England Slim Fit Formal Shirt", description: "Easy Care, Cotton blend, Spread Collar", color: "White", sizes: "S,M,L,XL,XXL",
    images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800"] },
  { brand: "peter-england", category: "men_formal_shoes", title: "Peter England Leather Formal Shoes", description: "Genuine leather, Lace-up, Office wear", color: "Black", sizes: "7,8,9,10,11",
    images: ["https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800"] },

  // ══════════ VAN HEUSEN ══════════
  { brand: "van-heusen", category: "men_formal_shirts", title: "Van Heusen Slim Fit Shirt", description: "Cotton rich, Easy Iron, Spread Collar", color: "Sky Blue", sizes: "S,M,L,XL,XXL",
    images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800"] },

  // ══════════ ZARA ══════════
  { brand: "zara", category: "women", title: "Zara Floral Print Midi Dress", description: "Lightweight fabric, V-neckline, Belted waist", color: "Multi", sizes: "XS,S,M,L,XL",
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800"] },
  { brand: "zara", category: "women_western_wear", title: "Zara Oversized Blazer", description: "Tailored fit, Notched lapels, Single button", color: "Black", sizes: "XS,S,M,L,XL",
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800"] },
  { brand: "zara", category: "men_casual_shirts", title: "Zara Slim Fit Linen Shirt", description: "100% Linen, Long sleeves, Spread collar", color: "White", sizes: "S,M,L,XL",
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"] },

  // ══════════ H&M ══════════
  { brand: "h-and-m", category: "women", title: "H&M Cotton Maxi Dress", description: "Soft cotton, Sleeveless, A-line cut", color: "Floral Print", sizes: "XS,S,M,L,XL",
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800"] },
  { brand: "h-and-m", category: "men_t_shirts", title: "H&M Regular Fit T-Shirt", description: "Soft cotton jersey, Crew neck", color: "Grey", sizes: "S,M,L,XL,XXL",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"] },

  // ══════════ BIBA ══════════
  { brand: "biba", category: "women_sarees", title: "Biba Printed Anarkali Kurta", description: "Cotton blend, 3/4 sleeves, Anarkali style", color: "Pink", sizes: "S,M,L,XL,XXL",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"] },
  { brand: "biba", category: "women_sarees", title: "Biba Floral Print Suit Set", description: "Kurta with palazzo and dupatta, Cotton", color: "Yellow", sizes: "S,M,L,XL,XXL",
    images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800"] },

  // ══════════ FABINDIA ══════════
  { brand: "fabindia", category: "women_sarees", title: "Fabindia Cotton Saree", description: "Handloom cotton, 6.3m with blouse piece", color: "White Red", sizes: "Free Size",
    images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800"] },

  // ══════════ BATA ══════════
  { brand: "bata", category: "men_formal_shoes", title: "Bata Formal Leather Shoes", description: "Genuine leather, Lace-up, Office wear", color: "Black", sizes: "7,8,9,10,11",
    images: ["https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800"] },

  // ══════════ WOODLAND ══════════
  { brand: "woodland", category: "men_footwear", title: "Woodland Leather Casual Boots", description: "Genuine leather, Anti-skid sole", color: "Camel", sizes: "7,8,9,10,11",
    images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"] },

  // ══════════ CROCS ══════════
  { brand: "crocs", category: "men_footwear", title: "Crocs Classic Clog", description: "Iconic Crocs Comfort, Croslite material", color: "Black", sizes: "7,8,9,10,11",
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800"] },

  // ══════════ IKEA ══════════
  { brand: "ikea", category: "home_furniture", title: "IKEA MALM Bed Frame Queen", description: "High bed frame, Veneer, Storage box optional", color: "White",
    images: ["https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800"] },
  { brand: "ikea", category: "home_furniture", title: "IKEA POÄNG Armchair", description: "Birch veneer, Cushioned seat, Ergonomic", color: "Birch",
    images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800"] },

  // ══════════ URBAN LADDER ══════════
  { brand: "urban-ladder", category: "home_furniture", title: "Urban Ladder Castello Sofa", description: "3-seater, Solid wood frame, Velvet upholstery", color: "Beige",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"] },

  // ══════════ WAKEFIT ══════════
  { brand: "wakefit", category: "home_furniture", title: "Wakefit Orthopedic Memory Foam Mattress Queen", description: "5 inch, Memory foam, Medium firm", color: "White",
    images: ["https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800"] },
];