import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface RazorpayCheckoutProps {
  amount: number;
  bookingId?: string;
  orderId?: string;
  onSuccess: (data: any) => void;
  children: React.ReactNode;
}

export function RazorpayCheckout({ amount, bookingId, orderId, onSuccess, children }: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // 1. Create order on server
      const { data } = await api.post('/payments/create-order', {
        amount,
        bookingId,
        orderId
      });

      const options = {
        key: data.data.key,
        amount: data.data.amount,
        currency: data.data.currency,
        name: 'Krishi Connect',
        description: 'Agricultural Services Payment',
        order_id: data.data.id,
        handler: async (response: any) => {
          try {
            // 2. Verify on server
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              onSuccess(verifyRes.data.data);
            }
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#166534'
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error('Could not initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={handlePayment} className="w-full">
      {loading ? (
         <Button className="w-full h-14 rounded-2xl" disabled>
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Initializing...
         </Button>
      ) : children}
    </div>
  );
}
