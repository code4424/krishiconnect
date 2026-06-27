import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { api } from '@/lib/api';
import { 
  ShoppingBag,
  ArrowRight,
  Filter,
  Package,
  Calendar
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatIndianCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export const Route = createFileRoute('/farmer/orders/')({
  component: FarmerOrdersPage,
});

function FarmerOrdersPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('ALL');
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['farmer-orders', status],
    queryFn: async () => (await api.get('/farmer/orders', { params: { status } })).data.data,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/farmer/orders/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-orders'] });
      toast.success('Order cancelled successfully');
      setCancelOrderId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to cancel order');
      setCancelOrderId(null);
    }
  });

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
        <Button variant="outline" size="icon" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
      </div>

      <Tabs value={status} onValueChange={setStatus} className="w-full">
        <TabsList className="bg-gray-100/50 p-1.5 rounded-2xl w-full sm:w-auto grid grid-cols-3 sm:flex h-auto gap-1">
          {['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
            <TabsTrigger 
              key={s}
              value={s} 
              className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              {s.toLowerCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-8 space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-[2.5rem] w-full" />)
          ) : (orders || []).length === 0 ? (
            <Card className="rounded-[2.5rem] border-dashed py-20 bg-gray-50/50">
               <CardContent className="flex flex-col items-center justify-center text-gray-400">
                  <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold">No orders found</p>
                  <Button asChild variant="link" className="text-primary mt-2">
                     <Link to="/farmer/products">Browse Products</Link>
                  </Button>
               </CardContent>
            </Card>
          ) : (
            orders.map((order: any) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={() => setCancelOrderId(order.id)}
              />
            ))
          )}
        </div>
      </Tabs>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={!!cancelOrderId} onOpenChange={(open) => { if (!open) setCancelOrderId(null); }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelOrderId(null)} className="rounded-xl">
              No, Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={() => { if (cancelOrderId) cancelMutation.mutate(cancelOrderId); }}
              disabled={cancelMutation.isPending}
              className="rounded-xl"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderCard({ order, onCancel }: any) {
  return (
    <Card className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all overflow-hidden bg-white border border-gray-100 group">
      <CardContent className="p-0">
         <div className="p-6 bg-gray-50/50 border-b flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-gray-100">
                  <Package className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-sm font-black text-gray-900 tracking-tight">Order #{order.orderId}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                     <Calendar className="w-3 h-3 text-gray-400" />
                     <span className="text-[10px] font-bold text-gray-400 uppercase">{format(new Date(order.createdAt), 'dd MMM yyyy')}</span>
                  </div>
               </div>
            </div>
            <div className="text-right">
               <p className="font-black text-gray-900">{formatIndianCurrency(Number(order.totalAmount))}</p>
               <OrderStatusBadge status={order.status} />
            </div>
         </div>
         
         <div className="p-6 space-y-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
               {order.items.map((item: any) => (
                  <div key={item.id} className="flex-shrink-0 flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-50 shadow-sm ring-1 ring-black/5">
                     <img src={item.product.images?.[0]} className="w-10 h-10 rounded-lg object-cover" />
                     <div className="pr-2">
                        <p className="text-[10px] font-black text-gray-900 line-clamp-1 max-w-[100px]">{item.product.name}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Qty: {item.quantity}</p>
                     </div>
                  </div>
               ))}
            </div>

            <div className="flex items-center justify-between pt-2">
               <Button asChild variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 rounded-xl">
                  <Link to="/farmer/orders/$orderId" params={{ orderId: order.id }}>View Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Link>
               </Button>
               {order.status === 'PLACED' && (
                  <button 
                    onClick={onCancel}
                    className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                  >
                    Cancel Order
                  </button>
               )}
            </div>
         </div>
      </CardContent>
    </Card>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: any = {
    DELIVERED: "text-green-600",
    SHIPPED: "text-blue-600",
    CONFIRMED: "text-indigo-600",
    PLACED: "text-yellow-600",
    CANCELLED: "text-red-600",
  };
  return (
    <span className={cn("text-[10px] font-black uppercase tracking-[0.1em]", styles[status])}>
      • {status}
    </span>
  );
}
