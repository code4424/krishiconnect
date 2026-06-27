import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from '@/lib/api';
import {
  Download,
  ArrowUpRight
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/common/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { formatIndianCurrency, formatNumber } from '@/lib/formatters';

export const Route = createFileRoute('/admin/reports')({
  component: ReportsPage,
});

function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['admin-reports-summary', date],
    queryFn: async () => (await api.get('/admin/reports/summary', {
      params: { 
        dateFrom: date?.from?.toISOString(),
        dateTo: date?.to?.toISOString()
      }
    })).data.data,
  });

  const { data: growthData } = useQuery({
    queryKey: ['admin-reports-growth'],
    queryFn: async () => (await api.get('/admin/reports/revenue-growth')).data.data,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center gap-3">
          <DatePickerWithRange date={date} setDate={setDate} />
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportStatCard 
          label="Total Revenue" 
          value={formatIndianCurrency(summary?.totalRevenue || 1875000)} 
          change={summary?.revenueChange || 10.2}
          loading={summaryLoading}
        />
        <ReportStatCard 
          label="Farmers" 
          value={formatNumber(summary?.totalFarmers || 3257)} 
          change={summary?.farmerChange || 19.8}
          loading={summaryLoading}
        />
        <ReportStatCard 
          label="Total Orders" 
          value={formatNumber(summary?.totalOrders || 2431)} 
          change={summary?.orderChange || 12.5}
          loading={summaryLoading}
        />
        <ReportStatCard 
          label="Total Users" 
          value={formatNumber(summary?.totalUsers || 3674)} 
          change={summary?.userChange || 14.2}
          loading={summaryLoading}
        />
      </div>

      {/* Growth Chart */}
      <Card className="rounded-2xl border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Revenue Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  tickFormatter={(val) => `₹${val/1000}k`} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val) => formatIndianCurrency(Number(val))}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#16a34a" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportStatCard({ label, value, change, loading }: any) {
  return (
    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            {loading ? <span className="animate-pulse bg-gray-100 h-8 w-24 block rounded" /> : value}
          </h3>
          <div className="flex items-center text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg">
            <ArrowUpRight className="w-4 h-4 mr-0.5" />
            {change}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
