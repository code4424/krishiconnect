import { format, formatDistanceToNow } from 'date-fns';
import { enIN } from 'date-fns/locale/en-IN';
import { kn } from 'date-fns/locale/kn';

export function formatIndianCurrency(amount: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'kn' ? 'kn-IN' : 'en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'kn' ? 'kn-IN' : 'en-IN').format(num);
}

export function formatDate(date: Date | string, formatStr: string = 'dd MMM yyyy', locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: locale === 'kn' ? kn : enIN });
}

export function formatRelativeTime(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: locale === 'kn' ? kn : enIN });
}
