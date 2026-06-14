

export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  age?: string;
  avatarUrl?: string;
  stripeAccountId?: string;
  stripeOnboarded: boolean;
  allowsFanMail: boolean;
  paymentLink?: string;
  pickupAddress?: {
    street: string;
    city: string;
    zip: string;
    phone: string;
  };
  createdAt: number;
}

export interface Book {
  id: string;
  authorId: string;
  authorName?: string;
  title: string;
  description: string;
  price: number;
  coverUrl: string;
  weightGrams: number;
  genre?: string;
  salesCount: number;
  isPublished: boolean;
  createdAt: number;
}

export type OrderStatus = 'pending_payment' | 'pending' | 'shipped' | 'delivered';
export type ShippingCompany = 'cheetah' | 'hfd' | 'israel_post' | 'other';

export interface Order {
  id: string;
  bookId: string;
  bookTitle?: string;
  authorId: string;
  readerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
    buyerNote?: string;
  };
  quantity: number;
  shippingCompany: ShippingCompany;
  shippingFee: number;
  totalPaid: number;
  splitAuthor: number;
  splitPlatform: number;
  splitShipping: number;
  status: OrderStatus;
  trackingNumber: string;
  shippingLabelUrl?: string;
  stripePaymentIntentId?: string;
  fanMailSent: boolean;
  createdAt: number;
}

export interface FanMail {
  id: string;
  orderId: string;
  authorId: string;
  readerName: string;
  message: string;
  createdAt: number;
}

export interface ShippingRate {
  company: ShippingCompany;
  name: string;
  fee: number;
  estimatedDays: string;
  logo: string;
}
