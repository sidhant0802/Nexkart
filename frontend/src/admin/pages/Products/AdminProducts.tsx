import React, { useEffect, useState } from "react";
import {
  Plus, Search, Edit2, Trash2, Package,
  Smartphone, Shirt, Sofa, Sparkles, Tag, Filter, X,
  Store, TrendingDown, Users, BarChart2, ShoppingBag,
} from "lucide-react";
import { Dialog, IconButton, CircularProgress, Chip, Tooltip } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchAdminProducts,
  deleteAdminProduct,
  resetAdminProductFlags,
  clearListings,
  fetchAdminStats,
} from "../../../Redux Toolkit/Admin/AdminProductSlice";
import { mainCategory } from "../../../data/category/mainCategory";
import AdminAddProductForm from "./AdminAddProductForm";
import AdminSellerManager from "./AdminSellerManager";

const categoryIcons: Record<string, any> = {
  electronics:    Smartphone,
  men:            Shirt,
  women:          Sparkles,
  home_furniture: Sofa,
};

const categoryColors: Record<string, string> = {
  electronics:    "from-blue-500 to-cyan-500",
  men:            "from-indigo-500 to-purple-500",
  women:          "from-pink-500 to-rose-500",
  home_furniture: "from-amber-500 to-orange-500",
};

const computeDiscount = (product: any): number => {
  const mrp  = product.minMrpPrice ?? product.mrpPrice ?? 0;
  const sell = product.minPrice    ?? product.sellingPrice ?? 0;
  if (mrp <= 0 || sell <= 0 || sell >= mrp) return 0;
  return Math.round(((mrp - sell) / mrp) * 100);
};

const AdminProducts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, stats, statsLoading } =
    useAppSelector(s => s.adminProduct);

  const [selectedCategory,     setSelectedCategory]     = useState<string>("");
  const [search,               setSearch]               = useState("");
  const [openForm,             setOpenForm]             = useState(false);
  const [editProduct,          setEditProduct]          = useState<any>(null);
  const [sellerManagerProduct, setSellerManagerProduct] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchAdminProducts(selectedCategory || undefined));
  }, [selectedCategory]);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, []);

  const handleEdit = (product: any) => {
    setEditProduct(product);
    setOpenForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this product and all its seller listings permanently?")) {
      dispatch(deleteAdminProduct(id));
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setEditProduct(null);
    dispatch(resetAdminProductFlags());
    dispatch(fetchAdminProducts(selectedCategory || undefined));
    dispatch(fetchAdminStats());
  };

  const handleSellerManagerClose = () => {
    setSellerManagerProduct(null);
    dispatch(clearListings());
    dispatch(fetchAdminProducts(selectedCategory || undefined));
    dispatch(fetchAdminStats());
  };

  const filtered = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-5 h-full">

      {/* ═══════════ LEFT SIDEBAR ═══════════ */}
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-0 overflow-y-auto max-h-screen">

          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <Filter size={16} className="text-indigo-600" />
            <h3 className="font-bold text-gray-800 text-sm">Categories</h3>
          </div>

          {/* All Products */}
          <button
            onClick={() => setSelectedCategory("")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 transition-all text-sm font-medium ${
              !selectedCategory
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Package size={16} />
            All Products
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
              !selectedCategory ? "bg-white/20" : "bg-gray-100"
            }`}>
              {products.length}
            </span>
          </button>

          {/* Category buttons */}
          <div className="space-y-1">
            {mainCategory.map(cat => {
              const Icon     = categoryIcons[cat.categoryId] || Tag;
              const isActive = selectedCategory === cat.categoryId;
              return (
                <button
                  key={cat.categoryId}
                  onClick={() => setSelectedCategory(cat.categoryId)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-left ${
                    isActive
                      ? `bg-gradient-to-r ${categoryColors[cat.categoryId]} text-white shadow-md`
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={16} />
                  <span className="flex-1">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* ✅ REAL Stats from API */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Platform Stats
            </p>

            {statsLoading ? (
              <div className="flex justify-center py-3">
                <CircularProgress size={16} />
              </div>
            ) : (
              [
                {
                  icon: BarChart2,
                  color: "text-indigo-500",
                  bg:    "bg-indigo-50",
                  label: "Total Products",
                  value: stats?.total?.toLocaleString() ?? products.length,
                },
                {
                  icon: Users,
                  color: "text-green-600",
                  bg:    "bg-green-50",
                  label: "Unique Sellers",
                  value: stats?.totalUniqueSellers?.toLocaleString() ?? "—",
                },
                {
                  icon: ShoppingBag,
                  color: "text-blue-500",
                  bg:    "bg-blue-50",
                  label: "Total Listings",
                  value: stats?.totalListings?.toLocaleString() ?? "—",
                },
                {
                  icon: TrendingDown,
                  color: "text-purple-500",
                  bg:    "bg-purple-50",
                  label: "Avg Sellers/Product",
                  value: stats?.avgSellersPerProduct ?? "—",
                },
                {
                  icon: Package,
                  color: "text-orange-500",
                  bg:    "bg-orange-50",
                  label: "Total Stock",
                  value: stats?.totalStock?.toLocaleString("en-IN") ?? "—",
                },
                {
                  icon: BarChart2,
                  color: "text-pink-500",
                  bg:    "bg-pink-50",
                  label: "Total Sold",
                  value: stats?.totalSold?.toLocaleString("en-IN") ?? "—",
                },
              ].map(({ icon: Icon, color, bg, label, value }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <span className={`p-1 rounded-lg ${bg}`}>
                      <Icon size={10} className={color} />
                    </span>
                    {label}
                  </span>
                  <span className="font-bold text-gray-800">{value}</span>
                </div>
              ))
            )}

            {/* Top multi-seller products */}
            {(stats?.topMultiSeller?.length ?? 0) > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Most Competitive
                </p>
                {stats!.topMultiSeller.slice(0, 3).map((p: any) => (
                  <div key={p._id} className="flex items-center justify-between py-1">
                    <p className="text-[10px] text-gray-600 truncate flex-1 max-w-[110px]">
                      {p.title}
                    </p>
                    <span className="text-[10px] font-bold text-indigo-600 ml-1">
                      {p.totalSellers} sellers
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ═══════════ MAIN ═══════════ */}
      <main className="flex-1 min-w-0">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="text-indigo-600" size={22} />
                Product Management
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {selectedCategory
                  ? `Showing: ${mainCategory.find(c => c.categoryId === selectedCategory)?.name}`
                  : "All Products"}
                {" · "}{filtered.length} items
              </p>
            </div>
            <button
              onClick={() => setOpenForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <CircularProgress />
          </div>

        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No products found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try a different search or click "Add Product"
            </p>
          </div>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(product => {
              const disc     = computeDiscount(product);
              const minPrice = product.minPrice    ?? product.sellingPrice ?? 0;
              const mrpPrice = product.minMrpPrice ?? product.mrpPrice    ?? 0;
              const sellers  = product.totalSellers ?? 0;
              const stock    = product.totalStock   ?? product.quantity   ?? 0;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-gray-50 overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                      <img loading="lazy" decoding="async"
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/400x300/eee/999?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={40} className="text-gray-300" />
                      </div>
                    )}

                    {/* Discount badge */}
                    {disc > 0 && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow">
                        {disc}% OFF
                      </span>
                    )}

                    {/* Multi-seller badge */}
                    {sellers > 1 && (
                      <Tooltip title={`${sellers} sellers competing on price`}>
                        <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-md shadow cursor-default">
                          <Store size={10} />
                          {sellers}
                        </span>
                      </Tooltip>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-indigo-600 font-semibold uppercase truncate flex-1">
                        {product.category?.name || "Uncategorized"}
                      </p>
                      {product.brand && (
                        <span className="text-xs text-gray-400 ml-2 truncate max-w-[80px]">
                          {product.brand}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-sm text-gray-800 truncate mb-2">
                      {product.title}
                    </h3>

                    {/* ✅ Price - never NaN */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-bold text-gray-900 text-base">
                        {minPrice > 0 ? `₹${minPrice.toLocaleString("en-IN")}` : "—"}
                      </span>
                      {mrpPrice > minPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{mrpPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                      {disc > 0 && (
                        <span className="text-xs text-green-600 font-semibold">
                          {disc}% off
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <Users size={11} className="text-indigo-400" />
                        <b className="text-gray-700">{sellers}</b> seller{sellers !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={11} className="text-orange-400" />
                        Stock: <b className="text-gray-700">{stock}</b>
                      </span>
                    </div>

                    {/* Lowest price indicator */}
                    {sellers > 1 && minPrice > 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 rounded-lg px-2 py-1 mb-3">
                        <TrendingDown size={11} />
                        Lowest: ₹{minPrice.toLocaleString("en-IN")}
                        {product.defaultListing?.seller?.businessDetails?.businessName && (
                          <span className="text-green-500 ml-1 truncate">
                            by {product.defaultListing.seller.businessDetails.businessName}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>

                    {/* ✅ Manage Sellers button */}
                    <button
                      onClick={() => setSellerManagerProduct(product)}
                      className="w-full flex items-center justify-center gap-2 py-2 mt-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:from-green-100 hover:to-emerald-100 transition-all"
                    >
                      <Store size={13} />
                      Manage Sellers
                      {sellers > 0 && (
                        <span className="bg-green-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                          {sellers}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openForm}
        onClose={handleFormClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {editProduct ? "Edit Product" : "Add New Product"}
          </h2>
          <IconButton onClick={handleFormClose} size="small">
            <X size={18} />
          </IconButton>
        </div>
        <AdminAddProductForm editProduct={editProduct} onClose={handleFormClose} />
      </Dialog>

      {/* ✅ Seller Manager Dialog */}
      {sellerManagerProduct && (
        <AdminSellerManager
          product={sellerManagerProduct}
          open={!!sellerManagerProduct}
          onClose={handleSellerManagerClose}
        />
      )}
    </div>
  );
};

export default AdminProducts;