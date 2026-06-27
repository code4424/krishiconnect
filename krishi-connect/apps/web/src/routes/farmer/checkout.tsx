import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  MapPin,
  Smartphone,
  CreditCard,
  Banknote,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Plus,
  Check
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatIndianCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRazorpay } from '@/hooks/useRazorpay';

export const Route = createFileRoute('/farmer/checkout')({
  component: CheckoutPage,
});

function CheckoutPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { items, clearCart, getSubtotal, getItemCount } = useCartStore();
  
  const [paymentMethod, setPaymentMethod] = useState<'UPI_ONLINE' | 'CARD' | 'CASH'>('UPI_ONLINE');
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Form State for new address
  const [newAddress, setNewAddress] = useState({
    name: `${user?.firstName} ${user?.lastName}`,
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || ''
  });

  const { data: addresses, isLoading: _addrLoading } = useQuery({
    queryKey: ['farmer-addresses'],
    queryFn: async () => (await api.get('/farmer/addresses')).data.data,
  });

  const { data: platformSettings } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => (await api.get('/farmer/platform-settings')).data.data,
  });

  // Validate cart items still exist in the database
  const { removeItem: removeCartItem } = useCartStore();
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
        invalidItems.forEach((id) => removeCartItem(id));
        toast.error('Some items in your cart are no longer available and have been removed.');
      }
    };
    if (items.length > 0) validateCart();
  }, []);

  useEffect(() => {
    if (addresses?.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [addresses]);

  const { initiatePayment } = useRazorpay();
  const [isProcessing, setIsProcessing] = useState(false);

  const addAddressMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/farmer/addresses', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['farmer-addresses'] });
      setSelectedAddress(res.data.data);
      setIsAddModalOpen(false);
      setIsAddressModalOpen(false);
      toast.success('Address added and selected');
    }
  });

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      return toast.error('Please select a delivery address');
    }

    if (items.length === 0) {
      return toast.error('Your cart is empty');
    }

    setIsProcessing(true);
    const idempotencyKey = window.crypto.randomUUID();

    try {
      // Step 1: Create the order
      const res = await api.post('/farmer/orders', {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
        deliveryAddress: {
          name: selectedAddress.name,
          address: selectedAddress.addressLine,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          phone: selectedAddress.phone
        }
      }, {
        headers: { 'X-Idempotency-Key': idempotencyKey }
      });

      const order = res.data.data;

      // Step 2: If online payment, open Razorpay
      if (paymentMethod !== 'CASH') {
        initiatePayment({
          amount: Number(order.totalAmount),
          orderId: order.id,
          description: `Order #${order.orderId}`,
          onSuccess: () => {
            setConfirmedOrder(order);
            clearCart();
            toast.success('Payment successful! Order placed.');
            setIsProcessing(false);
          },
          onError: () => {
            // Order is created but payment failed — user can retry from orders page
            toast.error('Payment failed. Your order is saved — you can retry payment later.');
            setConfirmedOrder(order);
            clearCart();
            setIsProcessing(false);
          }
        });
      } else {
        // Cash on delivery — order is done
        setConfirmedOrder(order);
        clearCart();
        toast.success('Order placed successfully!');
        setIsProcessing(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to place order');
      setIsProcessing(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-8 animate-in zoom-in-95 duration-500">
         <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
         </div>
         <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900">Your order is placed!</h1>
            <p className="text-gray-500 font-medium">Order ID: <span className="font-bold text-gray-900">#{confirmedOrder.orderId}</span></p>
         </div>

         <div className="flex flex-col gap-3 pt-6">
            <Button asChild className="h-14 rounded-2xl bg-primary hover:bg-primary-dark font-black uppercase tracking-widest shadow-xl">
               <Link to="/farmer/products">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" className="h-14 rounded-2xl border-primary text-primary font-black uppercase tracking-widest">
               <Link to="/farmer/orders">View My Orders</Link>
            </Button>
         </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
           <Link to="/farmer/cart"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            {/* Address Card */}
            <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
               <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Delivery Address
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    className="text-sm font-black text-primary hover:bg-primary/5 rounded-xl"
                    onClick={() => setIsAddressModalOpen(true)}
                  >
                    Change
                  </Button>
               </CardHeader>
               <CardContent className="p-6">
                  {selectedAddress ? (
                    <div className="space-y-1">
                      <p className="font-black text-gray-900">{selectedAddress.name}</p>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">
                         {selectedAddress.addressLine},<br />
                         {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                      </p>
                      <p className="text-sm text-gray-900 font-bold pt-2">+91 {selectedAddress.phone}</p>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                       <p className="text-gray-400 font-bold mb-4">No address selected</p>
                       <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl bg-gray-900">Add New Address</Button>
                    </div>
                  )}
               </CardContent>
            </Card>

            {/* Payment Options */}
            <div className="space-y-4">
                <h2 className="text-xl font-black text-gray-900 pl-2 tracking-tight">Select Payment Method</h2>
                <div className="grid grid-cols-1 gap-4">
                   <PaymentOption 
                     icon={<Smartphone />} 
                     title="UPI / Online" 
                     desc="Fast & Secure UPI payment" 
                     selected={paymentMethod === 'UPI_ONLINE'} 
                     onSelect={() => setPaymentMethod('UPI_ONLINE')} 
                   />
                   <PaymentOption 
                     icon={<CreditCard />} 
                     title="Card Payment" 
                     desc="Debit/Credit Cards" 
                     selected={paymentMethod === 'CARD'} 
                     onSelect={() => setPaymentMethod('CARD')} 
                   />
                   <PaymentOption 
                     icon={<Banknote />} 
                     title="Cash on Delivery" 
                     desc="Pay when your items arrive" 
                     selected={paymentMethod === 'CASH'} 
                     onSelect={() => setPaymentMethod('CASH')} 
                   />
                </div>
            </div>
         </div>

         {/* Summary Sticky Card */}
         <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white p-10 sticky top-28 overflow-hidden">
               <div className="space-y-8 relative z-10 text-gray-900">
                  <h3 className="font-black text-xl uppercase tracking-widest border-b border-gray-100 pb-4">Order Summary</h3>

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
                        <div className="flex justify-between font-bold text-gray-400 text-sm uppercase tracking-widest">
                          <span>Items ({getItemCount()})</span>
                          <span className="text-gray-900">{formatIndianCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-400 text-sm uppercase tracking-widest">
                          <span>Delivery</span>
                          <span className={cn(delivery === 0 ? "text-green-600" : "text-gray-900")}>
                            {delivery === 0 ? 'FREE' : formatIndianCurrency(delivery)}
                          </span>
                        </div>
                        {convenienceCharges > 0 && (
                          <div className="flex justify-between font-bold text-gray-400 text-sm uppercase tracking-widest">
                            <span>Convenience</span>
                            <span className="text-gray-900">{formatIndianCurrency(convenienceCharges)}</span>
                          </div>
                        )}
                        {platformChargesAmt > 0 && (
                          <div className="flex justify-between font-bold text-gray-400 text-sm uppercase tracking-widest">
                            <span>Platform Fee</span>
                            <span className="text-gray-900">{formatIndianCurrency(platformChargesAmt)}</span>
                          </div>
                        )}

                        <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                          <span className="font-black text-xs uppercase tracking-[0.3em]">Total Payable</span>
                          <span className="text-4xl font-black text-primary">{formatIndianCurrency(total)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !selectedAddress}
                    className="w-full h-16 rounded-2xl bg-primary hover:bg-primary-dark font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-primary/40 transition-all active:scale-95"
                  >
                     {isProcessing ? <Loader2 className="animate-spin w-6 h-6" /> : paymentMethod === 'CASH' ? 'Place Order' : 'Pay & Place Order'}
                  </Button>
               </div>
            </Card>
         </div>
      </div>

      {/* Address Selection Dialog */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-8">
           <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">Select Delivery Address</DialogTitle>
              <DialogDescription className="sr-only">Choose a delivery address for your order</DialogDescription>
           </DialogHeader>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
              {addresses?.map((addr: any) => (
                <div 
                  key={addr.id}
                  onClick={() => { setSelectedAddress(addr); setIsAddressModalOpen(false); }}
                  className={cn(
                    "p-5 rounded-3xl border-2 cursor-pointer transition-all relative group",
                    selectedAddress?.id === addr.id ? "border-primary bg-primary/5" : "border-gray-100 hover:border-primary/30"
                  )}
                >
                   {selectedAddress?.id === addr.id && (
                     <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                        <Check className="w-4 h-4" />
                     </div>
                   )}
                   <p className="font-black text-gray-900 text-sm mb-2">{addr.name}</p>
                   <p className="text-xs text-gray-500 font-medium leading-relaxed mb-3">
                      {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                   </p>
                   <p className="text-[10px] font-black text-gray-400">+91 {addr.phone}</p>
                </div>
              ))}
              
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="p-5 rounded-3xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                 <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Plus className="w-5 h-5" />
                 </div>
                 <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-primary">Add New</span>
              </button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Add Address Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-10">
           <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">New Delivery Address</DialogTitle>
              <DialogDescription className="sr-only">Add a new delivery address</DialogDescription>
           </DialogHeader>

           <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Full Name</Label>
                   <Input value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                   <Label>Phone Number</Label>
                   <Input value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                 <Label>Address Line</Label>
                 <Input value={newAddress.addressLine} onChange={(e) => setNewAddress({...newAddress, addressLine: e.target.value})} className="rounded-xl" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="rounded-xl" />
                 </div>
                 <div className="space-y-2">
                    <Label>State</Label>
                    <Input value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} className="rounded-xl" />
                 </div>
                 <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Input value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} className="rounded-xl" />
                 </div>
              </div>
              
              <Button 
                onClick={() => addAddressMutation.mutate(newAddress)}
                disabled={addAddressMutation.isPending}
                className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black font-black uppercase tracking-widest text-xs"
              >
                 {addAddressMutation.isPending ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Save & Select Address'}
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PaymentOption({ icon, title, desc, selected, onSelect }: any) {
   return (
      <div 
        onClick={onSelect}
        className={cn(
          "p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-6",
          selected ? "border-primary bg-white shadow-xl" : "border-gray-50 hover:border-primary/20 bg-white/50"
        )}
      >
         <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner", selected ? "bg-primary text-white" : "bg-gray-100 text-gray-400")}>
            {icon}
         </div>
         <div className="flex-1">
            <p className="font-black text-gray-900">{title}</p>
            <p className="text-xs font-medium text-gray-500">{desc}</p>
         </div>
         <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", selected ? "border-primary bg-primary" : "border-gray-200")}>
            {selected && <div className="w-2.5 h-2.5 rounded-full bg-white animate-in zoom-in duration-300" />}
         </div>
      </div>
   );
}
