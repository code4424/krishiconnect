import { createFileRoute, Link } from '@tanstack/react-router';
import { useCartStore } from '@/stores/cartStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatIndianCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const Route = createFileRoute('/farmer/cart')({
  component: CartPage,
});

function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getItemCount
  } = useCartStore();

  const { data: platformSettings } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => (await api.get('/farmer/platform-settings')).data.data,
  });

  // Validate cart items still exist in the database
  useEffect(() => {
    const validateCart = async () => {
      const invalidItems: string[] = [];
      for (const item of items) {
        try {
          await api.get(`/farmer/products/${item.productId}`);
        } catch {
          console.warn('Failed to validate cart item:', item.productId);
          invalidItems.push(item.productId);
        }
      }
      if (invalidItems.length > 0) {
        invalidItems.forEach((id) => removeItem(id));
        toast.error('Some items are no longer available and have been removed from your cart.');
      }
    };
    if (items.length > 0) validateCart();
  }, []);

  const count = getItemCount();

  if (count === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 space-y-6">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
           <ShoppingCart className="w-16 h-16" />
        </div>
        <div className="text-center space-y-2">
           <h1 className="text-2xl font-black text-gray-900">Your cart is empty</h1>
           <p className="text-gray-500 font-medium">Looks like you haven't added any products yet.</p>
        </div>
        <Button asChild className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary-dark font-black uppercase tracking-widest">
           <Link to="/farmer/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
               <Link to="/farmer/products"><ChevronLeft className="w-6 h-6" /></Link>
            </Button>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Cart <span className="text-gray-400">({count})</span></h1>
         </div>
         <button onClick={clearCart} className="text-sm font-bold text-red-500 hover:underline tracking-tight">Remove All</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.productId} className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white group hover:shadow-xl transition-all">
                <CardContent className="p-6 flex items-center gap-6">
                   <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-gray-100 shadow-inner">
                      <img src={item.image} className="w-full h-full object-cover" />
                   </div>
                   
                   <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                         <h3 className="font-black text-gray-900 line-clamp-1">{item.name}</h3>
                         <button onClick={() => removeItem(item.productId)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                         <p className="font-black text-primary text-lg">{formatIndianCurrency(item.price)}</p>
                         
                         <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100 shadow-inner">
                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:text-primary transition-all"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="w-6 text-center font-black text-sm text-gray-900">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:text-primary transition-all"><Plus className="w-3.5 h-3.5" /></button>
                         </div>
                      </div>
                   </div>
                </CardContent>
              </Card>
            ))}
         </div>

         <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-gray-900 text-white p-10 sticky top-28 overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><ShoppingCart className="w-32 h-32" /></div>
               
               <div className="space-y-8 relative z-10">
                  <h3 className="font-black text-xl uppercase tracking-widest border-b border-white/10 pb-4">Order Summary</h3>

                  {(() => {
                     const subtotal = getSubtotal();
                     const deliveryFee = platformSettings?.deliveryFee ?? 0;
                     const freeThreshold = platformSettings?.freeDeliveryThreshold ?? 0;
                     const convenienceCharges = platformSettings?.convenienceCharges ?? 0;
                     const platformChargesAmt = platformSettings?.platformCharges ?? 0;
                     const delivery = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : deliveryFee;
                     const total = subtotal + delivery + convenienceCharges + platformChargesAmt;

                     return (
                       <div className="space-y-4">
                         <div className="flex justify-between font-bold text-white/50 text-sm uppercase tracking-widest">
                           <span>Subtotal</span>
                           <span className="text-white">{formatIndianCurrency(subtotal)}</span>
                         </div>
                         <div className="flex justify-between font-bold text-white/50 text-sm uppercase tracking-widest">
                           <span>Delivery</span>
                           <span className={cn(delivery === 0 ? "text-green-400" : "text-white")}>
                             {delivery === 0 ? 'FREE' : formatIndianCurrency(delivery)}
                           </span>
                         </div>
                         {convenienceCharges > 0 && (
                           <div className="flex justify-between font-bold text-white/50 text-sm uppercase tracking-widest">
                             <span>Convenience</span>
                             <span className="text-white">{formatIndianCurrency(convenienceCharges)}</span>
                           </div>
                         )}
                         {platformChargesAmt > 0 && (
                           <div className="flex justify-between font-bold text-white/50 text-sm uppercase tracking-widest">
                             <span>Platform Fee</span>
                             <span className="text-white">{formatIndianCurrency(platformChargesAmt)}</span>
                           </div>
                         )}

                         <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                           <span className="font-black text-xs uppercase tracking-[0.3em]">Total Amount</span>
                           <span className="text-4xl font-black">{formatIndianCurrency(total)}</span>
                         </div>
                       </div>
                     );
                  })()}

                  <Button asChild className="w-full h-16 rounded-2xl bg-primary hover:bg-primary-dark font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-primary/40 transition-all active:scale-95 group">
                     <Link to="/farmer/checkout">
                        Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                     </Link>
                  </Button>
               </div>
            </Card>

            {(() => {
               const freeThreshold = platformSettings?.freeDeliveryThreshold ?? 0;
               const deliveryFee = platformSettings?.deliveryFee ?? 0;
               if (freeThreshold > 0 && deliveryFee > 0 && getSubtotal() < freeThreshold) {
                 return (
                   <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                     <p className="text-[10px] font-black text-primary uppercase text-center leading-tight">
                       Add {formatIndianCurrency(freeThreshold - getSubtotal())} more to get <span className="text-green-600">FREE DELIVERY</span>
                     </p>
                   </div>
                 );
               }
               return null;
            })()}
         </div>
      </div>
    </div>
  );
}
