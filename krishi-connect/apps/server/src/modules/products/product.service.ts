import { prisma } from '../../config/database';
import { Product } from '@krishi/shared';

export class ProductService {
  static async createProduct(providerId: string, data: any): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        providerId,
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category: data.category,
        images: data.images || []
      }
    });
    return product as unknown as Product;
  }

  static async getProducts(query: any): Promise<{ data: Product[], total: number }> {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.providerId) where.providerId = query.providerId;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { provider: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return { data: products as unknown as Product[], total };
  }

  static async getProductById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { provider: { select: { id: true, name: true, phone: true } } }
    });
    return product as unknown as Product | null;
  }
}
