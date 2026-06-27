import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from '@/lib/api';
import {
  Filter,
  User,
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatIndianCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export const Route = createFileRoute('/provider/orders')({
  component: ProviderOrdersPage,
});

function ProviderOrdersPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('ALL');
  const [page, _setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['provider-orders', status, page],
    queryFn: async () => (await api.get('/provider/orders', { params: { status, page, limit: 10 } })).data,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/provider/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-orders'] });
      toast.success('Order status updated');
      setIsDetailsOpen(false);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
      </div>

      <Tabs value={status} onValueChange={setStatus} className="w-full">
        <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start h-auto p-0 gap-8">
          {['ALL', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
            <TabsTrigger
              key={s}
              value={s}
              className="px-0 py-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent shadow-none font-bold capitalize text-sm"
            >
              {s.toLowerCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6 border rounded-2xl bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : !orders?.data?.length ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center text-gray-400">
                      <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="font-bold">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  orders.data.map((o: any) => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 text-sm">#{o.orderId}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {o.items.length} item{o.items.length > 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-primary">
                            {o.farmer.user.firstName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{o.farmer.user.firstName} {o.farmer.user.lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-500">
                        {format(new Date(o.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-400">
                        {o.paymentMethod === 'UPI_ONLINE' ? 'Online' : o.paymentMethod === 'CARD' ? 'Card' : 'Cash'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatIndianCurrency(Number(o.totalAmount))}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => { setSelectedOrder(o); setIsDetailsOpen(true); }}
                          className="text-primary font-bold text-sm hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Tabs>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order Details <Badge variant="outline" className="ml-2 font-bold">#{selectedOrder?.orderId}</Badge>
            </DialogTitle>
            <DialogDescription className="sr-only">View and manage order details</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-8 py-4">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest">Order Items</h4>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                    {selectedOrder.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border overflow-hidden">
                          <img src={item.product.images?.[0]} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatIndianCurrency(Number(item.unitPrice))}</p>
                        </div>
                        <p className="text-sm font-bold">{formatIndianCurrency(Number(item.totalPrice))}</p>
                      </div>
                    ))}
                    <div className="pt-3 border-t space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Subtotal</span>
                        <span className="font-bold text-gray-900">{formatIndianCurrency(Number(selectedOrder.subtotal))}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Delivery</span>
                        <span className="font-bold text-gray-900">{formatIndianCurrency(Number(selectedOrder.deliveryCharges))}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-1 border-t">
                        <span>Total</span>
                        <span className="text-primary">{formatIndianCurrency(Number(selectedOrder.totalAmount))}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest">Farmer Information</h4>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><User className="w-5 h-5" /></div>
                      <div>
                        <p className="font-bold text-sm">{selectedOrder.farmer.user.firstName} {selectedOrder.farmer.user.lastName}</p>
                        <p className="text-xs text-gray-500">{selectedOrder.farmer.user.phone}</p>
                      </div>
                    </div>
                    {selectedOrder.deliveryAddress && (
                      <div className="flex items-start gap-3 pt-3 border-t">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div className="text-xs text-gray-500 leading-relaxed">
                          <p className="font-bold text-gray-700">{selectedOrder.deliveryAddress.name}</p>
                          <p>{selectedOrder.deliveryAddress.address}</p>
                          <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedOrder.status === 'PLACED' && (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => updateStatusMutation.mutate({ id: selectedOrder.id, status: 'CONFIRMED' })}
                    className="h-12 bg-primary hover:bg-primary-dark rounded-xl font-bold"
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Order
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateStatusMutation.mutate({ id: selectedOrder.id, status: 'CANCELLED' })}
                    className="h-12 rounded-xl font-bold"
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              )}

              {selectedOrder.status === 'CONFIRMED' && (
                <Button
                  onClick={() => updateStatusMutation.mutate({ id: selectedOrder.id, status: 'SHIPPED' })}
                  className="h-12 w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold"
                  disabled={updateStatusMutation.isPending}
                >
                  <Truck className="w-4 h-4 mr-2" /> Mark as Shipped
                </Button>
              )}

              {selectedOrder.status === 'SHIPPED' && (
                <Button
                  onClick={() => updateStatusMutation.mutate({ id: selectedOrder.id, status: 'DELIVERED' })}
                  className="h-12 w-full bg-green-600 hover:bg-green-700 rounded-xl font-bold"
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Delivered
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PLACED: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", styles[status] || "bg-gray-100 text-gray-800 border-gray-200")}>
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
      ))}
    </tr>
  );
}
