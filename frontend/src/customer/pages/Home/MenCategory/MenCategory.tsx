import { useAppSelector } from "../../../../Redux Toolkit/Store";
import CategoryShowcase from "../CategoryShowcase/CategoryShowcase";

// ── Fallback ───────────────────────────────────────────────
const FALLBACK = [
  { name: "T-Shirts",   categoryId: "men_t_shirts",                   image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=85" },
  { name: "Shirts",     categoryId: "men_casual_shirts",              image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=85" },
  { name: "Hoodies",    categoryId: "men_topwear",                    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=85" },
  { name: "Jackets",    categoryId: "men_topwear",                    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=85" },
  { name: "Jeans",      categoryId: "men_bottomwear",                 image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=85" },
  { name: "Trousers",   categoryId: "men_bottomwear",                 image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=85" },
  { name: "Sneakers",   categoryId: "men_footwear",                   image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85" },
  { name: "Watches",    categoryId: "smart_watches",                  image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=85" },
  { name: "Sunglasses", categoryId: "men_fashion_accessories",        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=85" },
  { name: "Perfumes",   categoryId: "men_personal_care_and_grooming", image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=85" },
];

const MenCategory = () => {
  const homePage = useAppSelector((s) => s.homePage);
  const dbItems  = homePage?.homePageData?.menItems || [];

  // use DB if available else fallback
  const items = dbItems.length > 0
    ? dbItems.map((i: any) => ({
        name:       i.name,
        categoryId: i.categoryId,
        image:      i.image,
      }))
    : FALLBACK;

  return (
    <CategoryShowcase
      title="Men's Fashion"
      subtitle="Top picks for him"
      emoji="👔"
      items={items}
      viewAllLink="/all-men"
      accent="blue"
    />
  );
};

export default MenCategory;