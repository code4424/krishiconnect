import {
  Bell,
  CheckCircle2,
  Package,
  Calendar,
  CreditCard
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell({ variant = 'light' }: { variant?: 'light' | 'dark' } = {}) {
  const queryClient = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: async () => (await api.get('/notifications/unread-count')).data.data,
    refetchInterval: 30000, // Refresh every 30s
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications', { params: { limit: 5 } })).data,
    enabled: true
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => await api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => await api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'ORDER': return <Package className="w-4 h-4 text-orange-500" />;
      case 'APPROVAL': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'PAYMENT': return <CreditCard className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "p-2.5 relative rounded-xl transition-colors",
          variant === 'dark'
            ? "hover:bg-white/10 text-white/60 hover:text-white"
            : "hover:bg-gray-50 border border-gray-50 text-gray-500"
        )}>
          <Bell className="w-5 h-5" />
          {countData?.count > 0 && (
            <span className={cn(
              "absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2",
              variant === 'dark' ? "border-gray-900" : "border-white"
            )}>
              {countData.count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 shadow-2xl border-gray-100">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="font-black text-sm uppercase tracking-widest text-gray-400">Notifications</DropdownMenuLabel>
          <button 
            onClick={() => markAllReadMutation.mutate()}
            className="text-[10px] font-black text-primary uppercase hover:underline"
          >
            Mark all as read
          </button>
        </div>
        <DropdownMenuSeparator className="bg-gray-50" />
        <div className="max-h-[400px] overflow-y-auto">
          {notificationsData?.data?.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs font-bold uppercase">No new notifications</div>
          ) : (
            notificationsData?.data.map((n: any) => (
              <DropdownMenuItem 
                key={n.id} 
                onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
                className={cn(
                    "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors focus:bg-gray-50",
                    !n.isRead ? "bg-primary/5" : ""
                )}
              >
                <div className="mt-0.5 p-2 bg-white rounded-lg shadow-sm shrink-0 border border-gray-100">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className={cn("text-xs leading-snug", !n.isRead ? "font-bold text-gray-900" : "font-medium text-gray-500")}>
                    {n.message}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />}
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="bg-gray-50" />
        <button className="w-full py-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
            View All Notifications
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
