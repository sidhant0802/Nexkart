import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, RotateCcw, CheckCircle, AlertCircle, Clock,
} from 'lucide-react';
import { Button, TextField, MenuItem, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
  checkReturnEligibility,
  requestReturn,
  getReturnStatus,
  clearReturnState,
} from '../../../Redux Toolkit/Customer/ReturnSlice';
import { fetchOrderById, fetchOrderItemById } from '../../../Redux Toolkit/Customer/OrderSlice';
import { useTheme } from '../../../routes/CustomerRoutes';

const RETURN_REASONS = [
  { value: 'DAMAGED_PRODUCT',   label: '📦 Damaged Product' },
  { value: 'WRONG_PRODUCT',     label: '❌ Wrong Product Received' },
  { value: 'NOT_AS_DESCRIBED',  label: '📝 Not as Described' },
  { value: 'QUALITY_ISSUE',     label: '⚠️ Quality Issue' },
  { value: 'CHANGED_MIND',      label: '💭 Changed My Mind' },
  { value: 'OTHER',             label: '🔹 Other' },
];

const RETURN_STATUS_INFO: Record<string, { icon: any; color: string; title: string; desc: string }> = {
  REQUESTED: {
    icon: Clock, color: '#f59e0b',
    title: 'Return Requested',
    desc:  'Your return request is being reviewed by the seller',
  },
  APPROVED: {
    icon: CheckCircle, color: '#10b981',
    title: 'Return Approved!',
    desc:  'Seller approved your return. Pickup will be arranged soon',
  },
  REJECTED: {
    icon: AlertCircle, color: '#ef4444',
    title: 'Return Rejected',
    desc:  'Seller rejected your return request',
  },
  PICKED_UP: {
    icon: CheckCircle, color: '#3b82f6',
    title: 'Return Picked Up',
    desc:  'Your item has been picked up. Refund will be processed soon',
  },
  REFUNDED: {
    icon: CheckCircle, color: '#8b5cf6',
    title: 'Refunded!',
    desc:  'Your refund has been processed successfully',
  },
};

const ReturnRequest = () => {
  const { orderId, orderItemId } = useParams();
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const { isDark } = useTheme();

  const { eligibility, returnRequest, loading, error, success } =
    useAppSelector((s) => s.returnReq);
  const { currentOrder, orderItem } = useAppSelector((s) => s.orders);

  const [reason,      setReason]      = useState('');
  const [description, setDescription] = useState('');

  const c = {
    bg:     isDark ? '#0a0a0f' : '#f9fafb',
    card:   isDark ? '#13131a' : '#ffffff',
    border: isDark ? '#1f1f2e' : '#e5e7eb',
    text:   isDark ? '#f1f5f9' : '#0f172a',
    muted:  isDark ? '#94a3b8' : '#64748b',
  };

  useEffect(() => {
    if (!orderId || !orderItemId) return;
    dispatch(clearReturnState());
    dispatch(checkReturnEligibility(orderId));
    dispatch(getReturnStatus(orderItemId));
    dispatch(fetchOrderById({ orderId, jwt: localStorage.getItem('jwt') || '' }));
    dispatch(fetchOrderItemById({ orderItemId, jwt: localStorage.getItem('jwt') || '' }));
  }, [orderId, orderItemId]);

  const handleSubmit = () => {
    if (!orderId || !orderItemId || !reason) return;
    dispatch(requestReturn({ orderId, orderItemId, reason, description }));
  };

  // ── If already has a return request ──
  if (returnRequest) {
    const info = RETURN_STATUS_INFO[returnRequest.status];
    const Icon = info?.icon || CheckCircle;
    return (
      <div style={{ background: c.bg, minHeight: '100vh', padding: '20px 16px' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: 'none',
              color: c.muted, cursor: 'pointer', fontSize: 13,
              marginBottom: 16, fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background:   c.card,
              borderRadius: 16,
              padding:      32,
              border:       `1px solid ${c.border}`,
              textAlign:    'center',
            }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: `${info?.color}20`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Icon size={36} style={{ color: info?.color }} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 8px' }}>
              {info?.title}
            </h2>
            <p style={{ fontSize: 14, color: c.muted, margin: '0 0 16px' }}>
              {info?.desc}
            </p>

            {returnRequest.sellerNote && (
              <div style={{
                padding: 12, borderRadius: 10,
                background: `${info?.color}10`,
                border: `1px solid ${info?.color}30`,
                marginBottom: 16, textAlign: 'left',
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: c.muted, margin: '0 0 4px' }}>
                  SELLER NOTE
                </p>
                <p style={{ fontSize: 13, color: c.text, margin: 0 }}>
                  {returnRequest.sellerNote}
                </p>
              </div>
            )}

            <div style={{
              padding: 12, borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
              border: `1px solid ${c.border}`,
              textAlign: 'left', marginBottom: 20,
            }}>
              <p style={{ fontSize: 11, color: c.muted, margin: '0 0 4px', fontWeight: 700 }}>
                REASON
              </p>
              <p style={{ fontSize: 13, color: c.text, margin: 0 }}>
                {RETURN_REASONS.find((r) => r.value === returnRequest.reason)?.label}
              </p>
              {returnRequest.description && (
                <>
                  <p style={{ fontSize: 11, color: c.muted, margin: '8px 0 4px', fontWeight: 700 }}>
                    DESCRIPTION
                  </p>
                  <p style={{ fontSize: 13, color: c.text, margin: 0 }}>
                    {returnRequest.description}
                  </p>
                </>
              )}
            </div>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/account/orders')}
              sx={{
                textTransform: 'none', fontWeight: 700,
                borderColor: c.border, color: c.muted,
              }}
            >
              Back to Orders
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: c.bg, minHeight: '100vh', padding: '20px 16px' }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>

        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none',
            color: c.muted, cursor: 'pointer', fontSize: 13,
            marginBottom: 16, fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: c.card, borderRadius: 16,
            padding: 20, border: `1px solid ${c.border}`,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(245,158,11,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <RotateCcw size={22} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: c.text, margin: 0 }}>
                Request Return
              </h1>
              <p style={{ fontSize: 12, color: c.muted, margin: '2px 0 0' }}>
                Order #{orderId?.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Eligibility info */}
        {eligibility && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: eligibility.eligible ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${eligibility.eligible ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
              borderRadius: 12, padding: 14, marginBottom: 16,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}
          >
            {eligibility.eligible
              ? <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
              : <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
            }
            <div>
              <p style={{ fontSize: 13, fontWeight: 700,
                color: eligibility.eligible ? '#10b981' : '#ef4444', margin: 0 }}>
                {eligibility.eligible
                  ? `✅ Return eligible — ${eligibility.daysLeft} day${eligibility.daysLeft !== 1 ? 's' : ''} remaining`
                  : '❌ Return window has expired'}
              </p>
              <p style={{ fontSize: 11, color: c.muted, margin: '4px 0 0' }}>
                Return window: {eligibility.returnWindowDays} days from delivery
                {eligibility.returnDeadline &&
                  ` · Deadline: ${new Date(eligibility.returnDeadline).toLocaleDateString('en-IN')}`}
              </p>
            </div>
          </motion.div>
        )}

        {/* Product preview */}
        {orderItem && (
          <div style={{
            background: c.card, borderRadius: 12,
            padding: 14, border: `1px solid ${c.border}`,
            marginBottom: 16, display: 'flex', gap: 12,
          }}>
            <img
              src={orderItem.product?.images?.[0]}
              style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
            />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: c.text, margin: 0 }}>
                {orderItem.product?.title}
              </p>
              <p style={{ fontSize: 11, color: c.muted, margin: '4px 0 0' }}>
                Size: {orderItem.size} · Qty: {orderItem.quantity}
              </p>
            </div>
          </div>
        )}

        {/* Return form */}
        {eligibility?.eligible && !success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: c.card, borderRadius: 16,
              padding: 20, border: `1px solid ${c.border}`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TextField
                select
                label="Reason for Return"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth
                required
                sx={{
                  '& .MuiInputBase-root': {
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                    color: c.text,
                  },
                  '& .MuiInputLabel-root': { color: c.muted },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
                }}
              >
                {RETURN_REASONS.map((r) => (
                  <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Additional Details (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Describe the issue in detail..."
                sx={{
                  '& .MuiInputBase-root': {
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                    color: c.text,
                  },
                  '& .MuiInputLabel-root': { color: c.muted },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
                }}
              />

              {error && (
                <div style={{
                  padding: 10, borderRadius: 8,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444', fontSize: 13,
                }}>
                  ❌ {error}
                </div>
              )}

              <Button
                fullWidth
                variant="contained"
                disabled={!reason || loading}
                onClick={handleSubmit}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RotateCcw size={16} />}
                sx={{
                  textTransform: 'none', fontWeight: 700, py: 1.5,
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  '&:hover': { background: 'linear-gradient(135deg, #d97706, #dc2626)' },
                  '&:disabled': { opacity: 0.5 },
                }}
              >
                {loading ? 'Submitting...' : 'Submit Return Request'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Success state */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: c.card, borderRadius: 16,
              padding: 32, border: `1px solid ${c.border}`,
              textAlign: 'center',
            }}
          >
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(16,185,129,0.12)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <CheckCircle size={36} style={{ color: '#10b981' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: '0 0 8px' }}>
              Return Requested!
            </h2>
            <p style={{ fontSize: 14, color: c.muted, margin: '0 0 20px' }}>
              Your return request has been submitted. The seller will review it shortly.
            </p>
            <Button
              fullWidth variant="contained"
              onClick={() => navigate('/account/orders')}
              sx={{
                textTransform: 'none', fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}
            >
              Back to Orders
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReturnRequest;