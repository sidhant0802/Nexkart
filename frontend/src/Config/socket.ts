import { io, Socket } from 'socket.io-client';
import { addNotification } from '../Redux Toolkit/Customer/NotificationSlice';
import { receiveMessage } from '../Redux Toolkit/Customer/ChatSlice';

let socket: Socket | null = null;

// ✅ Lazy import store to avoid circular dependency
const getStore = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../Redux Toolkit/Store').default;
};

export const initSocket = (jwt: string): Socket => {
  if (socket?.connected) return socket;

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  socket = io(BASE_URL, {
    auth:              { token: jwt },
    transports:        ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnection:      true,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
    (window as any).__nexkartSocket = socket;
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  // ── Listen for notifications ──
  socket.on('notification:new', (data: { notification: any }) => {
    console.log('🔔 New notification:', data.notification);
    try {
      getStore().dispatch(addNotification(data.notification));
    } catch (e) {
      console.error('Store dispatch error:', e);
    }
  });

  // ── Listen for chat messages ──
  socket.on('chat:message', (data: any) => {
    try {
      getStore().dispatch(receiveMessage({
        orderId: data.orderId,
        message: data.message,
      }));
    } catch (e) {
      console.error('Store dispatch error:', e);
    }
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
  (window as any).__nexkartSocket = null;
};

export const joinOrderRoom = (orderId: string) => {
  socket?.emit('join:order', orderId);
};