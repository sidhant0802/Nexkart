import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, ImageIcon, X,
  CheckCheck, Check, Paperclip, Smile,
} from 'lucide-react';
import { CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
  fetchOrCreateChat,
  sendChatMessage,
  receiveMessage,
  clearChat,
} from '../../../Redux Toolkit/Customer/ChatSlice';
import { joinOrderRoom } from '../../../config/socket';
import { useTheme } from '../../../routes/CustomerRoutes';

// ── Stars computed once, outside component (no re-render) ─────
const STARS = Array.from({ length: 15 }, (_, i) => ({
  id:  i,
  x:   Math.random() * 100,
  y:   Math.random() * 100,
  r:   Math.random() * 1.4 + 0.3,
  dur: Math.random() * 6 + 4,
  del: Math.random() * 5,
  op:  Math.random() * 0.4 + 0.1,
}));

// ── Nebula blobs — only 2 for performance ────────────────────
const NEBULA = [
  { x: 20, y: 30, c: 'rgba(99,102,241,0.12)', s: 360 },
  { x: 78, y: 65, c: 'rgba(139,92,246,0.08)', s: 300 },
];

export default function OrderChat() {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const dispatch    = useAppDispatch();
  const { isDark }  = useTheme();

  const { chat, loading, sending } = useAppSelector((s) => s.chat);

  const [text,         setText]         = useState('');
  const [mediaFile,    setMediaFile]    = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType,    setMediaType]    = useState<'image' | 'video' | null>(null);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const socketBound = useRef(false);
  const initialLoad = useRef(true); // ✅ skip scroll animation on first load

  // ── Theme tokens ─────────────────────────────────────────────
  const tk = {
    pageBg:    isDark ? '#080810'                    : '#f1f5f9',
    headerBg:  isDark ? 'rgba(10,10,22,0.98)'        : '#ffffff',
    chatBg:    isDark ? 'rgba(6,6,16,0.95)'          : '#f8faff',
    inputArea: isDark ? 'rgba(10,10,22,0.98)'        : '#ffffff',
    border:    isDark ? 'rgba(255,255,255,0.07)'     : 'rgba(0,0,0,0.08)',
    text:      isDark ? '#f1f5f9'                    : '#0f172a',
    sub:       isDark ? '#94a3b8'                    : '#64748b',
    inputBg:   isDark ? 'rgba(255,255,255,0.06)'     : '#f1f5f9',
    myBubble:  'linear-gradient(135deg,#6366f1,#8b5cf6)',
    theirBg:   isDark ? 'rgba(255,255,255,0.08)'     : '#ffffff',
    theirBdr:  isDark ? 'rgba(255,255,255,0.07)'     : 'rgba(0,0,0,0.07)',
  };

  // ── Init: reset on orderId change ────────────────────────────
  useEffect(() => {
    if (!orderId) return;
    initialLoad.current = true; // reset for new chat
    dispatch(clearChat());
    dispatch(fetchOrCreateChat(orderId));
  }, [orderId]);

  // ── Socket: join room + listen once ─────────────────────────
  useEffect(() => {
    if (!orderId || socketBound.current) return;
    joinOrderRoom(orderId);
    const socket = (window as any).__nexkartSocket;
    if (!socket) return;
    socketBound.current = true;
    const fn = (data: any) => {
      if (data.orderId === orderId)
        dispatch(receiveMessage({ orderId, message: data.message }));
    };
    socket.on('chat:message', fn);
    return () => {
      socket.off('chat:message', fn);
      socketBound.current = false;
    };
  }, [orderId]);

  // ✅ Smart scroll:
  //    - First load  → instant jump (no animation, no jank)
  //    - New message → smooth scroll only if message is recent (< 5s)
  useEffect(() => {
    const count = chat?.messages?.length ?? 0;
    if (count === 0) return;

    if (initialLoad.current) {
      // First batch of messages loaded — jump instantly, no animation
      initialLoad.current = false;
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
      });
      return;
    }

    // Only smooth-scroll for genuinely new incoming messages
    const lastMsg  = chat!.messages[chat!.messages.length - 1];
    const ageMs    = Date.now() - new Date(lastMsg.createdAt).getTime();
    if (ageMs < 5000) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [chat?.messages?.length]);

  // ── File handling ────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null); setMediaPreview(null); setMediaType(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Send ─────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!orderId || (!text.trim() && !mediaFile) || sending) return;
    const t = text.trim();
    const f = mediaFile;
    setText('');
    clearMedia();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await dispatch(sendChatMessage({ orderId, text: t, mediaFile: f }));
  }, [orderId, text, mediaFile, sending]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Helpers ──────────────────────────────────────────────────
  const sellerName = chat?.seller?.businessDetails?.businessName
    || chat?.seller?.sellerName || 'Seller';
  const sellerInit = sellerName.charAt(0).toUpperCase();

  const fmt = (d: string) =>
    new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const dayLabel = (d: string) => {
    const dt = new Date(d); const now = new Date();
    if (dt.toDateString() === now.toDateString()) return 'Today';
    const y = new Date(now); y.setDate(now.getDate() - 1);
    if (dt.toDateString() === y.toDateString()) return 'Yesterday';
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group messages by day
  const groups: { day: string; msgs: NonNullable<typeof chat>['messages'] }[] = [];
  (chat?.messages || []).forEach((m) => {
    const d    = dayLabel(m.createdAt);
    const last = groups[groups.length - 1];
    if (last?.day === d) last.msgs.push(m);
    else groups.push({ day: d, msgs: [m] });
  });

  const canSend = !sending && (!!text.trim() || !!mediaFile);

  return (
    <div style={{
      minHeight:      '100vh',
      background:     tk.pageBg,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '24px 16px',
      position:       'relative',
      overflow:       'hidden',
    }}>

      {/* ══ PAGE BACKGROUND ════════════════════════════════════ */}
      <div style={{
        position:      'absolute',
        inset:         0,
        zIndex:        0,
        pointerEvents: 'none',
        overflow:      'hidden',
      }}>
        {isDark ? (
          <>
            {/* Deep space gradient */}
            <div style={{
              position:   'absolute',
              inset:      0,
              background: 'linear-gradient(160deg,#020408 0%,#07091a 45%,#090618 100%)',
            }} />

            {/* Nebula clouds — only 2, slow animation */}
            {NEBULA.map((n, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 16 + i * 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position:     'absolute',
                  left:         `${n.x}%`,
                  top:          `${n.y}%`,
                  width:        n.s,
                  height:       n.s,
                  borderRadius: '50%',
                  background:   n.c,
                  filter:       'blur(90px)',
                  transform:    'translate(-50%,-50%)',
                  willChange:   'transform',
                }}
              />
            ))}

            {/* Stars — reduced to 15, CSS animation via willChange */}
            {STARS.map((s) => (
              <motion.div
                key={s.id}
                animate={{ opacity: [s.op, s.op * 0.15, s.op] }}
                transition={{ duration: s.dur, repeat: Infinity, delay: s.del, ease: 'easeInOut' }}
                style={{
                  position:     'absolute',
                  left:         `${s.x}%`,
                  top:          `${s.y}%`,
                  width:        s.r,
                  height:       s.r,
                  borderRadius: '50%',
                  background:   '#fff',
                  boxShadow:    `0 0 ${s.r * 2}px rgba(255,255,255,0.8)`,
                  willChange:   'opacity',
                }}
              />
            ))}
          </>
        ) : (
          // Light mode: 2 soft blobs, very slow
          [
            { x: 15, y: 20, c: 'rgba(99,102,241,0.07)',  s: 500 },
            { x: 80, y: 75, c: 'rgba(139,92,246,0.05)',  s: 400 },
          ].map((b, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 18 + i * 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position:     'absolute',
                left:         `${b.x}%`,
                top:          `${b.y}%`,
                width:        b.s,
                height:       b.s,
                borderRadius: '50%',
                background:   b.c,
                filter:       'blur(100px)',
                transform:    'translate(-50%,-50%)',
              }}
            />
          ))
        )}
      </div>

      {/* ══ CHAT PANEL ════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        style={{
          position:      'relative',
          zIndex:        1,
          width:         '100%',
          maxWidth:      680,
          height:        'calc(100vh - 48px)',
          maxHeight:     760,
          borderRadius:  24,
          overflow:      'hidden',
          display:       'flex',
          flexDirection: 'column',
          boxShadow:     isDark
            ? '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)'
            : '0 24px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
        }}
      >

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div style={{
          background:     tk.headerBg,
          backdropFilter: 'blur(20px)',
          borderBottom:   `1px solid ${tk.border}`,
          padding:        '14px 18px',
          display:        'flex',
          alignItems:     'center',
          gap:            12,
          flexShrink:     0,
        }}>
          {/* Back button */}
          <motion.button
            whileHover={{ scale: 1.08, x: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(-1)}
            style={{
              background:   isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
              border:       'none',
              cursor:       'pointer',
              color:        tk.sub,
              width:        34,
              height:       34,
              borderRadius: 10,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              flexShrink:   0,
            }}
          >
            <ArrowLeft size={17} />
          </motion.button>

          {/* Seller avatar with pulse ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(16,185,129,0.5)',
                  '0 0 0 7px rgba(16,185,129,0)',
                  '0 0 0 0 rgba(16,185,129,0)',
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity }}
              style={{
                width:          42,
                height:         42,
                borderRadius:   '50%',
                background:     'linear-gradient(135deg,#10b981,#059669)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                color:          '#fff',
                fontWeight:     800,
                fontSize:       16,
              }}
            >
              {sellerInit}
            </motion.div>
            {/* Online dot */}
            <div style={{
              position:     'absolute',
              bottom:       1,
              right:        1,
              width:        11,
              height:       11,
              borderRadius: '50%',
              background:   '#22c55e',
              border:       `2px solid ${isDark ? '#0a0a16' : '#fff'}`,
            }} />
          </div>

          {/* Seller info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: tk.text, margin: 0 }}>
              {sellerName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#22c55e', flexShrink: 0,
              }} />
              <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>Online</span>
              <span style={{ fontSize: 11, color: tk.sub }}>·</span>
              <span style={{ fontSize: 11, color: tk.sub, fontFamily: 'monospace', fontWeight: 600 }}>
                #{orderId?.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* ── MESSAGES AREA ──────────────────────────────────── */}
        <div style={{
          flex:           1,
          overflowY:      'auto',
          background:     tk.chatBg,
          padding:        '16px 18px 10px',
          display:        'flex',
          flexDirection:  'column',
          gap:            2,
          scrollbarWidth: 'thin',
          scrollbarColor: isDark ? '#1a1a2e transparent' : '#e2e8f0 transparent',
        }}>

          {/* Loading spinner */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
              <div style={{ textAlign: 'center' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width:        36,
                    height:       36,
                    margin:       '0 auto 12px',
                    border:       '3px solid rgba(99,102,241,0.15)',
                    borderTop:    '3px solid #6366f1',
                    borderRadius: '50%',
                  }}
                />
                <p style={{ fontSize: 12, color: tk.sub, margin: 0 }}>Loading chat...</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && (chat?.messages?.length ?? 0) === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '60px 24px' }}
            >
              <motion.div
                animate={{ y: [-5, 5, -5], rotate: [-3, 3, -3] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width:          72,
                  height:         72,
                  borderRadius:   20,
                  background:     isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
                  border:         `2px solid ${isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)'}`,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  margin:         '0 auto 20px',
                  fontSize:       30,
                }}
              >
                💬
              </motion.div>
              <p style={{ fontSize: 16, fontWeight: 800, color: tk.text, margin: '0 0 6px' }}>
                Say hello to {sellerName}!
              </p>
              <p style={{ fontSize: 13, color: tk.sub, margin: 0, lineHeight: 1.6 }}>
                Ask about your order, request updates,<br />or report any issues
              </p>
            </motion.div>
          )}

          {/* Messages grouped by day */}
          {!loading && groups.map((group) => (
            <div key={group.day}>

              {/* Day separator */}
              <div style={{
                display:    'flex',
                alignItems: 'center',
                gap:        10,
                margin:     '14px 0 10px',
              }}>
                <div style={{ flex: 1, height: 1, background: tk.border }} />
                <span style={{
                  fontSize:      10,
                  fontWeight:    700,
                  color:         tk.sub,
                  letterSpacing: 0.4,
                  padding:       '3px 12px',
                  borderRadius:  20,
                  background:    isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }}>
                  {group.day}
                </span>
                <div style={{ flex: 1, height: 1, background: tk.border }} />
              </div>

              {/* ✅ Plain divs — NO motion.div on bubbles (prevents scroll on click) */}
              {group.msgs.map((msg, i) => {
                const mine       = msg.sender === 'user';
                const showAvatar = !mine && (i === 0 || group.msgs[i - 1]?.sender !== 'seller');
                const nextSame   = group.msgs[i + 1]?.sender === msg.sender;

                return (
                  <div
                    key={msg._id || `m${i}`}
                    style={{
                      display:        'flex',
                      justifyContent: mine ? 'flex-end' : 'flex-start',
                      alignItems:     'flex-end',
                      gap:            8,
                      marginBottom:   nextSame ? 2 : 8,
                    }}
                  >
                    {/* Seller avatar (only first in sequence) */}
                    {!mine && (
                      <div style={{ width: 28, flexShrink: 0 }}>
                        {showAvatar ? (
                          <div style={{
                            width:          28,
                            height:         28,
                            borderRadius:   '50%',
                            background:     'linear-gradient(135deg,#10b981,#059669)',
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            color:          '#fff',
                            fontSize:       11,
                            fontWeight:     800,
                          }}>
                            {sellerInit}
                          </div>
                        ) : (
                          <div style={{ width: 28 }} />
                        )}
                      </div>
                    )}

                    {/* Message bubble — plain div, no animation */}
                    <div style={{
                      maxWidth:        '68%',
                      borderRadius:    mine
                        ? '20px 20px 5px 20px'
                        : showAvatar ? '5px 20px 20px 20px' : '20px 20px 20px 5px',
                      overflow:        'hidden',
                      backgroundImage: mine ? tk.myBubble : undefined,
                      background:      mine ? undefined : tk.theirBg,
                      border:          mine ? 'none' : `1px solid ${tk.theirBdr}`,
                      boxShadow:       mine
                        ? '0 3px 16px rgba(99,102,241,0.28)'
                        : isDark
                        ? '0 2px 8px rgba(0,0,0,0.2)'
                        : '0 1px 6px rgba(0,0,0,0.06)',
                    }}>

                      {/* Image */}
                      {msg.mediaUrl && msg.mediaType === 'image' && (
                        <img
                          src={msg.mediaUrl}
                          style={{ width: '100%', maxWidth: 240, display: 'block', cursor: 'zoom-in' }}
                          onClick={() => window.open(msg.mediaUrl!, '_blank')}
                          alt="media"
                        />
                      )}

                      {/* Video */}
                      {msg.mediaUrl && msg.mediaType === 'video' && (
                        <video
                          src={msg.mediaUrl}
                          controls
                          style={{ width: '100%', maxWidth: 240, display: 'block' }}
                        />
                      )}

                      {/* Text */}
                      {msg.text && (
                        <div style={{ padding: '10px 14px 4px' }}>
                          <p style={{
                            fontSize:   13.5,
                            margin:     0,
                            lineHeight: 1.55,
                            color:      mine ? '#fff' : tk.text,
                            whiteSpace: 'pre-wrap',
                            wordBreak:  'break-word',
                          }}>
                            {msg.text}
                          </p>
                        </div>
                      )}

                      {/* Time + read receipt */}
                      <div style={{
                        padding:        '3px 11px 8px',
                        display:        'flex',
                        justifyContent: 'flex-end',
                        alignItems:     'center',
                        gap:            3,
                      }}>
                        <span style={{
                          fontSize: 10.5,
                          color:    mine ? 'rgba(255,255,255,0.5)' : tk.sub,
                        }}>
                          {fmt(msg.createdAt)}
                        </span>
                        {mine && (
                          msg.read
                            ? <CheckCheck size={12} style={{ color: '#93c5fd' }} />
                            : <Check      size={12} style={{ color: 'rgba(255,255,255,0.45)' }} />
                        )}
                      </div>
                    </div>

                    {/* My avatar */}
                    {mine && (
                      <div style={{
                        width:          24,
                        height:         24,
                        borderRadius:   '50%',
                        flexShrink:     0,
                        background:     'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        color:          '#fff',
                        fontSize:       9,
                        fontWeight:     800,
                      }}>
                        Me
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* ── MEDIA PREVIEW ──────────────────────────────────── */}
        <AnimatePresence>
          {mediaPreview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{   height: 0, opacity: 0 }}
              style={{
                background:     tk.inputArea,
                backdropFilter: 'blur(20px)',
                borderTop:      `1px solid ${tk.border}`,
                padding:        '10px 18px',
                flexShrink:     0,
              }}
            >
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'flex-start' }}>
                <div style={{
                  borderRadius: 10,
                  overflow:     'hidden',
                  border:       `1px solid ${tk.border}`,
                }}>
                  {mediaType === 'image'
                    ? <img src={mediaPreview} style={{ height: 72, objectFit: 'cover', display: 'block' }} alt="preview" />
                    : <video src={mediaPreview} style={{ height: 72, display: 'block' }} />
                  }
                </div>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={clearMedia}
                  style={{
                    position:       'absolute',
                    top:            -7,
                    right:          -7,
                    width:          22,
                    height:         22,
                    borderRadius:   '50%',
                    background:     '#ef4444',
                    border:         `2px solid ${isDark ? '#0a0a16' : '#fff'}`,
                    cursor:         'pointer',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    color:          '#fff',
                    boxShadow:      '0 2px 8px rgba(239,68,68,0.4)',
                  }}
                >
                  <X size={11} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── INPUT BAR ──────────────────────────────────────── */}
        <div style={{
          background:     tk.inputArea,
          backdropFilter: 'blur(20px)',
          borderTop:      `1px solid ${tk.border}`,
          padding:        '10px 14px 12px',
          flexShrink:     0,
        }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Input container row */}
          <div
            style={{
              display:        'flex',
              alignItems:     'flex-end',
              gap:            6,
              background:     tk.inputBg,
              borderRadius:   18,
              padding:        '6px 6px 6px 12px',
              border:         `1px solid ${tk.border}`,
              transition:     'border-color 0.2s',
            }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#6366f1';
            }}
            onBlurCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = tk.border;
            }}
          >
            {/* Attachment */}
            <motion.button
              whileHover={{ scale: 1.15, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileRef.current?.click()}
              title="Attach file"
              style={{
                background:   'none',
                border:       'none',
                cursor:       'pointer',
                color:        tk.sub,
                display:      'flex',
                padding:      '4px 2px',
                borderRadius: 8,
                flexShrink:   0,
              }}
            >
              <Paperclip size={18} />
            </motion.button>

            {/* Image */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileRef.current?.click()}
              title="Send image"
              style={{
                background:   'none',
                border:       'none',
                cursor:       'pointer',
                color:        tk.sub,
                display:      'flex',
                padding:      '4px 2px',
                borderRadius: 8,
                flexShrink:   0,
              }}
            >
              <ImageIcon size={18} />
            </motion.button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message..."
              rows={1}
              style={{
                flex:        1,
                background:  'transparent',
                border:      'none',
                outline:     'none',
                resize:      'none',
                fontFamily:  'inherit',
                fontSize:    14,
                color:       tk.text,
                lineHeight:  1.5,
                padding:     '4px 6px',
                maxHeight:   100,
                overflowY:   'auto',
                boxSizing:   'border-box',
              }}
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
              }}
            />

            {/* Emoji (placeholder) */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background:   'none',
                border:       'none',
                cursor:       'pointer',
                color:        tk.sub,
                display:      'flex',
                padding:      '4px 2px',
                borderRadius: 8,
                flexShrink:   0,
              }}
            >
              <Smile size={18} />
            </motion.button>

            {/* Send button */}
            <motion.button
              whileHover={canSend ? { scale: 1.08 } : {}}
              whileTap={canSend  ? { scale: 0.92 } : {}}
              onClick={handleSend}
              disabled={!canSend}
              style={{
                width:          38,
                height:         38,
                borderRadius:   14,
                background:     canSend
                  ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                  : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
                border:         'none',
                cursor:         canSend ? 'pointer' : 'not-allowed',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
                boxShadow:      canSend ? '0 3px 14px rgba(99,102,241,0.35)' : 'none',
                transition:     'all 0.2s',
              }}
            >
              {sending
                ? <CircularProgress size={15} sx={{ color: '#fff' }} />
                : <Send size={16} style={{
                    transform: 'translateX(1px)',
                    color:     canSend
                      ? '#fff'
                      : isDark ? '#374151' : '#c4c9d4',
                  }} />
              }
            </motion.button>
          </div>

          {/* Hint text */}
          <p style={{ fontSize: 10, color: tk.sub, margin: '6px 0 0 12px' }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </motion.div>
    </div>
  );
}