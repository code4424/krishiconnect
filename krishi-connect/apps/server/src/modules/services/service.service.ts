import { prisma } from '../../config/database';
import { Service } from '@krishi/shared';

export class ServiceService {
  static async createService(providerId: string, data: any): Promise<Service> {
    const service = await prisma.service.create({
      data: {
        providerId,
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        location: data.location || null,
        images: data.images || []
      }
    });

    return service as unknown as Service;
  }

  static async getServices(query: any): Promise<{ data: Service[], total: number }> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.category) {
      where.category = query.category;
    }
    if (query.providerId) {
      where.providerId = query.providerId;
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: {
          provider: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.service.count({ where })
    ]);

    return {
      data: services as unknown as Service[],
      total
    };
  }

  static async getServiceById(id: string): Promise<Service | null> {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    return service as unknown as Service | null;
  }

  static async updateService(id: string, providerId: string, data: any): Promise<Service> {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) throw new Error('Service not found');
    if (service.providerId !== providerId) throw new Error('Unauthorized');

    const updatedService = await prisma.service.update({
      where: { id },
      data
    });

    return updatedService as unknown as Service;
  }

  static async deleteService(id: string, providerId: string): Promise<void> {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) throw new Error('Service not found');
    if (service.providerId !== providerId) throw new Error('Unauthorized');

    await prisma.service.delete({ where: { id } });
  }
}
