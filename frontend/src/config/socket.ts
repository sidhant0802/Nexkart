import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

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

  socket.on('connect_error', (err: any) => {
    console.error('❌ Socket error:', err?.message);
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

export const emitEvent = (event: string, data?: any) => {
  socket?.emit(event, data);
};

export const onEvent = (event: string, callback: (...args: any[]) => void) => {
  socket?.on(event, callback);
};

export const offEvent = (event: string) => {
  socket?.off(event);
};

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  joinOrderRoom,
  emitEvent,
  onEvent,
  offEvent,
};
