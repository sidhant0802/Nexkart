import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package, Truck, CheckCircle, XCircle, Clock,
  Edit, MapPin, Phone, ChevronDown,
} from "lucide-react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Chip, IconButton,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchSellerOrders } from "../../../Redux Toolkit/Seller/sellerOrderSlice";
import { updateTrackingStatus } from "../../../Redux Toolkit/Customer/TrackingSlice";

const STATUS_OPTIONS = [
  { value: "CONFIRMED",        label: "Confirmed",        color: "#06b6d4", icon: CheckCircle },
  { value: "PACKED",           label: "Packed",           color: "#f59e0b", icon: Package },
  { value: "SHIPPED",          label: "Shipped",          color: "#3b82f6", icon: Truck },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", color: "#8b5cf6", icon: Truck },
  { value: "DELIVERED",        label: "Delivered",        color: "#10b981", icon: CheckCircle },
  { value: "CANCELLED",        label: "Cancelled",        color: "#ef4444", icon: XCircle },
];

const getStatusConfig = (status: string) =>
  STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

export default function OrderTable() {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((s) => s.sellerOrder);

  const [editOrder, setEditOrder] = useState<any>(null);
  const [editData, setEditData] = useState({
    status: "",
    message: "",
    location: "",
    carrier: "",
    trackingNumber: "",
    estimatedDelivery: "",
  });

  useEffect(() => {
    dispatch(fetchSellerOrders(localStorage.getItem("jwt") || ""));
  }, [dispatch]);

  const openEditDialog = (order: any) => {
    setEditOrder(order);
    setEditData({
      status: order.orderStatus,
      message: "",
      location: "",
      carrier: "Nexkart Express",
      trackingNumber: "",
      estimatedDelivery: order.deliverDate
        ? new Date(order.deliverDate).toISOString().split("T")[0]
        : "",
    });
  };

  const handleUpdate = async () => {
    if (!editOrder) return;
    try {
      await dispatch(updateTrackingStatus({
        orderId: editOrder._id,
        ...editData,
      })).unwrap();
      
      dispatch(fetchSellerOrders(localStorage.getItem("jwt") || ""));
      setEditOrder(null);
    } catch (e) {
      alert("Update failed: " + e);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>
        📦 Order Management
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map((order: any, i: number) => {
          const config = getStatusConfig(order.orderStatus);
          const Icon = config.icon;

          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
                border: "1px solid #e5e7eb",
              }}
            >
              {/* Header */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", flexWrap: "wrap", gap: 8,
                paddingBottom: 12, borderBottom: "1px solid #f1f5f9",
              }}>
                <div>
                  <p style={{ fontSize: 10, color: "#94a3b8", margin: 0, fontWeight: 700, letterSpacing: 1 }}>
                    ORDER ID
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", margin: "2px 0 0" }}>
                    #{order._id.slice(-10).toUpperCase()}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Chip
                    icon={<Icon size={14} />}
                    label={config.label}
                    sx={{
                      background: `${config.color}15`,
                      color: config.color,
                      fontWeight: 700,
                      "& .MuiChip-icon": { color: config.color },
                    }}
                  />
                  <Button
                    onClick={() => openEditDialog(order)}
                    variant="contained"
                    size="small"
                    startIcon={<Edit size={14} />}
                    sx={{
                      textTransform: "none",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      fontWeight: 700,
                    }}
                  >
                    Update
                  </Button>
                </div>
              </div>

              {/* Products */}
              <div style={{ display: "flex", gap: 12, padding: "12px 0", flexWrap: "wrap" }}>
                {order.orderItems.map((item: any) => (
                  <div key={item._id} style={{
                    display: "flex", gap: 10,
                    padding: 8,
                    background: "#f9fafb", borderRadius: 8,
                    border: "1px solid #f1f5f9", minWidth: 280,
                  }}>
                    <img
                      src={item.product?.images?.[0]}
                      style={{ width: 56, height: 56, borderRadius: 6, objectFit: "cover" }}
                    />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>
                        {item.product?.title}
                      </p>
                      <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0" }}>
                        Qty: {item.quantity} · Size: {item.size}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#10b981", margin: 0 }}>
                        ₹{(item.sellingPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Address */}
              <div style={{
                padding: 10,
                background: "#f9fafb",
                borderRadius: 8,
                border: "1px solid #f1f5f9",
                fontSize: 12,
              }}>
                <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={12} /> {order.shippingAddress?.name}
                </p>
                <p style={{ margin: "2px 0", color: "#64748b" }}>
                  {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pinCode}
                </p>
                <p style={{ margin: 0, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                  <Phone size={12} /> {order.shippingAddress?.mobile}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editOrder} onClose={() => setEditOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          📦 Update Order Tracking
        </DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
            <TextField
              select
              label="Order Status"
              value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              fullWidth
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Custom Message (optional)"
              value={editData.message}
              onChange={(e) => setEditData({ ...editData, message: e.target.value })}
              fullWidth
              placeholder="e.g. Package will be delivered tomorrow"
            />

            <TextField
              label="Current Location (optional)"
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              fullWidth
              placeholder="e.g. Mumbai Distribution Center"
            />

            <TextField
              label="Carrier"
              value={editData.carrier}
              onChange={(e) => setEditData({ ...editData, carrier: e.target.value })}
              fullWidth
            />

            <TextField
              label="Tracking Number"
              value={editData.trackingNumber}
              onChange={(e) => setEditData({ ...editData, trackingNumber: e.target.value })}
              fullWidth
              placeholder="Will auto-generate if empty"
            />

            <TextField
              type="date"
              label="Estimated Delivery"
              value={editData.estimatedDelivery}
              onChange={(e) => setEditData({ ...editData, estimatedDelivery: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOrder(null)}>Cancel</Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            sx={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            Update Order
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}