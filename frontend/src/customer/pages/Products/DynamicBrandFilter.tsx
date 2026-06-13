import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchBrandsByCategory, clearBrandsByCategory } from "../../../Redux Toolkit/Admin/BrandSlice";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  category?: string;
  selectedBrands: string[];
  onChange: (brands: string[]) => void;
}

const DynamicBrandFilter: React.FC<Props> = ({ category, selectedBrands, onChange }) => {
  const dispatch = useAppDispatch();
  const { brandsByCategory, categoryLoading } = useAppSelector(s => s.brand);

  const [expanded, setExpanded] = useState(true);
  const [showAll,  setShowAll]  = useState(false);

  // ✅ Only fetch when we have a valid category string
  useEffect(() => {
    if (category && category !== "undefined" && category.trim() !== "") {
      dispatch(fetchBrandsByCategory(category));
    } else {
      dispatch(clearBrandsByCategory());
    }
  }, [category, dispatch]);

  const visible = showAll ? brandsByCategory : brandsByCategory.slice(0, 6);

  const toggle = (name: string) => {
    if (selectedBrands.includes(name)) {
      onChange(selectedBrands.filter(b => b !== name));
    } else {
      onChange([...selectedBrands, name]);
    }
  };

  // Hide entire section if no category OR no brands match
  if (!category || category === "undefined") return null;
  if (!categoryLoading && brandsByCategory.length === 0) return null;

  return (
    <div>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3"
      >
        <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "#6C63FF" }}>
          Brand
          {selectedBrands.length > 0 && (
            <span
              className="ml-2 px-1.5 py-0.5 rounded text-white text-[10px]"
              style={{ backgroundColor: "#6C63FF" }}
            >
              {selectedBrands.length}
            </span>
          )}
        </h3>
        {expanded
          ? <ChevronUp   size={14} style={{ color: "#6b7280" }} />
          : <ChevronDown size={14} style={{ color: "#6b7280" }} />}
      </button>

      {expanded && (
        <>
          {categoryLoading && (
            <p className="text-xs" style={{ color: "#6b7280" }}>Loading brands…</p>
          )}

          {!categoryLoading && (
            <div className="space-y-1">
              {visible.map(brand => {
                const isSelected = selectedBrands.includes(brand.name);
                return (
                  <label
                    key={brand._id}
                    className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-lg transition-all"
                    style={{ backgroundColor: isSelected ? "rgba(108,99,255,0.15)" : "transparent" }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    onClick={(e) => { e.preventDefault(); toggle(brand.name); }}
                  >
                    {/* Checkbox */}
                    <div
                      className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-sm border-2 transition-all"
                      style={{
                        borderColor:     isSelected ? "#6C63FF" : "#4b5563",
                        backgroundColor: isSelected ? "#6C63FF" : "transparent",
                      }}
                    >
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Logo */}
                    {brand.logo ? (
                      <img loading="lazy" decoding="async"
                        src={brand.logo} alt={brand.name}
                        className="w-6 h-6 rounded object-cover flex-shrink-0"
                        style={{ backgroundColor: "#fff" }}
                        onError={(e) => (e.target as HTMLImageElement).style.display = "none"}
                      />
                    ) : (
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ backgroundColor: "#2a2a3d", color: "#6C63FF" }}
                      >
                        {brand.name.charAt(0)}
                      </div>
                    )}

                    {/* Name */}
                    <span
                      className="text-sm flex-1 truncate"
                      style={{
                        color:      isSelected ? "#fff" : "#9ca3af",
                        fontWeight: isSelected ? 600   : 400,
                      }}
                    >
                      {brand.name}
                    </span>

                    {/* Product count */}
                    {typeof brand.productCount === "number" && brand.productCount > 0 && (
                      <span className="text-[10px] flex-shrink-0" style={{ color: "#6b7280" }}>
                        ({brand.productCount})
                      </span>
                    )}

                    {brand.featured && <span className="text-amber-400 text-xs flex-shrink-0">⭐</span>}
                  </label>
                );
              })}

              {/* Show more */}
              {brandsByCategory.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="w-full mt-2 pt-2 text-xs font-semibold text-left pl-2"
                  style={{ color: "#6C63FF", borderTop: "1px solid #2a2a3d" }}
                >
                  {showAll ? "− Show Less" : `+ Show ${brandsByCategory.length - 6} More`}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DynamicBrandFilter;
