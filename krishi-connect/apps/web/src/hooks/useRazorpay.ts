import { useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface PaymentOptions {
  amount: number;
  bookingId?: string;
  orderId?: string;
  description?: string;
  onSuccess: (data: any) => void;
  onError?: (error: any) => void;
}

export function useRazorpay() {
  const processingRef = useRef(false);

  const initiatePayment = useCallback(async (options: PaymentOptions) => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please check your internet connection.');
        processingRef.current = false;
        return;
      }

      // Create Razorpay order on server
      const { data: rpData } = await api.post('/payments/create-order', {
        amount: options.amount,
        bookingId: options.bookingId,
        orderId: options.orderId,
      });

      const orderData = rpData.data;
      const user = useAuthStore.getState().user;

      const rzpOptions = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Krishi Connect',
        description: options.description || 'Payment',
        order_id: orderData.id,
        prefill: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#166534',
        },
        handler: async (response: any) => {
          try {
            // Verify payment on server
            const { data: verifyData } = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            options.onSuccess(verifyData.data);
          } catch (err: any) {
            toast.error('Payment verification failed. Contact support if amount was deducted.');
            options.onError?.(err);
          } finally {
            processingRef.current = false;
          }
        },
        modal: {
          ondismiss: () => {
            processingRef.current = false;
            toast.error('Payment cancelled');
            options.onError?.({ message: 'Payment cancelled by user' });
          },
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.on('payment.failed', (response: any) => {
        processingRef.current = false;
        toast.error(response.error?.description || 'Payment failed');
        options.onError?.(response.error);
      });
      rzp.open();
    } catch (err: any) {
      processingRef.current = false;
      toast.error(err.response?.data?.error || 'Could not initiate payment');
      options.onError?.(err);
    }
  }, []);

  return { initiatePayment };
}
