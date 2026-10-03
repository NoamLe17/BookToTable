import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/firestore';

type CheckoutItem = {
  book: {
    id: string;
    title: string;
    authorId: string;
    price: number;
  };
  quantity: number;
};

type CheckoutBody = {
  readerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
  };
  itemsByAuthor: Record<string, CheckoutItem[]>;
  totalToPay: number;
  baseUrl: string | URL;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CheckoutBody>;
    const { readerDetails, itemsByAuthor = {}, totalToPay = 0, baseUrl } = body;

    if (!readerDetails || !baseUrl || !itemsByAuthor) {
      return NextResponse.json({ error: 'Missing checkout payload' }, { status: 400 });
    }

    // We need to map the cart items into PayPlus items
    const orderIds: string[] = [];

    // 1. Create orders in Firestore (Pending Payment Status)
    for (const [authorId, authorItems] of Object.entries(itemsByAuthor)) {
      const itemsList = Array.isArray(authorItems) ? authorItems : [];
      
      let authorTotalAmount = 0; // Total books amount for this author
      
      for (const item of itemsList) {


        authorTotalAmount += (item.book.price * item.quantity);

        // Calculate shipping for this specific item (shared across author's items)
        const itemShippingFee = 0;

        // Create order in Firestore
        const orderId = await createOrder({
          bookId: item.book.id,
          bookTitle: item.book.title,
          authorId: item.book.authorId,
          quantity: item.quantity,
          readerDetails: readerDetails,
          shippingCompany: 'cheetah', // Default MVP
          shippingFee: itemShippingFee,
          totalPaid: (item.book.price * item.quantity),
          splitAuthor: (item.book.price * item.quantity),
          splitPlatform: 0,
          splitShipping: itemShippingFee,
          status: 'pending_payment',
          trackingNumber: '',
          fanMailSent: false,
        });
        
        orderIds.push(orderId);
      }
    }

    // Generate Success URL with order IDs
    const successUrl = new URL('/checkout/success', baseUrl);
    successUrl.searchParams.set('orders', orderIds.join(','));

    // ----------------------------------------------------
    // EMAIL NOTIFICATIONS (MUST AWAIT IN VERCEL)
    // ----------------------------------------------------
    const emailPromises: Promise<Response>[] = [];

    // 1. Fire off the confirmation email to the Buyer
    emailPromises.push(
      fetch(new URL('/api/email', baseUrl).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerDetails,
          items: Object.values(itemsByAuthor).flat(),
          orderIds,
          totalPaid: totalToPay,
        }),
      })
    );

    // 2. Fire off notification emails to the Authors
    let orderIndex = 0;
    for (const [authorId, authorItems] of Object.entries(itemsByAuthor)) {
      const itemsList = Array.isArray(authorItems) ? authorItems : [];
      const authorOrderIds = orderIds.slice(orderIndex, orderIndex + itemsList.length);
      orderIndex += itemsList.length;

      emailPromises.push(
        fetch(new URL('/api/email/author', baseUrl).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorId,
            readerDetails,
            items: authorItems,
            orderIds: authorOrderIds,
          }),
        })
      );
    }

    // Await all emails so Vercel Serverless doesn't kill the process
    // We use allSettled so if one email fails, it doesn't crash the checkout
    await Promise.allSettled(emailPromises);

    return NextResponse.json({ url: successUrl.toString() });

  } catch (error: unknown) {
    console.error('Checkout API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
