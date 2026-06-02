import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../../../../routes/CustomerRoutes";
import SectionBox from "../SectionBox/SectionBox";
import { useAppSelector, useAppDispatch } from "../../../../Redux Toolkit/Store";
import { useEffect } from "react";
import { fetchBrands } from "../../../../Redux Toolkit/Admin/BrandSlice";
import CloudImage from "../../../../components/ui/CloudImage";

const TopBrands = () => {
  const { isDark } = useTheme();
  const dispatch   = useAppDispatch();
  const homePage   = useAppSelector((s) => s.homePage);
  const brandState = useAppSelector((s) => s.brand);

  const settings   = (homePage?.homePageData as any)?.homeSettings;
  const showBrands = settings?.showBrandsOnHome ?? true;
  const homeBrands = (homePage?.homePageData as any)?.homeBrands || [];

  // Always fetch all brands to get total count
  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const displayBrands = homeBrands.length > 0
    ? homeBrands
    : brandState.brands.filter((b) => b.isActive !== false && b.featured);

  // Total brands on website (not just displayed)
  const totalBrands = brandState.brands.filter((b) => b.isActive !== false).length;

  if (!showBrands || displayBrands.length === 0) return null;

  return (
    <SectionBox accent="slate">
      {/* Header */}
      <div className="text-center mb-7">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-2xl font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          🏆 Top Brands
        </motion.h2>
        <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>
          Shop from {totalBrands}+ world's most trusted brands
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
        {displayBrands.map((brand: any, i: number) => {
          const brandCategory =
            Array.isArray(brand.categories) && brand.categories.length > 0
              ? brand.categories[0]
              : brand.category || "";

          return (
            <motion.div
              key={brand._id || brand.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/products/${brandCategory}?brand=${encodeURIComponent(brand.name)}`}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all group ${
                    isDark
                      ? "border-white/6 bg-white/3 hover:border-white/20 hover:bg-white/8"
                      : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg shadow-sm"
                  }`}
                >
                 <div className="w-full aspect-square rounded-xl overflow-hidden bg-white">
  <CloudImage
    src={brand.logo}
    alt={brand.name}
    width={200}
    height={200}
    quality="good"
    objectFit="cover"
    lazy={i > 8}
    priority={i < 6}   
    fallback={`https://placehold.co/200x200/6366f1/white?text=${(brand?.name || "?").charAt(0)}`}
    className="w-full h-full group-hover:scale-110 transition-transform duration-300"
  />
</div>
                  <span className={`text-sm font-bold text-center truncate w-full ${
                    isDark ? "text-white/80 group-hover:text-white" : "text-gray-700 group-hover:text-gray-900"
                  }`}>
                    {brand.name}
                  </span>
                  {brand.description && (
                    <span className={`text-[10px] font-medium ${isDark ? "text-white/30" : "text-gray-400"}`}>
                      {brand.description.split(" ").slice(0, 2).join(" ")}
                    </span>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <Link
          to="/brands"
          className={`text-sm font-bold inline-flex items-center gap-1 ${
            isDark ? "text-purple-400 hover:text-purple-300" : "text-indigo-600 hover:text-indigo-700"
          }`}
        >
          Explore All {totalBrands} Brands →
        </Link>
      </div>
    </SectionBox>
  );
};

export default TopBrands;