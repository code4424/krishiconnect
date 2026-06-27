import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ImageUploader } from '@/components/common/ImageUploader';
import { toast } from 'sonner';

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

export const Route = createFileRoute('/provider/services/add')({
  component: AddServicePage,
});

function AddServicePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, formState: { errors, isSubmitting: _isSubmitting } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      category: '',
      rateType: 'PER_HOUR',
      images: [],
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: ServiceFormValues) => {
      await api.post('/provider/services', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      toast.success('Service created successfully');
      navigate({ to: '/provider/services' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create service');
    }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/provider/services"><ChevronLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
          <p className="text-sm text-gray-500">Dashboard / Services / Add Service</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Service Information</CardTitle>
              <CardDescription>Enter details about the farm service you provide.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Service Category</Label>
                  <select 
                    id="category"
                    {...register('category')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select category</option>
                    <option value="TRACTOR">Tractor Service</option>
                    <option value="LABOR">Labor Service</option>
                    <option value="EQUIPMENT">Equipment Rental</option>
                    <option value="IRRIGATION">Irrigation Service</option>
                    <option value="HARVESTING">Harvesting Service</option>
                    <option value="SPRAYING">Spraying Service</option>
                    <option value="ROTAVATOR">Rotavator Service</option>
                    <option value="WATER_TANKER">Water Tanker Service</option>
                  </select>
                  {errors.category && <p className="text-xs text-red-500 font-medium">{errors.category.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input id="name" placeholder="e.g. Mahindra 575 DI Tractor" {...register('name')} />
                  {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description"
                  rows={4}
                  {...register('description')}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Describe your service in detail..."
                />
                {errors.description && <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity / Specification (Optional)</Label>
                  <Input id="capacity" placeholder="e.g. 50 HP / 5 Workers" {...register('capacity')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateType">Rate Type</Label>
                  <select 
                    id="rateType"
                    {...register('rateType')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
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
                  {errors.price && <p className="text-xs text-red-500 font-medium">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount Price (Optional)</Label>
                  <Input id="discountPrice" type="number" {...register('discountPrice', { valueAsNumber: true })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Images */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Service Images</CardTitle>
              <CardDescription>Upload clear images of your service</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="images"
                render={({ field }) => (
                  <ImageUploader value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.images && <p className="text-xs text-red-500 font-medium mt-2">{errors.images.message}</p>}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary-dark font-bold text-lg rounded-xl"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Service'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 font-bold text-lg rounded-xl"
              asChild
            >
              <Link to="/provider/services">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
