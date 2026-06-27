import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Users, 
  Wrench, 
  Calendar, 
  IndianRupee, 
  ArrowUpRight
} from 'lucide-react';
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
import { formatIndianCurrency, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
    refetchInterval: 60000,
  });

  const { data: revenueData } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: async () => (await api.get('/admin/revenue-chart')).data.data,
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['admin-bookings-overview'],
    queryFn: async () => (await api.get('/admin/bookings-overview')).data,
  });

  const { data: activities } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: async () => (await api.get('/admin/recent-activities')).data.data,
  });

  const { data: topServices } = useQuery({
    queryKey: ['admin-top-services'],
    queryFn: async () => (await api.get('/admin/top-services')).data.data,
  });

  const donutData = bookingsData ? [
    { name: 'Completed', value: bookingsData.completed, color: '#16a34a' },
    { name: 'Confirmed', value: bookingsData.confirmed, color: '#2563eb' },
    { name: 'Pending', value: bookingsData.pending, color: '#f59e0b' },
    { name: 'Cancelled', value: bookingsData.cancelled, color: '#ef4444' },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
        <p className="text-white/60 font-medium">Welcome back! Here's what's happening with the platform.</p>
      </div>

      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Farmers" 
          value={formatNumber(stats?.totalFarmers || 2431)} 
          change="+12.5%" 
          icon={<Users className="w-6 h-6 text-green-400" />} 
          iconBg="bg-green-400/10"
          loading={statsLoading}
        />
        <StatCard 
          label="Total Providers" 
          value={formatNumber(stats?.totalProviders || 1243)} 
          change="+8.3%" 
          icon={<Wrench className="w-6 h-6 text-blue-400" />} 
          iconBg="bg-blue-400/10"
          loading={statsLoading}
        />
        <StatCard 
          label="Total Bookings" 
          value={formatNumber(stats?.totalBookings || 3257)} 
          change="+15.8%" 
          icon={<Calendar className="w-6 h-6 text-orange-400" />} 
          iconBg="bg-orange-400/10"
          loading={statsLoading}
        />
        <StatCard 
          label="Total Revenue" 
          value={formatIndianCurrency(stats?.totalRevenue || 1875000)} 
          change="+18.2%" 
          icon={<IndianRupee className="w-6 h-6 text-purple-400" />} 
          iconBg="bg-purple-400/10"
          loading={statsLoading}
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="rounded-2xl border-white/5 bg-white/5 shadow-xl backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <CardTitle className="text-lg font-bold text-white">Revenue Overview</CardTitle>
            <select className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none">
              <option className="bg-gray-900">This Month</option>
              <option className="bg-gray-900">Last 6 Months</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(val) => formatIndianCurrency(Number(val))}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/5 bg-white/5 shadow-xl backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-white">Bookings Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center">
            <div className="h-[350px] w-full sm:w-[60%]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-[40%] space-y-4 px-4">
              {donutData.map((item) => (
                <div key={item.name} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{formatNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Activities & Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 rounded-2xl border-white/5 bg-white/5 shadow-xl backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 mb-4 pb-4">
            <CardTitle className="text-lg font-bold text-white">Recent Activities</CardTitle>
            <Link to="/admin/reports" className="text-sm font-semibold text-primary hover:underline transition-all">View All</Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {(activities || []).map((activity: any) => (
              <div key={activity.id} className="flex items-start justify-between group">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 leading-tight">
                      {activity.description.split(/(Ramesh Kumar|Arjun Patel|#ORD1256|Tractor Service)/g).map((part: string, i: number) =>
                        /(Ramesh Kumar|Arjun Patel|#ORD1256|Tractor Service)/.test(part)
                          ? <strong key={i} className="text-white">{part}</strong>
                          : part
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performing Services */}
        <Card className="lg:col-span-3 rounded-2xl border-white/5 bg-white/5 shadow-xl backdrop-blur-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-white">Top Performing Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/5">
                    <th className="pb-4 font-semibold text-gray-400 text-sm">Service</th>
                    <th className="pb-4 font-semibold text-gray-400 text-sm text-center">Bookings</th>
                    <th className="pb-4 font-semibold text-gray-400 text-sm text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(topServices || []).map((service: any) => (
                    <tr key={service.serviceName} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 text-sm font-medium text-white">{service.serviceName}</td>
                      <td className="py-4 text-sm text-gray-300 text-center">{service.bookings}</td>
                      <td className="py-4 text-sm font-bold text-white text-right">{formatIndianCurrency(service.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, icon, iconBg, loading }: any) {
  return (
    <Card className="overflow-hidden rounded-2xl border-white/5 bg-white/5 shadow-xl backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-white/[0.07]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn("p-4 rounded-2xl", iconBg)}>
            {icon}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
            <h3 className="text-2xl font-black text-white tracking-tight">
              {loading ? <span className="animate-pulse bg-white/10 h-8 w-24 block rounded" /> : value}
            </h3>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
          <div className="flex items-center text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-md">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span className="text-xs font-black">{change}</span>
          </div>
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
