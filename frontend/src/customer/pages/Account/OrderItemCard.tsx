import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Eye, MessageSquare, RotateCcw,
  CheckCircle, Clock, Package, MapPin,
} from 'lucide-react';
import type { Order, OrderItem } from '../../../types/orderTypes';
import { formatDate } from '../../util/fomateDate';
import { useTheme } from '../../../routes/CustomerRoutes';
import { api } from '../../../Config/Api';

interface Props { item: OrderItem; order: Order; }

const STATUS_META: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  PENDING:          { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Pending',          icon: Clock    },
  PAYMENT_PENDING:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Payment Pending',  icon: Clock    },
  CONFIRMED:        { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   label: 'Confirmed',        icon: CheckCircle },
  PLACED:           { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   label: 'Placed',           icon: Package  },
  PROCESSING:       { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'Processing',       icon: Package  },
  PACKED:           { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Packed',           icon: Package  },
  SHIPPED:          { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  label: 'Shipped',          icon: Truck    },
  OUT_FOR_DELIVERY: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'Out for Delivery', icon: Truck    },
  DELIVERED:        { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Delivered',        icon: CheckCircle },
  CANCELLED:        { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Cancelled',        icon: MapPin   },
};

const RETURN_STATUS: Record<string, { label: string; color: string }> = {
  REQUESTED: { label: '↩ Return Requested', color: '#f59e0b' },
  APPROVED:  { label: '✅ Return Approved',  color: '#10b981' },
  REJECTED:  { label: '❌ Return Rejected',  color: '#ef4444' },
  PICKED_UP: { label: '📦 Picked Up',        color: '#3b82f6' },
  REFUNDED:  { label: '💰 Refunded',         color: '#8b5cf6' },
};

const OrderItemCard: React.FC<Props> = ({ item, order }) => {
  const navigate   = useNavigate();
  const { isDark } = useTheme();

  const [returnInfo,    setReturnInfo]    = useState<any>(null);
  const [returnRequest, setReturnRequest] = useState<any>(null);
  const [returnChecked, setReturnChecked] = useState(false);

  const isDelivered = order.orderStatus === 'DELIVERED';
  const isCancelled = order.orderStatus === 'CANCELLED';
  const meta        = STATUS_META[order.orderStatus] || STATUS_META.PENDING;
  const Icon        = meta.icon;

  useEffect(() => {
    if (!isDelivered || returnChecked) return;
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return;
    setReturnChecked(true);
    const h = { Authorization: `Bearer ${jwt}` };
    api.get(`/api/returns/eligibility/${order._id}`, { headers: h }).then((r) => setReturnInfo(r.data)).catch(() => {});
    api.get(`/api/returns/item/${item._id}`,          { headers: h }).then((r) => setReturnRequest(r.data)).catch(() => {});
  }, [isDelivered, order._id, item._id]);

  // ── Colours ──────────────────────────────────────────────────
  const cardBg   = isDark ? 'rgba(255,255,255,0.025)' : '#ffffff';
  const cardBdr  = isDark ? 'rgba(255,255,255,0.07)'  : '#e5e7eb';
  const textCol  = isDark ? '#f1f5f9' : '#0f172a';
  const subCol   = isDark ? '#94a3b8' : '#64748b';
  const prodBg   = isDark ? 'rgba(99,102,241,0.05)'   : '#fafafa';
  const prodBdr  = isDark ? 'rgba(99,102,241,0.1)'    : '#f0f0f0';

  return (
    <div style={{
      background:   cardBg,
      border:       `1px solid ${cardBdr}`,
      borderRadius: 18,
      overflow:     'hidden',
      transition:   'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = isDark
          ? '0 8px 32px rgba(0,0,0,0.3)'
          : '0 8px 24px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* ── Status bar (top accent) ── */}
      <div style={{
        height:     3,
        background: `linear-gradient(90deg, ${meta.color}, ${meta.color}80)`,
      }} />

      <div style={{ padding: '16px 16px 14px' }}>

        {/* ── Status + Order ID row ── */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          marginBottom:   12,
        }}>
          {/* Status pill */}
          <div style={{
            display:    'flex',
            alignItems: 'center',
            gap:        7,
            padding:    '5px 12px',
            borderRadius: 30,
            background: meta.bg,
            border:     `1px solid ${meta.color}30`,
          }}>
            <Icon size={13} style={{ color: meta.color }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, letterSpacing: 0.3 }}>
              {meta.label}
            </span>
          </div>

          {/* Order ID */}
          <span style={{
            fontSize:    10,
            fontFamily:  'monospace',
            fontWeight:  700,
            color:       subCol,
            background:  isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
            padding:     '3px 8px',
            borderRadius: 6,
          }}>
            #{String(order._id).slice(-7).toUpperCase()}
          </span>
        </div>

        {/* ── Product row ── */}
        <div style={{
          display:      'flex',
          gap:          12,
          padding:      12,
          background:   prodBg,
          border:       `1px solid ${prodBdr}`,
          borderRadius: 12,
          marginBottom: 12,
        }}>
          {/* Product image */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={item.product?.images?.[0]}
              style={{
                width: 68, height: 68, borderRadius: 10,
                objectFit: 'cover', background: '#fff',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/68x68/6366f1/ffffff?text=?';
              }}
            />
            {/* Quantity badge */}
            {item.quantity > 1 && (
              <div style={{
                position: 'absolute', top: -4, right: -4,
                width: 18, height: 18, borderRadius: '50%',
                background: '#6366f1', color: '#fff',
                fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${isDark ? '#0a0a0f' : '#fff'}`,
              }}>
                {item.quantity}
              </div>
            )}
          </div>

          {/* Product info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: subCol,
              margin: '0 0 2px', letterSpacing: 0.2,
            }}>
              {(item.product as any)?.seller?.businessDetails?.businessName || 'Official Store'}
            </p>
            <p style={{
              fontSize: 13, fontWeight: 600, color: textCol,
              margin: '0 0 6px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.product?.title}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: 10, color: subCol,
                background: isDark ? 'rgba(255,255,255,0.06)' : '#f0f0f0',
                padding: '2px 8px', borderRadius: 6, fontWeight: 600,
              }}>
                {item.size} · Qty {item.quantity}
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#10b981' }}>
                ₹{(item.sellingPrice * item.quantity).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ── Delivery info ── */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: subCol, margin: 0 }}>
            {isDelivered
              ? <span style={{ color: '#10b981', fontWeight: 600 }}>✅ Delivered on {formatDate(order.deliverDate)}</span>
              : isCancelled
              ? <span style={{ color: '#ef4444', fontWeight: 600 }}>❌ Order Cancelled</span>
              : <span>🚚 Expected by <strong style={{ color: textCol }}>{formatDate(order.deliverDate)}</strong></span>
            }
          </p>

          {/* Return info */}
          {isDelivered && returnInfo && !returnRequest && (
            <p style={{
              fontSize: 10, margin: '4px 0 0', fontWeight: 600,
              color: returnInfo.eligible ? '#10b981' : '#94a3b8',
            }}>
              {returnInfo.eligible
                ? `↩ Return window: ${returnInfo.daysLeft} day${returnInfo.daysLeft !== 1 ? 's' : ''} remaining`
                : '↩ Return window expired'}
            </p>
          )}

          {returnRequest && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              marginTop: 4, padding: '2px 10px', borderRadius: 20,
              background: `${RETURN_STATUS[returnRequest.status]?.color}15`,
              border: `1px solid ${RETURN_STATUS[returnRequest.status]?.color}30`,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: RETURN_STATUS[returnRequest.status]?.color }}>
                {RETURN_STATUS[returnRequest.status]?.label}
              </span>
            </div>
          )}
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>

          {/* Track */}
          {!isDelivered && !isCancelled && (
            <ActionBtn
              icon={<Truck size={13} />}
              label="Track Order"
              onClick={() => navigate(`/account/orders/${order._id}/track`)}
              primary isDark={isDark}
            />
          )}

          {/* Delivered indicator */}
          {isDelivered && (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 5, padding: '6px 12px',
              borderRadius: 10, fontSize: 11, fontWeight: 700,
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)', color: '#10b981',
            }}>
              <CheckCircle size={13} /> Delivered
            </div>
          )}

          {/* Review */}
          {isDelivered && (
            <ActionBtn
              icon={<MessageSquare size={13} />}
              label="Review"
              onClick={() => navigate(`/write-review/${item.product._id}`)}
              color="#10b981" isDark={isDark}
            />
          )}

          {/* Return */}
          {isDelivered && returnInfo?.eligible && !returnRequest && (
            <ActionBtn
              icon={<RotateCcw size={13} />}
              label="Return"
              onClick={() => navigate(`/account/orders/${order._id}/item/${item._id}/return`)}
              color="#f59e0b" isDark={isDark}
            />
          )}

          {/* Chat */}
          {!isCancelled && (
            <ActionBtn
              icon={<MessageSquare size={13} />}
              label="Chat"
              onClick={() => navigate(`/account/orders/${order._id}/chat`)}
              color="#6366f1" isDark={isDark}
            />
          )}

          {/* Details */}
          <ActionBtn
            icon={<Eye size={13} />}
            label="Details"
            onClick={() => navigate(`/account/orders/${order._id}/item/${item._id}`)}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
};

// ── Small reusable action button ─────────────────────────────
const ActionBtn = ({
  icon, label, onClick, primary, color, isDark,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  color?: string;
  isDark: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const c = color || (isDark ? '#94a3b8' : '#6b7280');

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        5,
        padding:    '6px 12px',
        borderRadius: 10,
        border:     primary ? 'none' : `1px solid ${hovered ? c : (isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb')}`,
        background: primary
          ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
          : hovered
          ? `${c}12`
          : 'transparent',
        color:      primary ? '#fff' : c,
        fontSize:   11,
        fontWeight: 700,
        cursor:     'pointer',
        transition: 'all 0.18s',
        boxShadow:  primary ? '0 3px 10px rgba(99,102,241,0.25)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </button>
  );
};

export default OrderItemCard;