import { ProductCategory } from '../constants/index.js';
import { ApprovalStatus } from './user.js';

export interface Product {
  id: string;
  providerId: string;
  name: string;
  description: string;
  category: ProductCategory;
  brand?: string | null;
  price: string;
  stock: number;
  unit?: string | null;
  deliveryRange?: number | null;
  images: string[];
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
