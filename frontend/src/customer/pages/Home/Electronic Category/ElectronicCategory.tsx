import { useAppSelector } from "../../../../Redux Toolkit/Store";
import CategoryShowcase from "../CategoryShowcase/CategoryShowcase";

const FALLBACK = [
  { name: "Laptop",     categoryId: "laptops",             image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=85" },
  { name: "Mobile",     categoryId: "mobiles",             image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=85" },
  { name: "Headphones", categoryId: "headphones_headsets", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=85" },
  { name: "Smartwatch", categoryId: "smart_watches",       image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=85" },
  { name: "Speaker",    categoryId: "speakers",            image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=85" },
  { name: "TV",         categoryId: "television",          image: "https://images.unsplash.com/photo-1593359677879-a4bb92f4834a?w=400&q=85" },
  { name: "Camera",     categoryId: "cameras",             image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=85" },
  { name: "Tablet",     categoryId: "tablets",             image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=85" },
  { name: "Gaming",     categoryId: "gaming",              image: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=400&q=85" },
  { name: "Earbuds",    categoryId: "earbuds",             image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=85" },
];

const ElectronicCategory = () => {
  const homePage = useAppSelector((s) => s.homePage);
  const dbItems  = homePage?.homePageData?.electronicsItems || [];

  const items = dbItems.length > 0
    ? dbItems.map((i: any) => ({
        name:       i.name,
        categoryId: i.categoryId,
        image:      i.image,
      }))
    : FALLBACK;

  return (
    <CategoryShowcase
      title="Electronics"
      subtitle="Top gadgets & devices"
      emoji="💻"
      items={items}
      viewAllLink="/all-electronics"
      accent="indigo"
    />
  );
};

export default ElectronicCategory;