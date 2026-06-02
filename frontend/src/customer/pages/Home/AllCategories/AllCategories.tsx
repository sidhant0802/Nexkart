// src/customer/pages/Home/AllCategories/AllCategories.tsx

import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { useTheme } from "../../../../routes/CustomerRoutes";
import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface SubCategory {
  name:        string;
  categoryId:  string;
  image:       string;
  discount?:   string;   // for deals
}

interface CategoryGroup {
  id:           string;
  superGroup:   "electronics" | "men" | "women" | "fashion" | "deals";
  title:        string;
  description:  string;
  color:        string;
  gradient:     string;
  border:       string;
  iconBg:       string;
  emoji:        string;
  items:        SubCategory[];
}

// ════════════════════════════════════════════
//  ALL CATEGORY GROUPS
// ════════════════════════════════════════════
const CATEGORY_GROUPS: CategoryGroup[] = [

  // ═══ ELECTRONICS ═══
  {
    id: "computing", superGroup: "electronics",
    title: "Computing", description: "Powerful machines for work & play",
    color: "#6366f1", gradient: "from-indigo-600/20 to-blue-600/5",
    border: "border-indigo-500/20", iconBg: "bg-indigo-500/15", emoji: "💻",
    items: [
      { name: "Laptop",   categoryId: "laptops",   image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80" },
      { name: "Monitor",  categoryId: "monitors",  image: "https://images.unsplash.com/photo-1527443224154-c4a573d5f5a4?w=400&q=80" },
      { name: "Keyboard", categoryId: "keyboards", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80" },
      { name: "Mouse",    categoryId: "mouse",     image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&q=80" },
      { name: "SSD",      categoryId: "ssd",       image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&q=80" },
    ],
  },
  {
    id: "audio", superGroup: "electronics",
    title: "Audio", description: "Crystal clear sound experiences",
    color: "#06b6d4", gradient: "from-cyan-600/20 to-sky-600/5",
    border: "border-cyan-500/20", iconBg: "bg-cyan-500/15", emoji: "🎧",
    items: [
      { name: "Headphones", categoryId: "headphones_headsets", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" },
      { name: "Speaker",    categoryId: "speakers",            image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80" },
      { name: "Earbuds",    categoryId: "earbuds",             image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80" },
      { name: "Microphone", categoryId: "microphones",         image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80" },
    ],
  },
  {
    id: "smart-devices", superGroup: "electronics",
    title: "Smart Devices", description: "Connected tech for modern living",
    color: "#8b5cf6", gradient: "from-purple-600/20 to-violet-600/5",
    border: "border-purple-500/20", iconBg: "bg-purple-500/15", emoji: "⌚",
    items: [
      { name: "Smartwatch", categoryId: "smart_watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" },
      { name: "Tablet",     categoryId: "tablets",       image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80" },
      { name: "Smart Home", categoryId: "smart_home",    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80" },
    ],
  },
  {
    id: "entertainment", superGroup: "electronics",
    title: "Entertainment", description: "Immersive viewing & gaming",
    color: "#f59e0b", gradient: "from-amber-600/20 to-orange-600/5",
    border: "border-amber-500/20", iconBg: "bg-amber-500/15", emoji: "🎮",
    items: [
      { name: "TV",             categoryId: "television",   image: "https://images.unsplash.com/photo-1593359677879-a4bb92f4834a?w=400&q=80" },
      { name: "Gaming Console", categoryId: "gaming",       image: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=400&q=80" },
      { name: "Projector",      categoryId: "projectors",   image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80" },
      { name: "VR Headset",     categoryId: "vr_headset",   image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400&q=80" },
    ],
  },
  {
    id: "accessories", superGroup: "electronics",
    title: "Accessories", description: "Essential add-ons & power",
    color: "#10b981", gradient: "from-emerald-600/20 to-teal-600/5",
    border: "border-emerald-500/20", iconBg: "bg-emerald-500/15", emoji: "🔌",
    items: [
      { name: "Chargers",   categoryId: "chargers",  image: "https://images.unsplash.com/photo-1601999009162-2459b78386a6?w=400&q=80" },
      { name: "Power Bank", categoryId: "powerbank", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&q=80" },
      { name: "Cables",     categoryId: "cables",    image: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=400&q=80" },
      { name: "Router",     categoryId: "routers",   image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&q=80" },
    ],
  },

  // ═══ MEN ═══
  {
    id: "men-topwear", superGroup: "men",
    title: "Men • Topwear", description: "Shirts, tees & jackets",
    color: "#3b82f6", gradient: "from-blue-600/20 to-sky-600/5",
    border: "border-blue-500/20", iconBg: "bg-blue-500/15", emoji: "👕",
    items: [
      { name: "T-Shirts",      categoryId: "men_t_shirts",      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80" },
      { name: "Casual Shirts", categoryId: "men_casual_shirts", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80" },
      { name: "Formal Shirts", categoryId: "men_formal_shirts", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80" },
      { name: "Hoodies",       categoryId: "men_topwear",       image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80" },
      { name: "Jackets",       categoryId: "men_topwear",       image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80" },
    ],
  },
  {
    id: "men-bottomwear", superGroup: "men",
    title: "Men • Bottomwear", description: "Jeans, trousers & more",
    color: "#0ea5e9", gradient: "from-sky-600/20 to-blue-600/5",
    border: "border-sky-500/20", iconBg: "bg-sky-500/15", emoji: "👖",
    items: [
      { name: "Jeans",       categoryId: "men_bottomwear", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80" },
      { name: "Joggers",     categoryId: "men_bottomwear", image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&q=80" },
      { name: "Shorts",      categoryId: "men_bottomwear", image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80" },
      { name: "Trousers",    categoryId: "men_bottomwear", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80" },
      { name: "Cargo Pants", categoryId: "men_bottomwear", image: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400&q=80" },
    ],
  },
  {
    id: "men-footwear", superGroup: "men",
    title: "Men • Footwear", description: "Step out in style",
    color: "#1d4ed8", gradient: "from-blue-700/20 to-indigo-600/5",
    border: "border-blue-700/20", iconBg: "bg-blue-700/15", emoji: "👟",
    items: [
      { name: "Sneakers",     categoryId: "men_footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
      { name: "Casual Shoes", categoryId: "men_footwear", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80" },
      { name: "Sports Shoes", categoryId: "men_footwear", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80" },
      { name: "Sandals",      categoryId: "men_footwear", image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80" },
    ],
  },
  {
    id: "men-accessories", superGroup: "men",
    title: "Men • Accessories & Grooming", description: "Complete your look",
    color: "#0369a1", gradient: "from-sky-700/20 to-cyan-600/5",
    border: "border-sky-700/20", iconBg: "bg-sky-700/15", emoji: "⌚",
    items: [
      { name: "Watches",      categoryId: "smart_watches",                  image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" },
      { name: "Wallets",      categoryId: "men_fashion_accessories",        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80" },
      { name: "Sunglasses",   categoryId: "men_fashion_accessories",        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80" },
      { name: "Belts",        categoryId: "men_fashion_accessories",        image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&q=80" },
      { name: "Perfumes",     categoryId: "men_personal_care_and_grooming", image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80" },
      { name: "Beard Care",   categoryId: "men_personal_care_and_grooming", image: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&q=80" },
      { name: "Hair Styling", categoryId: "men_personal_care_and_grooming", image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80" },
      { name: "Skincare",     categoryId: "men_personal_care_and_grooming", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80" },
    ],
  },

  // ═══ WOMEN ═══
  {
    id: "women-indian", superGroup: "women",
    title: "Women • Indian Wear", description: "Traditional elegance",
    color: "#ec4899", gradient: "from-pink-600/20 to-rose-600/5",
    border: "border-pink-500/20", iconBg: "bg-pink-500/15", emoji: "👘",
    items: [
      { name: "Sarees",         categoryId: "women_sarees",                 image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80" },
      { name: "Kurtis",         categoryId: "women_indian_and_fusion_wear", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80" },
      { name: "Lehenga Cholis", categoryId: "women_lehenga_cholis",         image: "https://images.unsplash.com/photo-1583391733981-3f0bcf3c2c30?w=400&q=80" },
      { name: "Salwars",        categoryId: "women_indian_and_fusion_wear", image: "https://images.unsplash.com/photo-1580893207853-77b8acc1cce6?w=400&q=80" },
    ],
  },
  {
    id: "women-western", superGroup: "women",
    title: "Women • Western Wear", description: "Modern & trendy styles",
    color: "#f43f5e", gradient: "from-rose-600/20 to-pink-600/5",
    border: "border-rose-500/20", iconBg: "bg-rose-500/15", emoji: "👗",
    items: [
      { name: "Dresses",  categoryId: "women_western_wear", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80" },
      { name: "Tops",     categoryId: "women_western_wear", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80" },
      { name: "T-Shirts", categoryId: "women_western_wear", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&q=80" },
      { name: "Jeans",    categoryId: "women_western_wear", image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400&q=80" },
      { name: "Co-ords",  categoryId: "women_western_wear", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80" },
    ],
  },
  {
    id: "women-footwear", superGroup: "women",
    title: "Women • Footwear", description: "Step into glamour",
    color: "#db2777", gradient: "from-pink-700/20 to-rose-600/5",
    border: "border-pink-700/20", iconBg: "bg-pink-700/15", emoji: "👠",
    items: [
      { name: "Heels",    categoryId: "women_footwear", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80" },
      { name: "Flats",    categoryId: "women_footwear", image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80" },
      { name: "Boots",    categoryId: "women_footwear", image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80" },
      { name: "Sneakers", categoryId: "women_footwear", image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&q=80" },
    ],
  },
  {
    id: "women-accessories", superGroup: "women",
    title: "Women • Accessories & Beauty", description: "Look your best",
    color: "#be185d", gradient: "from-pink-800/20 to-rose-700/5",
    border: "border-pink-800/20", iconBg: "bg-pink-800/15", emoji: "💄",
    items: [
      { name: "Handbags",   categoryId: "women_handbags_bags_wallets", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80" },
      { name: "Jewellery",  categoryId: "women_jewellery",             image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80" },
      { name: "Sunglasses", categoryId: "women_fashion_accessories",   image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80" },
      { name: "Watches",    categoryId: "smart_watches",               image: "https://images.unsplash.com/photo-1495856458515-0637185db551?w=400&q=80" },
      { name: "Makeup",     categoryId: "women_beauty_personal_care",  image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80" },
      { name: "Skincare",   categoryId: "women_beauty_personal_care",  image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80" },
      { name: "Hair Care",  categoryId: "women_beauty_personal_care",  image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80" },
      { name: "Perfumes",   categoryId: "women_beauty_personal_care",  image: "https://images.unsplash.com/photo-1557170334-a9086d21c41b?w=400&q=80" },
    ],
  },

  // ═══ FASHION & LIFESTYLE ═══
  {
    id: "fashion-trending", superGroup: "fashion",
    title: "Trending Now", description: "What everyone's wearing",
    color: "#a855f7", gradient: "from-purple-600/20 to-fuchsia-600/5",
    border: "border-purple-500/20", iconBg: "bg-purple-500/15", emoji: "🔥",
    items: [
      { name: "Streetwear",  categoryId: "men_topwear",       image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80" },
      { name: "Athleisure",  categoryId: "women_sports_active_wear", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" },
      { name: "Vintage",     categoryId: "women_western_wear",image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" },
      { name: "Minimalist",  categoryId: "men_t_shirts",      image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=80" },
    ],
  },
  {
    id: "fashion-occasion", superGroup: "fashion",
    title: "Shop By Occasion", description: "Dress for every moment",
    color: "#d946ef", gradient: "from-fuchsia-600/20 to-pink-600/5",
    border: "border-fuchsia-500/20", iconBg: "bg-fuchsia-500/15", emoji: "🎉",
    items: [
      { name: "Wedding",    categoryId: "women_lehenga_cholis", image: "https://images.unsplash.com/photo-1583391733981-3f0bcf3c2c30?w=400&q=80" },
      { name: "Party Wear", categoryId: "women_western_wear",   image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80" },
      { name: "Office",     categoryId: "men_formal_shirts",    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80" },
      { name: "Casual",     categoryId: "men_t_shirts",         image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80" },
      { name: "Festive",    categoryId: "women_sarees",         image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80" },
      { name: "Sports",     categoryId: "men_footwear",         image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
    ],
  },

  // ═══ LIGHTNING DEALS ═══
  {
    id: "deals-electronics", superGroup: "deals",
    title: "⚡ Electronics Deals", description: "Hot tech at slashed prices",
    color: "#f97316", gradient: "from-orange-600/20 to-red-600/5",
    border: "border-orange-500/20", iconBg: "bg-orange-500/15", emoji: "⚡",
    items: [
      { name: "iPhone Deals",   categoryId: "mobiles",             discount: "30% OFF", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80" },
      { name: "Laptop Sale",    categoryId: "laptops",             discount: "40% OFF", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80" },
      { name: "Headphone Loot", categoryId: "headphones_headsets", discount: "50% OFF", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80" },
      { name: "Watch Bonanza",  categoryId: "smart_watches",       discount: "35% OFF", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80" },
      { name: "TV Mega Sale",   categoryId: "television",          discount: "45% OFF", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f4834a?w=400&q=80" },
    ],
  },
  {
    id: "deals-fashion", superGroup: "deals",
    title: "⚡ Fashion Deals", description: "Style meets savings",
    color: "#ef4444", gradient: "from-red-600/20 to-rose-600/5",
    border: "border-red-500/20", iconBg: "bg-red-500/15", emoji: "⚡",
    items: [
      { name: "Fashion Deals", categoryId: "men_topwear",                discount: "60% OFF", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80" },
      { name: "Saree Special", categoryId: "women_sarees",               discount: "70% OFF", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80" },
      { name: "Footwear Sale", categoryId: "men_footwear",               discount: "50% OFF", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
      { name: "Bag Bonanza",   categoryId: "women_handbags_bags_wallets",discount: "55% OFF", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80" },
      { name: "Beauty Sale",   categoryId: "women_beauty_personal_care", discount: "40% OFF", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80" },
    ],
  },
];

// ════════════════════════════════════════════
//  SUPER GROUP TABS CONFIG
// ════════════════════════════════════════════
const SUPER_GROUPS = [
  { id: "all",         label: "All",                 emoji: "🌐", color: "#6366f1" },
  { id: "electronics", label: "Electronics",         emoji: "💻", color: "#6366f1" },
  { id: "men",         label: "Men's Fashion",       emoji: "👔", color: "#3b82f6" },
  { id: "women",       label: "Women's Fashion",     emoji: "👗", color: "#ec4899" },
  { id: "fashion",     label: "Fashion & Lifestyle", emoji: "✨", color: "#a855f7" },
  { id: "deals",       label: "Lightning Deals",     emoji: "⚡", color: "#f97316" },
];

// ════════════════════════════════════════════
//  COMPONENT
// ════════════════════════════════════════════

const AllCategories = () => {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get("tab") || "all";

  const [search, setSearch]                 = useState("");
  const [activeSuperGroup, setActiveSuperGroup] = useState(tabFromUrl);

  // ── Sync URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") || "all";
    setActiveSuperGroup(tab);
  }, [searchParams]);

  // ── Filter helper
  const filtered = (items: SubCategory[]) =>
    items.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  // ── Visible groups (filtered by superGroup)
  const visibleGroups =
    activeSuperGroup === "all"
      ? CATEGORY_GROUPS
      : CATEGORY_GROUPS.filter((g) => g.superGroup === activeSuperGroup);

  // ── Counts
  const totalItems = CATEGORY_GROUPS.reduce((sum, g) => sum + g.items.length, 0);
  const visibleCount = visibleGroups.reduce(
    (sum, g) => sum + filtered(g.items).length, 0
  );

  // ── Tab change → update URL
  const changeTab = (tabId: string) => {
    setActiveSuperGroup(tabId);
    setSearchParams(tabId === "all" ? {} : { tab: tabId });
  };

  // ── Title for header
  const currentSG = SUPER_GROUPS.find((s) => s.id === activeSuperGroup);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#0a0a0f]" : "bg-gray-50"
      }`}
    >
      {/* ════════ HERO HEADER ════════ */}
      <div
        className={`py-12 border-b ${
          isDark ? "border-white/5" : "border-gray-200"
        }`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)"
            : "linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">

          <Link
            to="/"
            className={`inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${
              isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-900"
            }`}
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <motion.h1
                key={activeSuperGroup}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-3xl font-black mb-2 flex items-center gap-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                <span>{currentSG?.emoji}</span>
                {currentSG?.label}
              </motion.h1>
              <p className={isDark ? "text-white/40" : "text-gray-500"}>
                {visibleCount} categories {activeSuperGroup !== "all" ? "in this section" : `across ${CATEGORY_GROUPS.length} groups`}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-white/30" : "text-gray-400"
                }`}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-indigo-500/50"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400"
                }`}
              />
            </div>
          </div>

          {/* Super Group Tabs */}
          <div className="flex gap-2 mt-7 flex-wrap">
            {SUPER_GROUPS.map((sg) => (
              <motion.button
                key={sg.id}
                onClick={() => changeTab(sg.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  activeSuperGroup === sg.id
                    ? "text-white border-transparent shadow-lg"
                    : isDark
                    ? "bg-white/5 border-white/8 text-white/50 hover:text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                style={
                  activeSuperGroup === sg.id
                    ? {
                        backgroundColor: sg.color,
                        boxShadow:       `0 8px 20px ${sg.color}40`,
                      }
                    : {}
                }
              >
                <span className="mr-1.5">{sg.emoji}</span>
                {sg.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ CATEGORY GROUPS ════════ */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-12">
        {visibleGroups.map((group, gIdx) => {
          const items = filtered(group.items);
          if (items.length === 0) return null;

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gIdx * 0.08 }}
            >
              {/* Group Header */}
              <div
                className={`flex items-center justify-between p-5 rounded-2xl border mb-6 bg-gradient-to-r ${group.gradient} ${group.border}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${group.iconBg}`}>
                    {group.emoji}
                  </div>
                  <div>
                    <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                      {group.title}
                    </h2>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                      {group.description}
                    </p>
                  </div>
                </div>

                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap"
                  style={{ backgroundColor: `${group.color}20`, color: group.color }}
                >
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {items.map((item, i) => (
                  <motion.div
                    key={item.name + i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link to={`/products/${item.categoryId}`}>
                      <motion.div
                        whileHover={{ y: -6, scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all group ${
                          isDark
                            ? "border-white/6 bg-white/3 hover:border-white/20 hover:bg-white/8"
                            : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg shadow-sm"
                        }`}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = `${group.color}50`;
                          (e.currentTarget as HTMLElement).style.boxShadow   = `0 12px 30px ${group.color}20`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = "";
                          (e.currentTarget as HTMLElement).style.boxShadow   = "";
                        }}
                      >
                        {/* Discount badge for deals */}
                        {item.discount && (
                          <span
                            className="absolute -top-2 -right-2 z-10 px-2 py-1 rounded-md text-[9px] font-black text-white"
                            style={{
                              background: "linear-gradient(135deg, #f97316, #ef4444)",
                              boxShadow:  "0 0 10px rgba(239,68,68,0.5)",
                            }}
                          >
                            {item.discount}
                          </span>
                        )}

                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white flex items-center justify-center">
                          <img loading="lazy" decoding="async"
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-400"
                            style={{ padding: "6px" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                `https://placehold.co/80x80/${group.color.replace("#", "")}/white?text=${item.name.charAt(0)}`;
                            }}
                          />
                        </div>

                        <span
                          className={`text-sm font-bold text-center transition-colors ${
                            isDark ? "text-white/80 group-hover:text-white" : "text-gray-700 group-hover:text-gray-900"
                          }`}
                        >
                          {item.name}
                        </span>

                        <div
                          className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: group.color }}
                        >
                          Shop Now
                          <ChevronRight size={11} />
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Empty state */}
        {visibleGroups.every((g) => filtered(g.items).length === 0) && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className={`text-lg font-semibold mb-2 ${isDark ? "text-white/50" : "text-gray-500"}`}>
              {search ? `No categories found for "${search}"` : "No categories in this section"}
            </p>
            <button
              onClick={() => { setSearch(""); changeTab("all"); }}
              className="mt-4 px-6 py-2 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              View All Categories
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCategories;