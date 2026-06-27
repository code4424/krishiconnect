import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from '@/lib/api';
import {
  Filter,
  User,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatIndianCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export const Route = createFileRoute('/provider/bookings')({
  component: ProviderBookingsPage,
});

function ProviderBookingsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('ALL');
  const [page, _setPage] = useState(1);
  const [selectedBooking, setSelectedProvider] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['provider-bookings', status, page],
    queryFn: async () => (await api.get('/provider/bookings', { params: { status, page, limit: 10 } })).data,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: any) => {
      await api.put(`/provider/bookings/${id}/status`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      toast.success('Booking status updated');
      setIsDetailsOpen(false);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
      </div>

      <Tabs value={status} onValueChange={setStatus} className="w-full">
        <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start h-auto p-0 gap-8">
          {['ALL', 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
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
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : (
                  bookings?.data.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 text-sm">#{b.bookingId}</td>
                      <td className="px-6 py-4 text-sm font-medium">{b.service.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-primary">
                            {b.farmer.user.firstName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{b.farmer.user.firstName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-500">
                        {format(new Date(b.bookingDate), 'dd MMM yyyy')}, {b.startTime}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-400">{b.paymentMethod === 'UPI_ONLINE' ? 'Online' : 'Cash'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatIndianCurrency(Number(b.totalAmount))}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => { setSelectedProvider(b); setIsDetailsOpen(true); }}
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
              Booking Details <Badge variant="outline" className="ml-2 font-bold">#{selectedBooking?.bookingId}</Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-8 py-4">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest">Service Information</h4>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Wrench className="w-5 h-5" /></div>
                      <div>
                        <p className="font-bold text-sm">{selectedBooking.service.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{selectedBooking.service.category.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t flex justify-between">
                      <span className="text-xs text-gray-500">Duration</span>
                      <span className="text-xs font-bold text-gray-900">{selectedBooking.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest">Farmer Information</h4>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><User className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-sm">{selectedBooking.farmer.user.firstName} {selectedBooking.farmer.user.lastName}</p>
                      <p className="text-xs text-gray-500">{selectedBooking.farmer.user.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.status === 'REQUESTED' && (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => updateStatusMutation.mutate({ id: selectedBooking.id, status: 'ACCEPTED' })}
                    className="h-12 bg-primary hover:bg-primary-dark rounded-xl font-bold"
                    disabled={updateStatusMutation.isPending}
                  >
                    Accept Booking
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateStatusMutation.mutate({ id: selectedBooking.id, status: 'CANCELLED' })}
                    className="h-12 rounded-xl font-bold"
                    disabled={updateStatusMutation.isPending}
                  >
                    Reject
                  </Button>
                </div>
              )}

              {['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(selectedBooking.status) && (
                <div className="space-y-4">
                  <Label>Update Progress</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedBooking.status === 'ACCEPTED' && (
                       <Button
                        onClick={() => updateStatusMutation.mutate({ id: selectedBooking.id, status: 'CONFIRMED' })}
                        className="h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold"
                        disabled={updateStatusMutation.isPending}
                      >
                        Confirm & On the Way
                      </Button>
                    )}
                    {selectedBooking.status === 'CONFIRMED' && (
                       <Button
                        onClick={() => updateStatusMutation.mutate({ id: selectedBooking.id, status: 'IN_PROGRESS' })}
                        className="h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold"
                        disabled={updateStatusMutation.isPending}
                      >
                        Start Service
                      </Button>
                    )}
                    {selectedBooking.status === 'IN_PROGRESS' && (
                       <Button
                        onClick={() => updateStatusMutation.mutate({ id: selectedBooking.id, status: 'COMPLETED' })}
                        className="h-12 bg-green-600 hover:bg-green-700 rounded-xl font-bold"
                        disabled={updateStatusMutation.isPending}
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                </div>
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
    CONFIRMED: "bg-green-100 text-green-800 border-green-200",
    REQUESTED: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ACCEPTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-primary/10 text-primary border-primary/20",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", styles[status] || styles.PENDING)}>
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
