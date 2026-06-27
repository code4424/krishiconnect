import { prisma } from '../../config/database.js';
import { redis } from '../../config/redis.js';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export class AdminService {
  static async getStats() {
    const cacheKey = 'stats:admin';
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [totalFarmers, totalProviders, totalBookings, revenueResult] = await Promise.all([
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'SERVICE_PROVIDER' } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true }
      })
    ]);

    const totalRevenue = Number(revenueResult._sum.totalAmount || 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [farmersThisMonth, farmersLastMonth, providersThisMonth, providersLastMonth, bookingsThisMonth, bookingsLastMonth, revenueThisMonth, revenueLastMonth] = await Promise.all([
      prisma.user.count({ where: { role: 'FARMER', createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { role: 'FARMER', createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.user.count({ where: { role: 'SERVICE_PROVIDER', createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { role: 'SERVICE_PROVIDER', createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.booking.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.booking.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
      prisma.booking.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { totalAmount: true } }),
    ]);

    const calcGrowth = (current: number, previous: number) =>
      previous === 0 ? (current > 0 ? 100 : 0) : Number((((current - previous) / previous) * 100).toFixed(1));

    const farmerGrowth = calcGrowth(farmersThisMonth, farmersLastMonth);
    const providerGrowth = calcGrowth(providersThisMonth, providersLastMonth);
    const bookingGrowth = calcGrowth(bookingsThisMonth, bookingsLastMonth);
    const revenueGrowth = calcGrowth(Number(revenueThisMonth._sum.totalAmount || 0), Number(revenueLastMonth._sum.totalAmount || 0));

    const stats = {
      totalFarmers,
      totalProviders,
      totalBookings,
      totalRevenue,
      farmerGrowth,
      providerGrowth,
      bookingGrowth,
      revenueGrowth
    };

    await redis.setex(cacheKey, 60, JSON.stringify(stats));
    return stats;
  }

  static async getProviders(query: any) {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(10000, Math.max(1, parseInt(query.limit || '10')));
    const skip = (page - 1) * limit;
    const status = query.status as string;
    const search = query.search as string;

    const where: any = {
      role: 'SERVICE_PROVIDER',
      providerProfile: { isNot: null }
    };

    if (status && status !== 'ALL') {
      where.providerProfile = { approvalStatus: status };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { providerProfile: { businessName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { providerProfile: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const [pendingCount] = await Promise.all([
      prisma.providerProfile.count({ where: { approvalStatus: 'PENDING' } })
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), pendingCount }
    };
  }

  static async getProviderById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { providerProfile: true }
    });
  }

  static async updateProviderStatus(userId: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    const updated = await prisma.$transaction(async (tx) => {
      const profile = await tx.providerProfile.update({
        where: { userId },
        data: {
          approvalStatus: status,
          rejectionReason: reason || null
        }
      });

      await tx.notification.create({
        data: {
          userId,
          title: `Account ${status.toLowerCase()}`,
          message: status === 'APPROVED'
            ? 'Congratulations! Your service provider account has been approved.'
            : `Your application was rejected. Reason: ${reason || 'N/A'}`,
          type: 'APPROVAL'
        }
      });

      return profile;
    });

    await redis.del(`user:${userId}`);
    await redis.del('stats:admin');
    return updated;
  }

  static async getProducts(query: any) {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(10000, Math.max(1, parseInt(query.limit || '10')));
    const skip = (page - 1) * limit;
    const status = query.status;

    const where: any = {};
    if (status && status !== 'ALL') where.approvalStatus = status;

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { provider: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    const pendingCount = await prisma.product.count({ where: { approvalStatus: 'PENDING' } });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), pendingCount }
    };
  }

  static async updateProductStatus(id: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    const product = await prisma.product.update({
      where: { id },
      data: { approvalStatus: status },
      include: { provider: true }
    });

    await prisma.notification.create({
      data: {
        userId: product.provider.userId,
        title: `Product ${status.toLowerCase()}`,
        message: `Your product "${product.name}" has been ${status.toLowerCase()}.`,
        type: 'APPROVAL'
      }
    });

    await redis.del('stats:admin');
    return product;
  }

  static async getBookings(query: any) {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(10000, Math.max(1, parseInt(query.limit || '10')));
    const skip = (page - 1) * limit;
    const { status, dateFrom, dateTo, search } = query;

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (dateFrom || dateTo) {
      where.bookingDate = {};
      if (dateFrom) where.bookingDate.gte = new Date(dateFrom);
      if (dateTo) where.bookingDate.lte = new Date(dateTo);
    }
    if (search) {
      where.OR = [
        { bookingId: { contains: search, mode: 'insensitive' } },
        { farmer: { user: { firstName: { contains: search, mode: 'insensitive' } } } },
        { provider: { businessName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          farmer: { include: { user: true } },
          provider: true,
          service: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  static async getOrders(query: any) {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(10000, Math.max(1, parseInt(query.limit || '10')));
    const skip = (page - 1) * limit;
    const { status, dateFrom, dateTo } = query;

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          farmer: { include: { user: true } },
          items: { include: { product: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  static async getReportsSummary(query: any) {
    const { dateFrom, dateTo, period } = query;
    const cacheKey = `reports:summary:${String(period || '')}:${String(dateFrom || '')}:${String(dateTo || '')}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [revenue, farmers, orders, users, revenueLastMonth, farmersLastMonth, ordersLastMonth, usersLastMonth] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { totalAmount: true } }),
      prisma.user.count({ where: { role: 'FARMER', createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    ]);

    const [revenueThisMonth, farmersThisMonth, ordersThisMonth, usersThisMonth] = await Promise.all([
      prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
      prisma.user.count({ where: { role: 'FARMER', createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    const calcGrowth = (current: number, previous: number) =>
      previous === 0 ? (current > 0 ? 100 : 0) : Number((((current - previous) / previous) * 100).toFixed(1));

    const summary = {
      totalRevenue: Number(revenue._sum.totalAmount || 0),
      totalFarmers: farmers,
      totalOrders: orders,
      totalUsers: users,
      revenueChange: calcGrowth(Number(revenueThisMonth._sum.totalAmount || 0), Number(revenueLastMonth._sum.totalAmount || 0)),
      farmerChange: calcGrowth(farmersThisMonth, farmersLastMonth),
      orderChange: calcGrowth(ordersThisMonth, ordersLastMonth),
      userChange: calcGrowth(usersThisMonth, usersLastMonth),
    };

    await redis.setex(cacheKey, 300, JSON.stringify(summary));
    return summary;
  }

  static async getRevenueGrowth() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'asc' }
    });

    const grouped: Record<string, number> = {};
    orders.forEach(o => {
      const dateKey = o.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      grouped[dateKey] = (grouped[dateKey] || 0) + Number(o.totalAmount);
    });

    return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
  }

  static async getRevenueChart() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'asc' }
    });

    const grouped: Record<string, number> = {};
    orders.forEach(o => {
      const month = o.createdAt.toLocaleDateString('en-US', { month: 'short' });
      grouped[month] = (grouped[month] || 0) + Number(o.totalAmount);
    });

    return Object.entries(grouped).map(([month, revenue]) => ({ month, revenue }));
  }

  static async getBookingsOverview() {
    const [completed, confirmed, pending, cancelled] = await Promise.all([
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
    ]);
    return { completed, confirmed, pending, cancelled };
  }

  static async getRecentActivities() {
    const activities: any[] = [];

    // Recent farmer registrations
    const recentFarmers = await prisma.user.findMany({
      where: { role: 'FARMER' },
      orderBy: { createdAt: 'desc' },
      take: 2,
      select: { id: true, firstName: true, lastName: true, createdAt: true }
    });
    recentFarmers.forEach(f => activities.push({
      id: f.id,
      type: 'FARMER',
      description: `${f.firstName} ${f.lastName} registered as a new farmer`,
      timestamp: formatTimeAgo(f.createdAt)
    }));

    // Recent provider registrations pending approval
    const recentProviders = await prisma.user.findMany({
      where: { role: 'SERVICE_PROVIDER', providerProfile: { approvalStatus: 'PENDING' } },
      orderBy: { createdAt: 'desc' },
      take: 1,
      select: { id: true, firstName: true, lastName: true, createdAt: true }
    });
    recentProviders.forEach(p => activities.push({
      id: p.id,
      type: 'PROVIDER',
      description: `New service provider ${p.firstName} ${p.lastName} pending approval`,
      timestamp: formatTimeAgo(p.createdAt)
    }));

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 2,
      select: { id: true, orderId: true, status: true, createdAt: true }
    });
    recentOrders.forEach(o => activities.push({
      id: o.id,
      type: 'ORDER',
      description: `Order #${o.orderId} has been ${o.status.toLowerCase()}`,
      timestamp: formatTimeAgo(o.createdAt)
    }));

    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 2,
      include: { service: { select: { title: true } } }
    });
    recentBookings.forEach(b => activities.push({
      id: b.id,
      type: 'BOOKING',
      description: `New booking request for ${b.service.title}`,
      timestamp: formatTimeAgo(b.createdAt)
    }));

    return activities.slice(0, 10);
  }

  static async getSettings() {
    let settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: 'default' }
      });
    }
    return settings;
  }

  static async updateSettings(data: {
    deliveryFee?: number;
    freeDeliveryThreshold?: number;
    convenienceCharges?: number;
    platformCharges?: number;
  }) {
    const settings = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        ...(data.deliveryFee !== undefined && { deliveryFee: data.deliveryFee }),
        ...(data.freeDeliveryThreshold !== undefined && { freeDeliveryThreshold: data.freeDeliveryThreshold }),
        ...(data.convenienceCharges !== undefined && { convenienceCharges: data.convenienceCharges }),
        ...(data.platformCharges !== undefined && { platformCharges: data.platformCharges }),
      },
      update: {
        ...(data.deliveryFee !== undefined && { deliveryFee: data.deliveryFee }),
        ...(data.freeDeliveryThreshold !== undefined && { freeDeliveryThreshold: data.freeDeliveryThreshold }),
        ...(data.convenienceCharges !== undefined && { convenienceCharges: data.convenienceCharges }),
        ...(data.platformCharges !== undefined && { platformCharges: data.platformCharges }),
      }
    });

    await redis.del('platform:settings');
    return settings;
  }

  static async getTopServices() {
    const services = await prisma.booking.groupBy({
      by: ['serviceId'],
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const serviceDetails = await prisma.service.findMany({
      where: { id: { in: services.map(s => s.serviceId) } },
      select: { id: true, title: true }
    });

    const nameMap = Object.fromEntries(serviceDetails.map(s => [s.id, s.title]));

    return services.map(s => ({
      serviceName: nameMap[s.serviceId] || 'Unknown Service',
      bookings: s._count.id,
      revenue: Number(s._sum.totalAmount || 0)
    }));
  }
}
