import React, { useEffect } from "react";
import SellingChart from "./SellingChart";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchSellerReport }   from "../../../Redux Toolkit/Seller/sellerSlice";
import { fetchSellerProducts } from "../../../Redux Toolkit/Seller/sellerProductSlice";
import { fetchSellerOrders }   from "../../../Redux Toolkit/Seller/sellerOrderSlice";
import ReportCard from "./Report/ReportCard";
import AccountBalanceIcon  from "@mui/icons-material/AccountBalance";
import ShoppingBagIcon     from "@mui/icons-material/ShoppingBag";
import InventoryIcon       from "@mui/icons-material/Inventory";
import CancelIcon          from "@mui/icons-material/Cancel";
import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from "@mui/material";

const Chart = [
  { name: "Today",        value: "today"   },
  { name: "Last 7 days",  value: "daily"   },
  { name: "Last 12 Month",value: "monthly" },
];

const HomePage = () => {
  const dispatch        = useAppDispatch();
  const sellers         = useAppSelector((s) => s.sellers);
  const sellerProduct   = useAppSelector((s) => s.sellerProduct);
  const sellerOrder     = useAppSelector((s) => s.sellerOrder);
  const [chartType, setChartType] = React.useState(Chart[0].value);
  const jwt = localStorage.getItem("jwt") || "";

  useEffect(() => {
    dispatch(fetchSellerReport(jwt));
    dispatch(fetchSellerProducts(jwt));
    dispatch(fetchSellerOrders(jwt));
  }, []);

  // ── Derived stats ──
  const totalListings   = sellerProduct.listings.length;
  const activeListings  = sellerProduct.listings.filter(l => l.isActive).length;
  const totalOrders     = sellerOrder.orders.length;
  const pendingOrders   = sellerOrder.orders.filter(o => o.orderStatus === "PLACED").length;
  const deliveredOrders = sellerOrder.orders.filter(o => o.orderStatus === "DELIVERED").length;
  const cancelledOrders = sellerOrder.orders.filter(o => o.orderStatus === "CANCELLED").length;

  const totalRevenue = sellers.report?.totalEarnings ?? 0;
  const totalSales   = sellers.report?.totalSales    ?? totalOrders;

  return (
    <div className="space-y-5">
      {/* ── Stats grid ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          icon={<AccountBalanceIcon />}
          value={`₹${totalRevenue.toLocaleString()}`}
          title="Total Earnings"
        />
        <ReportCard
          icon={<ShoppingBagIcon />}
          value={totalSales}
          title="Total Sales"
        />
        <ReportCard
          icon={<InventoryIcon />}
          value={`${activeListings} / ${totalListings}`}
          title="Active Listings"
        />
        <ReportCard
          icon={<CancelIcon />}
          value={cancelledOrders}
          title="Cancelled Orders"
        />
      </section>

      {/* ── Order summary row ── */}
      <section className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{pendingOrders}</p>
        </div>
        <div className="p-4 rounded-xl bg-green-50 border border-green-100">
          <p className="text-xs text-green-500 font-semibold uppercase tracking-wider">Delivered</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{deliveredOrders}</p>
        </div>
        <div className="p-4 rounded-xl bg-red-50 border border-red-100">
          <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">Cancelled</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{cancelledOrders}</p>
        </div>
      </section>

      {/* ── Revenue chart ── */}
      <div className="h-[500px] space-y-10 p-5 lg:p-10 bg-slate-800 rounded-md">
        <div className="w-40">
          <FormControl fullWidth>
            <InputLabel sx={{ color: "white" }}>Chart Type</InputLabel>
            <Select
              sx={{
                color: "white",
                ".MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                ".MuiSvgIcon-root": { color: "white" },
              }}
              value={chartType}
              label="Chart Type"
              onChange={(e: SelectChangeEvent) => setChartType(e.target.value)}
            >
              {Chart.map((item) => (
                <MenuItem key={item.value} value={item.value}>{item.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="h-[350px]">
          <SellingChart chartType={chartType} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;