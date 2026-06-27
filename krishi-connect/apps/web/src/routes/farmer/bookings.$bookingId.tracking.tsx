import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { api } from '@/lib/api';
import { 
  ChevronLeft,
  Phone,
  MessageSquare,
  Star,
  Tractor,
  CheckCircle2,
  Circle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { BookingTrackingMap } from '@/components/maps/BookingTrackingMap';

export const Route = createFileRoute('/farmer/bookings/$bookingId/tracking')({
  component: BookingTrackingPage,
});

function BookingTrackingPage() {
  const { bookingId } = useParams({ from: '/farmer/bookings/$bookingId/tracking' });

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking-tracking', bookingId],
    queryFn: async () => (await api.get(`/farmer/bookings/${bookingId}`)).data.data,
    refetchInterval: 10000, 
  });

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
       <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
       <p className="font-black text-gray-400 uppercase tracking-[0.3em] text-xs">Initializing Tracking...</p>
    </div>
  );

  if (error || !booking || !booking.farmer || !booking.provider) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-10 text-center space-y-6">
         <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500">
            <AlertTriangle className="w-10 h-10" />
         </div>
         <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">Tracking Unavailable</h2>
            <p className="text-gray-500 max-w-sm mx-auto">We couldn't load the tracking data for this booking. Please try again later.</p>
         </div>
         <Button asChild className="rounded-2xl px-10 h-14 bg-gray-900 font-black uppercase tracking-widest text-xs">
            <Link to="/farmer/bookings">Back to My Bookings</Link>
         </Button>
      </div>
    );
  }

  const steps = [
    { status: 'REQUESTED', label: 'Requested', desc: 'Your booking request has been sent' },
    { status: 'ACCEPTED', label: 'Accepted', desc: 'Provider has accepted your request' },
    { status: 'CONFIRMED', label: 'On The Way', desc: 'Provider confirmed and is on the way' },
    { status: 'IN_PROGRESS', label: 'In Progress', desc: 'Service is currently being performed' },
    { status: 'COMPLETED', label: 'Completed', desc: 'Service marked as completed' },
  ];

  // Safely access coordinates with fallbacks
  const providerPos: [number, number] = [
    booking.provider.latitude || 12.9716, 
    booking.provider.longitude || 77.5946
  ]; 
  const farmerPos: [number, number] = [
    booking.farmer.latitude || 12.9716, 
    booking.farmer.longitude || 77.5946
  ];

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-700 overflow-hidden flex flex-col">
      <div className="p-4 lg:p-8 flex items-center gap-4 bg-white/80 backdrop-blur-md z-30 border-b border-gray-50 shrink-0">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
           <Link to="/farmer/bookings"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h2 className="font-black text-xl text-gray-900 tracking-tight">Booking Tracking</h2>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 min-h-0">
        {/* Left: Info & Timeline */}
        <div className="lg:col-span-2 overflow-y-auto p-4 lg:p-8 space-y-8 scrollbar-hide border-r border-gray-50">
           <Card className="rounded-3xl border-none shadow-xl bg-gray-900 text-white p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Tractor className="w-24 h-24" /></div>
              <div className="relative z-10 space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Booking ID</p>
                    <h3 className="text-xl font-black">#{booking.bookingId}</h3>
                 </div>
                 <div className="flex gap-4">
                    <img src={booking.service.images?.[0] || 'https://images.unsplash.com/photo-1594398911514-18d49c7a98b5'} className="w-16 h-16 rounded-2xl object-cover" />
                    <div>
                       <p className="font-black text-lg">{booking.service.name}</p>
                       <p className="text-xs font-bold text-white/50">
                          {booking.bookingDate ? format(new Date(booking.bookingDate), 'dd MMM yyyy') : 'Date TBD'} • {booking.startTime}
                       </p>
                    </div>
                 </div>
              </div>
           </Card>

           <Card className="rounded-[2.5rem] border-none shadow-lg p-6 bg-white">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden">
                       <img src={booking.provider.user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${booking.provider.businessName}`} />
                    </div>
                    <div>
                       <p className="font-black text-gray-900 truncate max-w-[150px]">{booking.provider.businessName}</p>
                       <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-black">{booking.provider.averageRating || 4.6}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="secondary" size="icon" className="rounded-full bg-green-50 text-primary hover:bg-green-100"><Phone className="w-4 h-4" /></Button>
                    <Button variant="secondary" size="icon" className="rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"><MessageSquare className="w-4 h-4" /></Button>
                 </div>
              </div>
           </Card>

           <div className="px-4 space-y-1 pb-10">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] mb-8">Service Timeline</h3>
              <div className="space-y-0 relative">
                 <div className="absolute left-[15px] top-4 bottom-10 w-0.5 bg-gray-100" />
                 {steps.map((step, _i) => {
                    const isCompleted = booking.tracking?.some((t: any) => t.status === step.status);
                    const trackingData = booking.tracking?.find((t: any) => t.status === step.status);

                    return (
                       <div key={step.status} className="flex gap-6 pb-12 relative">
                          <div className={cn(
                             "w-8 h-8 rounded-full z-10 flex items-center justify-center transition-all duration-500",
                             isCompleted ? "bg-primary shadow-lg shadow-primary/30" : "bg-white border-2 border-gray-100"
                          )}>
                             {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Circle className="w-4 h-4 text-gray-200" />}
                          </div>
                          <div className="flex-1 -mt-1">
                             <div className="flex justify-between items-start">
                                <h4 className={cn("font-black text-sm uppercase tracking-wider", isCompleted ? "text-gray-900" : "text-gray-300")}>{step.label}</h4>
                                {trackingData && <span className="text-[10px] font-bold text-gray-400">{format(new Date(trackingData.timestamp), 'hh:mm a')}</span>}
                             </div>
                             <p className="text-xs font-medium text-gray-500 mt-1">{step.desc}</p>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>

        {/* Right: Map */}
        <div className="lg:col-span-3 h-full min-h-[400px] relative">
           <BookingTrackingMap 
              farmerPos={farmerPos} 
              providerPos={providerPos} 
              providerAvatar={booking.provider.user?.profileImage} 
              status={booking.status} 
           />
           
           <div className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur shadow-2xl rounded-2xl z-[1000] border border-white">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Estimated Arrival</p>
              <p className="text-xl font-black text-gray-900 tracking-tighter">
                {booking.status === 'CONFIRMED' ? '12 Mins' : booking.status === 'IN_PROGRESS' ? 'Ongoing' : '--'}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
