import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid phone number'),
  farmSize: z.coerce.number().min(0, 'Farm size must be positive').optional(),
  farmAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional().or(z.literal('')),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});
import { ChevronLeft, Loader2, Save, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useEffect, useState, lazy, Suspense } from 'react';

const LocationPicker = lazy(() => import('@/components/maps/LocationPicker').then(m => ({ default: m.LocationPicker })));

export const Route = createFileRoute('/farmer/settings/personal')({
  component: PersonalInfoPage,
});

function PersonalInfoPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['farmer-profile-detailed'],
    queryFn: async () => (await api.get('/auth/me')).data.data,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(personalInfoSchema),
  });
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  useEffect(() => {
    if (profile?.user) {
      const u = profile.user;
      reset({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        farmAddress: u.farmerProfile?.farmAddress || '',
        city: u.farmerProfile?.city || '',
        state: u.farmerProfile?.state || '',
        pincode: u.farmerProfile?.pincode || '',
        latitude: u.farmerProfile?.latitude || 13.6906,
        longitude: u.farmerProfile?.longitude || 75.2426,
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await api.put('/farmer/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmer-profile-detailed'] });
      toast.success('Profile updated successfully');
      navigate({ to: '/farmer/settings' });
    }
  });

  const handleLocationConfirm = (lat: number, lng: number, address: string) => {
    setValue('latitude', lat);
    setValue('longitude', lng);
    setValue('farmAddress', address);

    const parts = address.split(',').map((s: string) => s.trim());
    if (parts.length >= 2) {
      setValue('city', parts[0]);
      setValue('state', parts[parts.length - 2] || '');
    }

    setShowMap(false);
    toast.success('Farm location updated on map');
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
           <Link to="/farmer/settings"><ChevronLeft className="w-6 h-6" /></Link>
        </Button>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Personal Information</h1>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden p-8">
           <CardContent className="p-0 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>}
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>}
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...register('phone')} />
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                 </div>
              </div>

              <div className="space-y-2">
                 <Label htmlFor="farmAddress">Farm Address</Label>
                 <textarea id="farmAddress" rows={3} {...register('farmAddress')} className="flex min-h-[100px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-inner" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register('city')} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...register('state')} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" {...register('pincode')} />
                    {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode.message}</p>}
                 </div>
              </div>

              {/* Farm Location Map Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Farm Location
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMap(!showMap)}
                    className="text-xs font-bold rounded-xl"
                  >
                    {showMap ? 'Hide Map' : 'Pick on Map'}
                  </Button>
                </div>

                {latitude && longitude && !showMap && (
                  <div className="p-3 bg-green-50 rounded-xl border border-green-100 flex gap-2 items-center">
                    <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-xs font-bold text-green-800">
                      Location set: {Number(latitude).toFixed(4)}°N, {Number(longitude).toFixed(4)}°E
                    </p>
                  </div>
                )}

                {showMap && (
                  <Suspense fallback={<div className="h-[300px] rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Loading map...</div>}>
                    <LocationPicker
                      initialLat={Number(latitude) || 13.6906}
                      initialLng={Number(longitude) || 75.2426}
                      onConfirm={handleLocationConfirm}
                    />
                  </Suspense>
                )}
              </div>

              <input type="hidden" {...register('latitude')} />
              <input type="hidden" {...register('longitude')} />

              <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-dark font-black uppercase tracking-widest shadow-xl shadow-primary/20" disabled={mutation.isPending}>
                 {mutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
              </Button>
           </CardContent>
        </Card>
      </form>
    </div>
  );
}
