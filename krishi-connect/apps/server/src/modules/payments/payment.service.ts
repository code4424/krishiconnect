import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { prisma } from '../../config/database.js';
import { notificationQueue } from '../../queues/index.js';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export class PaymentService {
  static async createOrder(data: { amount: number, userId: string, bookingId?: string, orderId?: string }) {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(data.amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const payment = await prisma.payment.create({
      data: {
        userId: data.userId,
        bookingId: data.bookingId,
        orderId: data.orderId,
        amount: data.amount,
        method: 'UPI_ONLINE',
        status: 'PENDING',
        transactionId: razorpayOrder.id, // Temporary store RP order ID here
      },
    });

    return {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: env.RAZORPAY_KEY_ID
    };
  }

  static async verifyPayment(data: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }) {
    const body = data.razorpay_order_id + "|" + data.razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== data.razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    // Update DB
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { transactionId: data.razorpay_order_id }
      });

      if (!payment) throw new Error('Payment record not found');

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          transactionId: data.razorpay_payment_id
        }
      });

      if (payment.bookingId) {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: 'PAID' }
        });
      }

      if (payment.orderId) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'PAID' }
        });
      }

      await notificationQueue.add('order-confirmed', {
        userId: payment.userId,
        title: 'Payment Successful',
        message: `Your payment of ₹${payment.amount} was successful.`,
        type: 'PAYMENT'
      });

      return updatedPayment;
    });
  }
}
