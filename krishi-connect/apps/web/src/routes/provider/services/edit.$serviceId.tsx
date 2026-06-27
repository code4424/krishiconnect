import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useParams, useNavigate } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/common/ImageUploader';
import { toast } from 'sonner';
import { useEffect } from 'react';

const serviceSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  capacity: z.string().optional(),
  rateType: z.string().min(1, 'Rate type is required'),
  price: z.number().min(1, 'Price must be positive'),
  discountPrice: z.number().optional(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export const Route = createFileRoute('/provider/services/edit/$serviceId')({
  component: EditServicePage,
});

function EditServicePage() {
  const { serviceId } = useParams({ from: '/provider/services/edit/$serviceId' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: service, isLoading } = useQuery({
    queryKey: ['provider-service', serviceId],
    queryFn: async () => (await api.get(`/provider/services/${serviceId}`)).data.data,
  });

  const { register, handleSubmit, control, reset, formState: { errors: _errors } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    if (service) {
      reset({
        ...service,
        price: Number(service.price),
        discountPrice: service.discountPrice ? Number(service.discountPrice) : undefined,
      });
    }
  }, [service, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      await api.put(`/provider/services/${serviceId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      toast.success('Service updated successfully');
      navigate({ to: '/provider/services' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update service');
    }
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/provider/services"><ChevronLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
          <p className="text-sm text-gray-500">Dashboard / Services / Edit</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Service Category</Label>
                  <select id="category" {...register('category')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="TRACTOR">Tractor Service</option>
                    <option value="LABOR">Labor Service</option>
                    <option value="EQUIPMENT">Equipment Rental</option>
                    <option value="IRRIGATION">Irrigation Service</option>
                    <option value="HARVESTING">Harvesting Service</option>
                    <option value="SPRAYING">Spraying Service</option>
                    <option value="ROTAVATOR">Rotavator Service</option>
                    <option value="WATER_TANKER">Water Tanker Service</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input id="name" {...register('name')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" rows={4} {...register('description')} className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" {...register('capacity')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateType">Rate Type</Label>
                  <select id="rateType" {...register('rateType')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="PER_HOUR">Per Hour</option>
                    <option value="PER_DAY">Per Day</option>
                    <option value="PER_TRIP">Per Trip</option>
                    <option value="PER_ACRE">Per Acre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" type="number" {...register('price', { valueAsNumber: true })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader><CardTitle className="text-lg font-bold">Images</CardTitle></CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="images"
                render={({ field }) => (
                  <ImageUploader value={field.value} onChange={field.onChange} />
                )}
              />
            </CardContent>
          </Card>
          <Button type="submit" className="w-full h-12 bg-primary rounded-xl font-bold" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Update Service'}
          </Button>
        </div>
      </form>
    </div>
  );
}
