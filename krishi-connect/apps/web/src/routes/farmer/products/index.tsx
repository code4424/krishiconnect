import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Search, 
  Filter, 
  Star,
  Package
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatIndianCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/farmer/products/')({
  component: FarmerProductsPage,
});

function FarmerProductsPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const categories = ['ALL', 'SEEDS', 'FERTILIZERS', 'PESTICIDES', 'TOOLS', 'IRRIGATION', 'EQUIPMENT'];

  const { data: products, isLoading } = useQuery({
    queryKey: ['farmer-products', category, search, page],
    queryFn: async () => {
      const res = await api.get('/farmer/products', {
        params: { category, search, page, limit: 12 }
      });
      return res.data;
    }
  });

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Agricultural Marketplace</h1>
          <Button variant="outline" className="rounded-2xl gap-2 font-bold text-gray-600 h-12 px-6">
            <Filter className="w-4 h-4" /> {t('common.filters')}
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search seeds, fertilizers, high-quality tools..." 
            className="pl-11 h-14 rounded-2xl bg-white border-gray-100 shadow-sm placeholder:text-gray-400 font-medium text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all uppercase tracking-widest",
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[400px] rounded-3xl w-full" />)
        ) : products?.data?.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
             <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
             <h3 className="font-black text-gray-900">No products found</h3>
             <p className="text-gray-500">Try adjusting your category or search term.</p>
          </div>
        ) : (
          products.data.map((product: any) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={() => {
                addItem(product);
                toast.success(`${product.name} added to cart`);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart }: any) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Card className="rounded-[2rem] border-none shadow-sm hover:shadow-2xl transition-all group overflow-hidden bg-white border border-gray-50 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to="/farmer/products/$productId" params={{ productId: product.id }}>
           <img 
             src={product.images?.[0] || 'https://images.unsplash.com/photo-1589923188900-85dae523342b'} 
             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
           />
        </Link>
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/90 text-primary border-none shadow-sm font-black text-[10px] uppercase tracking-tighter backdrop-blur-md">
            {product.category}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 flex flex-col flex-1 gap-4">
        <div className="flex-1 space-y-1">
          <Link to="/farmer/products/$productId" params={{ productId: product.id }}>
            <h3 className="font-black text-gray-900 leading-tight line-clamp-2 group-hover:text-primary transition-colors h-10">{product.name}</h3>
          </Link>
          <div className="flex items-center gap-1.5">
             <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">4.5 (86)</span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-2xl font-black text-gray-900 tracking-tighter">{formatIndianCurrency(Number(product.price))}</p>
          <Button 
            onClick={handleAdd}
            className={cn(
                "w-full h-12 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg transition-all active:scale-95",
                isAdded ? "bg-green-600 hover:bg-green-600" : "bg-primary hover:bg-primary-dark shadow-primary/20"
            )}
          >
            {isAdded ? 'Added ✓' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
