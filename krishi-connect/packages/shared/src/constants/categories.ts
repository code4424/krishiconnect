export const PRODUCT_CATEGORIES = [
  'SEEDS',
  'FERTILIZERS',
  'PESTICIDES',
  'TOOLS',
  'IRRIGATION',
  'EQUIPMENT'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export const SERVICE_CATEGORIES = [
  'TRACTOR',
  'LABOR',
  'EQUIPMENT',
  'IRRIGATION',
  'HARVESTING',
  'SPRAYING',
  'ROTAVATOR',
  'WATER_TANKER'
] as const;
