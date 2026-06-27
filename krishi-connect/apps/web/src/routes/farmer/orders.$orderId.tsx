import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { api } from '@/lib/api';
import {
  ChevronLeft,
  Package,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  Circle,
  XCircle,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatIndianCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

export const Route = createFileRoute('/farmer/orders/$orderId')({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['farmer-order', orderId],
    queryFn: async () => (await api.get(`/farmer/orders/${orderId}`)).data.data,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/farmer/orders/${orderId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['farmer-orders'] });
      toast.success('Order cancelled successfully');
      setShowCancelDialog(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to cancel order');
      setShowCancelDialog(false);
    }
  });

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto text-center py-20 space-y-4">
        <Package className="w-16 h-16 mx-auto text-gray-200" />
        <h2 className="text-xl font-black text-gray-900">Order not found</h2>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/farmer/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const steps = [
    { status: 'PLACED', label: 'Order Placed', desc: 'Your order has been placed' },
    { status: 'CONFIRMED', label: 'Confirmed', desc: 'Seller has confirmed your order' },
    { status: 'SHIPPED', label: 'Shipped', desc: 'Your order is on the way' },
    { status: 'DELIVERED', label: 'Delivered', desc: 'Order delivered successfully' },
  ];

  const statusOrder = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
  const currentIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link to="/farmer/orders"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order #{order.orderId}</h1>
          <p className="text-xs font-bold text-gray-400 mt-1">
            <Calendar className="w-3 h-3 inline mr-1" />
            Placed on {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
          </p>
        </div>
      </div>

      {/* Status Timeline */}
      <Card className="rounded-3xl border-none shadow-sm p-6 lg:p-8 bg-white">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] mb-6">Order Status</h3>
        {isCancelled ? (
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-black text-red-700">Order Cancelled</p>
              <p className="text-xs text-red-500">This order has been cancelled</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100" />
            <div className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500" style={{ width: `${Math.max(0, currentIndex) / (steps.length - 1) * 100}%`, maxWidth: 'calc(100% - 40px)' }} />
            {steps.map((step, i) => {
              const isCompleted = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={step.status} className="flex flex-col items-center relative z-10 flex-1">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isCompleted ? "bg-primary shadow-lg shadow-primary/30" : "bg-white border-2 border-gray-200"
                  )}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Circle className="w-4 h-4 text-gray-300" />}
                  </div>
                  <p className={cn("text-[10px] font-black uppercase tracking-wider mt-3 text-center", isCurrent ? "text-primary" : isCompleted ? "text-gray-900" : "text-gray-300")}>
                    {step.label}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-1 text-center hidden sm:block">{step.desc}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Items */}
        <Card className="rounded-3xl border-none shadow-sm p-6 lg:p-8 bg-white">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] mb-6">Items ({order.items.length})</h3>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border shrink-0">
                  <img src={item.product.images?.[0]} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-gray-900 truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">
                    {item.product.provider?.businessName || item.product.category}
                  </p>
                  <p className="text-xs text-gray-500 font-bold mt-1">
                    Qty: {item.quantity} x {formatIndianCurrency(Number(item.unitPrice))}
                  </p>
                </div>
                <p className="font-black text-sm text-gray-900 shrink-0">{formatIndianCurrency(Number(item.totalPrice))}</p>
              </div>
            ))}

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">{formatIndianCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery Charges</span>
                <span className={cn("font-bold", Number(order.deliveryCharges) === 0 ? "text-green-600" : "text-gray-900")}>
                  {Number(order.deliveryCharges) === 0 ? 'FREE' : formatIndianCurrency(Number(order.deliveryCharges))}
                </span>
              </div>
              {Number(order.convenienceCharges) > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Convenience Charges</span>
                  <span className="font-bold text-gray-900">{formatIndianCurrency(Number(order.convenienceCharges))}</span>
                </div>
              )}
              {Number(order.platformCharges) > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Platform Charges</span>
                  <span className="font-bold text-gray-900">{formatIndianCurrency(Number(order.platformCharges))}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatIndianCurrency(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Delivery & Payment Info */}
        <div className="space-y-6">
          {/* Delivery Address */}
          {order.deliveryAddress && (
            <Card className="rounded-3xl border-none shadow-sm p-6 lg:p-8 bg-white">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] mb-4">Delivery Address</h3>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-sm text-gray-900">{order.deliveryAddress.name}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {order.deliveryAddress.address}<br />
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-bold text-gray-600">+91 {order.deliveryAddress.phone}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Payment Info */}
          <Card className="rounded-3xl border-none shadow-sm p-6 lg:p-8 bg-white">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] mb-4">Payment</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-black text-sm text-gray-900">
                  {order.paymentMethod === 'UPI_ONLINE' ? 'UPI / Online' : order.paymentMethod === 'CARD' ? 'Card Payment' : 'Cash on Delivery'}
                </p>
                <p className={cn("text-xs font-bold mt-0.5", order.paymentStatus === 'PAID' ? "text-green-600" : "text-yellow-600")}>
                  {order.paymentStatus}
                </p>
              </div>
            </div>
          </Card>

          {/* Cancel Button */}
          {order.status === 'PLACED' && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs"
            >
              <XCircle className="w-4 h-4 mr-2" /> Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="rounded-xl">
              No, Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
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
