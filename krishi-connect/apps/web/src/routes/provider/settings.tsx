import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';

const providerSettingsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid phone number'),
  businessName: z.string().min(2, 'Business name is required'),
  experience: z.coerce.number().min(0, 'Experience must be positive'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional().or(z.literal('')),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});
import {
  User,
  MapPin,
  Briefcase,
  ShieldCheck,
  Camera,
  Loader2,
  Navigation,
} from 'lucide-react';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const LocationPicker = lazy(() => import('@/components/maps/LocationPicker').then(m => ({ default: m.LocationPicker })));

export const Route = createFileRoute('/provider/settings')({
  component: ProviderSettingsPage,
});

function ProviderSettingsPage() {
  const queryClient = useQueryClient();
  const [isLocating, setIsLocating] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: async () => (await api.get('/provider/profile')).data.data,
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(providerSettingsSchema),
  });
  const currentPincode = watch('pincode');
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        address: profile.providerProfile.address,
        businessName: profile.providerProfile.businessName,
        experience: profile.providerProfile.experience,
        city: profile.providerProfile.city,
        state: profile.providerProfile.state,
        pincode: profile.providerProfile.pincode,
        latitude: profile.providerProfile.latitude,
        longitude: profile.providerProfile.longitude,
      });
    }
  }, [profile, reset]);

  const handleCurrentLocation = async () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await api.get('/geocode/reverse', { params: { lat: latitude, lng: longitude } });
          const addr = res.data.data.address;
          const city = addr?.city || addr?.town || addr?.village || 'Unknown';
          const state = addr?.state || '';
          const pincode = addr?.postcode || '';

          setValue('city', city);
          setValue('state', state);
          setValue('pincode', pincode);
          setValue('latitude', latitude);
          setValue('longitude', longitude);
          
          toast.success(`Location set to ${city}, ${state}`);
        } catch (e) {
          setValue('latitude', latitude);
          setValue('longitude', longitude);
          toast.info('Coordinates captured, but could not determine address name.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        toast.error('Location access denied. Please check browser settings.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePincodeSearch = async () => {
    if (!currentPincode || currentPincode.length !== 6) {
      return toast.error('Please enter a valid 6-digit pincode');
    }

    setIsPincodeLoading(true);
    try {
      const res = await api.get('/geocode/search', { params: { q: currentPincode } });
      const results = res.data.data;
      if (results && results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const parts = display_name.split(',');
        const city = parts[0].trim();
        const state = parts.length > 1 ? parts[1].trim() : '';

        setValue('city', city);
        setValue('state', state);
        setValue('latitude', parseFloat(lat));
        setValue('longitude', parseFloat(lon));
        
        toast.success(`Updated to ${city}, ${state}`);
      } else {
        toast.error('Location not found for this pincode');
      }
    } catch (e) {
      toast.error('Failed to fetch location details');
    } finally {
      setIsPincodeLoading(false);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.put('/provider/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    }
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

      <form onSubmit={handleSubmit((data) => updateProfileMutation.mutate(data))} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-none shadow-sm bg-white">
            <CardHeader><CardTitle className="text-lg font-bold">Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                     <User className="w-12 h-12 text-gray-300" />
                  </div>
                  <button type="button" className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-lg">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                   <h4 className="font-bold text-gray-900">Profile Photo</h4>
                   <p className="text-sm text-gray-500">Allowed formats: JPG, PNG. Max size 2MB.</p>
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 border-r pr-2">+91</span>
                    <Input id="phone" className="pl-14" {...register('phone')} />
                  </div>
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Residential Address</Label>
                <textarea id="address" rows={3} {...register('address')} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Documents Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 px-1">Verification Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DocStatusCard label="Aadhar Card" status={profile?.providerProfile?.approvalStatus} />
              <DocStatusCard label="PAN Card" status={profile?.providerProfile?.approvalStatus} />
              <DocStatusCard label="Bank Details" status={profile?.providerProfile?.approvalStatus} />
            </div>
          </div>
        </div>

        {/* Right: Business Info */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" {...register('businessName')} />
                {errors.businessName && <p className="text-sm text-red-500 mt-1">{errors.businessName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input id="experience" type="number" {...register('experience')} />
                {errors.experience && <p className="text-sm text-red-500 mt-1">{errors.experience.message}</p>}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <Label htmlFor="city">City / Service Area</Label>
                   <button 
                     type="button" 
                     onClick={handleCurrentLocation}
                     disabled={isLocating}
                     className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline"
                   >
                     {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3 fill-primary" />}
                     Use GPS
                   </button>
                </div>
                <Input id="city" {...register('city')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <div className="relative">
                   <Input id="pincode" {...register('pincode')} maxLength={6} />
                   <Button 
                     type="button" 
                     onClick={handlePincodeSearch}
                     disabled={isPincodeLoading}
                     size="sm" 
                     className="absolute right-1 top-1 bottom-1 h-auto rounded-lg bg-gray-900 text-[9px] font-black uppercase tracking-widest px-3"
                   >
                     {isPincodeLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Lookup'}
                   </Button>
                </div>
                {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode.message}</p>}
              </div>

              {/* Hidden Coordinate Fields */}
              <input type="hidden" {...register('latitude')} />
              <input type="hidden" {...register('longitude')} />

              {/* Map Location Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-xs">
                    <MapPin className="w-4 h-4 text-primary" />
                    Service Location
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMap(!showMap)}
                    className="text-[10px] font-bold rounded-lg h-7"
                  >
                    {showMap ? 'Hide Map' : 'Pick on Map'}
                  </Button>
                </div>

                {latitude && longitude && !showMap && (
                  <div className="p-3 bg-green-50 rounded-xl border border-green-100 flex gap-2 items-center">
                    <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-[10px] font-bold text-green-800">
                      Location: {Number(latitude).toFixed(4)}°N, {Number(longitude).toFixed(4)}°E
                    </p>
                  </div>
                )}

                {showMap && (
                  <Suspense fallback={<div className="h-[300px] rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">Loading map...</div>}>
                    <LocationPicker
                      initialLat={Number(latitude) || 13.6906}
                      initialLng={Number(longitude) || 75.2426}
                      onConfirm={(lat, lng, address) => {
                        setValue('latitude', lat);
                        setValue('longitude', lng);
                        const parts = address.split(',').map((s: string) => s.trim());
                        if (parts.length >= 2) {
                          setValue('city', parts[0]);
                          setValue('state', parts[parts.length - 2] || '');
                        }
                        setShowMap(false);
                        toast.success('Service location updated');
                      }}
                    />
                  </Suspense>
                )}

                {!showMap && !latitude && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex gap-2 items-start">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-700 font-bold leading-tight">
                      Accurate GPS coordinates help farmers find you faster. Use "GPS", "Lookup", or "Pick on Map" to set them.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full h-12 bg-primary hover:bg-primary-dark font-bold text-lg rounded-xl"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? <Loader2 className="animate-spin" /> : 'Update Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function DocStatusCard({ label, status: _status }: { label: string; status: string }) {
  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden group">
      <CardContent className="p-5 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900">{label}</p>
          <Badge variant="success" className="mt-1">Verified</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
