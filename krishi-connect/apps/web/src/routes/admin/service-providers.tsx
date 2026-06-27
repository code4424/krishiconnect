import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from '@/lib/api';
import {
  Search,
  Download,
  Star,
  FileText,
  MapPin,
  Phone,
  Mail,
  User as UserIcon
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/service-providers')({
  component: ServiceProvidersPage,
});

function ServiceProvidersPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: providers, isLoading } = useQuery({
    queryKey: ['admin-providers', status, search, page],
    queryFn: async () => {
      const res = await api.get('/admin/providers', {
        params: { status, search, page, limit: 10 }
      });
      return res.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: any) => {
      await api.put(`/admin/providers/${id}/status`, { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-providers'] });
      toast.success('Provider status updated successfully');
      setIsDetailsOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  });

  const handleExport = async () => {
    toast.info('Starting export...');
    window.open('/api/admin/providers/export', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Service Providers</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search provider..." 
              className="pl-10" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ALL" value={status} onValueChange={setStatus} className="w-full">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-max sm:w-full justify-start h-auto p-0 gap-4 sm:gap-8">
            <TabTrigger value="ALL" label="All Providers" />
            <TabTrigger
              value="PENDING"
              label="Pending Approval"
              count={providers?.meta?.pendingCount}
              badgeColor="bg-red-500"
            />
            <TabTrigger value="APPROVED" label="Approved" />
            <TabTrigger value="REJECTED" label="Rejected" />
          </TabsList>
        </div>

        {/* Mobile Card View */}
        <div className="mt-6 space-y-4 lg:hidden">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)
          ) : providers?.data?.length === 0 ? (
            <p className="py-12 text-center text-gray-500">No providers found matching your criteria.</p>
          ) : (
            providers?.data.map((user: any) => (
              <div key={user.id} className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                      {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </div>
                  </div>
                  <StatusBadge status={user.providerProfile?.approvalStatus} />
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-gray-600">{user.providerProfile?.serviceCategories?.join(', ') || 'N/A'}</p>
                  <p className="text-gray-500 text-xs">{user.providerProfile?.city}, {user.providerProfile?.state}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <button
                    className="text-primary font-semibold text-sm hover:underline"
                    onClick={() => { setSelectedProvider(user); setIsDetailsOpen(true); }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="mt-6 border rounded-xl bg-white overflow-hidden shadow-sm hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered On</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : providers?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No providers found matching your criteria.</td>
                  </tr>
                ) : (
                  providers?.data.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                            {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5" />}
                          </div>
                          <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.providerProfile?.serviceCategories?.join(', ') || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.providerProfile?.city}, {user.providerProfile?.state}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.providerProfile?.approvalStatus} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            className="text-primary font-semibold text-sm hover:underline"
                            onClick={() => { setSelectedProvider(user); setIsDetailsOpen(true); }}
                          >
                            View
                          </button>
                          {user.providerProfile?.approvalStatus === 'PENDING' && (
                            <button
                              className="text-red-500 text-sm font-medium border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                              onClick={() => { if(confirm('Reject this provider?')) updateStatusMutation.mutate({ id: user.id, status: 'REJECTED', reason: 'Documentation incomplete' }) }}
                            >
                              Reject
                            </button>
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

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, providers?.meta?.total || 0)} of {providers?.meta?.total || 0} providers
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>&lt;</Button>
            {Array.from({ length: providers?.meta?.totalPages || 1 }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? 'default' : 'outline'}
                size="sm"
                className={page === i + 1 ? 'bg-primary border-primary' : ''}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="sm" disabled={page === (providers?.meta?.totalPages || 1)} onClick={() => setPage(p => p + 1)}>&gt;</Button>
          </div>
        </div>
      </Tabs>

      {/* Provider Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
            <DialogDescription>Review application and documentation</DialogDescription>
          </DialogHeader>

          {selectedProvider && (
            <div className="space-y-8 py-4">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-2 mx-auto sm:mx-0">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                    <UserIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{selectedProvider.firstName} {selectedProvider.lastName}</p>
                    <p className="text-sm text-gray-500 italic">{selectedProvider.providerProfile?.businessName}</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 w-full">
                  <DetailItem icon={<Mail className="w-4 h-4" />} label="Email" value={selectedProvider.email} />
                  <DetailItem icon={<Phone className="w-4 h-4" />} label="Phone" value={selectedProvider.phone} />
                  <DetailItem icon={<MapPin className="w-4 h-4" />} label="Location" value={`${selectedProvider.providerProfile?.city}, ${selectedProvider.providerProfile?.state}`} />
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Experience</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("w-4 h-4", i < selectedProvider.providerProfile?.experience ? "text-yellow-400 fill-yellow-400" : "text-gray-200")} />
                      ))}
                      <span className="text-sm font-medium ml-1">({selectedProvider.providerProfile?.experience} Years)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Documents</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <DocThumbnail label="Aadhar Card" />
                  <DocThumbnail label="PAN Card" />
                  <DocThumbnail label="Driving License" />
                  <DocThumbnail label="Bank Details" />
                </div>
              </div>

              {selectedProvider.providerProfile?.approvalStatus === 'PENDING' && (
                <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    className="w-full bg-primary hover:bg-primary-dark h-12"
                    onClick={() => updateStatusMutation.mutate({ id: selectedProvider.id, status: 'APPROVED' })}
                    disabled={updateStatusMutation.isPending}
                  >
                    Approve Provider
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full h-12"
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:');
                      if(reason) updateStatusMutation.mutate({ id: selectedProvider.id, status: 'REJECTED', reason });
                    }}
                    disabled={updateStatusMutation.isPending}
                  >
                    Reject Application
                  </Button>
                </DialogFooter>
              )}
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

function DetailItem({ icon, label, value }: any) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{label}</p>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {value}
      </div>
    </div>
  );
}

function DocThumbnail({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-2 group cursor-pointer">
      <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center group-hover:border-primary group-hover:bg-green-50 transition-all">
        <FileText className="w-8 h-8 text-gray-300 group-hover:text-primary" />
      </div>
      <p className="text-[10px] text-center font-bold text-gray-500 uppercase">{label}</p>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-6 py-4"><Skeleton className="h-10 w-40" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-12 ml-auto" /></td>
    </tr>
  );
}
