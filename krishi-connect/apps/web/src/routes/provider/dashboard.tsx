import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  IndianRupee, 
  Calendar, 
  ShoppingBag, 
  Star, 
  TrendingUp,
  Package,
  Clock,
  Tractor
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
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
import { Badge } from '@/components/ui/badge';
import { formatIndianCurrency, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/provider/dashboard')({
  component: ProviderDashboard,
});

function ProviderDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['provider-stats'],
    queryFn: async () => (await api.get('/provider/stats')).data.data,
    refetchInterval: 60000,
  });

  const { data: earningsData } = useQuery({
    queryKey: ['provider-earnings-chart'],
    queryFn: async () => (await api.get('/provider/earnings-chart')).data.data,
  });

  const { data: bookingsOverview } = useQuery({
    queryKey: ['provider-bookings-overview'],
    queryFn: async () => (await api.get('/provider/booking-status-overview')).data.data,
  });

  const { data: upcomingBookings } = useQuery({
    queryKey: ['provider-upcoming-bookings'],
    queryFn: async () => (await api.get('/provider/upcoming-bookings')).data.data,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['provider-recent-orders'],
    queryFn: async () => (await api.get('/provider/recent-orders')).data.data,
  });

  const donutData = bookingsOverview ? [
    { name: 'Completed', value: bookingsOverview.completed, color: '#16a34a' },
    { name: 'Confirmed', value: bookingsOverview.confirmed, color: '#0d9488' },
    { name: 'Pending', value: bookingsOverview.pending, color: '#f59e0b' },
    { name: 'Cancelled', value: bookingsOverview.cancelled, color: '#ef4444' },
  ] : [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Provider Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-500 font-medium">Manage your services and track your performance.</p>
      </div>

      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard 
          label="Total Earnings" 
          value={formatIndianCurrency(stats?.totalEarnings || 48750)} 
          change="+12.5%" 
          icon={<IndianRupee className="w-6 h-6 text-green-600" />} 
          iconBg="bg-green-100"
          loading={statsLoading}
        />
        <StatCard 
          label="Total Bookings" 
          value={formatNumber(stats?.totalBookings || 32)} 
          change="+8.2%" 
          icon={<Calendar className="w-6 h-6 text-blue-600" />} 
          iconBg="bg-blue-100"
          loading={statsLoading}
        />
        <StatCard 
          label="Total Orders" 
          value={formatNumber(stats?.totalOrders || 18)} 
          change="+5.3%" 
          icon={<ShoppingBag className="w-6 h-6 text-orange-600" />} 
          iconBg="bg-orange-100"
          loading={statsLoading}
        />
        <RatingCard 
          rating={stats?.averageRating || 4.6} 
          totalReviews={stats?.totalReviews || 128}
          loading={statsLoading}
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
        <Card className="rounded-2xl shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between pb-4 sm:pb-8">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-800">Earnings Overview</CardTitle>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none">
              <option>This Month</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(val) => `₹${val/1000}k`} width={45} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val) => formatIndianCurrency(Number(val))}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={4} dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-800">Booking Status</CardTitle>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 outline-none">
              <option>This Month</option>
            </select>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center">
            <div className="h-[220px] sm:h-[300px] w-full sm:w-[60%] relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">{bookingsOverview?.total || 32}</span>
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">Total</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="75%"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-[40%] space-y-3 sm:space-y-4 px-4 pb-4 sm:pb-0">
              {donutData.map((item) => (
                <div key={item.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Upcoming Bookings & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <Card className="rounded-2xl shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 mb-4 pb-4">
            <CardTitle className="text-lg font-bold text-gray-800">Upcoming Bookings</CardTitle>
            <Link to="/provider/bookings" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {(upcomingBookings || []).length === 0 ? (
               <div className="text-center py-8 text-gray-400 font-medium">No upcoming bookings.</div>
            ) : upcomingBookings.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between gap-3 p-1">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                    <Tractor className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{b.service.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 shrink-0" />
                      {new Date(b.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {b.startTime}
                    </p>
                  </div>
                </div>
                <Badge className="shrink-0 text-[10px] sm:text-xs" variant={b.status === 'CONFIRMED' ? 'success' : 'warning'}>{b.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 mb-4 pb-4">
            <CardTitle className="text-lg font-bold text-gray-800">Recent Orders</CardTitle>
            <Link to="/provider/dashboard" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {(recentOrders || []).length === 0 ? (
              <div className="text-center py-8 text-gray-400 font-medium">No recent orders.</div>
            ) : recentOrders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between gap-3 p-1">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 border flex items-center justify-center overflow-hidden shrink-0">
                    {o.items?.[0]?.product?.images?.[0] ? <img src={o.items[0].product.images[0]} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{o.items?.[0]?.product?.name || 'Multiple Items'}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • #{o.orderId}
                    </p>
                  </div>
                </div>
                <Badge className="shrink-0 text-[10px] sm:text-xs" variant={o.status === 'DELIVERED' ? 'success' : 'secondary'}>{o.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, icon, iconBg, loading }: any) {
  return (
    <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className={cn("p-3 sm:p-4 rounded-xl sm:rounded-2xl", iconBg)}>{icon}</div>
          <div className="sm:text-right">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1">{label}</p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {loading ? <Skeleton className="h-7 sm:h-8 w-20 sm:w-24" /> : value}
            </h3>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-50 flex items-center gap-2">
          <div className="flex items-center text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md font-bold text-[10px] sm:text-xs">
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
            {change}
          </div>
          <span className="text-[10px] sm:text-xs text-gray-400 font-medium">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RatingCard({ rating, totalReviews, loading }: any) {
  return (
    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-purple-100 text-purple-600"><Star className="w-5 h-5 sm:w-6 sm:h-6 fill-purple-600" /></div>
          <div className="sm:text-right">
            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1">Average Rating</p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {loading ? <Skeleton className="h-7 sm:h-8 w-14 sm:w-16" /> : rating}
            </h3>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5", i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200")} />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500 font-bold">({totalReviews} Reviews)</span>
        </div>
      </CardContent>
    </Card>
  );
}
