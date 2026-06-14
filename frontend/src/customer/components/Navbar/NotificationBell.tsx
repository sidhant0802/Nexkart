import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Package, MessageSquare, RotateCcw, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
  fetchUserNotifications,
  markNotificationsRead,
  type AppNotification,
} from '../../../Redux Toolkit/Customer/NotificationSlice';

const NOTIF_ICONS: Record<string, { icon: any; color: string }> = {
  ORDER_STATUS:  { icon: Package,      color: '#6366f1' },
  NEW_MESSAGE:   { icon: MessageSquare, color: '#10b981' },
  RETURN_UPDATE: { icon: RotateCcw,    color: '#f59e0b' },
  ORDER_PLACED:  { icon: Zap,          color: '#8b5cf6' },
  GENERAL:       { icon: Bell,         color: '#06b6d4' },
};

const formatRelativeTime = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

interface Props {
  isDark: boolean;
}

const NotificationBell = ({ isDark }: Props) => {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);
  const dropRef         = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount } = useAppSelector((s) => s.notifications);
  const isLoggedIn = !!localStorage.getItem('jwt');

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchUserNotifications());
  }, [isLoggedIn]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((p) => !p);
    if (!open && unreadCount > 0) {
      // Mark all as read after 2s
      setTimeout(() => dispatch(markNotificationsRead()), 2000);
    }
  };

  const handleNotifClick = (notif: AppNotification) => {
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  return (
    <div ref={dropRef} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        onClick={handleOpen}
        className={`hidden sm:flex relative w-9 h-9 items-center justify-center rounded-xl transition-all ${
          isDark ? 'text-white/40 hover:text-white hover:bg-white/8'
                 : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center"
            style={{ boxShadow: '0 0 6px rgba(239,68,68,0.8)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{   opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position:   'absolute',
                right:      0,
                top:        'calc(100% + 8px)',
                width:      340,
                maxHeight:  480,
                borderRadius: 16,
                overflow:   'hidden',
                zIndex:     50,
                background: isDark ? 'rgba(15,15,26,0.98)' : 'rgba(255,255,255,0.98)',
                border:     isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                boxShadow:  isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.15)',
                display:    'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{
                padding:      '14px 16px',
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f3f4f6',
                display:      'flex',
                justifyContent: 'space-between',
                alignItems:   'center',
                flexShrink:   0,
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800,
                    color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>
                    Notifications
                  </p>
                  {unreadCount > 0 && (
                    <p style={{ fontSize: 11, color: '#6366f1', margin: '2px 0 0', fontWeight: 600 }}>
                      {unreadCount} unread
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dispatch(markNotificationsRead())}
                      style={{
                        background: 'none', border: 'none',
                        fontSize: 11, color: '#6366f1',
                        cursor: 'pointer', fontWeight: 600,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      background: 'none', border: 'none',
                      color: isDark ? '#94a3b8' : '#64748b',
                      cursor: 'pointer', padding: 2,
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center' }}>
                    <Bell size={32} style={{
                      color: isDark ? '#334155' : '#cbd5e1',
                      marginBottom: 12,
                    }} />
                    <p style={{ fontSize: 13, color: isDark ? '#475569' : '#94a3b8', margin: 0 }}>
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const config = NOTIF_ICONS[notif.type] || NOTIF_ICONS.GENERAL;
                    const Icon   = config.icon;
                    return (
                      <motion.div
                        key={notif._id}
                        whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb' }}
                        onClick={() => handleNotifClick(notif)}
                        style={{
                          display:   'flex',
                          gap:       12,
                          padding:   '12px 16px',
                          cursor:    notif.link ? 'pointer' : 'default',
                          borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid #f9fafb',
                          background:   !notif.read
                            ? isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)'
                            : 'transparent',
                          transition: 'background 0.15s',
                        }}
                      >
                        {/* Icon */}
                        <div style={{
                          width:      36, height: 36,
                          borderRadius: '50%',
                          background: `${config.color}15`,
                          display:    'flex',
                          alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon size={16} style={{ color: config.color }} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <p style={{
                              fontSize:  12, fontWeight: 700,
                              color:     isDark ? '#f1f5f9' : '#0f172a',
                              margin:    0,
                            }}>
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: '#6366f1', flexShrink: 0,
                                marginTop: 4,
                              }} />
                            )}
                          </div>
                          <p style={{
                            fontSize:  11, color: isDark ? '#94a3b8' : '#64748b',
                            margin:    '2px 0 0',
                            overflow:  'hidden',
                            display:   '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          } as any}>
                            {notif.message}
                          </p>
                          <p style={{ fontSize: 10, color: isDark ? '#475569' : '#94a3b8', margin: '4px 0 0' }}>
                            {formatRelativeTime(notif.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;