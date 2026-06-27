import { createFileRoute, useNavigate, Link, Outlet, useMatch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Tractor,
  Clock,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  Star,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatIndianCurrency } from '@/lib/formatters';
import { ServiceDetailMap } from '@/components/maps/ServiceDetailMap';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/farmer/services/$serviceId')({
  component: ServiceDetailLayout,
});

function ServiceDetailLayout() {
  const bookMatch = useMatch({ from: '/farmer/services/$serviceId/book', shouldThrow: false });

  if (bookMatch) return <Outlet />;

  return <ServiceDetailPage />;
}

function ServiceDetailPage() {
  const { serviceId } = Route.useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => (await api.get(`/farmer/services/${serviceId}`)).data.data,
  });

  if (isLoading) return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
       <Skeleton className="h-10 w-48 rounded-full" />
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-[2.5rem]" />
          <div className="space-y-6">
             <Skeleton className="h-20 w-full rounded-3xl" />
             <Skeleton className="h-40 w-full rounded-[2rem]" />
             <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-24 rounded-3xl" />
                <Skeleton className="h-24 rounded-3xl" />
                <Skeleton className="h-24 rounded-3xl" />
             </div>
          </div>
       </div>
    </div>
  );

  if (!service) return <div className="p-20 text-center font-black">Service not found</div>;

  const images = service.images?.length > 0 ? service.images : ['https://images.unsplash.com/photo-1594398911514-18d49c7a98b5'];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={() => navigate({ to: '/farmer/services' })}
        className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-primary transition-colors mb-8 group"
      >
        <div className="p-2 rounded-xl bg-gray-100 group-hover:bg-primary/10 group-hover:text-primary transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        BACK TO DISCOVERY
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left Column: Media */}
        <div className="space-y-6">
          <div className="aspect-[4/3] rounded-[3rem] overflow-hidden bg-gray-50 shadow-2xl border-4 border-white">
            <img src={images[selectedImage]} className="w-full h-full object-contain" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((img: string, i: number) => (
              <button 
                key={i} 
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0",
                  selectedImage === i ? "border-primary scale-95 shadow-inner" : "border-white shadow-sm"
                )}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          
          {/* Map Location */}
          <div className="space-y-4">
             <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Service Location</h3>
             <div className="h-64 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-lg">
                {service.provider?.latitude && service.provider?.longitude ? (
                  <ServiceDetailMap 
                    lat={service.provider.latitude} 
                    lng={service.provider.longitude} 
                    price={formatIndianCurrency(Number(service.price))} 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                    Location not available
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Info & Booking */}
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Badge className="bg-primary/5 text-primary border-none font-black text-[10px] tracking-widest px-3 py-1 uppercase">{service.category}</Badge>
               <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified Provider</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-[1.1]">{service.name}</h1>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                  <span className="text-sm font-black text-gray-900">{service.averageRating || 4.8}</span>
               </div>
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest border-l pl-4 border-gray-100">128 Bookings</span>
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest border-l pl-4 border-gray-100">{service.distance?.toFixed(1) || 0} km away</span>
            </div>
          </div>

          <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-white shadow-inner flex items-center justify-between">
             <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Service Rate</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-5xl font-black text-gray-900 tracking-tighter">{formatIndianCurrency(Number(service.price))}</span>
                   <span className="text-sm font-bold text-gray-500 uppercase">/ {service.rate_type?.toLowerCase().replace('_', ' ')}</span>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-100 px-2 py-1 rounded-lg mb-2">Available Today</p>
                <p className="text-xs font-bold text-gray-400">Next Slot: 02:00 PM</p>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
             <InfoStat icon={<Tractor className="w-4 h-4" />} label="Category" value={service.category} />
             <InfoStat icon={<Clock className="w-4 h-4" />} label="Rate Type" value={service.rate_type} />
             <InfoStat icon={<MapPin className="w-4 h-4" />} label="Area" value={service.city} />
          </div>

          <div className="space-y-4">
             <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Description</h3>
             <p className="text-gray-600 leading-relaxed font-medium">{service.description}</p>
          </div>

          <div className="mt-auto pt-8 border-t border-gray-100 flex gap-4">
             <Button variant="outline" className="flex-1 h-16 rounded-2xl border-2 font-black uppercase text-xs tracking-widest gap-2">
                <MessageSquare className="w-5 h-5" /> Chat
             </Button>
             <Button asChild className="flex-[2] h-16 rounded-2xl bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20 text-white font-black uppercase tracking-widest text-xs gap-3">
                <Link to="/farmer/services/$serviceId/book" params={{ serviceId: service.id }}>
                   Book Now <ChevronRight className="w-5 h-5" />
                </Link>
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoStat({ icon, label, value }: any) {
  return (
    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
      <div className="text-primary mb-2">{icon}</div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</p>
      <p className="text-xs font-black text-gray-900 mt-1 truncate uppercase">{value?.replace('_', ' ')}</p>
    </div>
  );
}
