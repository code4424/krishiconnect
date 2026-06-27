import { prisma } from '../../config/database';
import { Booking } from '@krishi/shared';

export class BookingService {
  static async createBooking(farmerId: string, data: any): Promise<Booking> {
    const booking = await prisma.booking.create({
      data: {
        farmerId,
        serviceId: data.serviceId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        totalAmount: data.totalAmount,
        notes: data.notes || null,
        status: 'PENDING'
      }
    });

    return booking as unknown as Booking;
  }

  static async getBookings(userId: string, role: string, query: any): Promise<{ data: Booking[], total: number }> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role === 'FARMER') {
      where.farmerId = userId;
    } else if (role === 'PROVIDER') {
      where.service = { providerId: userId };
    }

    if (query.status) {
      where.status = query.status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          service: true,
          farmer: { select: { id: true, name: true, phone: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);

    return { data: bookings as unknown as Booking[], total };
  }

  static async updateBookingStatus(id: string, providerId: string, status: any): Promise<Booking> {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { service: true }
    });

    if (!booking) throw new Error('Booking not found');
    if (booking.service.providerId !== providerId) throw new Error('Unauthorized');

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status }
    });

    return updatedBooking as unknown as Booking;
  }
}
