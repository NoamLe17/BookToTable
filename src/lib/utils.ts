import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `₪${price.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: { toDate: () => Date } | Date | null | undefined): string {
  if (!date) return '';
  const d = 'toDate' in date ? date.toDate() : date;
  return new Intl.DateTimeFormat('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function generateMockTrackingNumber(company: string): string {
  const prefix = company === 'cheetah' ? 'CHT' : 'HFD';
  const num = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix}${num}IL`;
}
