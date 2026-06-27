import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { formatIndianCurrency } from '@/lib/formatters';
import {
  Truck,
  IndianRupee,
  Percent,
  Save,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const Route = createFileRoute('/admin/settings')({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => (await api.get('/admin/settings')).data.data,
  });

  const [form, setForm] = useState({
    deliveryFee: '',
    freeDeliveryThreshold: '',
    convenienceCharges: '',
    platformCharges: '',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        deliveryFee: String(settings.deliveryFee ?? '0'),
        freeDeliveryThreshold: String(settings.freeDeliveryThreshold ?? '0'),
        convenienceCharges: String(settings.convenienceCharges ?? '0'),
        platformCharges: String(settings.platformCharges ?? '0'),
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return (await api.put('/admin/settings', data)).data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to update settings');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      deliveryFee: parseFloat(form.deliveryFee) || 0,
      freeDeliveryThreshold: parseFloat(form.freeDeliveryThreshold) || 0,
      convenienceCharges: parseFloat(form.convenienceCharges) || 0,
      platformCharges: parseFloat(form.platformCharges) || 0,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Settings</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Configure delivery fees, convenience charges, and platform charges
          </p>
        </div>
      </div>

      {/* Delivery Settings */}
      <Card className="rounded-3xl border-none shadow-sm bg-white">
        <CardContent className="p-8 space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Delivery Settings</h2>
              <p className="text-xs text-gray-400 font-medium">Configure delivery fee and free delivery threshold</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                Delivery Fee (Rs.)
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.deliveryFee}
                  onChange={(e) => setForm((f) => ({ ...f, deliveryFee: e.target.value }))}
                  className="pl-10 h-14 text-lg font-bold rounded-2xl border-gray-200 focus:border-primary focus:ring-primary"
                  placeholder="60"
                />
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                Charged when order subtotal is below the free delivery threshold
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                Free Delivery Threshold (Rs.)
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.freeDeliveryThreshold}
                  onChange={(e) => setForm((f) => ({ ...f, freeDeliveryThreshold: e.target.value }))}
                  className="pl-10 h-14 text-lg font-bold rounded-2xl border-gray-200 focus:border-primary focus:ring-primary"
                  placeholder="500"
                />
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                Orders above this amount get free delivery
              </p>
            </div>
          </div>

          {settings && (
            <div className="p-4 bg-blue-50/50 rounded-2xl text-sm text-blue-700 font-medium">
              Current: Delivery fee of {formatIndianCurrency(Number(form.deliveryFee || 0))} for orders below {formatIndianCurrency(Number(form.freeDeliveryThreshold || 0))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convenience Charges */}
      <Card className="rounded-3xl border-none shadow-sm bg-white">
        <CardContent className="p-8 space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Percent className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Convenience Charges</h2>
              <p className="text-xs text-gray-400 font-medium">Fixed convenience fee added to every order</p>
            </div>
          </div>

          <div className="max-w-sm space-y-3">
            <Label className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Convenience Fee (Rs.)
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.convenienceCharges}
                onChange={(e) => setForm((f) => ({ ...f, convenienceCharges: e.target.value }))}
                className="pl-10 h-14 text-lg font-bold rounded-2xl border-gray-200 focus:border-primary focus:ring-primary"
                placeholder="0"
              />
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              This flat fee is added to every order total. Set to 0 to disable.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platform Charges */}
      <Card className="rounded-3xl border-none shadow-sm bg-white">
        <CardContent className="p-8 space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Platform Charges</h2>
              <p className="text-xs text-gray-400 font-medium">Platform service fee added to every order</p>
            </div>
          </div>

          <div className="max-w-sm space-y-3">
            <Label className="text-xs font-black text-gray-500 uppercase tracking-widest">
              Platform Fee (Rs.)
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.platformCharges}
                onChange={(e) => setForm((f) => ({ ...f, platformCharges: e.target.value }))}
                className="pl-10 h-14 text-lg font-bold rounded-2xl border-gray-200 focus:border-primary focus:ring-primary"
                placeholder="0"
              />
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              This flat fee is added to every order total. Set to 0 to disable.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary Preview */}
      <Card className="rounded-3xl border-none shadow-sm bg-white">
        <CardContent className="p-8 space-y-6">
          <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Preview - Order Charges Breakdown</h3>
          <div className="space-y-3 text-sm max-w-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal (example)</span>
              <span className="font-bold text-gray-900">{formatIndianCurrency(300)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-bold text-gray-900">
                {300 >= Number(form.freeDeliveryThreshold || 0)
                  ? 'FREE'
                  : formatIndianCurrency(Number(form.deliveryFee || 0))}
              </span>
            </div>
            {Number(form.convenienceCharges || 0) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Convenience Charges</span>
                <span className="font-bold text-gray-900">{formatIndianCurrency(Number(form.convenienceCharges))}</span>
              </div>
            )}
            {Number(form.platformCharges || 0) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Platform Charges</span>
                <span className="font-bold text-gray-900">{formatIndianCurrency(Number(form.platformCharges))}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base pt-3 border-t">
              <span>Total</span>
              <span className="text-primary">
                {formatIndianCurrency(
                  300 +
                    (300 >= Number(form.freeDeliveryThreshold || 0) ? 0 : Number(form.deliveryFee || 0)) +
                    Number(form.convenienceCharges || 0) +
                    Number(form.platformCharges || 0)
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
