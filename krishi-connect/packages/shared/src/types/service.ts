import { ApprovalStatus } from './user.js';

export type ServiceCategory = 'TRACTOR' | 'LABOR' | 'EQUIPMENT' | 'IRRIGATION' | 'HARVESTING' | 'SPRAYING' | 'ROTAVATOR' | 'WATER_TANKER';
export type RateType = 'PER_HOUR' | 'PER_DAY' | 'PER_TRIP' | 'PER_ACRE';

export interface Service {
  id: string;
  providerId: string;
  category: ServiceCategory;
  name: string;
  description: string;
  capacity?: string | null;
  rateType: RateType;
  price: string; // Decimal returned as string
  discountPrice?: string | null;
  fuelType?: string | null;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
