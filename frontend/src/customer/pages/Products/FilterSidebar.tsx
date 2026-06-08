// src/customer/pages/Products/FilterSidebar.tsx
import React from "react";
import {
  CATEGORY_FILTERS,
  DEFAULT_FILTERS,
  COLOR_HEX,
  type FilterGroup,
} from "../../../data/categoryFilters";
import DynamicBrandFilter from "./DynamicBrandFilter";

export interface ActiveFilters {
  [key: string]: string[];
}

interface Props {
  categoryId:   string | undefined;
  filters:      ActiveFilters;
  setFilters:   React.Dispatch<React.SetStateAction<ActiveFilters>>;
  onClear:      () => void;
}

const FilterSidebar = ({ categoryId, filters, setFilters, onClear }: Props) => {

  const filterGroups: FilterGroup[] =
    (categoryId && CATEGORY_FILTERS[categoryId]) || DEFAULT_FILTERS;

  const hasFilters = Object.values(filters).some((v) => v.length > 0);

  const toggle = (key: string, value: string) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      const exists  = current.includes(value);
      return {
        ...prev,
        [key]: exists
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const isChecked = (key: string, value: string) =>
    (filters[key] || []).includes(value);

  // ── Brand handler (separate state key)
  const handleBrandsChange = (brands: string[]) => {
    setFilters(prev => ({ ...prev, brand: brands }));
  };

  // Filter out static "brand" group from category filters (we use dynamic now)
  const nonBrandGroups = filterGroups.filter(g => g.key !== "brand");

  return (
    <div
      className="rounded-2xl p-5 sticky top-4"
      style={{ backgroundColor: "#16161f", border: "1px solid #2a2a3d" }}
    >
      {/* ── Header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-sm font-bold tracking-widest uppercase"
          style={{ color: "#6C63FF" }}
        >
          Filters
        </h2>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "#6C63FF" }}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="w-full h-px mb-5" style={{ backgroundColor: "#2a2a3d" }} />

      {/* ✅ NEW — Dynamic Brand Filter (from DB) */}
      <DynamicBrandFilter
        category={categoryId}
        selectedBrands={filters.brand || []}
        onChange={handleBrandsChange}
      />

      {/* Divider after brand */}
      {nonBrandGroups.length > 0 && (
        <div className="w-full h-px my-5" style={{ backgroundColor: "#2a2a3d" }} />
      )}

      {/* ── Existing Filter Groups (excluding brand) */}
      <div className="flex flex-col gap-6">
        {nonBrandGroups.map((group, idx) => (
          <div key={group.key}>

            <h3
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "#6C63FF" }}
            >
              {group.label}
            </h3>

            {group.type === "color-swatch" ? (
              <div className="flex flex-col gap-2.5">
                {group.options.map((opt) => {
                  const checked = isChecked(group.key, opt.value);
                  const hex     = COLOR_HEX[opt.label] || "#6b7280";
                  const isGrad  = hex.startsWith("linear");

                  return (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => toggle(group.key, opt.value)}
                    >
                      <div
                        className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-sm border-2 transition-all"
                        style={{
                          borderColor:     checked ? "#6C63FF" : "#4b5563",
                          backgroundColor: checked ? "#6C63FF" : "transparent",
                        }}
                      >
                        {checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white" strokeWidth="1.8"
                              strokeLinecap="round" strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>

                      <div
                        className="w-5 h-5 rounded-sm flex-shrink-0 border"
                        style={{
                          background:      isGrad ? hex : undefined,
                          backgroundColor: isGrad ? undefined : hex,
                          borderColor:     opt.label === "White" ? "#4b5563" : "transparent",
                        }}
                      />

                      <span
                        className="text-sm font-medium transition-colors group-hover:text-white"
                        style={{ color: checked ? "#fff" : "#9ca3af" }}
                      >
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {group.options.map((opt) => {
                  const checked = isChecked(group.key, opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => toggle(group.key, opt.value)}
                    >
                      <div
                        className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-sm border-2 transition-all"
                        style={{
                          borderColor:     checked ? "#6C63FF" : "#4b5563",
                          backgroundColor: checked ? "#6C63FF" : "transparent",
                        }}
                      >
                        {checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white" strokeWidth="1.8"
                              strokeLinecap="round" strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>

                      <span
                        className="text-sm font-medium transition-colors group-hover:text-white"
                        style={{ color: checked ? "#fff" : "#9ca3af" }}
                      >
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {idx < nonBrandGroups.length - 1 && (
              <div
                className="w-full h-px mt-5"
                style={{ backgroundColor: "#2a2a3d" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSidebar;