import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { api } from '@/lib/api';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatIndianCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export const Route = createFileRoute('/provider/products/')({
  component: ProviderProductsPage,
});

function ProviderProductsPage() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ['provider-products'],
    queryFn: async () => (await api.get('/provider/products')).data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/provider/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-products'] });
      toast.success('Product removed');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Marketplace</h1>
        <Button asChild className="bg-primary hover:bg-primary-dark gap-2">
          <Link to="/provider/products/add"><Plus className="w-4 h-4" /> Add Product</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)
        ) : (products || []).length === 0 ? (
          <Card className="col-span-full py-12 border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-gray-500">
              <Package className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold">No products found.</p>
              <p className="text-sm">List seeds, fertilizers, or tools for farmers.</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product: any) => (
            <Card key={product.id} className="overflow-hidden rounded-2xl border-none shadow-sm hover:shadow-md transition-all group">
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img 
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1589923188900-85dae523342b'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm text-[10px] uppercase font-bold">{product.category}</Badge>
                  <Badge variant={product.approvalStatus === 'APPROVED' ? 'success' : 'warning'} className="text-[9px] uppercase font-black tracking-tighter">
                    {product.approvalStatus}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                   <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                   <p className="text-lg font-black text-primary mt-0.5">{formatIndianCurrency(Number(product.price))}</p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-400 border-t pt-3">
                   <span>Stock: <span className="text-gray-900">{product.stock} {product.unit || 'Units'}</span></span>
                   <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-primary" asChild>
                         <Link to="/provider/products/edit/$productId" params={{ productId: product.id }}><Edit className="w-3.5 h-3.5" /></Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-gray-400 hover:text-red-500"
                        onClick={() => { if(confirm('Remove this product?')) deleteMutation.mutate(product.id) }}
                        disabled={deleteMutation.isPending}
                      >
                         <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
