import { NextResponse } from 'next/server';
import { generatePayPlusPaymentLink } from '@/lib/payplus';
import { createOrder } from '@/lib/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { readerDetails, itemsByAuthor, totalToPay, baseUrl } = body;

    // We need to map the cart items into PayPlus items
    const payplusItems = [];
    const orderIds = [];

    let totalPlatformFee = 0;
    const splits = [];

    // 1. Create orders in Firestore (Pending Status)
    // 2. Build PayPlus split array
    for (const [authorId, authorItems] of Object.entries(itemsByAuthor)) {
      const itemsList = authorItems as any[];
      
      let authorTotalAmount = 0; // Total books amount for this author
      
      for (const item of itemsList) {
        // Build PayPlus item
        payplusItems.push({
          name: item.book.title,
          quantity: item.quantity,
          price: item.book.price
        });

        authorTotalAmount += (item.book.price * item.quantity);

        // Calculate shipping for this specific item (shared across author's items)
        const itemShippingFee = 20 / itemsList.length;

        // Create order in Firestore
        const orderId = await createOrder({
          bookId: item.book.id,
          bookTitle: item.book.title,
          authorId: item.book.authorId,
          readerDetails: readerDetails,
          shippingCompany: 'cheetah', // Default MVP
          shippingFee: itemShippingFee,
          totalPaid: (item.book.price * item.quantity) + itemShippingFee,
          splitAuthor: (item.book.price * item.quantity) * 0.9,
          splitPlatform: (item.book.price * item.quantity) * 0.1,
          splitShipping: itemShippingFee,
          status: 'pending',
          trackingNumber: '',
          fanMailSent: false,
        });
        
        orderIds.push(orderId);
      }

      // Shipping fee per author
      payplusItems.push({
        name: `דמי משלוח - מוכר ${authorId.substring(0, 5)}`,
        quantity: 1,
        price: 20
      });

      authorTotalAmount += 20;

      // In PayPlus, the Marketplace split defines how much is sent to secondary Terminals.
      // E.g., The author gets 90% of the book price, + 100% of the shipping fee.
      const amountForAuthor = (authorTotalAmount - 20) * 0.9 + 20;

      // Add to splits
      splits.push({
        terminal_uid: `DUMMY_TERMINAL_AUTHOR_${authorId.substring(0, 5)}`, // In production: author.payplusTerminalUid
        amount: Number(amountForAuthor.toFixed(2))
      });
    }

    // Generate Success URL with order IDs
    const successUrl = new URL('/checkout/success', baseUrl);
    successUrl.searchParams.set('orders', orderIds.join(','));

    // Call PayPlus
    const paymentLink = await generatePayPlusPaymentLink({
      charge_method: 1,
      amount: totalToPay,
      currency_code: 'ILS',
      refURL_success: successUrl.toString(),
      refURL_cancel: new URL('/cart', baseUrl).toString(),
      customer: {
        customer_name: readerDetails.name,
        email: readerDetails.email,
        phone: readerDetails.phone
      },
      items: payplusItems,
      cashbox_details: splits
    });

    // ----------------------------------------------------
    // EMAIL NOTIFICATIONS (MUST AWAIT IN VERCEL)
    // ----------------------------------------------------
    const emailPromises = [];

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
      const itemsList = authorItems as any[];
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

    return NextResponse.json({ url: paymentLink });

  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
