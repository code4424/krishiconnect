import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

let socket: Socket | null = null;

export function useSocket() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated && !socket) {
      socket = io('/', {
        withCredentials: true,
        transports: ['websocket']
      });

      socket.on('connect', () => console.log('WebSocket connected'));

      socket.on('notification:new', (notification) => {
        toast.info(notification.message, {
          description: notification.title,
        });
        queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      });

      socket.on('booking:status', () => {
        queryClient.invalidateQueries({ queryKey: ['farmer-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      });

      socket.on('order:status', () => {
        queryClient.invalidateQueries({ queryKey: ['farmer-orders'] });
        queryClient.invalidateQueries({ queryKey: ['provider-orders'] });
      });
    }

    return () => {
      if (!isAuthenticated && socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [isAuthenticated, queryClient]);

  const emit = useCallback((event: string, data: any) => {
    socket?.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socket?.on(event, callback);
    return () => { socket?.off(event, callback); };
  }, []);

  return { socket, emit, on };
}
