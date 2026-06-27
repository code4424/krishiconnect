import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { api } from '@/lib/api';
import { 
  Calendar,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatIndianCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/farmer/bookings/')({
  component: FarmerBookingsPage,
});

function FarmerBookingsPage() {
  const [status, setStatus] = useState('ALL');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['farmer-bookings', status],
    queryFn: async () => (await api.get('/farmer/bookings', { params: { status } })).data.data,
  });

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Bookings</h1>
        <Button variant="outline" size="icon" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
      </div>

      <Tabs value={status} onValueChange={setStatus} className="w-full">
        <TabsList className="bg-gray-100/50 p-1.5 rounded-2xl w-full sm:w-auto grid grid-cols-3 sm:flex h-auto gap-1">
          {['ALL', 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
            <TabsTrigger 
              key={s}
              value={s} 
              className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              {s.toLowerCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-8 space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-[2rem] w-full" />)
          ) : (bookings || []).length === 0 ? (
            <Card className="rounded-[2rem] border-dashed py-20 bg-gray-50/50">
               <CardContent className="flex flex-col items-center justify-center text-gray-400">
                  <Calendar className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold">No bookings found</p>
                  <Button asChild variant="link" className="text-primary mt-2">
                     <Link to="/farmer/services">Browse Services</Link>
                  </Button>
               </CardContent>
            </Card>
          ) : (
            bookings.map((booking: any) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </Tabs>
      
      {(bookings || []).length > 0 && (
         <div className="text-center pt-4">
            <Button variant="ghost" className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-primary">
               View All History
            </Button>
         </div>
      )}
    </div>
  );
}

function BookingCard({ booking }: any) {
  return (
    <Card className="rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all overflow-hidden group bg-white border border-gray-50">
      <CardContent className="p-0">
         <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-32 h-32 sm:h-auto shrink-0 relative overflow-hidden bg-gray-100">
               <img src={booking.service.images?.[0]} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
               <div className="absolute inset-0 bg-black/5" />
            </div>
            
            <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
               <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 leading-tight">{booking.service.name}</h3>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{booking.provider.businessName}</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-black text-gray-600">{format(new Date(booking.bookingDate), 'dd MMM yyyy')}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-black text-gray-600">{booking.startTime}</span>
                     </div>
                     <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter rounded-lg border-gray-200">{booking.duration}</Badge>
                  </div>
               </div>

               <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 pt-4 sm:pt-0 border-t sm:border-none border-gray-50">
                  <div className="text-right">
                     <p className="text-lg font-black text-gray-900">{formatIndianCurrency(Number(booking.totalAmount))}</p>
                     <StatusBadge status={booking.status} />
                  </div>
                  <Button asChild variant="ghost" size="sm" className="rounded-xl text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/5">
                     <Link to="/farmer/bookings/$bookingId/tracking" params={{ bookingId: booking.id }}>View Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Link>
                  </Button>
               </div>
            </div>
         </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    CONFIRMED: "text-green-600",
    REQUESTED: "text-yellow-600",
    ACCEPTED: "text-emerald-600",
    IN_PROGRESS: "text-blue-600",
    COMPLETED: "text-primary",
    CANCELLED: "text-red-600",
  };
  return (
    <span className={cn("text-[10px] font-black uppercase tracking-[0.1em]", styles[status])}>
      • {status}
    </span>
  );
}
