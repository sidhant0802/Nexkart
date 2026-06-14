import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Truck, CheckCircle, XCircle,
  Edit, MapPin, Phone, MessageSquare,
  RotateCcw, ChevronDown, ChevronUp,
  Clock, AlertCircle,
} from "lucide-react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Chip, Tab, Tabs,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchSellerOrders } from "../../../Redux Toolkit/Seller/sellerOrderSlice";
import { updateTrackingStatus } from "../../../Redux Toolkit/Customer/TrackingSlice";
import SellerOrderChat from "./SellerOrderChat";
import { api } from "../../../Config/Api";

// ── Constants ─────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "CONFIRMED",        label: "Confirmed",        color: "#06b6d4", icon: CheckCircle },
  { value: "PACKED",           label: "Packed",           color: "#f59e0b", icon: Package     },
  { value: "SHIPPED",          label: "Shipped",          color: "#3b82f6", icon: Truck        },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", color: "#8b5cf6", icon: Truck        },
  { value: "DELIVERED",        label: "Delivered",        color: "#10b981", icon: CheckCircle  },
  { value: "CANCELLED",        label: "Cancelled",        color: "#ef4444", icon: XCircle      },
];

const RETURN_STATUS_OPTIONS = [
  { value: "APPROVED",  label: "Approve",  color: "#10b981", icon: CheckCircle  },
  { value: "REJECTED",  label: "Reject",   color: "#ef4444", icon: XCircle      },
  { value: "PICKED_UP", label: "Picked Up",color: "#3b82f6", icon: Package      },
  { value: "REFUNDED",  label: "Refunded", color: "#8b5cf6", icon: CheckCircle  },
];

const RETURN_STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  REQUESTED: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Requested"  },
  APPROVED:  { color: "#10b981", bg: "rgba(16,185,129,0.1)",  label: "Approved"   },
  REJECTED:  { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Rejected"   },
  PICKED_UP: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  label: "Picked Up"  },
  REFUNDED:  { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  label: "Refunded"   },
};

const RETURN_REASON_LABELS: Record<string, string> = {
  DAMAGED_PRODUCT:  "📦 Damaged Product",
  WRONG_PRODUCT:    "❌ Wrong Product",
  NOT_AS_DESCRIBED: "📝 Not as Described",
  QUALITY_ISSUE:    "⚠️ Quality Issue",
  CHANGED_MIND:     "💭 Changed Mind",
  OTHER:            "🔹 Other",
};

const getStatusConfig = (status: string) =>
  STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

// ── Return Item Component ─────────────────────────────────────
const ReturnItem = ({ ret, onUpdate }: { ret: any; onUpdate: () => void }) => {
  const [expanded,   setExpanded]   = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [sellerNote, setSellerNote] = useState('');
  const [updating,   setUpdating]   = useState(false);

  const sc = RETURN_STATUS_COLORS[ret.status] || RETURN_STATUS_COLORS.REQUESTED;

  const handleAction = async (status: string) => {
    setUpdating(true);
    try {
      const jwt = localStorage.getItem("jwt");
      await api.put(`/api/returns/seller/${ret._id}`, { status, sellerNote }, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setActionOpen(false);
      onUpdate();
    } catch (e) {
      alert("Failed to update return");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background:   "#fff",
        borderRadius: 12,
        border:       "1px solid #e5e7eb",
        overflow:     "hidden",
        marginBottom: 8,
      }}
    >
      {/* Status accent bar */}
      <div style={{ height: 3, background: sc.color }} />

      <div style={{ padding: 14 }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* Status badge */}
            <div style={{
              padding: "4px 10px", borderRadius: 20,
              background: sc.bg, border: `1px solid ${sc.color}30`,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: sc.color }}>{sc.label}</span>
            </div>

            {/* Order ID */}
            <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace", fontWeight: 600 }}>
              #{ret.order?._id?.slice(-6).toUpperCase() || "------"}
            </span>

            {/* Date */}
            <span style={{ fontSize: 10, color: "#94a3b8" }}>
              {new Date(ret.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {/* Update button — only for REQUESTED */}
            {ret.status === "REQUESTED" && (
              <Button
                size="small"
                variant="contained"
                onClick={() => setActionOpen(true)}
                sx={{
                  textTransform: "none", fontWeight: 700, fontSize: 11,
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                  minWidth: "auto",
                }}
              >
                Take Action
              </Button>
            )}

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded((p) => !p)}
              style={{
                background: "#f9fafb", border: "1px solid #e5e7eb",
                borderRadius: 8, cursor: "pointer", color: "#64748b",
                width: 28, height: 28, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Customer + Reason summary */}
        <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 8,
            background: "#f9fafb", border: "1px solid #f1f5f9",
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 10, fontWeight: 800, flexShrink: 0,
            }}>
              {(ret.user?.fullName || "C").charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>
              {ret.user?.fullName || "Customer"}
            </span>
          </div>

          <div style={{
            padding: "4px 10px", borderRadius: 8,
            background: "#fef3c7", border: "1px solid #fde68a",
            fontSize: 11, fontWeight: 600, color: "#92400e",
          }}>
            {RETURN_REASON_LABELS[ret.reason] || ret.reason}
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{   height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                {/* Product info */}
                {ret.orderItem && (
                  <div style={{
                    display: "flex", gap: 10, padding: 10,
                    background: "#f9fafb", borderRadius: 10,
                    border: "1px solid #f1f5f9", marginBottom: 10,
                  }}>
                    <img
                      src={ret.orderItem?.product?.images?.[0] || ""}
                      style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover" }}
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/50x50/6366f1/fff?text=?"; }}
                    />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, margin: "0 0 2px", color: "#0f172a" }}>
                        {ret.orderItem?.product?.title || "Product"}
                      </p>
                      <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 2px" }}>
                        Qty: {ret.orderItem?.quantity} · Size: {ret.orderItem?.size}
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#10b981", margin: 0 }}>
                        ₹{((ret.orderItem?.sellingPrice || 0) * (ret.orderItem?.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                {ret.description && (
                  <div style={{
                    padding: 10, borderRadius: 8,
                    background: "#fff7ed", border: "1px solid #fed7aa",
                    marginBottom: 8,
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#92400e", margin: "0 0 4px", letterSpacing: 0.5 }}>
                      CUSTOMER NOTE
                    </p>
                    <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>{ret.description}</p>
                  </div>
                )}

                {/* Return window */}
                <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#64748b" }}>
                  <Clock size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    Return window: {ret.returnWindowDays} days ·
                    Deadline: {new Date(ret.returnDeadline).toLocaleDateString("en-IN")}
                  </span>
                </div>

                {/* Seller note if already actioned */}
                {ret.sellerNote && (
                  <div style={{
                    marginTop: 8, padding: 10, borderRadius: 8,
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#166534", margin: "0 0 4px" }}>YOUR NOTE</p>
                    <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>{ret.sellerNote}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionOpen} onClose={() => setActionOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>↩ Handle Return Request</DialogTitle>
        <DialogContent>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>
            Customer: <strong>{ret.user?.fullName}</strong><br />
            Reason: <strong>{RETURN_REASON_LABELS[ret.reason]}</strong>
          </p>

          <TextField
            label="Note to customer (optional)"
            value={sellerNote}
            onChange={(e) => setSellerNote(e.target.value)}
            fullWidth multiline rows={2}
            placeholder="e.g. Approved! Please keep the item..."
            sx={{ mb: 2 }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {RETURN_STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleAction(opt.value)}
                  disabled={updating}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                    border: `1px solid ${opt.color}30`,
                    background: `${opt.color}08`,
                    color: opt.color, fontWeight: 700, fontSize: 13,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget).style.background = `${opt.color}15`; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.background = `${opt.color}08`; }}
                >
                  <Icon size={16} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: "8px 24px 16px" }}>
          <Button onClick={() => setActionOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

// ── Returns Tab Component ─────────────────────────────────────
const ReturnsTab = () => {
  const [returns,  setReturns]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<string>("ALL");

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await api.get("/api/returns/seller", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setReturns(res.data || []);
    } catch (e) {
      console.error("Failed to fetch returns:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReturns(); }, []);

  const filtered = filter === "ALL"
    ? returns
    : returns.filter((r) => r.status === filter);

  const counts: Record<string, number> = {};
  returns.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });

  const FILTERS = [
    { key: "ALL",       label: "All"       },
    { key: "REQUESTED", label: "Pending"   },
    { key: "APPROVED",  label: "Approved"  },
    { key: "REJECTED",  label: "Rejected"  },
    { key: "PICKED_UP", label: "Picked Up" },
    { key: "REFUNDED",  label: "Refunded"  },
  ];

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { key: "REQUESTED", label: "Pending",   color: "#f59e0b", icon: Clock        },
          { key: "APPROVED",  label: "Approved",  color: "#10b981", icon: CheckCircle  },
          { key: "REJECTED",  label: "Rejected",  color: "#ef4444", icon: XCircle      },
          { key: "REFUNDED",  label: "Refunded",  color: "#8b5cf6", icon: RotateCcw    },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.key} style={{
              flex: "1 1 100px",
              padding: "10px 14px", borderRadius: 12,
              background: "#fff", border: "1px solid #e5e7eb",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `${s.color}12`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={14} style={{ color: s.color }} />
                </div>
                <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{s.label}</span>
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: 0 }}>
                {counts[s.key] || 0}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "5px 12px", borderRadius: 20, cursor: "pointer",
              border: filter === f.key ? "1px solid #6366f1" : "1px solid #e5e7eb",
              background: filter === f.key ? "rgba(99,102,241,0.08)" : "#fff",
              color: filter === f.key ? "#6366f1" : "#64748b",
              fontWeight: 700, fontSize: 11, transition: "all 0.15s",
            }}
          >
            {f.label}
            {f.key !== "ALL" && counts[f.key]
              ? <span style={{
                  marginLeft: 5, background: filter === f.key ? "#6366f1" : "#e5e7eb",
                  color: filter === f.key ? "#fff" : "#64748b",
                  borderRadius: 10, padding: "0 5px", fontSize: 10,
                }}>
                  {counts[f.key]}
                </span>
              : null
            }
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: 32, height: 32, margin: "0 auto 12px",
              border: "3px solid rgba(99,102,241,0.15)",
              borderTop: "3px solid #6366f1", borderRadius: "50%",
            }}
          />
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Loading returns...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#374151", margin: "0 0 4px" }}>
            No {filter === "ALL" ? "" : filter.toLowerCase()} returns
          </p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            {filter === "ALL"
              ? "Return requests from customers will appear here"
              : "No returns with this status"}
          </p>
        </div>
      ) : (
        <div>
          {filtered.map((ret) => (
            <ReturnItem key={ret._id} ret={ret} onUpdate={fetchReturns} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main OrderTable Component ─────────────────────────────────
export default function OrderTable() {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((s) => s.sellerOrder);

  const [activeTab, setActiveTab] = useState(0);
  const [editOrder, setEditOrder] = useState<any>(null);
  const [chatOrder, setChatOrder] = useState<any>(null);
  const [editData,  setEditData]  = useState({
    status: "", message: "", location: "",
    carrier: "", trackingNumber: "", estimatedDelivery: "",
  });

  useEffect(() => {
    dispatch(fetchSellerOrders(localStorage.getItem("jwt") || ""));
  }, [dispatch]);

  const openEditDialog = (order: any) => {
    setEditOrder(order);
    setEditData({
      status:            order.orderStatus,
      message:           "",
      location:          "",
      carrier:           "Nexkart Express",
      trackingNumber:    "",
      estimatedDelivery: order.deliverDate
        ? new Date(order.deliverDate).toISOString().split("T")[0]
        : "",
    });
  };

  const handleUpdate = async () => {
    if (!editOrder) return;
    try {
      await dispatch(updateTrackingStatus({ orderId: editOrder._id, ...editData })).unwrap();
      dispatch(fetchSellerOrders(localStorage.getItem("jwt") || ""));
      setEditOrder(null);
    } catch (e) {
      alert("Update failed: " + e);
    }
  };

  // Count pending returns for badge
  const [pendingReturns, setPendingReturns] = useState(0);
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;
    api.get("/api/returns/seller", { headers: { Authorization: `Bearer ${jwt}` } })
      .then((r) => {
        const pending = (r.data || []).filter((ret: any) => ret.status === "REQUESTED").length;
        setPendingReturns(pending);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ padding: "0 0 40px" }}>

      {/* ── Page Title ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#0f172a" }}>
          📦 Order Management
        </h1>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
          Manage orders, update tracking and handle return requests
        </p>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        background: "#fff", borderRadius: 12,
        border: "1px solid #e5e7eb", marginBottom: 16, overflow: "hidden",
      }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            minHeight: 44,
            "& .MuiTab-root": {
              textTransform: "none", fontWeight: 700, fontSize: 13,
              minHeight: 44, color: "#64748b",
            },
            "& .Mui-selected": { color: "#6366f1 !important" },
            "& .MuiTabs-indicator": { background: "#6366f1" },
          }}
        >
          <Tab
            label={
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Package size={15} /> Orders
                {orders.length > 0 && (
                  <span style={{
                    background: "#f1f5f9", color: "#475569",
                    borderRadius: 10, padding: "0 6px", fontSize: 10, fontWeight: 700,
                  }}>
                    {orders.length}
                  </span>
                )}
              </div>
            }
          />
          <Tab
            label={
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <RotateCcw size={15} /> Returns
                {pendingReturns > 0 && (
                  <span style={{
                    background: "#fef3c7", color: "#92400e",
                    borderRadius: 10, padding: "0 6px", fontSize: 10, fontWeight: 700,
                    border: "1px solid #fde68a",
                  }}>
                    {pendingReturns} pending
                  </span>
                )}
              </div>
            }
          />
        </Tabs>
      </div>

      {/* ── Orders Tab ── */}
      {activeTab === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((order: any, i: number) => {
            const config = getStatusConfig(order.orderStatus);
            const Icon   = config.icon;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  background: "#fff", borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                }}
              >
                {/* Status accent bar */}
                <div style={{ height: 3, background: config.color }} />

                <div style={{ padding: 16 }}>
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
                      <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", margin: "2px 0 0", color: "#0f172a" }}>
                        #{order._id.slice(-10).toUpperCase()}
                      </p>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <Chip
                        icon={<Icon size={14} />}
                        label={config.label}
                        sx={{
                          background: `${config.color}15`, color: config.color,
                          fontWeight: 700, "& .MuiChip-icon": { color: config.color },
                        }}
                      />
                      <Button
                        onClick={() => setChatOrder(order)}
                        variant="outlined" size="small"
                        startIcon={<MessageSquare size={14} />}
                        sx={{
                          textTransform: "none", fontWeight: 700,
                          borderColor: "#6366f1", color: "#6366f1",
                          "&:hover": { borderColor: "#4f46e5", background: "rgba(99,102,241,0.06)" },
                        }}
                      >
                        Chat
                      </Button>
                      <Button
                        onClick={() => openEditDialog(order)}
                        variant="contained" size="small"
                        startIcon={<Edit size={14} />}
                        sx={{
                          textTransform: "none",
                          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                          fontWeight: 700, boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
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
                        display: "flex", gap: 10, padding: 10,
                        background: "#f9fafb", borderRadius: 10,
                        border: "1px solid #f1f5f9", minWidth: 260,
                      }}>
                        <img
                          src={item.product?.images?.[0]}
                          style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }}
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/56x56/6366f1/ffffff?text=?"; }}
                        />
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, margin: 0, lineHeight: 1.4, color: "#0f172a" }}>
                            {item.product?.title}
                          </p>
                          <p style={{ fontSize: 11, color: "#64748b", margin: "3px 0" }}>
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
                    padding: 10, background: "#f9fafb",
                    borderRadius: 8, border: "1px solid #f1f5f9", fontSize: 12,
                  }}>
                    <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={12} style={{ color: "#6366f1" }} />
                      {order.shippingAddress?.name}
                    </p>
                    <p style={{ margin: "2px 0", color: "#64748b" }}>
                      {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state} - {order.shippingAddress?.pinCode}
                    </p>
                    <p style={{ margin: 0, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                      <Phone size={12} style={{ color: "#10b981" }} />
                      {order.shippingAddress?.mobile}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {orders.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", margin: "0 0 4px" }}>
                No orders yet
              </p>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                Orders will appear here when customers purchase from you
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Returns Tab ── */}
      {activeTab === 1 && <ReturnsTab />}

      {/* ── Update Tracking Dialog ── */}
      <Dialog open={!!editOrder} onClose={() => setEditOrder(null)}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18 }}>
          📦 Update Order Tracking
        </DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
            <TextField select label="Order Status" value={editData.status}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })} fullWidth>
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
                    {opt.label}
                  </div>
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Custom Message (optional)" value={editData.message}
              onChange={(e) => setEditData({ ...editData, message: e.target.value })}
              fullWidth placeholder="e.g. Package will be delivered tomorrow" />
            <TextField label="Current Location (optional)" value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              fullWidth placeholder="e.g. Mumbai Distribution Center" />
            <TextField label="Carrier" value={editData.carrier}
              onChange={(e) => setEditData({ ...editData, carrier: e.target.value })} fullWidth />
            <TextField label="Tracking Number" value={editData.trackingNumber}
              onChange={(e) => setEditData({ ...editData, trackingNumber: e.target.value })}
              fullWidth placeholder="Auto-generated if empty" />
            <TextField type="date" label="Estimated Delivery" value={editData.estimatedDelivery}
              onChange={(e) => setEditData({ ...editData, estimatedDelivery: e.target.value })}
              fullWidth InputLabelProps={{ shrink: true }} />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: "12px 24px" }}>
          <Button onClick={() => setEditOrder(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" sx={{
            textTransform: "none", fontWeight: 700,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          }}>
            Update Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Seller Chat Popup ── */}
      <AnimatePresence>
        {chatOrder && (
          <SellerOrderChat order={chatOrder} onClose={() => setChatOrder(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}