import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, ImageIcon, Paperclip, CheckCheck, Check,
  MessageSquare,
} from 'lucide-react';
import { CircularProgress } from '@mui/material';
import { api } from '../../../Config/Api';
import { joinOrderRoom } from '../../../config/socket';

// ── Space background (dark only for seller) ──────────────────
const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 2 + 0.5, dur: Math.random() * 7 + 4,
  del: Math.random() * 5, op: Math.random() * 0.5 + 0.1,
}));

const SpaceBackground = () => (
  <div style={{
    position: 'absolute', inset: 0, zIndex: 0,
    background: 'linear-gradient(180deg, #020408 0%, #060d1a 50%, #0a0618 100%)',
    overflow: 'hidden', borderRadius: 16,
  }}>
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 10, repeat: Infinity }}
      style={{
        position: 'absolute', left: '20%', top: '30%',
        width: 240, height: 240, borderRadius: '50%',
        background: 'rgba(99,102,241,0.12)', filter: 'blur(70px)',
        transform: 'translate(-50%, -50%)',
      }}
    />
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 14, repeat: Infinity, delay: 3 }}
      style={{
        position: 'absolute', left: '75%', top: '60%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(16,185,129,0.10)', filter: 'blur(60px)',
        transform: 'translate(-50%, -50%)',
      }}
    />
    {PARTICLES.map((p) => (
      <motion.div
        key={p.id}
        animate={{ opacity: [p.op, p.op * 0.2, p.op], scale: [1, 1.4, 1] }}
        transition={{ duration: p.dur, repeat: Infinity, delay: p.del }}
        style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: '#fff', boxShadow: `0 0 ${p.size * 2}px rgba(255,255,255,0.8)`,
        }}
      />
    ))}
  </div>
);

interface Props {
  order: any;
  onClose: () => void;
}

const SellerOrderChat = ({ order, onClose }: Props) => {
  const [messages,     setMessages]     = useState<any[]>([]);
  const [chatId,       setChatId]       = useState<string | null>(null);
  const [text,         setText]         = useState('');
  const [mediaFile,    setMediaFile]    = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType,    setMediaType]    = useState<'image' | 'video' | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [sending,      setSending]      = useState(false);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const socketBound = useRef(false);

  const jwt      = localStorage.getItem('jwt') || '';
  const headers  = { Authorization: `Bearer ${jwt}` };
  const orderId  = order._id;

  const customerName = order.user?.fullName || order.shippingAddress?.name || 'Customer';

  // ── Fetch chat ───────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    api.get(`/api/chat/seller/order/${orderId}`, { headers })
      .then((res) => {
        setChatId(res.data._id);
        setMessages(res.data.messages || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  // ── Socket ───────────────────────────────────────────────────
  useEffect(() => {
    if (socketBound.current) return;
    joinOrderRoom(orderId);
    const socket = (window as any).__nexkartSocket;
    if (!socket) return;
    socketBound.current = true;

    const handler = (data: any) => {
      if (data.orderId === orderId) {
        setMessages((prev) => {
          // prevent duplicates
          if (prev.find((m) => m._id === data.message._id)) return prev;
          return [...prev, data.message];
        });
      }
    };

    socket.on('chat:message', handler);
    return () => {
      socket.off('chat:message', handler);
      socketBound.current = false;
    };
  }, [orderId]);

  // ── Auto scroll ──────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  }, [messages.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSend = useCallback(async () => {
    if ((!text.trim() && !mediaFile) || sending) return;
    setSending(true);
    const t = text.trim();
    const f = mediaFile;
    setText('');
    clearMedia();

    try {
      const formData = new FormData();
      if (t) formData.append('text', t);
      if (f) formData.append('media', f);

      const res = await api.post(
        `/api/chat/seller/order/${orderId}/message`,
        formData,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Add to local state (socket will also fire but we deduplicate)
      setMessages((prev) => {
        const newMsg = res.data.message;
        if (prev.find((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    } catch (e) {
      console.error('Send failed:', e);
    } finally {
      setSending(false);
    }
  }, [text, mediaFile, sending, orderId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const formatDay = (d: string) => {
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const y = new Date(today);
    y.setDate(today.getDate() - 1);
    if (date.toDateString() === y.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const groupedMessages = () => {
    const groups: { day: string; messages: any[] }[] = [];
    messages.forEach((msg) => {
      const day = formatDay(msg.createdAt);
      const last = groups[groups.length - 1];
      if (last?.day === day) last.messages.push(msg);
      else groups.push({ day, messages: [msg] });
    });
    return groups;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      exit={{   opacity: 0, scale: 0.95,  y: 20 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{
        position:      'fixed',
        bottom:        24, right: 24,
        width:         380,
        height:        560,
        borderRadius:  20,
        overflow:      'hidden',
        display:       'flex',
        flexDirection: 'column',
        zIndex:        1000,
        boxShadow:     '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      <SpaceBackground />

      {/* All content above bg */}
      <div style={{
        position:      'relative', zIndex: 1,
        display:       'flex', flexDirection: 'column',
        height:        '100%',
      }}>

        {/* ── Header ── */}
        <div style={{
          background:    'rgba(8,8,18,0.90)',
          backdropFilter: 'blur(20px)',
          borderBottom:  '1px solid rgba(255,255,255,0.08)',
          padding:       '12px 14px',
          display:       'flex',
          alignItems:    'center',
          gap:           10,
          flexShrink:    0,
        }}>
          <div style={{ position: 'relative' }}>
            <motion.div
              animate={{ boxShadow: ['0 0 0 0 rgba(99,102,241,0.5)', '0 0 0 8px rgba(99,102,241,0)', '0 0 0 0 rgba(99,102,241,0)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 15,
              }}
            >
              {customerName.charAt(0).toUpperCase()}
            </motion.div>
            <div style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 9, height: 9, borderRadius: '50%',
              background: '#22c55e', border: '2px solid #080812',
            }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
              {customerName}
            </p>
            <p style={{ fontSize: 10, color: '#22c55e', margin: 0, fontWeight: 600 }}>
              Order #{orderId.slice(-6).toUpperCase()}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none',
              cursor: 'pointer', color: '#94a3b8',
              width: 30, height: 30, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.2s',
            }}
          >
            <X size={15} />
          </motion.button>
        </div>

        {/* ── Messages ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '12px 14px 6px',
          display: 'flex', flexDirection: 'column', gap: 3,
          scrollbarWidth: 'thin', scrollbarColor: '#1f1f2e transparent',
        }}>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 32, height: 32,
                  border: '3px solid rgba(99,102,241,0.2)',
                  borderTop: '3px solid #6366f1',
                  borderRadius: '50%',
                }}
              />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '40px 20px' }}
            >
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{
                  fontSize: 36, marginBottom: 12,
                  filter: 'drop-shadow(0 0 12px rgba(99,102,241,0.5))',
                }}
              >
                💬
              </motion.div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>
                No messages yet
              </p>
              <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
                Start chatting with the customer
              </p>
            </motion.div>
          )}

          {!loading && groupedMessages().map((group) => (
            <div key={group.day}>
              {/* Day label */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 6px',
              }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#475569',
                  padding: '2px 8px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.04)',
                }}>
                  {group.day}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {group.messages.map((msg, i) => {
                const isMine = msg.sender === 'seller';
                return (
                  <motion.div
                    key={msg._id || `smsg-${i}`}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={{
                      display:        'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                      marginBottom:   3,
                    }}
                  >
                    {!isMine && (
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 10, fontWeight: 800,
                        flexShrink: 0, marginRight: 6, alignSelf: 'flex-end', marginBottom: 2,
                      }}>
                        {customerName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div style={{
                      maxWidth:     '70%',
                      borderRadius: isMine ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                      overflow:     'hidden',
                      backgroundImage: isMine ? 'linear-gradient(135deg, #10b981, #059669)' : undefined,
                      background:   isMine ? undefined : 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(10px)',
                      boxShadow:    isMine
                        ? '0 3px 14px rgba(16,185,129,0.35)'
                        : '0 2px 10px rgba(0,0,0,0.3)',
                    }}>
                      {msg.mediaUrl && msg.mediaType === 'image' && (
                        <img
                          src={msg.mediaUrl}
                          style={{ width: '100%', maxWidth: 220, display: 'block', cursor: 'pointer' }}
                          onClick={() => window.open(msg.mediaUrl, '_blank')}
                        />
                      )}
                      {msg.mediaUrl && msg.mediaType === 'video' && (
                        <video src={msg.mediaUrl} controls style={{ width: '100%', maxWidth: 220 }} />
                      )}
                      {msg.text && (
                        <div style={{ padding: '8px 11px 3px' }}>
                          <p style={{
                            fontSize: 12.5, margin: 0, lineHeight: 1.5,
                            color: '#f1f5f9', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                          }}>
                            {msg.text}
                          </p>
                        </div>
                      )}
                      <div style={{
                        padding: '2px 9px 6px',
                        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3,
                      }}>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>
                          {formatTime(msg.createdAt)}
                        </span>
                        {isMine && (
                          msg.read
                            ? <CheckCheck size={10} style={{ color: '#a5f3fc' }} />
                            : <Check size={10} style={{ color: 'rgba(255,255,255,0.4)' }} />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* ── Media preview ── */}
        <AnimatePresence>
          {mediaPreview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{   height: 0, opacity: 0 }}
              style={{
                background: 'rgba(8,8,18,0.90)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                padding: '8px 14px', flexShrink: 0,
              }}
            >
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {mediaType === 'image'
                  ? <img src={mediaPreview} style={{ height: 70, borderRadius: 8, objectFit: 'cover' }} />
                  : <video src={mediaPreview} style={{ height: 70, borderRadius: 8 }} />
                }
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={clearMedia}
                  style={{
                    position: 'absolute', top: -5, right: -5,
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#ef4444', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}
                >
                  <X size={11} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input ── */}
        <div style={{
          background:    'rgba(8,8,18,0.90)',
          backdropFilter: 'blur(20px)',
          borderTop:     '1px solid rgba(255,255,255,0.08)',
          padding:       '8px 12px',
          display:       'flex',
          alignItems:    'flex-end',
          gap:           6,
          flexShrink:    0,
        }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => fileRef.current?.click()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#475569', display: 'flex', padding: 5, borderRadius: 8,
            }}
          >
            <Paperclip size={17} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => fileRef.current?.click()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#475569', display: 'flex', padding: 5, borderRadius: 8,
            }}
          >
            <ImageIcon size={17} />
          </motion.button>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: '8px 12px',
              fontSize: 13,
              color: '#f1f5f9',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.5,
              maxHeight: 80,
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; }}
            onBlur={(e)  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            onInput={(e) => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
            }}
          />

          <motion.button
            whileHover={(!text.trim() && !mediaFile) ? {} : { scale: 1.08 }}
            whileTap={(!text.trim() && !mediaFile) ? {} : { scale: 0.92 }}
            onClick={handleSend}
            disabled={sending || (!text.trim() && !mediaFile)}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: (!text.trim() && !mediaFile)
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              cursor: (!text.trim() && !mediaFile) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', flexShrink: 0,
              boxShadow: (!text.trim() && !mediaFile) ? 'none' : '0 3px 12px rgba(16,185,129,0.4)',
              transition: 'all 0.2s',
            }}
          >
            {sending
              ? <CircularProgress size={14} sx={{ color: '#fff' }} />
              : <Send size={15} style={{
                  transform: 'translateX(1px)',
                  color: (!text.trim() && !mediaFile) ? '#334155' : '#fff',
                }} />
            }
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SellerOrderChat;