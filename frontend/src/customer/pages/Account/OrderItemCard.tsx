import React from 'react';
import { Avatar, Button, Chip } from '@mui/material';
import { teal } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import { Truck, Eye, MessageSquare } from 'lucide-react';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import type { Order, OrderItem } from '../../../types/orderTypes';
import { formatDate } from '../../util/fomateDate';
import { useTheme } from '../../../routes/CustomerRoutes';

interface OrderItemCardProps {
  item: OrderItem;
  order: Order;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:          "#f59e0b",
  PAYMENT_PENDING:  "#f59e0b",
  CONFIRMED:        "#06b6d4",
  PLACED:           "#06b6d4",
  PROCESSING:       "#8b5cf6",
  PACKED:           "#f59e0b",
  SHIPPED:          "#3b82f6",
  OUT_FOR_DELIVERY: "#8b5cf6",
  DELIVERED:        "#10b981",
  CANCELLED:        "#ef4444",
};

const OrderItemCard: React.FC<OrderItemCardProps> = ({ item, order }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const statusColor = STATUS_COLORS[order.orderStatus] || "#6b7280";

  return (
    <div
      className='p-4 rounded-2xl space-y-4 border transition-all hover:shadow-lg'
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
      }}
    >
      {/* Status Header */}
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3 flex-1 min-w-0'>
          <Avatar
            sx={{
              bgcolor: statusColor,
              width: 38,
              height: 38,
            }}
          >
            <ElectricBoltIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 flex-wrap'>
              <h1
                className='font-bold text-sm'
                style={{ color: statusColor }}
              >
                {order.orderStatus.replace(/_/g, " ")}
              </h1>
              <Chip
                label={`#${String(order._id).slice(-6).toUpperCase()}`}
                size="small"
                sx={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  height: 18,
                  background: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
              />
            </div>
            <p
              className='text-xs mt-0.5'
              style={{ color: isDark ? "#94a3b8" : "#6b7280" }}
            >
              {order.orderStatus === "DELIVERED"
                ? `Delivered on ${formatDate(order.deliverDate)}`
                : `Arriving by ${formatDate(order.deliverDate)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div
        className='p-3 rounded-xl flex gap-3'
        style={{
          background: isDark ? "rgba(99,102,241,0.06)" : "#f0fdfa",
          border: isDark ? "1px solid rgba(99,102,241,0.12)" : "1px solid #99f6e4",
        }}
      >
        <img
          className='w-16 h-16 rounded-lg object-cover flex-shrink-0'
          src={item.product?.images?.[0]}
          alt=""
          style={{ background: "#fff", padding: 4 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/64x64/6366f1/ffffff?text=?";
          }}
        />
        <div className='flex-1 min-w-0 space-y-1'>
          <h1
            className='font-bold text-xs'
            style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}
          >
            {(item.product as any)?.seller?.businessDetails?.businessName ||
              "Official Store"}
          </h1>
          <p
            className='text-xs truncate'
            style={{ color: isDark ? "#cbd5e1" : "#374151" }}
          >
            {item.product?.title}
          </p>
          <div className='flex items-center justify-between'>
            <p
              className='text-[10px]'
              style={{ color: isDark ? "#94a3b8" : "#6b7280" }}
            >
              Size: {item.size} · Qty: {item.quantity}
            </p>
            <p className='font-bold text-sm text-green-600'>
              ₹{(item.sellingPrice * item.quantity).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-2'>
        <Button
          fullWidth
          variant='contained'
          size='small'
          startIcon={<Truck size={14} />}
          onClick={() => navigate(`/account/orders/${order._id}/track`)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: 12,
            py: 1,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            },
          }}
        >
          Track Order
        </Button>

        {order.orderStatus === "DELIVERED" && (
          <Button
            variant='outlined'
            size='small'
            startIcon={<MessageSquare size={14} />}
            onClick={() => navigate(`/write-review/${item.product._id}`)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 12,
              py: 1,
              borderColor: "#10b981",
              color: "#10b981",
              "&:hover": {
                borderColor: "#059669",
                background: "rgba(16,185,129,0.05)",
              },
            }}
          >
            Review
          </Button>
        )}

        <Button
          variant='outlined'
          size='small'
          startIcon={<Eye size={14} />}
          onClick={() =>
            navigate(`/account/orders/${order._id}/item/${item._id}`)
          }
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: 12,
            py: 1,
            minWidth: "auto",
            borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb",
            color: isDark ? "#cbd5e1" : "#374151",
          }}
        >
          Details
        </Button>
      </div>
    </div>
  );
};

export default OrderItemCard;