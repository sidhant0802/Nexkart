import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Tag } from "lucide-react";

interface Props {
  category: {
    categoryId: string;
    name: string;
    image: string;
  };
  discount: number;
  isDark: boolean;
  index: number;
}

const accentColors = [
  "#6366f1", "#ec4899", "#f59e0b",
  "#10b981", "#06b6d4", "#8b5cf6",
  "#f43f5e", "#84cc16",
];

// ✅ Premium CTAs
const ctas = [
  "Shop Now →",
  "Claim Offer →",
  "Discover →",
  "Get Offer →",
  "Unlock Deal →",
  "View Deal →",
  "Shop Collection →",
  "Limited Offer →",
];

const DealCard = ({ category, discount, isDark, index }: Props) => {
  const color = accentColors[index % accentColors.length];

  return (
    <Link to={`/products/${category?.categoryId}`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`relative w-[155px] rounded-2xl overflow-hidden border cursor-pointer group transition-all ${
          isDark
            ? "border-white/8 bg-white/3 hover:border-white/20 hover:shadow-xl"
            : "border-gray-100 bg-white hover:shadow-xl shadow-sm"
        }`}
      >
        {/* Image */}
        <div className="relative h-[175px] overflow-hidden">
          <img
            src={category?.image}
            alt={category?.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/155x175";
            }}
          />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Discount Badge */}
          <div
            className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-lg text-white text-[10px] font-black shadow-lg"
            style={{ backgroundColor: color }}
          >
            <Tag size={8} />
            {discount}% OFF
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p
            className={`text-xs font-bold capitalize leading-tight mb-1 ${
              isDark ? "text-white/80" : "text-gray-800"
            }`}
          >
            {category?.name}
          </p>
          {/* ✅ Premium CTA */}
          <p
            className="text-[10px] font-semibold"
            style={{ color }}
          >
            {ctas[index % ctas.length]}
          </p>
        </div>

        {/* Bottom color bar animation */}
        <div
          className="h-0.5 w-0 group-hover:w-full transition-all duration-500"
          style={{ backgroundColor: color }}
        />
      </motion.div>
    </Link>
  );
};

export default DealCard;