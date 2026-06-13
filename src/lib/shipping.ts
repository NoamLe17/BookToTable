import { ShippingCompany, ShippingRate } from '@/types';

export const SHIPPING_RATES: ShippingRate[] = [
  {
    company: 'cheetah',
    name: 'Cheetah Deliveries',
    fee: 18,
    estimatedDays: '1-2 ימי עסקים',
    logo: '🐆',
  },
  {
    company: 'hfd',
    name: 'HFD – Hungry For Delivery',
    fee: 22,
    estimatedDays: '1-3 ימי עסקים',
    logo: '🚀',
  },
];

export function getShippingRate(company: ShippingCompany): ShippingRate {
  return SHIPPING_RATES.find(r => r.company === company) || SHIPPING_RATES[0];
}

export function calculateSplits(bookPrice: number, shippingFee: number) {
  const platformFee = Math.round(bookPrice * 0.1 * 100) / 100;
  const authorAmount = Math.round((bookPrice - platformFee) * 100) / 100;
  return {
    splitAuthor: authorAmount,
    splitPlatform: platformFee,
    splitShipping: shippingFee,
    totalPaid: bookPrice + shippingFee,
  };
}
