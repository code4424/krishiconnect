import { prisma } from '../../config/database.js';
import { Prisma } from '@prisma/client';

export class FarmerService {
  static async getDashboardData(userId: string, lat?: number, lng?: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { farmerProfile: true }
    });

    if (!user || !user.farmerProfile) throw new Error('Farmer profile not found');

    // Use provided coords (from UI selection) or fallback to profile
    const searchLat = lat ? Number(lat) : user.farmerProfile.latitude;
    const searchLng = lng ? Number(lng) : user.farmerProfile.longitude;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    // 1. Nearby Services — Haversine distance filter via subquery.
    // HAVING without GROUP BY is invalid in Postgres for non-aggregated rows,
    // so we compute the distance in an inner query and filter outside.
    const nearbyServices = await prisma.$queryRaw`
      SELECT * FROM (
        SELECT
          s.*,
          p.business_name as "providerName",
          p.latitude as "latitude",
          p.longitude as "longitude",
          p.average_rating as "averageRating",
          p.total_reviews as "totalReviews",
          (6371 * acos(cos(radians(${searchLat})) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(${searchLng})) + sin(radians(${searchLat})) * sin(radians(p.latitude)))) AS distance
        FROM services s
        JOIN provider_profiles p ON s.provider_id = p.id
        WHERE s.is_active = true AND p.approval_status = 'APPROVED'
      ) ranked
      WHERE distance <= 25
      ORDER BY distance ASC
      LIMIT 10
    `;

    // 2. Upcoming Bookings
    const upcomingBookings = await prisma.booking.findMany({
      where: { farmerId: user.farmerProfile.id, status: { in: ['CONFIRMED', 'REQUESTED'] }, bookingDate: { gte: new Date() } },
      take: 3,
      include: { service: true, provider: true },
      orderBy: { bookingDate: 'asc' }
    });

    return {
      greeting: `${greeting}, ${user.firstName}! 👋`,
      nearbyServices,
      upcomingBookings,
      popularCategories: ['Tractor', 'Labor', 'Equipment', 'Irrigation', 'Harvesting', 'Spraying']
    };
  }

  static async searchServices(params: any) {
    const { lat, lng, radius = 100, category, search, sortBy = 'distance', page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Use raw query for distance filtering and sorting (subquery: see dashboard above)
    const services = await prisma.$queryRaw`
      SELECT * FROM (
        SELECT
          s.*,
          p.business_name as "providerName",
          p.city,
          p.state,
          p.latitude as "latitude",
          p.longitude as "longitude",
          p.average_rating as "averageRating",
          p.total_reviews as "totalReviews",
          (6371 * acos(cos(radians(${userLat})) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(${userLng})) + sin(radians(${userLat})) * sin(radians(p.latitude)))) AS distance
        FROM services s
        JOIN provider_profiles p ON s.provider_id = p.id
        WHERE s.is_active = true
          AND p.approval_status = 'APPROVED'
          ${category && category !== 'ALL' ? Prisma.sql`AND s.category::text = ${category}` : Prisma.empty}
          ${search ? Prisma.sql`AND (s.name ILIKE ${'%' + search + '%'} OR s.description ILIKE ${'%' + search + '%'})` : Prisma.empty}
      ) ranked
      WHERE distance <= ${Number(radius)}
      ORDER BY
        ${sortBy === 'price' ? Prisma.sql`price ASC` : sortBy === 'rating' ? Prisma.sql`"averageRating" DESC` : Prisma.sql`distance ASC`}
      LIMIT ${Number(limit)} OFFSET ${Number(skip)}
    `;

    // Total count
    const totalResult: any = await prisma.$queryRaw`
      SELECT COUNT(*) FROM (
        SELECT
          (6371 * acos(cos(radians(${userLat})) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(${userLng})) + sin(radians(${userLat})) * sin(radians(p.latitude)))) AS distance
        FROM services s
        JOIN provider_profiles p ON s.provider_id = p.id
        WHERE s.is_active = true AND p.approval_status = 'APPROVED'
        ${category && category !== 'ALL' ? Prisma.sql`AND s.category::text = ${category}` : Prisma.empty}
      ) ranked
      WHERE distance <= ${Number(radius)}
    `;

    const total = Number(totalResult[0]?.count || 0);

    return {
      data: services,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  static async getServiceById(id: string, lat?: number, lng?: number) {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: { include: { user: { select: { firstName: true, lastName: true, profileImage: true, email: true, phone: true } } } },
        reviews: { take: 5, orderBy: { createdAt: 'desc' }, include: { farmer: { include: { user: { select: { firstName: true } } } } } }
      }
    });

    if (!service) throw new Error('Service not found');

    let distance = null;
    if (lat && lng) {
      // Calculate distance manually for details
      const R = 6371;
      const dLat = (service.provider.latitude - lat) * (Math.PI / 180);
      const dLon = (service.provider.longitude - lng) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat * (Math.PI / 180)) * Math.cos(service.provider.latitude * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = R * c;
    }

    return { ...service, distance };
  }

  static async getAvailableSlots(serviceId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId,
        bookingDate: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' }
      },
      select: { startTime: true }
    });

    const bookedTimes = existingBookings.map(b => b.startTime);
    const allSlots = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];
    
    return allSlots.map(time => ({
      time,
      available: !bookedTimes.includes(time)
    }));
  }

  static async createBooking(userId: string, data: any) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) throw new Error('Farmer profile not found');

    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
      include: { provider: true }
    });

    if (!service || !service.isActive) throw new Error('Service not available');
    if (service.provider.approvalStatus !== 'APPROVED') throw new Error('Provider not approved');

    // Check conflict
    const conflict = await prisma.booking.findFirst({
      where: {
        serviceId: data.serviceId,
        bookingDate: new Date(data.bookingDate),
        startTime: data.startTime,
        status: { not: 'CANCELLED' }
      }
    });

    if (conflict) throw new Error('Time slot already booked');

    // Calculate total
    let multiplier = 1;
    if (data.duration.includes('2 Hour')) multiplier = 2;
    if (data.duration.includes('3 Hour')) multiplier = 3;
    if (data.duration.includes('Half Day')) multiplier = 4;
    if (data.duration.includes('Full Day')) multiplier = 8;
    
    const totalAmount = Number(service.price) * multiplier;

    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          farmerId: farmer.id,
          serviceId: data.serviceId,
          providerId: service.providerId,
          bookingDate: new Date(data.bookingDate),
          startTime: data.startTime,
          duration: data.duration,
          paymentMethod: data.paymentMethod,
          totalAmount: totalAmount,
          farmerNotes: data.farmerNotes,
          status: 'REQUESTED'
        }
      });

      await tx.bookingTracking.create({
        data: {
          bookingId: booking.id,
          status: 'REQUESTED',
          description: 'Your booking request has been sent'
        }
      });

      await tx.notification.create({
        data: {
          userId: service.provider.userId,
          title: 'New Booking Request',
          message: `You have a new booking request for ${service.name}`,
          type: 'BOOKING'
        }
      });

      return booking;
    });
  }

  static async getBookings(userId: string, query: any) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) throw new Error('Farmer profile not found');

    const { status } = query;
    const where: any = { farmerId: farmer.id };
    if (status && status !== 'ALL') where.status = status;

    return prisma.booking.findMany({
      where,
      include: { service: true, provider: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getBookingById(id: string, userId: string) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) throw new Error('Farmer profile not found');

    return prisma.booking.findUnique({
      where: { id, farmerId: farmer.id },
      include: { 
        service: true, 
        farmer: true,
        provider: { include: { user: { select: { firstName: true, lastName: true, profileImage: true } } } },
        tracking: { orderBy: { timestamp: 'asc' } }
      }
    });
  }

  static async cancelBooking(id: string, userId: string, reason: string) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) throw new Error('Farmer profile not found');

    const booking = await prisma.booking.findUnique({ where: { id, farmerId: farmer.id } });
    if (!booking) throw new Error('Booking not found');
    if (!['REQUESTED', 'CONFIRMED'].includes(booking.status)) throw new Error('Cannot cancel at this stage');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED', cancellationReason: reason }
      });

      await tx.bookingTracking.create({
        data: {
          bookingId: id,
          status: 'CANCELLED',
          description: `Booking cancelled by farmer. Reason: ${reason}`
        }
      });

      return updated;
    });
  }

    // --- Products discovery ---
    static async getProducts(query: any) {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.max(1, parseInt(query.limit || '12'));
    const skip = (page - 1) * limit;
    const { category, search, sortBy } = query;

    const where: any = { 
      approvalStatus: 'APPROVED',
      isActive: true
    };

    if (category && category !== 'ALL') where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (sortBy === 'name') orderBy = { name: 'asc' };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { provider: true },
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id, approvalStatus: 'APPROVED', isActive: true },
      include: { 
        provider: { include: { user: { select: { firstName: true, lastName: true, profileImage: true } } } },
        reviews: { take: 5, include: { farmer: { include: { user: true } } } }
      }
    });
    if (!product) throw new Error('Product not found');
    return product;
    }

    // --- Orders management ---
    static async createOrder(userId: string, data: any) {
    if (!data || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Invalid order: items array is required');
    }
    if (!data.paymentMethod) {
      throw new Error('Invalid order: paymentMethod is required');
    }
    if (!data.deliveryAddress) {
      throw new Error('Invalid order: deliveryAddress is required');
    }

    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) throw new Error('Farmer profile not found');

    return prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItems: any[] = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) throw new Error(`Product is no longer available. Please refresh your cart.`);
        if (!product.isActive) throw new Error(`${product.name} is no longer available`);
        if (product.approvalStatus !== 'APPROVED') throw new Error(`${product.name} is not yet approved for sale`);
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name} (available: ${product.stock})`);

        const itemTotal = Number(product.price) * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: new Prisma.Decimal(Number(product.price)),
          totalPrice: new Prisma.Decimal(itemTotal)
        });

        // Decrement stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Fetch platform settings for charges
      let settings = await tx.platformSettings.findUnique({ where: { id: 'default' } });
      if (!settings) {
        settings = await tx.platformSettings.create({ data: { id: 'default' } });
      }

      const deliveryFee = Number(settings.deliveryFee);
      const freeDeliveryThreshold = Number(settings.freeDeliveryThreshold);
      const convenienceCharges = Number(settings.convenienceCharges);
      const platformCharges = Number(settings.platformCharges);

      const deliveryCharges = freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : deliveryFee;
      const totalAmount = subtotal + deliveryCharges + convenienceCharges + platformCharges;

      // Create order
      const order = await tx.order.create({
        data: {
          farmerId: farmer.id,
          status: 'PLACED',
          subtotal: new Prisma.Decimal(subtotal),
          deliveryCharges: new Prisma.Decimal(deliveryCharges),
          convenienceCharges: new Prisma.Decimal(convenienceCharges),
          platformCharges: new Prisma.Decimal(platformCharges),
          totalAmount: new Prisma.Decimal(totalAmount),
          paymentMethod: data.paymentMethod,
          paymentStatus: 'PENDING',
          deliveryAddress: data.deliveryAddress,
          items: {
            create: orderItems
          }
        },
        include: { items: true }
      });

      // Notify farmer
      await tx.notification.create({
        data: {
          userId,
          title: 'Order Placed',
          message: `Your order #${order.orderId || 'Order'} has been placed successfully.`,
          type: 'ORDER'
        }
      });

      // Notify each provider whose products are in this order
      const providerIds = new Set<string>();
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { provider: true }
        });
        if (product && !providerIds.has(product.provider.userId)) {
          providerIds.add(product.provider.userId);
          await tx.notification.create({
            data: {
              userId: product.provider.userId,
              title: 'New Order Received',
              message: `You have a new order #${order.orderId || 'Order'} for your products.`,
              type: 'ORDER'
            }
          });
        }
      }

      return order;
    });
  }

    static async getOrders(userId: string, query: any) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) throw new Error('Farmer profile not found');

    const { status } = query;
    const where: any = { farmerId: farmer.id };
    if (status && status !== 'ALL') where.status = status;

    return prisma.order.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    }

    static async getOrderById(id: string, userId: string) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) throw new Error('Farmer profile not found');

    return prisma.order.findUnique({
      where: { id, farmerId: farmer.id },
      include: { items: { include: { product: { include: { provider: true } } } } }
    });
    }

    static async cancelOrder(id: string, userId: string) {
    const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
    if (!farmer) throw new Error('Farmer profile not found');

    const order = await prisma.order.findUnique({
      where: { id, farmerId: farmer.id },
      include: { items: true }
    });

    if (!order) throw new Error('Order not found');
    if (order.status !== 'PLACED') throw new Error('Order cannot be cancelled at this stage');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      return updated;
      });
      }

      static async getPlatformSettings() {
        let settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
        if (!settings) {
          settings = await prisma.platformSettings.create({ data: { id: 'default' } });
        }
        return {
          deliveryFee: Number(settings.deliveryFee),
          freeDeliveryThreshold: Number(settings.freeDeliveryThreshold),
          convenienceCharges: Number(settings.convenienceCharges),
          platformCharges: Number(settings.platformCharges),
        };
      }

      // --- Addresses ---
      static async getAddresses(userId: string) {
      const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (!farmer) throw new Error('Farmer profile not found');

      return prisma.address.findMany({
      where: { farmerId: farmer.id },
      orderBy: { isDefault: 'desc' }
      });
      }

      static async addAddress(userId: string, data: any) {
      const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (!farmer) throw new Error('Farmer profile not found');

      if (data.isDefault) {
      await prisma.address.updateMany({
        where: { farmerId: farmer.id },
        data: { isDefault: false }
      });
      }

      return prisma.address.create({
      data: {
        farmerId: farmer.id,
        ...data
      }
      });
      }

      static async updateAddress(id: string, userId: string, data: any) {
      const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (!farmer) throw new Error('Farmer profile not found');

      if (data.isDefault) {
      await prisma.address.updateMany({
        where: { farmerId: farmer.id },
        data: { isDefault: false }
      });
      }

      return prisma.address.update({
      where: { id, farmerId: farmer.id },
      data
      });
      }

      static async deleteAddress(id: string, userId: string) {
      const farmer = await prisma.farmerProfile.findUnique({ where: { userId } });
      if (!farmer) throw new Error('Farmer profile not found');

      return prisma.address.delete({
      where: { id, farmerId: farmer.id }
      });
      }
      }
