import CategoryShowcase from "../CategoryShowcase/CategoryShowcase";

const ITEMS = [
  { name: "Sofas",     categoryId: "home_furniture",      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=85" },
  { name: "Beds",      categoryId: "home_furniture",      image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=85" },
  { name: "Dining",    categoryId: "home_furniture",      image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=400&q=85" },
  { name: "Wardrobes", categoryId: "home_furniture",      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=85" },
  { name: "Office",    categoryId: "home_furniture",      image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&q=85" },
  { name: "Lighting",  categoryId: "home_furnishing",     image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=85" },
  { name: "Decor",     categoryId: "home_furnishing",     image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=85" },
  { name: "Kitchen",   categoryId: "kitchen_dining",      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=85" },
  { name: "Bath",      categoryId: "home_furnishing",     image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=85" },
  { name: "Garden",    categoryId: "home_garden_outdoor", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=85" },
];

const FurnitureCategory = () => (
  <CategoryShowcase
    title="Home & Furniture"
    subtitle="Transform your space"
    emoji="🛋️"
    items={ITEMS}
    viewAllLink="/products/home_furniture"
    accent="amber"
  />
);

export default FurnitureCategory;