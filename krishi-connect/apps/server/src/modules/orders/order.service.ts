import { prisma } from '../../config/database';
import { Order } from '@krishi/shared';

export class OrderService {
  static async createOrder(farmerId: string, data: any): Promise<Order> {
    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${product.name}`);
        
        totalAmount += product.price * item.quantity;
        
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity }
        });
      }

      return tx.order.create({
        data: {
          farmerId,
          totalAmount,
          shippingAddress: data.shippingAddress,
          status: 'PENDING',
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: { items: true }
      });
    });

    return order as unknown as Order;
  }

  static async getOrders(userId: string, role: string, query: any): Promise<{ data: Order[], total: number }> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role === 'FARMER') {
      where.farmerId = userId;
    } else if (role === 'PROVIDER') {
      where.items = { some: { product: { providerId: userId } } };
    }

    if (query.status) where.status = query.status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    return { data: orders as unknown as Order[], total };
  }
}
