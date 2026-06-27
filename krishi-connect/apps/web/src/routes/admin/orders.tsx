import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from '@/lib/api';
import {
  Download,
  Filter,
  Package,
  User,
  CreditCard,
  MapPin,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DatePickerWithRange } from '@/components/common/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatIndianCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/admin/orders')({
  component: OrdersPage,
});

function OrdersPage() {
  const [status, setStatus] = useState('ALL');
  const [page, _setPage] = useState(1);
  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', status, page, date],
    queryFn: async () => {
      const res = await api.get('/admin/orders', {
        params: {
          status,
          page,
          limit: 10,
          dateFrom: date?.from?.toISOString(),
          dateTo: date?.to?.toISOString()
        }
      });
      return res.data;
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      <Tabs value={status} onValueChange={setStatus} className="w-full">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-max sm:w-full justify-start h-auto p-0 gap-4 sm:gap-8">
            {['ALL', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="px-0 py-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent shadow-none font-semibold capitalize whitespace-nowrap"
              >
                {s.toLowerCase()} Orders
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white text-gray-600 cursor-pointer hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </div>
            <DatePickerWithRange date={date} setDate={setDate} />
          </div>
          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="mt-6 space-y-4 lg:hidden">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
          ) : (
            orders?.data.map((o: any) => (
              <div key={o.id} onClick={() => setSelectedOrder(o)} className="bg-white rounded-2xl border shadow-sm p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-900">#{o.orderId}</span>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700"><span className="text-gray-400 font-medium">Farmer:</span> {o.farmer.user.firstName} {o.farmer.user.lastName}</p>
                  <p className="text-gray-700"><span className="text-gray-400 font-medium">Items:</span> {o.items.length} items</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <div className="flex items-center gap-3 text-gray-500">
                    <span>{format(new Date(o.createdAt), 'dd MMM yyyy')}</span>
                    <span>{o.paymentMethod === 'UPI_ONLINE' ? 'Online' : 'COD'}</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatIndianCurrency(Number(o.totalAmount))}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="mt-6 border rounded-xl bg-white overflow-hidden shadow-sm hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Farmer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Order Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
                ) : (
                  orders?.data.map((o: any) => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">#{o.orderId}</td>
                      <td className="px-6 py-4 text-sm">{o.farmer.user.firstName} {o.farmer.user.lastName}</td>
                      <td className="px-6 py-4 text-sm">{o.items.length} items</td>
                      <td className="px-6 py-4 text-sm font-bold">
                        {formatIndianCurrency(Number(o.totalAmount))}
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {o.paymentMethod === 'UPI_ONLINE' ? 'Online' : 'COD'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {format(new Date(o.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedOrder(o)} className="text-primary font-semibold text-sm hover:underline">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order #{selectedOrder?.orderId}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="py-4 space-y-6">
              {/* Status & Amount */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <OrderStatusBadge status={selectedOrder.status} />
                <span className="text-2xl font-black text-gray-900">{formatIndianCurrency(Number(selectedOrder.totalAmount))}</span>
              </div>

              {/* Farmer Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4" /> Farmer
                </h4>
                <div className="p-4 bg-white border rounded-xl space-y-1">
                  <p className="font-bold text-gray-900">{selectedOrder.farmer.user.firstName} {selectedOrder.farmer.user.lastName}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.farmer.user.phone}</p>
                  <p className="text-sm text-gray-500 break-all">{selectedOrder.farmer.user.email}</p>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.deliveryAddress && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Delivery Address
                  </h4>
                  <div className="p-4 bg-white border rounded-xl space-y-1">
                    <p className="font-bold text-gray-900">{selectedOrder.deliveryAddress.name}</p>
                    <p className="text-sm text-gray-500">
                      {selectedOrder.deliveryAddress.address}<br />
                      {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pincode}
                    </p>
                    {selectedOrder.deliveryAddress.phone && (
                      <p className="text-sm text-gray-500">+91 {selectedOrder.deliveryAddress.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Package className="w-4 h-4" /> Items ({selectedOrder.items.length})
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-white border rounded-xl">
                      <div className="w-14 h-14 rounded-xl bg-gray-50 border overflow-hidden shrink-0">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0]} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-6 h-6" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{item.product?.name || 'Product'}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatIndianCurrency(Number(item.unitPrice))}</p>
                      </div>
                      <p className="font-bold text-sm text-gray-900 shrink-0">{formatIndianCurrency(Number(item.totalPrice))}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Price Breakdown</h4>
                  <div className="p-4 bg-white border rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-bold text-gray-900">{formatIndianCurrency(Number(selectedOrder.subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery</span>
                      <span className={cn("font-bold", Number(selectedOrder.deliveryCharges) === 0 ? "text-green-600" : "text-gray-900")}>
                        {Number(selectedOrder.deliveryCharges) === 0 ? 'FREE' : formatIndianCurrency(Number(selectedOrder.deliveryCharges))}
                      </span>
                    </div>
                    {Number(selectedOrder.convenienceCharges) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Convenience</span>
                        <span className="font-bold text-gray-900">{formatIndianCurrency(Number(selectedOrder.convenienceCharges))}</span>
                      </div>
                    )}
                    {Number(selectedOrder.platformCharges) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Platform Fee</span>
                        <span className="font-bold text-gray-900">{formatIndianCurrency(Number(selectedOrder.platformCharges))}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">{formatIndianCurrency(Number(selectedOrder.totalAmount))}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Payment
                  </h4>
                  <div className="p-4 bg-white border rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Method</span>
                      <span className="font-bold text-gray-900">
                        {selectedOrder.paymentMethod === 'UPI_ONLINE' ? 'Online' : selectedOrder.paymentMethod === 'CARD' ? 'Card' : 'Cash on Delivery'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      <span className={cn("font-bold", selectedOrder.paymentStatus === 'PAID' ? "text-green-600" : "text-yellow-600")}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Ordered On</span>
                      <span className="font-bold text-gray-900">{format(new Date(selectedOrder.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: any = {
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    SHIPPED: "bg-blue-100 text-blue-800 border-blue-200",
    CONFIRMED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    PLACED: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap", styles[status] || styles.PENDING)}>
      {status}
    </span>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
      ))}
    </tr>
  );
}
