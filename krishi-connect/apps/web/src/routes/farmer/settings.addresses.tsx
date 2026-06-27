import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  ChevronLeft, 
  MapPin, 
  Plus, 
  Trash2,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/farmer/settings/addresses')({
  component: FarmerAddressesPage,
});

function FarmerAddressesPage() {
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['farmer-addresses'],
    queryFn: async () => (await api.get('/farmer/addresses')).data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/farmer/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-addresses'] });
      toast.success('Address deleted');
    }
  });

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link to="/farmer/settings"><ChevronLeft className="w-6 h-6" /></Link>
           </Button>
           <h1 className="text-2xl font-black text-gray-900 tracking-tight">Saved Addresses</h1>
        </div>
        <Button className="rounded-2xl bg-primary hover:bg-primary-dark font-black uppercase text-[10px] tracking-widest h-10 px-6 shadow-lg shadow-primary/20">
           <Plus className="w-4 h-4 mr-2" /> Add New
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-[2rem] w-full" />)
        ) : (addresses || []).length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
             <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-4" />
             <p className="font-bold text-gray-400">No saved addresses found</p>
          </div>
        ) : (
          addresses.map((addr: any) => (
            <Card key={addr.id} className="rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-white border border-gray-50">
              <CardContent className="p-6 flex items-start gap-6">
                 <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    {addr.isDefault ? <Home className="w-6 h-6" /> : <MapPin className="w-6 h-6 text-gray-300" />}
                 </div>
                 
                 <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                       <h3 className="font-black text-gray-900">{addr.name}</h3>
                       {addr.isDefault && <Badge variant="success" className="font-black text-[9px] uppercase tracking-tighter">Default</Badge>}
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                       {addr.addressLine},<br />
                       {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-xs font-bold text-gray-400 pt-1">+91 {addr.phone}</p>
                 </div>

                 <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-300 hover:text-primary"><Trash2 className="w-4 h-4" onClick={() => { if(confirm('Delete address?')) deleteMutation.mutate(addr.id) }} /></Button>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
