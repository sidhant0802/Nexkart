import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { getAllProducts } from "../../../Redux Toolkit/Customer/ProductSlice";
import ProductCard from "./ProductCard";
import FilterSidebar, { type ActiveFilters } from "./FilterSidebar";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Relevance",          value: ""           },
  { label: "Price: Low to High", value: "price_low"  },
  { label: "Price: High to Low", value: "price_high" },
  { label: "Best Discount",      value: "discount"   },
  { label: "Newest First",       value: "newest"     },
];

const Products = () => {
  const { categoryId } = useParams();
  const dispatch = useAppDispatch();
  const { products, loading, totalPages } = useAppSelector((s) => s.products);

  const [sortBy,      setSortBy]      = useState("");
  const [sortOpen,    setSortOpen]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters,     setFilters]     = useState<ActiveFilters>({});

  const buildParams = useCallback(() => {
    const params: Record<string, any> = {
      category:   categoryId,
      sort:       sortBy,
      pageNumber: currentPage,
      pageSize:   10,
    };

    Object.entries(filters).forEach(([key, values]) => {
      if (!values || values.length === 0) return;
      const val = values[values.length - 1];
      if (key === "brand")              params.brand       = val;
      else if (key === "color")         params.color       = val;
      else if (key === "minDiscount")   params.minDiscount = val;
      else if (key === "minPrice,maxPrice") {
        const [min, max] = val.split("-");
        params.minPrice  = min;
        params.maxPrice  = max;
      }
    });

    return params;
  }, [categoryId, sortBy, currentPage, filters]);

  useEffect(() => {
    dispatch(getAllProducts(buildParams()));
  }, [buildParams, dispatch]);

  useEffect(() => {
    setCurrentPage(0);
    setFilters({});
    setSortBy("");
  }, [categoryId]);

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(0);
  };

  const activeFilterCount = Object.values(filters).reduce(
    (sum, arr) => sum + arr.length, 0
  );

  const activeChips: { key: string; value: string; label: string }[] = [];
  Object.entries(filters).forEach(([key, values]) => {
    values.forEach((v) => activeChips.push({ key, value: v, label: v }));
  });

  const removeChip = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((v) => v !== value),
    }));
    setCurrentPage(0);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D12", color: "#fff" }}>
      <div className="max-w-[1400px] mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold capitalize">
            {categoryId?.replace(/_/g, " ") || "All Products"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#9ca3af" }}>
            {loading ? "Loading..." : `${products?.length || 0} products found`}
          </p>
        </div>

        <div className="flex gap-6">

          {/* Sidebar Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              categoryId={categoryId}
              filters={filters}
              setFilters={(f) => { setFilters(f); setCurrentPage(0); }}
              onClear={handleClearFilters}
            />
          </aside>

          <main className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
                style={{
                  borderColor:     "#6C63FF",
                  color:           "#6C63FF",
                  backgroundColor: "rgba(108,99,255,0.1)",
                }}
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span
                    className="w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                    style={{ backgroundColor: "#6C63FF" }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="relative ml-auto">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border"
                  style={{
                    borderColor:     "#2a2a3d",
                    backgroundColor: "#16161f",
                    color:           "#fff",
                  }}
                >
                  Sort By:&nbsp;
                  <span style={{ color: "#6C63FF" }}>
                    {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Relevance"}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      color:      "#6C63FF",
                      transform:  sortOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                {sortOpen && (
                  <div
                    className="absolute right-0 top-12 z-50 w-52 rounded-xl overflow-hidden shadow-2xl border"
                    style={{ backgroundColor: "#16161f", borderColor: "#2a2a3d" }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); setCurrentPage(0); }}
                        className="w-full text-left px-4 py-3 text-sm transition-colors"
                        style={{
                          backgroundColor: sortBy === opt.value
                            ? "rgba(108,99,255,0.15)" : "transparent",
                          color: sortBy === opt.value ? "#6C63FF" : "#d1d5db",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {activeChips.map((chip) => (
                  <span
                    key={`${chip.key}-${chip.value}`}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "rgba(108,99,255,0.15)",
                      color:  "#6C63FF",
                      border: "1px solid rgba(108,99,255,0.3)",
                    }}
                  >
                    {chip.label}
                    <X
                      size={11}
                      className="cursor-pointer hover:opacity-70"
                      onClick={() => removeChip(chip.key, chip.value)}
                    />
                  </span>
                ))}
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{ color: "#FF6584", border: "1px solid rgba(255,101,132,0.3)" }}
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-32">
                <div
                  className="w-10 h-10 rounded-full border-4 animate-spin"
                  style={{ borderColor: "#6C63FF", borderTopColor: "transparent" }}
                />
              </div>
            )}

            {/* ✅ Product Grid - passes categoryId so navigation works */}
            {!loading && products && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    categoryId={
                      // ✅ Use product's own categoryId - most reliable
                      typeof (product as any).category === "object"
                        ? (product as any).category?.categoryId
                        : (product as any).category || categoryId || "all"
                    }
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && (!products || products.length === 0) && (
              <div
                className="flex flex-col items-center justify-center py-24 rounded-2xl"
                style={{ backgroundColor: "#16161f" }}
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-sm mb-4" style={{ color: "#9ca3af" }}>
                  Try adjusting or clearing your filters
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: "#6C63FF", color: "#fff" }}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{
                    backgroundColor: currentPage === 0 ? "#1a1a2e" : "#16161f",
                    color:           currentPage === 0 ? "#4b5563" : "#fff",
                    border:  "1px solid #2a2a3d",
                    cursor:  currentPage === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-10 h-10 rounded-xl text-sm font-semibold"
                    style={{
                      backgroundColor: currentPage === page ? "#6C63FF" : "#16161f",
                      color:           currentPage === page ? "#fff"    : "#9ca3af",
                      border:    currentPage === page ? "none" : "1px solid #2a2a3d",
                      boxShadow: currentPage === page
                        ? "0 0 16px rgba(108,99,255,0.4)" : "none",
                    }}
                  >
                    {page + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{
                    backgroundColor: currentPage === totalPages - 1 ? "#1a1a2e" : "#16161f",
                    color:           currentPage === totalPages - 1 ? "#4b5563" : "#fff",
                    border:  "1px solid #2a2a3d",
                    cursor:  currentPage === totalPages - 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="absolute left-0 top-0 h-full w-80 overflow-y-auto p-4"
            style={{ backgroundColor: "#0D0D12" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} style={{ color: "#9ca3af" }} />
              </button>
            </div>
            <FilterSidebar
              categoryId={categoryId}
              filters={filters}
              setFilters={(f) => { setFilters(f); setCurrentPage(0); }}
              onClear={handleClearFilters}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;