import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Tractor,
  Users,
  Wrench,
  Droplets,
  Wheat,
  SprayCan,
  Star,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatIndianCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useLocationStore } from '@/stores/locationStore';

export const Route = createFileRoute('/farmer/dashboard')({
  component: FarmerDashboard,
});

function FarmerDashboard() {
  const { t } = useTranslation();
  const { lat, lng } = useLocationStore();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['farmer-dashboard', lat, lng],
    queryFn: async () => (await api.get('/farmer/dashboard', { params: { lat, lng } })).data.data,
  });

  const categories = [
    { name: t('services.tractor'), icon: Tractor, color: 'bg-orange-100 text-orange-600' },
    { name: t('services.labor'), icon: Users, color: 'bg-blue-100 text-blue-600' },
    { name: t('services.equipment'), icon: Wrench, color: 'bg-purple-100 text-purple-600' },
    { name: t('services.irrigation'), icon: Droplets, color: 'bg-cyan-100 text-cyan-600' },
    { name: t('services.harvesting'), icon: Wheat, color: 'bg-green-100 text-green-600' },
    { name: t('services.spraying'), icon: SprayCan, color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{dashboard?.greeting || t('dashboard.morning')}</h1>
        <p className="text-sm sm:text-base text-gray-500 font-bold mt-1 tracking-wide">{t('dashboard.whatToDo')}</p>
      </div>

      {/* CTA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <CTACard 
          title={t('dashboard.bookService')} 
          subtitle={t('dashboard.bookServiceDesc')} 
          buttonText={t('dashboard.bookNow')}
          to="/farmer/services"
          image="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1000&auto=format&fit=crop"
          color="bg-green-600"
        />
        <CTACard 
          title={t('dashboard.buyProducts')} 
          subtitle={t('dashboard.buyProductsDesc')} 
          buttonText={t('dashboard.shopNow')}
          to="/farmer/products"
          image="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1000&auto=format&fit=crop"
          color="bg-primary"
        />
      </div>

      {/* Nearby Services */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-black text-gray-900">
            {t('dashboard.nearbyServices', { radius: 25 })}
          </h2>
          <Link to="/farmer/services" className="text-xs sm:text-sm font-black text-primary hover:underline flex items-center gap-1 shrink-0">
            {t('common.viewAll')} <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="min-w-[280px] h-[340px] rounded-3xl" />)
          ) : (dashboard?.nearbyServices || []).length === 0 ? (
            <div className="w-full py-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
               <Tractor className="w-12 h-12 text-gray-200 mx-auto mb-3" />
               <p className="text-sm font-bold text-gray-400">Nearby services not available in your area yet.</p>
               <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Try changing your location or pincode</p>
            </div>
          ) : (dashboard?.nearbyServices || []).map((service: any) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-10">
        {/* Popular Categories */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-black text-gray-900">Popular Categories</h2>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to="/farmer/services"
                search={{ category: cat.name.toUpperCase() }}
                className="flex flex-col items-center gap-2 sm:gap-3 group"
              >
                <div className={cn("w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm", cat.color)}>
                  <cat.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <span className="text-[10px] sm:text-xs font-black text-gray-700 uppercase tracking-tighter text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* My Bookings */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-gray-900">My Bookings</h2>
            <Link to="/farmer/bookings" className="text-xs sm:text-sm font-black text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {(dashboard?.upcomingBookings || []).length === 0 ? (
                <div className="py-10 text-center bg-gray-100/50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-sm font-bold text-gray-400">No upcoming bookings</p>
                </div>
            ) : dashboard?.upcomingBookings.map((b: any) => (
              <BookingItem key={b.id} booking={b} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CTACard({ title, subtitle, buttonText, to, image, color }: any) {
  return (
    <Card className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-none shadow-sm h-40 sm:h-48 group cursor-pointer transition-all hover:shadow-xl">
      <CardContent className="p-0 h-full flex items-center">
        <div className="flex-1 p-5 sm:p-8 relative z-10 space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-lg sm:text-2xl font-black text-gray-900 leading-tight">{title}</h3>
            <p className="text-xs sm:text-sm font-bold text-gray-500 mt-0.5 sm:mt-1">{subtitle}</p>
          </div>
          <Button asChild size="sm" className={cn("rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest px-4 sm:px-6 h-8 sm:h-9", color)}>
            <Link to={to}>{buttonText}</Link>
          </Button>
        </div>
        <div className="absolute right-0 bottom-0 w-2/5 sm:w-1/2 h-full">
           <img src={image} className="w-full h-full object-contain object-right-bottom transition-transform duration-500 group-hover:scale-110" />
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceCard({ service }: any) {
  return (
    <Link to="/farmer/services/$serviceId" params={{ serviceId: service.id }} className="block">
    <Card className="min-w-[220px] max-w-[220px] sm:min-w-[280px] sm:max-w-[280px] rounded-2xl sm:rounded-3xl border-none shadow-sm overflow-hidden bg-white group cursor-pointer hover:shadow-xl transition-all border border-gray-50">
      <div className="h-36 sm:h-48 relative">
        <img src={service.images?.[0] || 'https://images.unsplash.com/photo-1594398911514-18d49c7a98b5'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <Badge className="bg-white/90 text-primary border-none shadow-sm font-black text-[9px] sm:text-[10px] uppercase tracking-tighter backdrop-blur-md">
            {service.category}
          </Badge>
        </div>
      </div>
      <CardContent className="p-3.5 sm:p-5 space-y-3 sm:space-y-4">
        <div>
          <h4 className="font-black text-gray-900 leading-tight line-clamp-1 text-sm sm:text-base">{service.name}</h4>
          <div className="flex items-center gap-1 mt-1">
             <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-yellow-400" />
             <span className="text-[11px] sm:text-xs font-black text-gray-900">{service.averageRating || 4.6}</span>
             <span className="text-[9px] sm:text-[10px] font-bold text-gray-400">({service.totalReviews || 128})</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-base sm:text-lg font-black text-gray-900">{formatIndianCurrency(Number(service.price))}</p>
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ {service.rate_type?.toLowerCase().replace('_', ' ')}</p>
          </div>
          <div className="text-right">
             <p className="text-[9px] sm:text-[10px] font-bold text-primary bg-primary/5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">{(service.distance / 1).toFixed(1)} km</p>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}

function BookingItem({ booking }: any) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-50 flex items-center justify-center text-primary shrink-0">
          <Tractor className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <p className="font-black text-gray-900 text-xs sm:text-sm truncate">{booking.service.name}</p>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase">{format(new Date(booking.bookingDate), 'dd MMM')}</span>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400">{booking.startTime}</span>
          </div>
        </div>
      </div>
      <Badge variant={booking.status === 'CONFIRMED' ? 'success' : 'warning'} className="font-black text-[8px] sm:text-[9px] uppercase tracking-tighter shrink-0">
        {booking.status}
      </Badge>
    </div>
  );
}
