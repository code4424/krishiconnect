import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from '@/lib/api';
import {
  Search,
  Download,
  Filter,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  CreditCard,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export const Route = createFileRoute('/admin/bookings')({
  component: BookingsPage,
});

function BookingsPage() {
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, _setPage] = useState(1);
  const [date, setDate] = useState<DateRange | undefined>();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings', status, search, page, date],
    queryFn: async () => {
      const res = await api.get('/admin/bookings', {
        params: {
          status,
          search,
          page,
          limit: 10,
          dateFrom: date?.from?.toISOString(),
          dateTo: date?.to?.toISOString()
        }
      });
      return res.data;
    }
  });

  const handleExport = () => {
    window.open(`/api/admin/bookings/export?status=${status}&dateFrom=${date?.from?.toISOString() || ''}&dateTo=${date?.to?.toISOString() || ''}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>

      <Tabs value={status} onValueChange={setStatus} className="w-full">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-max sm:w-full justify-start h-auto p-0 gap-4 sm:gap-8">
            {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="px-0 py-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent shadow-none font-semibold capitalize whitespace-nowrap"
              >
                {s.toLowerCase()} Bookings
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white text-gray-600 cursor-pointer hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
              </div>
              <DatePickerWithRange date={date} setDate={setDate} />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-10 w-full sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2 shrink-0" onClick={handleExport}>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="mt-6 space-y-4 lg:hidden">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)
          ) : (
            bookings?.data.map((b: any) => (
              <div key={b.id} onClick={() => setSelectedBooking(b)} className="bg-white rounded-2xl border shadow-sm p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">#{b.bookingId}</span>
                  <BookingStatusBadge status={b.status} />
                </div>
                <div className="space-y-1.5 text-sm">
                  <p className="text-gray-700"><span className="text-gray-400 font-medium">Farmer:</span> {b.farmer.user.firstName} {b.farmer.user.lastName}</p>
                  <p className="text-gray-700"><span className="text-gray-400 font-medium">Service:</span> {b.service.name}</p>
                  <p className="text-gray-700"><span className="text-gray-400 font-medium">Provider:</span> {b.provider.businessName}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <div className="flex items-center gap-3 text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(new Date(b.bookingDate), 'dd MMM yyyy')}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {b.startTime}</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatIndianCurrency(Number(b.totalAmount))}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="mt-6 border rounded-xl bg-white overflow-hidden shadow-sm hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Booking ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Farmer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={10} />)
                ) : (
                  bookings?.data.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">#{b.bookingId}</td>
                      <td className="px-6 py-4 text-sm">{b.farmer.user.firstName} {b.farmer.user.lastName}</td>
                      <td className="px-6 py-4 text-sm">{b.service.name}</td>
                      <td className="px-6 py-4 text-sm">{b.provider.businessName}</td>
                      <td className="px-6 py-4 text-sm">
                        {format(new Date(b.bookingDate), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm">{b.startTime}</td>
                      <td className="px-6 py-4">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {b.paymentMethod === 'UPI_ONLINE' ? 'Online' : 'COD'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right">
                        {formatIndianCurrency(Number(b.totalAmount))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedBooking(b)} className="text-primary font-semibold text-sm hover:underline">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Tabs>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => { if (!open) setSelectedBooking(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Booking #{selectedBooking?.bookingId}</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="py-4 space-y-6">
              {/* Status & Amount Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <BookingStatusBadge status={selectedBooking.status} />
                <span className="text-2xl font-black text-gray-900">{formatIndianCurrency(Number(selectedBooking.totalAmount))}</span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Farmer Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-4 h-4" /> Farmer
                  </h4>
                  <div className="p-4 bg-white border rounded-xl space-y-1">
                    <p className="font-bold text-gray-900">{selectedBooking.farmer.user.firstName} {selectedBooking.farmer.user.lastName}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {selectedBooking.farmer.user.phone}
                    </p>
                    <p className="text-sm text-gray-500 break-all">{selectedBooking.farmer.user.email}</p>
                  </div>
                </div>

                {/* Provider Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Provider
                  </h4>
                  <div className="p-4 bg-white border rounded-xl space-y-1">
                    <p className="font-bold text-gray-900">{selectedBooking.provider.businessName}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {selectedBooking.provider.city}, {selectedBooking.provider.state}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Service Details</h4>
                <div className="p-4 bg-white border rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900">{selectedBooking.service.name}</p>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg uppercase">{selectedBooking.service.category}</span>
                  </div>
                  {selectedBooking.service.description && (
                    <p className="text-sm text-gray-500">{selectedBooking.service.description}</p>
                  )}
                </div>
              </div>

              {/* Schedule & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Schedule
                  </h4>
                  <div className="p-4 bg-white border rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date</span>
                      <span className="font-bold text-gray-900">{format(new Date(selectedBooking.bookingDate), 'dd MMM yyyy')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Time</span>
                      <span className="font-bold text-gray-900">{selectedBooking.startTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-bold text-gray-900">{selectedBooking.duration}</span>
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
                      <span className="font-bold text-gray-900">{selectedBooking.paymentMethod === 'UPI_ONLINE' ? 'Online' : selectedBooking.paymentMethod === 'CARD' ? 'Card' : 'Cash on Delivery'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      <span className={cn("font-bold", selectedBooking.paymentStatus === 'PAID' ? "text-green-600" : "text-yellow-600")}>{selectedBooking.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-bold text-gray-900">{formatIndianCurrency(Number(selectedBooking.totalAmount))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {(selectedBooking.farmerNotes || selectedBooking.providerNotes) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Notes</h4>
                  <div className="p-4 bg-white border rounded-xl space-y-2">
                    {selectedBooking.farmerNotes && (
                      <div>
                        <p className="text-xs font-bold text-gray-400">Farmer Notes</p>
                        <p className="text-sm text-gray-700">{selectedBooking.farmerNotes}</p>
                      </div>
                    )}
                    {selectedBooking.providerNotes && (
                      <div>
                        <p className="text-xs font-bold text-gray-400">Provider Notes</p>
                        <p className="text-sm text-gray-700">{selectedBooking.providerNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedBooking.cancellationReason && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Cancellation Reason</p>
                  <p className="text-sm text-red-700">{selectedBooking.cancellationReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingStatusBadge({ status }: { status: string }) {
  const styles: any = {
    CONFIRMED: "bg-green-100 text-green-800 border-green-200",
    ACCEPTED: "bg-green-100 text-green-800 border-green-200",
    REQUESTED: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-indigo-100 text-indigo-800 border-indigo-200",
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
