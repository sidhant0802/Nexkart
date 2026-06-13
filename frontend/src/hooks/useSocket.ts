import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    const token = localStorage.getItem("jwt");

    socketInstance = io(SOCKET_URL, {
      auth:                  { token },
      transports:            ["websocket", "polling"],
      reconnection:          true,
      reconnectionAttempts:  5,
      reconnectionDelay:     1000,
      autoConnect:           true,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance?.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("⚠️ Socket connection error:", err.message);
    });
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const useSocket = (
  event:    string,
  callback: (data: any) => void,
  enabled:  boolean = true
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    const socket = getSocket();
    const handler = (data: any) => callbackRef.current(data);
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, enabled]);
};

export const useSocketEmit = () => {
  return useCallback((event: string, data?: any) => {
    const socket = getSocket();
    socket.emit(event, data);
  }, []);
};

export const useJoinAdminRoom = () => {
  useEffect(() => {
    const socket = getSocket();
    socket.emit("join:admin");
    const onConnect = () => socket.emit("join:admin");
    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, []);
};

export const useJoinSellerRoom = (sellerId?: string) => {
  useEffect(() => {
    if (!sellerId) return;
    const socket = getSocket();
    socket.emit("join:seller", sellerId);
    const onConnect = () => socket.emit("join:seller", sellerId);
    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, [sellerId]);
};