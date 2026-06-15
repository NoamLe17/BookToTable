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
  const platformFee = 0;
  const authorAmount = bookPrice;
  return {
    splitAuthor: authorAmount,
    splitPlatform: platformFee,
    splitShipping: shippingFee,
    totalPaid: bookPrice + shippingFee,
  };
}
