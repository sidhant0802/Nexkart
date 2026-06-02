import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Props {
  category: {
    categoryId: string;
    name: string;
    image: string;
  };
  isDark: boolean;
}

const ElectronicCategoryCard = ({ category, isDark }: Props) => {
  return (
    <Link to={`/products/${category.categoryId}`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`flex flex-col items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all group ${
          isDark
            ? "border-white/5 bg-white/3 hover:border-indigo-500/30 hover:bg-white/8"
            : "border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50"
        }`}
      >
        {/* Image */}
        <div
          className={`w-14 h-14 rounded-xl overflow-hidden ${
            isDark ? "bg-white/5" : "bg-white"
          } shadow-md`}
        >
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/56x56";
            }}
          />
        </div>

        {/* Name */}
        <span
          className={`text-xs text-center font-semibold leading-tight transition-colors ${
            isDark
              ? "text-white/60 group-hover:text-white"
              : "text-gray-600 group-hover:text-indigo-600"
          }`}
        >
          {category.name}
        </span>
      </motion.div>
    </Link>
  );
};

export default ElectronicCategoryCard;