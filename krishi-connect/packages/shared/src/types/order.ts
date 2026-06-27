import { OrderStatus } from '../constants/statuses.js';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  farmerId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
