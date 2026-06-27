import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useParams, useNavigate } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { ChevronLeft, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploader } from '@/components/common/ImageUploader';
import { toast } from 'sonner';
import { useEffect } from 'react';

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

export const Route = createFileRoute('/provider/products/edit/$productId')({
  component: EditProductPage,
});

function EditProductPage() {
  const { productId } = useParams({ from: '/provider/products/edit/$productId' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['provider-product', productId],
    queryFn: async () => (await api.get(`/provider/products/${productId}`)).data.data,
  });

  const { register, handleSubmit, control, reset, formState: { errors: _errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        price: Number(product.price),
      });
    }
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      await api.put(`/provider/products/${productId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-products'] });
      toast.success('Product updated and resubmitted for approval');
      navigate({ to: '/provider/products' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update product');
    }
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/provider/products"><ChevronLeft className="w-5 h-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500">Dashboard / Products / Edit</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" {...register('name')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select id="category" {...register('category')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
                <textarea id="description" rows={4} {...register('description')} className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
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
                  <select id="unit" {...register('unit')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="pieces">pieces</option>
                    <option value="packets">packets</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-3">
            <Info className="w-5 h-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-800 font-medium">Updating this product will reset its approval status. It will need to be re-approved by an admin.</p>
          </div>
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
            {mutation.isPending ? <Loader2 className="animate-spin" /> : 'Update Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
