import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Star,
  ShieldCheck,
  ArrowLeft,
  ShoppingCart,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { formatIndianCurrency } from '@/lib/formatters';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

export const Route = createFileRoute('/farmer/products/$productId')({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => (await api.get(`/farmer/products/${productId}`)).data.data,
  });

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      navigate({ to: '/farmer/cart' });
    }
  };

  if (isLoading) return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
       <Skeleton className="h-10 w-48 rounded-full" />
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-[3rem]" />
          <div className="space-y-6">
             <Skeleton className="h-12 w-3/4 rounded-2xl" />
             <Skeleton className="h-8 w-1/4 rounded-xl" />
             <Skeleton className="h-32 w-full rounded-3xl" />
          </div>
       </div>
    </div>
  );

  if (!product) return <div>Product not found</div>;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={() => navigate({ to: '/farmer/products' })}
        className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-primary transition-colors mb-8 group"
      >
        <div className="p-2 rounded-xl bg-gray-100 group-hover:bg-primary/10 group-hover:text-primary transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        BACK TO MARKETPLACE
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Image Gallery */}
        <div className="space-y-6">
          <div className="aspect-square rounded-[3rem] overflow-hidden bg-gray-100 shadow-2xl border-4 border-white">
            <img 
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1589923188900-85dae523342b'} 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" 
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
             {product.images?.slice(1, 5).map((img: string, i: number) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm hover:border-primary transition-all cursor-pointer">
                   <img src={img} className="w-full h-full object-cover" />
                </div>
             ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Badge className="bg-primary/5 text-primary border-none font-black text-[10px] tracking-widest px-3 py-1 uppercase">{product.category}</Badge>
               <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> In Stock</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-[1.1]">{product.name}</h1>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                  <span className="text-sm font-black text-gray-900">4.5</span>
               </div>
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest border-l pl-4 border-gray-100">128 Reviews</span>
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest border-l pl-4 border-gray-100">542 Sold</span>
            </div>
          </div>

          <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-white shadow-inner">
             <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Special Price</p>
             <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-gray-900 tracking-tighter">{formatIndianCurrency(Number(product.price))}</span>
                <span className="text-lg font-bold text-gray-400 line-through">₹{Number(product.price) + 200}</span>
                <Badge className="bg-green-500 text-white border-none rounded-lg font-black text-xs">Save ₹200</Badge>
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">About Product</h3>
             <p className="text-gray-600 leading-relaxed font-medium">{product.description}</p>
          </div>

          <div className="flex flex-col gap-6">
             <div className="flex items-center gap-6">
                <div className="space-y-2 flex-1">
                   <Label className="text-xs font-black uppercase text-gray-400 tracking-widest">Quantity</Label>
                   <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 w-fit">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors font-black">-</button>
                      <span className="font-black w-8 text-center">{quantity}</span>
                      <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors font-black">+</button>
                   </div>
                </div>
                
                <div className="space-y-2 flex-[2]">
                   <Label className="text-xs font-black uppercase text-gray-400 tracking-widest">Seller</Label>
                   <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">{product.providerName?.charAt(0) || 'S'}</div>
                      <div>
                         <p className="text-sm font-black text-gray-900 leading-none">{product.providerName || 'Verified Seller'}</p>
                         <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 mt-1">Visit Store <ChevronRight className="w-3 h-3" /></p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex gap-4">
                <Button 
                   onClick={handleAddToCart}
                   variant="outline" 
                   className="flex-1 h-16 rounded-[1.5rem] border-2 border-primary text-primary font-black uppercase tracking-widest text-xs gap-3 hover:bg-primary/5 active:scale-95 transition-all"
                >
                   <ShoppingCart className="w-5 h-5" /> Add to Cart
                </Button>
                <Button 
                   onClick={handleBuyNow}
                   className="flex-[2] h-16 rounded-[1.5rem] bg-primary hover:bg-primary-dark shadow-xl shadow-primary/20 text-white font-black uppercase tracking-widest text-xs gap-3 active:scale-95 transition-all"
                >
                   Buy Now <ArrowRight className="w-5 h-5" />
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
