import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { api } from '@/lib/api';
import {
  ArrowUpRight,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatIndianCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export const Route = createFileRoute('/provider/earnings')({
  component: ProviderEarningsPage,
});

function ProviderEarningsPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['provider-earnings-summary'],
    queryFn: async () => (await api.get('/provider/earnings/summary')).data.data,
  });

  const { data: chartData } = useQuery({
    queryKey: ['provider-earnings-chart'],
    queryFn: async () => (await api.get('/provider/earnings-chart')).data.data,
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['provider-transactions'],
    queryFn: async () => (await api.get('/provider/earnings/transactions')).data,
  });

  const breakdownData = summary ? [
    { name: 'Services', value: summary.serviceEarnings, color: '#16a34a' },
    { name: 'Products', value: summary.productEarnings, color: '#0d9488' },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Earnings Report</h1>
        <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export Statement</Button>
      </div>

      {/* Row 1: Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EarningStatCard 
          label="Total Earnings" 
          value={formatIndianCurrency(summary?.totalEarnings || 48750)} 
          change={summary?.earningsGrowth || 12.5}
          loading={summaryLoading}
          color="primary"
        />
        <EarningStatCard 
          label="Service Earnings" 
          value={formatIndianCurrency(summary?.serviceEarnings || 32450)} 
          change={summary?.serviceGrowth || 10.2}
          loading={summaryLoading}
          color="blue"
        />
        <EarningStatCard 
          label="Product Earnings" 
          value={formatIndianCurrency(summary?.productEarnings || 16300)} 
          change={summary?.productGrowth || 15.8}
          loading={summaryLoading}
          color="orange"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-2xl border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <CardTitle className="text-lg font-bold">Earnings Overview</CardTitle>
            <select className="bg-gray-50 border border-gray-100 text-xs rounded-lg px-3 py-1.5 outline-none font-bold">
              <option>This Month</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData || []}>
                  <defs>
                    <linearGradient id="earnGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#earnGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white">
          <CardHeader><CardTitle className="text-lg font-bold text-center">Breakdown</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[250px] w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdownData} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                    {breakdownData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-3 mt-4">
               {breakdownData.map(item => (
                 <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}} />
                       <span className="text-sm font-medium text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold">{Math.round((item.value / (summary?.totalEarnings || 1)) * 100)}%</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Transactions */}
      <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-50 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
          <a href="#" className="text-sm font-bold text-primary hover:underline">View All</a>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Details</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Method</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {txLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                ) : (
                  transactions?.data.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-gray-50/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{format(new Date(tx.date), 'dd MMM yyyy')}</td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">{tx.type}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{tx.details}</td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-500 capitalize">{tx.method.toLowerCase().replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatIndianCurrency(Number(tx.amount))}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded-lg bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest border border-green-200">Paid</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EarningStatCard({ label, value, change, loading, color: _color }: any) {
  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white">
      <CardContent className="p-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
            {loading ? <Skeleton className="h-8 w-24 block rounded-lg" /> : value}
          </h3>
          <div className="flex items-center text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-lg">
            <ArrowUpRight className="w-4 h-4 mr-0.5" />
            {change}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonRow() {
    return (
        <tr>
            {Array.from({ length: 6 }).map((_, i) => (
                <td key={i} className="px-6 py-4"><Skeleton className="h-4 w-full" /></td>
            ))}
        </tr>
    );
}
