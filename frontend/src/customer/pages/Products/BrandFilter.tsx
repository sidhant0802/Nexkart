import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchBrands } from "../../../Redux Toolkit/Admin/BrandSlice";
import { ChevronDown, ChevronUp, BadgeCheck } from "lucide-react";
import { useTheme } from "../../../routes/CustomerRoutes";

interface Props {
  selectedBrands: string[];
  onChange: (brands: string[]) => void;
  category?: string;
}

const BrandFilter: React.FC<Props> = ({ selectedBrands, onChange, category }) => {
  const { isDark } = useTheme();
  const dispatch   = useAppDispatch();
  const { brands } = useAppSelector(s => s.brand);

  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll]   = useState(false);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  // Filter brands by current category if provided
  const relevantBrands = brands.filter(b =>
    b.isActive !== false &&
    (!category || !b.category || b.category === category)
  );

  const visibleBrands = showAll ? relevantBrands : relevantBrands.slice(0, 6);

  const handleToggle = (brandName: string) => {
    if (selectedBrands.includes(brandName)) {
      onChange(selectedBrands.filter(b => b !== brandName));
    } else {
      onChange([...selectedBrands, brandName]);
    }
  };

  if (relevantBrands.length === 0) return null;

  return (
    <div
      className={`p-4 rounded-2xl border ${
        isDark ? "bg-white/3 border-white/8" : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-2">
          <BadgeCheck size={14} className="text-indigo-500" />
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? "text-white/60" : "text-gray-700"
            }`}
          >
            Brands
          </span>
          {selectedBrands.length > 0 && (
            <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {selectedBrands.length}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={14} className={isDark ? "text-white/40" : "text-gray-400"} />
        ) : (
          <ChevronDown size={14} className={isDark ? "text-white/40" : "text-gray-400"} />
        )}
      </button>

      {/* Brand List */}
      {expanded && (
        <>
          <div className="space-y-2">
            {visibleBrands.map(brand => {
              const isSelected = selectedBrands.includes(brand.name);
              return (
                <label
                  key={brand._id}
                  className={`flex items-center gap-2.5 cursor-pointer p-2 rounded-lg transition-all ${
                    isSelected
                      ? isDark ? "bg-indigo-500/15" : "bg-indigo-50"
                      : isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(brand.name)}
                    className="w-3.5 h-3.5 accent-indigo-500 rounded"
                  />

                  {/* Brand logo */}
                  {brand.logo && (
                    <img loading="lazy" decoding="async"
                      src={brand.logo}
                      alt={brand.name}
                      className="w-6 h-6 rounded object-cover bg-white border border-gray-200"
                      onError={(e) => (e.target as HTMLImageElement).style.display = "none"}
                    />
                  )}

                  {/* Brand name */}
                  <span
                    className={`text-sm flex-1 ${
                      isSelected
                        ? isDark ? "text-white font-semibold" : "text-indigo-700 font-semibold"
                        : isDark ? "text-white/70" : "text-gray-700"
                    }`}
                  >
                    {brand.name}
                  </span>

                  {brand.featured && (
                    <span className="text-amber-400 text-xs">⭐</span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Show More/Less */}
          {relevantBrands.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className={`w-full mt-3 pt-3 border-t text-xs font-semibold ${
                isDark
                  ? "border-white/10 text-purple-400 hover:text-purple-300"
                  : "border-gray-100 text-indigo-600 hover:text-indigo-700"
              }`}
            >
              {showAll ? "− Show Less" : `+ Show ${relevantBrands.length - 6} More`}
            </button>
          )}

          {/* Clear */}
          {selectedBrands.length > 0 && (
            <button
              onClick={() => onChange([])}
              className={`w-full mt-2 text-xs font-semibold ${
                isDark ? "text-white/40 hover:text-white" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              Clear All ({selectedBrands.length})
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default BrandFilter;