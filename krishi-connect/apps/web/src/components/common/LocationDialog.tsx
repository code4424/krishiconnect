import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Loader2, Check } from 'lucide-react';
import { useLocationStore } from '@/stores/locationStore';
import { toast } from 'sonner';

export function LocationDialog({ children }: { children: React.ReactNode }) {
  const { address, pincode, requestCurrentLocation, updateByPincode } = useLocationStore();
  const [pc, setPc] = useState(pincode);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCurrentLocation = async () => {
    setLoading(true);
    await requestCurrentLocation();
    setLoading(false);
    setOpen(false);
    toast.success('Location updated to current position');
  };

  const handlePincodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pc.length !== 6) {
      return toast.error('Please enter a valid 6-digit pincode');
    }
    setLoading(true);
    try {
      await updateByPincode(pc);
      setOpen(false);
      toast.success(`Location updated to ${pc}`);
    } catch (error) {
      toast.error('Could not find location for this pincode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
             <MapPin className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl font-black text-center text-gray-900 tracking-tight">Your Location</DialogTitle>
          <p className="text-center text-sm font-medium text-gray-500">Find agricultural services and products nearest to you.</p>
        </DialogHeader>

        <div className="py-6 space-y-6">
           <Button 
             onClick={handleCurrentLocation}
             variant="outline" 
             className="w-full h-16 rounded-2xl border-2 border-primary/20 hover:border-primary hover:bg-primary/5 group transition-all flex items-center justify-between px-6"
             disabled={loading}
           >
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5 fill-primary" />}
                </div>
                <div className="text-left">
                   <p className="text-sm font-black text-gray-900 leading-none">Use Current Location</p>
                   <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Recommended</p>
                </div>
             </div>
             <Check className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
           </Button>

           <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em] text-gray-300"><span className="bg-white px-4">Or Enter Pincode</span></div>
           </div>

           <form onSubmit={handlePincodeSubmit} className="space-y-4">
              <div className="relative">
                 <Input 
                   placeholder="Enter 6-digit pincode" 
                   value={pc}
                   onChange={(e) => setPc(e.target.value)}
                   className="h-16 rounded-2xl bg-gray-50 border-none pl-6 text-lg font-black tracking-widest placeholder:text-gray-300 placeholder:tracking-normal focus-visible:ring-primary/20"
                   maxLength={6}
                 />
                 <Button 
                   type="submit" 
                   className="absolute right-2 top-2 bottom-2 rounded-xl bg-gray-900 hover:bg-black font-black text-[10px] uppercase tracking-widest px-6"
                   disabled={loading || pc.length !== 6}
                 >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set'}
                 </Button>
              </div>
           </form>
        </div>

        <div className="p-4 bg-gray-50 rounded-2xl border border-white flex gap-3 items-start">
           <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-primary" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Current Active Area</p>
              <p className="text-sm font-black text-gray-900">{address}</p>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
