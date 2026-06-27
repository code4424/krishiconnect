import { prisma } from '../../config/database.js';
import { redis } from '../../config/redis.js';

export class ProviderService {
  static async getStats(userId: string) {
    const cacheKey = `stats:provider:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true, averageRating: true, totalReviews: true }
    });

    if (!profile) throw new Error('Provider profile not found');

    const [bookingsCount, ordersCount, bookingsRevenue, ordersRevenue] = await Promise.all([
      prisma.booking.count({ where: { providerId: profile.id } }),
      prisma.order.count({ 
        where: { items: { some: { product: { providerId: profile.id } } } } 
      }),
      prisma.booking.aggregate({
        where: { providerId: profile.id, status: 'COMPLETED' },
        _sum: { totalAmount: true }
      }),
      prisma.orderItem.aggregate({
        where: { product: { providerId: profile.id }, order: { status: 'DELIVERED' } },
        _sum: { totalPrice: true }
      })
    ]);

    const totalEarnings = Number(bookingsRevenue._sum.totalAmount || 0) + Number(ordersRevenue._sum.totalPrice || 0);

    const stats = {
      totalEarnings,
      totalBookings: bookingsCount,
      totalOrders: ordersCount,
      averageRating: profile.averageRating,
      totalReviews: profile.totalReviews,
      earningsGrowth: 12.5, // Mocked for design
      bookingsGrowth: 8.2,
      ordersGrowth: 5.3
    };

    await redis.setex(cacheKey, 60, JSON.stringify(stats));
    return stats;
  }

  static async getEarningsChart(userId: string) {
    // Mock data for line chart
    return [
      { date: '1 May', revenue: 2000 },
      { date: '8 May', revenue: 4500 },
      { date: '15 May', revenue: 3200 },
      { date: '22 May', revenue: 8750 },
      { date: '31 May', revenue: 6000 },
    ];
  }

  static async getBookingStatusOverview(userId: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    return {
      completed: 18,
      confirmed: 8,
      pending: 4,
      cancelled: 2,
      total: 32
    };
  }

  static async getUpcomingBookings(userId: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    return prisma.booking.findMany({
      where: { 
        providerId: profile.id,
        status: { in: ['CONFIRMED', 'REQUESTED'] },
        bookingDate: { gte: new Date() }
      },
      take: 5,
      include: { service: true, farmer: { include: { user: true } } },
      orderBy: { bookingDate: 'asc' }
    });
  }

  static async getRecentOrders(userId: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    return prisma.order.findMany({
      where: { items: { some: { product: { providerId: profile.id } } } },
      take: 5,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // --- Services CRUD ---
  static async getServices(userId: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    return prisma.service.findMany({
      where: { providerId: profile.id, isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getServiceById(id: string, userId: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service || service.providerId !== profile.id) throw new Error('Service not found or unauthorized');

    return service;
  }

  static async createService(userId: string, data: any) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    return prisma.service.create({
      data: {
        providerId: profile.id,
        ...data,
        isActive: true
      }
    });
  }

  static async updateService(id: string, userId: string, data: any) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service || service.providerId !== profile.id) throw new Error('Service not found or unauthorized');

    return prisma.service.update({
      where: { id },
      data: { ...data }
    });
  }

  static async deleteService(id: string, userId: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service || service.providerId !== profile.id) throw new Error('Service not found or unauthorized');

    return prisma.service.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // --- Products CRUD ---
  static async getProducts(userId: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    return prisma.product.findMany({
      where: { providerId: profile.id, isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getProductById(id: string, userId: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.providerId !== profile.id) throw new Error('Product not found or unauthorized');

    return product;
  }

  static async createProduct(userId: string, data: any) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    return prisma.product.create({
      data: {
        providerId: profile.id,
        ...data,
        approvalStatus: 'PENDING',
        isActive: true
      }
    });
  }

  static async updateProduct(id: string, userId: string, data: any) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.providerId !== profile.id) throw new Error('Product not found or unauthorized');

    return prisma.product.update({
      where: { id },
      data: { 
        ...data,
        approvalStatus: 'PENDING' // Reset to pending on update
      }
    });
  }

  static async deleteProduct(id: string, userId: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.providerId !== profile.id) throw new Error('Product not found or unauthorized');

    return prisma.product.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // --- Bookings Management ---
  static async getBookings(userId: string, query: any) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.max(1, parseInt(query.limit || '10'));
    const skip = (page - 1) * limit;
    const { status } = query;

    const where: any = { providerId: profile.id };
    if (status && status !== 'ALL') where.status = status;

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: { service: true, farmer: { include: { user: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  static async getBookingById(id: string, userId: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true, farmer: { include: { user: true } }, tracking: true }
    });

    if (!booking || booking.providerId !== profile.id) throw new Error('Booking not found');
    return booking;
  }

  static async updateBookingStatus(id: string, userId: string, status: any, notes?: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { farmer: true, service: true }
    });
    if (!booking || booking.providerId !== profile.id) throw new Error('Unauthorized');

    const statusLabels: Record<string, string> = {
      ACCEPTED: 'accepted',
      CONFIRMED: 'confirmed — provider is on the way',
      IN_PROGRESS: 'in progress',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    };

    return prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: { status, providerNotes: notes || booking.providerNotes }
      });

      await tx.bookingTracking.create({
        data: {
          bookingId: id,
          status,
          description: `Booking ${status.toLowerCase()} by provider`
        }
      });

      // Notify the farmer about status change
      await tx.notification.create({
        data: {
          userId: booking.farmer.userId,
          title: `Booking ${statusLabels[status] || status.toLowerCase()}`,
          message: `Your booking for ${booking.service.name} has been ${statusLabels[status] || status.toLowerCase()}.`,
          type: 'BOOKING'
        }
      });

      return updated;
    });
  }

  // --- Orders Management ---
  static async getOrders(userId: string, query: any) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.max(1, parseInt(query.limit || '10'));
    const skip = (page - 1) * limit;
    const { status } = query;

    const where: any = { items: { some: { product: { providerId: profile.id } } } };
    if (status && status !== 'ALL') where.status = status;

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: { include: { product: true } },
          farmer: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  static async updateOrderStatus(orderId: string, userId: string, status: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const order = await prisma.order.findFirst({
      where: { id: orderId, items: { some: { product: { providerId: profile.id } } } },
      include: { farmer: true }
    });
    if (!order) throw new Error('Order not found');

    const statusLabels: Record<string, string> = {
      CONFIRMED: 'confirmed',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled',
    };

    return prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status },
        include: { items: { include: { product: true } }, farmer: { include: { user: true } } }
      });

      // Notify the farmer about order status change
      await tx.notification.create({
        data: {
          userId: order.farmer.userId,
          title: `Order ${statusLabels[status] || status.toLowerCase()}`,
          message: `Your order #${order.orderId} has been ${statusLabels[status] || status.toLowerCase()}.`,
          type: 'ORDER'
        }
      });

      return updated;
    });
  }

  // --- Earnings ---
  static async getEarningsSummary(userId: string) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const [bookingEarnings, orderEarnings] = await Promise.all([
      prisma.booking.aggregate({
        where: { providerId: profile.id, status: 'COMPLETED' },
        _sum: { totalAmount: true }
      }),
      prisma.orderItem.aggregate({
        where: { product: { providerId: profile.id }, order: { status: 'DELIVERED' } },
        _sum: { totalPrice: true }
      })
    ]);

    const serviceVal = Number(bookingEarnings._sum.totalAmount || 0);
    const productVal = Number(orderEarnings._sum.totalPrice || 0);

    return {
      totalEarnings: serviceVal + productVal,
      serviceEarnings: serviceVal,
      productEarnings: productVal,
      earningsGrowth: 12.5,
      serviceGrowth: 10.2,
      productGrowth: 15.8
    };
  }

  static async getEarningsTransactions(userId: string, query: any) {
    const profile = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.max(1, parseInt(query.limit || '10'));
    const skip = (page - 1) * limit;

    const [bookings, orders] = await Promise.all([
      prisma.booking.findMany({
        where: { providerId: profile.id, status: 'COMPLETED' },
        select: { id: true, createdAt: true, totalAmount: true, paymentMethod: true, service: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.orderItem.findMany({
        where: { product: { providerId: profile.id }, order: { status: 'DELIVERED' } },
        select: { order: { select: { id: true, orderId: true, createdAt: true, paymentMethod: true } }, totalPrice: true },
        orderBy: { order: { createdAt: 'desc' } }
      })
    ]);

    const transactions = [
      ...bookings.map(b => ({ id: b.id, date: b.createdAt, type: 'Service Booking', details: b.service.name, method: b.paymentMethod, amount: b.totalAmount, status: 'Paid' })),
      ...orders.map(o => ({ id: o.order.id, date: o.order.createdAt, type: 'Product Order', details: `Order #${o.order.orderId}`, method: o.order.paymentMethod, amount: o.totalPrice, status: 'Paid' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      data: transactions.slice(skip, skip + limit),
      total: transactions.length
    };
  }

  // --- Profile ---
  static async getProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { providerProfile: true }
    });
  }

  static async updateProfile(userId: string, data: any) {
    const { firstName, lastName, email, phone, ...profileData } = data;
    
    // Ensure numeric types are correctly parsed for Prisma
    const formattedProfileData: any = {
      businessName: profileData.businessName,
      address: profileData.address,
      city: profileData.city,
      state: profileData.state,
      pincode: profileData.pincode,
      experience: profileData.experience ? parseInt(profileData.experience) : 0,
      latitude: profileData.latitude ? parseFloat(profileData.latitude) : 0,
      longitude: profileData.longitude ? parseFloat(profileData.longitude) : 0,
    };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName, 
        lastName, 
        email, 
        phone,
        providerProfile: {
          update: formattedProfileData
        }
      },
      include: { providerProfile: true }
    });

    await redis.del(`user:${userId}`);
    return updated;
  }
}
