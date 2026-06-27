import { prisma } from '../../config/database.js';

export class NotificationService {
  static async getNotifications(userId: string, query: any) {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.max(1, parseInt(query.limit || '10'));
    const skip = (page - 1) * limit;
    const { unread } = query;

    const where: any = { userId };
    if (unread === 'true') where.isRead = false;

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);

    return { data, meta: { page, limit, total } };
  }

  static async markAsRead(id: string, userId: string) {
    return prisma.notification.update({
      where: { id, userId },
      data: { isRead: true }
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }

  static async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    });
    return { count };
  }
}
