import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { ChevronLeft, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ImageUploader } from '@/components/common/ImageUploader';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(1, 'Price must be positive'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  unit: z.string().min(1, 'Unit is required'),
  deliveryRange: z.number().optional(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

export const Route = createFileRoute('/provider/products/add')({
  component: AddProductPage,
});

function AddProductPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: '',
      unit: 'kg',
      images: [],
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      await api.post('/provider/products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-products'] });
      toast.success('Product submitted for approval');
      navigate({ to: '/provider/products' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add product');
    }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/provider/products"><ChevronLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-sm text-gray-500">Dashboard / Products / Add Product</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Product Information</CardTitle>
              <CardDescription>Details about the seeds, fertilizers or equipment you are selling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" placeholder="e.g. Organic Wheat Seeds" {...register('name')} />
                  {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category"
                    {...register('category')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select category</option>
                    <option value="SEEDS">Seeds</option>
                    <option value="FERTILIZERS">Fertilizers</option>
                    <option value="PESTICIDES">Pesticides</option>
                    <option value="TOOLS">Tools</option>
                    <option value="IRRIGATION">Irrigation</option>
                    <option value="EQUIPMENT">Equipment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description"
                  rows={4}
                  {...register('description')}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Tell farmers about your product..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" type="number" {...register('price', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" {...register('stock', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <select 
                    id="unit"
                    {...register('unit')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="pieces">pieces</option>
                    <option value="packets">packets</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryRange">Delivery Range (km)</Label>
                <Input id="deliveryRange" type="number" {...register('deliveryRange', { valueAsNumber: true })} />
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-3">
            <Info className="w-5 h-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-800 font-medium">Your product will be visible to farmers after admin approval. This usually takes 24-48 hours.</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Product Images</CardTitle>
              <CardDescription>Max 5 high-quality images</CardDescription>
            </CardHeader>
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

          <div className="flex flex-col gap-3">
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary-dark font-bold text-lg rounded-xl"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit for Approval'}
            </Button>
            <Button variant="outline" className="w-full h-12 font-bold text-lg rounded-xl" asChild>
              <Link to="/provider/products">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
