// src/customer/components/Navbar/CategorySheet.tsx

import { menLevelThree } from "../../../data/category/level three/menLevelThree";
import { menLevelTwo } from "../../../data/category/level two/menLevelTwo";
import { womenLevelThree } from "../../../data/category/level three/womenLevelThree";
import { womenLevelTwo } from "../../../data/category/level two/womenLevelTwo";
import { useNavigate } from "react-router-dom";
import { electronicsLevelTwo } from "../../../data/category/level two/electronicsLavelTwo";
import { furnitureLevelTwo } from "../../../data/category/level two/furnitureLevleTwo";
import { furnitureLevelThree } from "../../../data/category/level three/furnitureLevelThree";
import { electronicsLevelThree } from "../../../data/category/level three/electronicsLevelThree";
import { motion } from "framer-motion";
import { useTheme } from "../../../routes/CustomerRoutes";
import { ArrowRight } from "lucide-react";

const categoryTwo: { [key: string]: any[] } = {
  men: menLevelTwo,
  women: womenLevelTwo,
  electronics: electronicsLevelTwo,
  home_furniture: furnitureLevelTwo,
};

const categoryThree: { [key: string]: any[] } = {
  men: menLevelThree,
  women: womenLevelThree,
  electronics: electronicsLevelThree,
  home_furniture: furnitureLevelThree,
};

// ✅ Fix all spelling errors
const fixSpelling = (name: string): string => {
  const fixes: Record<string, string> = {
    "Topwere": "Topwear",
    "Bottomwere": "Bottomwear",
    "Innerwere And Sleepwere": "Innerwear & Sleepwear",
    "Innerwere and Sleepwere": "Innerwear & Sleepwear",
    "Footwere": "Footwear",
    "Persional Care And  grooming": "Personal Care & Grooming",
    "Persional Care And grooming": "Personal Care & Grooming",
    "Personal Care And  grooming": "Personal Care & Grooming",
    "Buauty & Personal Care": "Beauty & Personal Care",
    "Handbags, Bags & wallets": "Handbags, Bags & Wallets",
    "Bags And Backpacks": "Bags & Backpacks",
    "Indian & fusion Wear": "Indian & Fusion Wear",
    "women_indian_and_fusion_wear": "Indian & Fusion Wear",
  };
  return fixes[name] || name;
};

// ✅ Category accent colors
const categoryAccents: Record<string, string> = {
  men: "#6366f1",
  women: "#ec4899",
  electronics: "#06b6d4",
  home_furniture: "#f59e0b",
};

interface CategorySheetProps {
  selectedCategory: string;
  toggleDrawer?: (open: boolean) => () => void;
  setShowSheet?: (show: boolean) => void;
}

const CategorySheet = ({
  selectedCategory,
  toggleDrawer,
  setShowSheet,
}: CategorySheetProps) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const accentColor = categoryAccents[selectedCategory] || "#6366f1";

  const childCategory = (category: any[], parentCategoryId: string) => {
    return category.filter(
      (child: any) => child.parentCategoryId === parentCategoryId
    );
  };

  const handleCategoryClick = (categoryId: string) => {
    if (toggleDrawer) toggleDrawer(false)();
    if (setShowSheet) setShowSheet(false);
    navigate("/products/" + categoryId);
  };

  const levelTwoCategories = categoryTwo[selectedCategory] || [];
  const levelThreeCategories = categoryThree[selectedCategory] || [];

  // ✅ Theme-based styles
  const sheetBg = isDark ? "#0f0f1a" : "#ffffff";
  const borderColor = isDark
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.08)";
  const headerColor = accentColor;
  const headerBorder = isDark
    ? `${accentColor}30`
    : `${accentColor}40`;
  const itemColor = isDark ? "rgba(255,255,255,0.55)" : "#374151";
  const itemHoverColor = accentColor;
  const dividerColor = isDark
    ? "rgba(255,255,255,0.05)"
    : "rgba(0,0,0,0.06)";

  return (
    <div
      className="w-full overflow-y-auto transition-all duration-300"
      style={{
        backgroundColor: sheetBg,
        borderTop: `1px solid ${borderColor}`,
        borderBottom: `1px solid ${borderColor}`,
        boxShadow: isDark
          ? "0 20px 60px rgba(0,0,0,0.5)"
          : "0 20px 40px rgba(0,0,0,0.1)",
        maxHeight: "460px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">

        {/* Category Title Banner */}
        <div
          className="flex items-center justify-between mb-5 pb-4"
          style={{ borderBottom: `1px solid ${dividerColor}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <h3
              className="text-sm font-black uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              {selectedCategory === "home_furniture"
                ? "Home & Furniture"
                : selectedCategory.charAt(0).toUpperCase() +
                  selectedCategory.slice(1)}
            </h3>
          </div>

          <motion.button
            whileHover={{ x: 3 }}
            onClick={() => handleCategoryClick(selectedCategory)}
            className="flex items-center gap-1 text-xs font-semibold transition-colors"
            style={{ color: accentColor }}
          >
            View All <ArrowRight size={12} />
          </motion.button>
        </div>

        {/* Sub Categories Grid */}
        <div className="flex flex-wrap">
          {levelTwoCategories.map((item: any, index: number) => {
            const children = childCategory(
              levelThreeCategories,
              item.categoryId
            );

            return (
              <motion.div
                key={item.categoryId || item.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
                className="p-4"
                style={{ width: "20%", minWidth: "150px" }}
              >
                {/* ✅ Section Header */}
                <button
                  onClick={() => handleCategoryClick(item.categoryId)}
                  className="w-full text-left mb-3 pb-2 block transition-colors"
                  style={{
                    borderBottom: `1.5px solid ${headerBorder}`,
                  }}
                >
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: headerColor }}
                  >
                    {fixSpelling(item.name)}
                  </span>
                </button>

                {/* ✅ Sub Items - proper dark/light colors */}
                <ul className="space-y-2">
                  {children.length > 0 ? (
                    <>
                      {children.map((child: any) => (
                        <li key={child.categoryId || child.name}>
                          <motion.button
                            whileHover={{ x: 3 }}
                            onClick={() =>
                              handleCategoryClick(child.categoryId)
                            }
                            className="text-left w-full text-xs transition-all duration-150 py-0.5"
                            style={{
                              // ✅ Always visible - dark in light, light in dark
                              color: itemColor,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLButtonElement
                              ).style.color = itemHoverColor;
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLButtonElement
                              ).style.color = itemColor;
                            }}
                          >
                            {fixSpelling(child.name)}
                          </motion.button>
                        </li>
                      ))}

                      {/* View All link */}
                      <li>
                        <motion.button
                          whileHover={{ x: 3 }}
                          onClick={() =>
                            handleCategoryClick(item.categoryId)
                          }
                          className="text-left w-full text-xs font-semibold transition-all mt-1 flex items-center gap-1"
                          style={{
                            color: isDark
                              ? "rgba(255,255,255,0.2)"
                              : "rgba(0,0,0,0.25)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.color = accentColor;
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.color = isDark
                              ? "rgba(255,255,255,0.2)"
                              : "rgba(0,0,0,0.25)";
                          }}
                        >
                          View all →
                        </motion.button>
                      </li>
                    </>
                  ) : (
                    <li>
                      <motion.button
                        whileHover={{ x: 3 }}
                        onClick={() =>
                          handleCategoryClick(item.categoryId)
                        }
                        className="text-left w-full text-xs transition-all"
                        style={{
                          color: itemColor,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.color = itemHoverColor;
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.color = itemColor;
                        }}
                      >
                        View All {fixSpelling(item.name)}
                      </motion.button>
                    </li>
                  )}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorySheet;