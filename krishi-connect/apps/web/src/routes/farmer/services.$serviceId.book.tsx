import { createFileRoute, useParams, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Banknote,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatIndianCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRazorpay } from '@/hooks/useRazorpay';

export const Route = createFileRoute('/farmer/services/$serviceId/book')({
  component: BookServicePage,
});

function BookServicePage() {
  const { serviceId } = useParams({ from: '/farmer/services/$serviceId/book' });
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [duration, setDuration] = useState('1 Hour');
  const [paymentMethod, setPaymentMethod] = useState<'UPI_ONLINE' | 'CARD' | 'CASH'>('UPI_ONLINE');
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const { data: service } = useQuery({
    queryKey: ['farmer-service', serviceId],
    queryFn: async () => (await api.get(`/farmer/services/${serviceId}`)).data.data,
  });

  const { data: availableSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ['available-slots', serviceId, selectedDate],
    queryFn: async () => (await api.get(`/farmer/services/${serviceId}/available-slots`, {
      params: { date: selectedDate?.toISOString() }
    })).data.data,
    enabled: !!selectedDate
  });

  const { initiatePayment } = useRazorpay();
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = useMemo(() => {
    if (!service) return 0;
    let multiplier = 1;
    if (duration === '2 Hours') multiplier = 2;
    if (duration === '3 Hours') multiplier = 3;
    if (duration === 'Half Day') multiplier = 4;
    if (duration === 'Full Day') multiplier = 8;
    return Number(service.price) * multiplier;
  }, [service, duration]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      // Step 1: Create the booking
      const res = await api.post('/farmer/bookings', {
        serviceId,
        bookingDate: selectedDate?.toISOString(),
        startTime: selectedTime,
        duration,
        paymentMethod
      });
      const booking = res.data.data;

      // Step 2: If online payment, open Razorpay
      if (paymentMethod !== 'CASH') {
        initiatePayment({
          amount: totalPrice,
          bookingId: booking.id,
          description: `Booking #${booking.bookingId} - ${service.name}`,
          onSuccess: () => {
            setConfirmedBooking(booking);
            setStep(4);
            toast.success('Payment successful! Booking confirmed.');
            setIsProcessing(false);
          },
          onError: () => {
            setConfirmedBooking(booking);
            setStep(4);
            toast.error('Payment failed. You can retry payment later.');
            setIsProcessing(false);
          }
        });
      } else {
        // Cash — booking is done
        setConfirmedBooking(booking);
        setStep(4);
        toast.success('Booking confirmed!');
        setIsProcessing(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Booking failed');
      setIsProcessing(false);
    }
  };

  if (step === 4 && confirmedBooking) {
    return (
      <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 text-center space-y-6 sm:space-y-8 animate-in zoom-in-95 duration-500">
         <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
         </div>
         <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Your booking is confirmed!</h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
                {service.name} • {format(selectedDate!, 'dd MMM yyyy')} • {selectedTime} • {duration}
            </p>
         </div>

         <Card className="rounded-2xl sm:rounded-[2.5rem] border-2 border-green-100 bg-green-50/30 overflow-hidden shadow-none">
            <CardContent className="p-5 sm:p-8 space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Booking ID</span>
                    <span className="font-black text-gray-900">#{confirmedBooking.bookingId}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs sm:text-sm">Total Amount</span>
                    <span className="text-xl sm:text-2xl font-black text-primary">{formatIndianCurrency(totalPrice)}</span>
                </div>
            </CardContent>
         </Card>

         <div className="flex flex-col gap-3">
            <Button asChild className="h-12 sm:h-14 rounded-2xl bg-primary hover:bg-primary-dark font-black uppercase tracking-widest shadow-xl shadow-primary/20 text-sm">
               <Link to="/farmer/dashboard">Go to Home</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 sm:h-14 rounded-2xl border-primary text-primary font-black uppercase tracking-widest text-sm">
               <Link to={`/farmer/bookings`}>View Booking</Link>
            </Button>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-3 sm:px-4 space-y-5 sm:space-y-8 pb-40 lg:pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(s => s - 1) : window.history.back()} className="rounded-full shrink-0 w-9 h-9 sm:w-10 sm:h-10">
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Book Service</h1>
          <div className="flex gap-2 mt-1">
             {[1, 2, 3].map((s) => (
                <div key={s} className={cn("h-1.5 rounded-full transition-all", step === s ? "w-8 bg-primary" : "w-4 bg-gray-200")} />
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="space-y-6 sm:space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest text-xs">
                       <CalendarIcon className="w-4 h-4 text-primary" /> Select Date
                    </h3>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-2xl sm:rounded-3xl border shadow-xl p-2 sm:p-4 bg-white w-full [&_table]:w-full"
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                    />
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest text-xs">
                       <Clock className="w-4 h-4 text-primary" /> Select Time
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-2 gap-2 sm:gap-3">
                       {slotsLoading ? (
                          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11 sm:h-12 rounded-xl sm:rounded-2xl" />)
                       ) : (availableSlots || []).map((slot: any) => (
                          <button
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={cn(
                                "h-11 sm:h-12 rounded-xl sm:rounded-2xl border-2 font-black text-[11px] sm:text-xs transition-all",
                                !slot.available ? "opacity-30 cursor-not-allowed bg-gray-50 border-gray-100" :
                                selectedTime === slot.time ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" : "bg-white border-gray-100 text-gray-600 hover:border-primary/50"
                            )}
                          >
                            {slot.time}
                          </button>
                       ))}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {step === 2 && (
             <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right-4 duration-500">
                <Card className="rounded-2xl sm:rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
                   <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                      <div className="flex gap-4 sm:gap-6 items-center">
                         <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg shrink-0 ring-2 sm:ring-4 ring-gray-50">
                            <img src={service?.images?.[0]} className="w-full h-full object-cover" />
                         </div>
                         <div className="min-w-0">
                            <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] sm:text-[10px] uppercase tracking-widest mb-1">{service?.category}</Badge>
                            <h2 className="text-lg sm:text-2xl font-black text-gray-900 truncate">{service?.name}</h2>
                            <p className="font-bold text-primary text-sm sm:text-base">{formatIndianCurrency(Number(service?.price))} / {service?.rateType?.replace('_', ' ')}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-5 sm:pt-8 border-t">
                         <div className="space-y-1">
                            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Booking Date</p>
                            <p className="font-black text-gray-900 text-sm sm:text-base">{format(selectedDate!, 'dd MMMM, yyyy')}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Start Time</p>
                            <p className="font-black text-gray-900 text-sm sm:text-base">{selectedTime}</p>
                         </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                         <Label className="text-xs font-black uppercase text-gray-400 tracking-widest">Service Duration</Label>
                         <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                            {['1 Hour', '2 Hours', '3 Hours', 'Half Day', 'Full Day'].map((d) => (
                               <button
                                 key={d}
                                 onClick={() => setDuration(d)}
                                 className={cn(
                                    "px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 text-[10px] font-black transition-all uppercase tracking-tighter",
                                    duration === d ? "bg-primary border-primary text-white shadow-lg" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"
                                 )}
                               >
                                 {d}
                               </button>
                            ))}
                         </div>
                      </div>
                   </CardContent>
                </Card>
             </div>
          )}

          {step === 3 && (
             <div className="space-y-5 sm:space-y-8 animate-in slide-in-from-right-4 duration-500">
                <h2 className="text-lg sm:text-xl font-black text-gray-900">Select Payment Method</h2>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                   <PaymentOption
                     id="UPI_ONLINE"
                     icon={<Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />}
                     title="UPI / Online"
                     desc="Pay securely using Google Pay, PhonePe, or BHIM"
                     selected={paymentMethod === 'UPI_ONLINE'}
                     onSelect={() => setPaymentMethod('UPI_ONLINE')}
                   />
                   <PaymentOption
                     id="CARD"
                     icon={<CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />}
                     title="Debit / Credit Card"
                     desc="All major domestic and international cards accepted"
                     selected={paymentMethod === 'CARD'}
                     onSelect={() => setPaymentMethod('CARD')}
                   />
                   <PaymentOption
                     id="CASH"
                     icon={<Banknote className="w-5 h-5 sm:w-6 sm:h-6" />}
                     title="Cash on Delivery"
                     desc="Pay directly to the provider after service completion"
                     selected={paymentMethod === 'CASH'}
                     onSelect={() => setPaymentMethod('CASH')}
                   />
                </div>
             </div>
          )}
        </div>

        {/* Sidebar Summary — hidden on mobile, shown on lg */}
        <div className="hidden lg:block space-y-6">
           <Card className="rounded-[2.5rem] border-none shadow-2xl bg-[#166534] text-white overflow-hidden p-8 sticky top-28">
              <div className="space-y-6">
                 <h3 className="font-black text-lg uppercase tracking-widest border-b border-white/10 pb-4">Order Summary</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold text-white/60">
                       <span>Service Cost</span>
                       <span className="text-white">{formatIndianCurrency(Number(service?.price))}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-white/60">
                       <span>Duration</span>
                       <span className="text-white">{duration}</span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                       <span className="font-black text-white uppercase tracking-widest text-xs">Total Amount</span>
                       <span className="text-3xl font-black">{formatIndianCurrency(totalPrice)}</span>
                    </div>
                 </div>

                 <Button
                   onClick={() => step < 3 ? setStep(s => s + 1) : handleConfirm()}
                   disabled={!selectedTime || isProcessing}
                   className="w-full h-16 rounded-2xl bg-white text-primary hover:bg-gray-100 font-black text-lg uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:bg-white/20 disabled:text-white/40"
                 >
                    {isProcessing ? <Loader2 className="animate-spin" /> : step < 3 ? 'Continue' : 'Confirm & Pay'}
                 </Button>
              </div>
           </Card>

           <p className="text-[10px] text-gray-400 font-bold uppercase text-center px-4 leading-relaxed">
              By confirming, you agree to our Terms of Service and Privacy Policy. Secure payments powered by Razorpay.
           </p>
        </div>
      </div>

      {/* Mobile Bottom Bar — fixed at bottom on small screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 sm:p-4 z-50 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
            <p className="text-xl font-black text-gray-900">{formatIndianCurrency(totalPrice)}</p>
            <p className="text-[10px] font-bold text-gray-400">{duration}</p>
          </div>
          <Button
            onClick={() => step < 3 ? setStep(s => s + 1) : handleConfirm()}
            disabled={!selectedTime || isProcessing}
            className="h-12 sm:h-14 px-6 sm:px-10 rounded-xl sm:rounded-2xl bg-primary font-black uppercase tracking-widest text-xs sm:text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-40"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : step < 3 ? 'Continue' : 'Confirm & Pay'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({ id: _id, icon, title, desc, selected, onSelect }: any) {
   return (
      <div
        onClick={onSelect}
        className={cn(
          "p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-4 sm:gap-6",
          selected ? "border-primary bg-green-50/50 shadow-xl" : "border-gray-100 hover:border-primary/20"
        )}
      >
         <div className={cn("w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors shrink-0", selected ? "bg-primary text-white" : "bg-gray-50 text-gray-400")}>
            {icon}
         </div>
         <div className="flex-1 min-w-0">
            <p className="font-black text-gray-900 text-sm sm:text-base">{title}</p>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500 truncate">{desc}</p>
         </div>
         <div className={cn("w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0", selected ? "border-primary bg-primary" : "border-gray-200")}>
            {selected && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white animate-in zoom-in duration-300" />}
         </div>
      </div>
   );
}
