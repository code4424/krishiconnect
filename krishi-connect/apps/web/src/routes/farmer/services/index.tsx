import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useLocationStore } from '@/stores/locationStore';
import { 
  Search, 
  Filter, 
  Map as MapIcon, 
  List, 
  Star, 
  MapPin, 
  ChevronRight,
  Heart,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatIndianCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Skeleton } from '@/components/ui/skeleton';
import { farmerIcon, createPriceIcon } from '@/components/maps/utils/icons';

export const Route = createFileRoute('/farmer/services/')({
  component: ServicesDiscoveryPage,
});

function ServicesDiscoveryPage() {
  const { lat, lng, address, isPermissionDenied, requestCurrentLocation } = useLocationStore();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  const categories = ['ALL', 'TRACTOR', 'LABOR', 'EQUIPMENT', 'IRRIGATION', 'HARVESTING', 'SPRAYING'];

  const { data: services, isLoading } = useQuery({
    queryKey: ['farmer-services', lat, lng, category, search],
    queryFn: async () => {
      const res = await api.get('/farmer/services', {
        params: { lat, lng, category, search, radius: 50 }
      });
      return res.data;
    }
  });

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Discovery Header */}
      <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100 flex flex-col gap-4 sm:gap-6 shrink-0">
        
        {isPermissionDenied && (
          <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
               <AlertCircle className="w-5 h-5 text-orange-600" />
               <p className="text-sm font-bold text-orange-900 leading-tight">Turn on current location to get the accurate distance and nearby results.</p>
            </div>
            <Button size="sm" onClick={() => requestCurrentLocation()} className="bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl h-8 shrink-0">
               Enable GPS
            </Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Explore Services</h1>
            <p className="text-xs font-bold text-primary flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> Showing results near {address}
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit self-end sm:self-auto">
            <button 
              onClick={() => setViewMode('list')}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all", viewMode === 'list' ? "bg-white text-primary shadow-sm" : "text-gray-400")}
            >
              <List className="w-4 h-4" /> LIST
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all", viewMode === 'map' ? "bg-white text-primary shadow-sm" : "text-gray-400")}
            >
              <MapIcon className="w-4 h-4" /> MAP
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <Input
               placeholder="Search John Deere, Mahindra, Skilled labor..."
               className="pl-11 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-gray-50 border-none placeholder:text-gray-400 font-medium text-sm"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
          <Button variant="outline" className="h-10 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl gap-2 font-bold text-gray-600 text-sm">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>

        {/* Category Filter Bar */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black whitespace-nowrap transition-all uppercase tracking-wider sm:tracking-widest",
                category === cat
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                  : "bg-white border border-gray-100 text-gray-400 hover:border-primary/50"
              )}
            >
              {cat.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 relative">
        {viewMode === 'list' ? (
          <div className="h-full overflow-y-auto p-3 sm:p-4 lg:p-8 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {isLoading ? (
               Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 sm:h-40 rounded-2xl sm:rounded-3xl w-full" />)
            ) : services?.data?.length === 0 ? (
               <div className="text-center py-12 sm:py-20 bg-gray-50 rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-gray-100 px-4 sm:px-6">
                  <div className="bg-white w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-gray-200/50">
                     <Search className="w-7 h-7 sm:w-10 sm:h-10 text-gray-200" />
                  </div>
                  <h3 className="font-black text-lg sm:text-2xl text-gray-900 tracking-tight">Nearby services not available</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-xs mx-auto font-medium">We couldn't find any services in your area. Try expanding your search radius or changing your village pincode.</p>
                  <Button onClick={() => requestCurrentLocation()} variant="outline" size="sm" className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest border-primary text-primary hover:bg-primary/5 px-6 sm:px-8">
                     Reset Location
                  </Button>
               </div>
            ) : (
              services?.data?.map((service: any) => (
                <ServiceListItem key={service.id} service={service} />
              ))
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col lg:flex-row overflow-hidden">
             {/* Map Component */}
             <div className="flex-1 h-[400px] lg:h-full z-10 border-r border-gray-100">
               <MapContainer center={[lat, lng]} zoom={12} className="h-full w-full">
                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                 <Marker position={[lat, lng]} icon={farmerIcon}>
                    <Popup>Your Location</Popup>
                 </Marker>
                 <MarkerClusterGroup>
                   {(services?.data || []).map((s: any) => (
                     <Marker key={s.id} position={[s.latitude, s.longitude]} icon={createPriceIcon(Number(s.price).toLocaleString('en-IN'))}>
                        <Popup className="rounded-2xl">
                           <div className="p-1 space-y-2 min-w-[150px]">
                              <h4 className="font-black text-xs">{s.name}</h4>
                              <p className="text-[10px] font-bold text-primary">{formatIndianCurrency(Number(s.price))}</p>
                              <Button asChild size="sm" className="h-7 w-full text-[9px] rounded-lg font-black uppercase">
                                <Link to="/farmer/services/$serviceId" params={{ serviceId: s.id }}>View</Link>
                              </Button>
                           </div>
                        </Popup>
                     </Marker>
                   ))}
                 </MarkerClusterGroup>
               </MapContainer>
             </div>
             {/* Side Panel for Map */}
             <div className="w-full lg:w-96 bg-gray-50 h-full overflow-y-auto p-4 space-y-4 shadow-2xl z-20">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{services?.data?.length || 0} results found</p>
                {(services?.data || []).map((s: any) => (
                   <Link key={s.id} to="/farmer/services/$serviceId" params={{ serviceId: s.id }} className="block bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                      <div className="flex gap-3">
                         <img src={s.images?.[0]} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                         <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm text-gray-900 truncate">{s.name}</h5>
                            <p className="text-[10px] text-gray-500 font-medium">{s.providerName}</p>
                            <div className="flex items-center justify-between mt-1">
                               <p className="text-xs font-black text-primary">{formatIndianCurrency(Number(s.price))}</p>
                               <span className="text-[9px] font-bold text-gray-400 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {(s.distance / 1).toFixed(1)} km</span>
                            </div>
                         </div>
                      </div>
                   </Link>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceListItem({ service }: any) {
  return (
    <Card className="rounded-2xl sm:rounded-3xl border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-white border border-gray-50">
      <CardContent className="p-0 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:gap-6">
          {/* Image — full width on mobile, fixed width on desktop */}
          <div className="w-full h-44 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-none sm:rounded-2xl overflow-hidden shrink-0">
            <img
              src={service.images?.[0] || 'https://images.unsplash.com/photo-1594398911514-18d49c7a98b5'}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between p-4 sm:p-0 sm:py-1">
            <div className="space-y-1.5 sm:space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">{service.category}</span>
                <button className="text-gray-300 hover:text-red-500 transition-colors"><Heart className="w-4 h-4 sm:w-5 sm:h-5" /></button>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900 leading-tight">{service.name}</h3>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-[11px] sm:text-xs font-black text-gray-900">{service.averageRating || 4.6}</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-gray-400">({service.totalReviews || 128})</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-gray-400">
                  <MapPin className="w-3 h-3" /> {(service.distance / 1).toFixed(1)} km away
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 sm:mt-4">
              <div>
                <p className="text-lg sm:text-xl font-black text-gray-900">{formatIndianCurrency(Number(service.price))}</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ {service.rate_type?.toLowerCase().replace('_', ' ')}</p>
              </div>
              <Button asChild size="sm" className="rounded-xl px-4 sm:px-6 font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-lg shadow-primary/20 h-9 sm:h-10">
                <Link to="/farmer/services/$serviceId" params={{ serviceId: service.id }}>View Details <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
