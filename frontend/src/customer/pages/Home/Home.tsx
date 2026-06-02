// src/customer/pages/Home/Home.tsx

import { useTheme } from "../../../routes/CustomerRoutes";
import Banner             from "./Banner/Banner";
import ElectronicCategory from "./Electronic Category/ElectronicCategory";
import MenCategory        from "./MenCategory/MenCategory";
import WomenCategory      from "./WomenCategory/WomenCategory";
import FurnitureCategory  from "./FurnitureCategory/FurnitureCategory";  // ✅ NEW
import FashionLifestyle   from "./FashionLifestyle/FashionLifestyle";
import HomeCategory       from "./HomeCategory/HomeCategory";
import DealSlider         from "./Deals/DealSlider";
import ShopByCategory     from "./ShopByCategory/ShopByCategory";
import FeaturedProducts   from "./FeaturedProducts/FeaturedProducts";
import TopBrands          from "./TopBrands/Grid";

const Home = () => {
  const { isDark } = useTheme();

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-[#0a0a0f]" : "bg-gray-50"
    }`}>
      <Banner />
      <ElectronicCategory />   {/* 🟦 indigo box */}
      <MenCategory />          {/* 🟦 blue box */}
      <WomenCategory />        {/* 🌸 pink box */}
      <FurnitureCategory />    {/* 🟧 amber box ✅ NEW */}
      <FashionLifestyle />
      <HomeCategory />
      <DealSlider />
      <FeaturedProducts />
      <ShopByCategory />
      <TopBrands />
    </main>
  );
};

export default Home;