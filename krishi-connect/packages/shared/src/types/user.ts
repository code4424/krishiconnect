export type Role = 'ADMIN' | 'SERVICE_PROVIDER' | 'FARMER';
export type Language = 'EN' | 'KN';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  phone: string;
  role: Role;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
  isActive: boolean;
  isVerified: boolean;
  preferredLanguage: Language;
  createdAt: Date;
  updatedAt: Date;
}
