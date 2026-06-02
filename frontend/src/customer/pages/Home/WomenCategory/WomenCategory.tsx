import { useAppSelector } from "../../../../Redux Toolkit/Store";
import CategoryShowcase from "../CategoryShowcase/CategoryShowcase";

const FALLBACK = [
  { name: "Sarees",    categoryId: "women_sarees",                 image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=85" },
  { name: "Kurtis",    categoryId: "women_indian_and_fusion_wear", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=85" },
  { name: "Lehenga",   categoryId: "women_lehenga_cholis",         image: "https://images.unsplash.com/photo-1583391733981-3f0bcf3c2c30?w=400&q=85" },
  { name: "Dresses",   categoryId: "women_western_wear",           image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=85" },
  { name: "Tops",      categoryId: "women_western_wear",           image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=85" },
  { name: "Jeans",     categoryId: "women_western_wear",           image: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=400&q=85" },
  { name: "Heels",     categoryId: "women_footwear",               image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=85" },
  { name: "Handbags",  categoryId: "women_handbags_bags_wallets",  image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=85" },
  { name: "Jewellery", categoryId: "women_jewellery",              image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=85" },
  { name: "Makeup",    categoryId: "women_beauty_personal_care",   image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=85" },
];

const WomenCategory = () => {
  const homePage = useAppSelector((s) => s.homePage);
  const dbItems  = homePage?.homePageData?.womenItems || [];

  const items = dbItems.length > 0
    ? dbItems.map((i: any) => ({
        name:       i.name,
        categoryId: i.categoryId,
        image:      i.image,
      }))
    : FALLBACK;

  return (
    <CategoryShowcase
      title="Women's Fashion"
      subtitle="Trending styles for her"
      emoji="👗"
      items={items}
      viewAllLink="/all-women"
      accent="pink"
    />
  );
};

export default WomenCategory;