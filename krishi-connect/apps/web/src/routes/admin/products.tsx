import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from '@/lib/api';
import {
  Download,
  Plus,
  Image as ImageIcon,
  User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatIndianCurrency, formatNumber } from '@/lib/formatters';

export const Route = createFileRoute('/admin/products')({
  component: ProductsPage,
});

function ProductsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('ALL');
  const [page] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', status, page],
    queryFn: async () => {
      const res = await api.get('/admin/products', {
        params: { status, page, limit: 10 }
      });
      return res.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: any) => {
      await api.put(`/admin/products/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product status updated');
      setIsDetailsOpen(false);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center gap-3">
          <Button className="bg-primary hover:bg-primary-dark gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ALL" value={status} onValueChange={setStatus} className="w-full">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-max sm:w-full justify-start h-auto p-0 gap-4 sm:gap-8">
            <TabTrigger value="ALL" label="All Products" />
            <TabTrigger
              value="PENDING"
              label="Pending Approval"
              count={products?.meta?.pendingCount}
              badgeColor="bg-red-500"
            />
            <TabTrigger value="APPROVED" label="Approved" />
            <TabTrigger value="REJECTED" label="Rejected" />
          </TabsList>
        </div>

        {/* Mobile Card View */}
        <div className="mt-6 space-y-4 lg:hidden">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)
          ) : (
            products?.data.map((product: any) => (
              <div key={product.id} className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 border flex items-center justify-center overflow-hidden shrink-0">
                    {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.provider.businessName}</p>
                  </div>
                  <StatusBadge status={product.approvalStatus} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="capitalize text-xs">{product.category.toLowerCase()}</Badge>
                    <span className="font-bold text-gray-900">{formatIndianCurrency(Number(product.price))}</span>
                    <span className="text-gray-500">Stock: {formatNumber(product.stock)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary font-bold"
                    onClick={() => { setSelectedProduct(product); setIsDetailsOpen(true); }}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="mt-6 border rounded-xl bg-white overflow-hidden shadow-sm hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : (
                  products?.data.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden shrink-0">
                            {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-300" />}
                          </div>
                          <span className="font-semibold text-gray-900 line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {product.provider.businessName}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="capitalize">{product.category.toLowerCase()}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {formatIndianCurrency(Number(product.price))}
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-bold text-gray-700">
                        {formatNumber(product.stock)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={product.approvalStatus} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-green-50 font-bold"
                            onClick={() => { setSelectedProduct(product); setIsDetailsOpen(true); }}
                          >
                            View
                          </Button>
                          {product.approvalStatus === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
                              onClick={() => { if(confirm('Reject this product?')) updateStatusMutation.mutate({ id: product.id, status: 'REJECTED' }) }}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Tabs>

      {/* Product Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Review product specifications and provider information</DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="py-6 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2 aspect-square rounded-2xl bg-gray-50 border overflow-hidden">
                {selectedProduct.images?.[0] ? (
                  <img src={selectedProduct.images[0]} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-20 h-20" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <Badge className="mb-2">{selectedProduct.category}</Badge>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">by {selectedProduct.provider.businessName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                    <p className="text-[10px] uppercase font-bold text-green-600 tracking-wider">Price</p>
                    <p className="text-lg font-bold text-primary">{formatIndianCurrency(Number(selectedProduct.price))}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Stock</p>
                    <p className="text-lg font-bold text-gray-900">{selectedProduct.stock} Units</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-900">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" /> Provider Info
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-primary">
                      {selectedProduct.provider.user.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{selectedProduct.provider.user.firstName} {selectedProduct.provider.user.lastName}</p>
                      <p className="text-xs text-gray-500 break-all">{selectedProduct.provider.user.email} | {selectedProduct.provider.user.phone}</p>
                    </div>
                  </div>
                </div>

                {selectedProduct.approvalStatus === 'PENDING' && (
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary-dark h-12 rounded-xl"
                      onClick={() => updateStatusMutation.mutate({ id: selectedProduct.id, status: 'APPROVED' })}
                    >
                      Approve Product
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-12 rounded-xl"
                      onClick={() => updateStatusMutation.mutate({ id: selectedProduct.id, status: 'REJECTED' })}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TabTrigger({ value, label, count, badgeColor }: any) {
  return (
    <TabsTrigger
      value={value}
      className="px-0 py-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent shadow-none whitespace-nowrap"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold">{label}</span>
        {count > 0 && (
          <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] text-white font-bold", badgeColor || "bg-gray-400")}>
            {count}
          </span>
        )}
      </div>
    </TabsTrigger>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    APPROVED: "bg-green-100 text-green-800 border-green-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider", styles[status] || styles.PENDING)}>
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-6 py-4"><Skeleton className="h-12 w-48" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-12 ml-auto" /></td>
    </tr>
  );
}
