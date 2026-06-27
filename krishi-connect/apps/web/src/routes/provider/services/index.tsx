import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { api } from '@/lib/api';
import { Plus, MapPin, Tag, Wrench, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatIndianCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export const Route = createFileRoute('/provider/services/')({
  component: ProviderServicesPage,
});

function ProviderServicesPage() {
  const queryClient = useQueryClient();
  const { data: services, isLoading } = useQuery({
    queryKey: ['provider-services'],
    queryFn: async () => (await api.get('/provider/services')).data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/provider/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      toast.success('Service deleted');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
        <Button asChild className="bg-primary hover:bg-primary-dark gap-2">
          <Link to="/provider/services/add"><Plus className="w-4 h-4" /> Add Service</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
        ) : (services || []).length === 0 ? (
          <Card className="col-span-full py-12 border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-gray-500">
              <Wrench className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold">No services listed yet.</p>
              <p className="text-sm">Start by adding your first agricultural service.</p>
            </CardContent>
          </Card>
        ) : (
          services.map((service: any) => (
            <Card key={service.id} className="overflow-hidden rounded-2xl border-none shadow-sm hover:shadow-md transition-all group">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={service.images?.[0] || 'https://images.unsplash.com/photo-1594398911514-18d49c7a98b5'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm">{service.category}</Badge>
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{service.name}</h3>
                    <p className="text-sm text-primary font-bold mt-1">
                      {formatIndianCurrency(Number(service.price))} 
                      <span className="text-gray-400 font-medium text-xs ml-1 capitalize">/ {service.rateType?.replace('_', ' ').toLowerCase()}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary" asChild>
                      <Link to="/provider/services/edit/$serviceId" params={{ serviceId: service.id }}><Edit className="w-4 h-4" /></Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                      onClick={() => { if(confirm('Delete this service?')) deleteMutation.mutate(service.id) }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{service.description}</p>
                
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 border-t pt-4">
                  <div className="flex items-center gap-1"><Tag className="w-3 h-3" /> {service.capacity || 'N/A'}</div>
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 25km Radius</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
