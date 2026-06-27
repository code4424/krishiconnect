import { BookingStatus } from '../constants/statuses.js';

export interface Booking {
  id: string;
  serviceId: string;
  farmerId: string;
  status: BookingStatus;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
