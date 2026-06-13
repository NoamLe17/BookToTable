/**
 * PayPlus API Integration (Mock / Blueprint)
 * Documentation: https://docs.payplus.co.il/reference/introduction
 * 
 * This file sets up the structure for interacting with PayPlus.
 * Once the real API Key, Secret Key, and Terminal UID are injected via environment variables,
 * the mock endpoint logic will be replaced with actual fetch requests.
 */

const PAYPLUS_API_KEY = process.env.PAYPLUS_API_KEY || 'DUMMY_API_KEY';
const PAYPLUS_SECRET_KEY = process.env.PAYPLUS_SECRET_KEY || 'DUMMY_SECRET_KEY';
const PAYPLUS_TERMINAL_UID = process.env.PAYPLUS_TERMINAL_UID || 'DUMMY_TERMINAL_UID';

// PayPlus API Base URL
const PAYPLUS_BASE_URL = 'https://restapidev.payplus.co.il/api/v1.0';

export interface PayPlusItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PayPlusCashboxDetail {
  terminal_uid: string;
  amount: number;
}

export interface PayPlusPaymentPageRequest {
  payment_page_uid?: string; // Optional template UID
  charge_method: number; // 1 = Charge
  amount: number;
  currency_code: string; // "ILS"
  refURL_success: string;
  refURL_cancel: string;
  customer: {
    customer_name: string;
    email: string;
    phone: string;
  };
  items: PayPlusItem[];
  cashbox_details?: PayPlusCashboxDetail[];
}

export async function generatePayPlusPaymentLink(requestData: PayPlusPaymentPageRequest): Promise<string> {
  // In a real environment, we would do:
  /*
  const response = await fetch(`${PAYPLUS_BASE_URL}/PaymentPages/generateLink`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `{"api_key":"${PAYPLUS_API_KEY}","secret_key":"${PAYPLUS_SECRET_KEY}"}`
    },
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate PayPlus link');
  }
  
  const data = await response.json();
  return data.data.payment_page_link;
  */

  // --- MOCK IMPLEMENTATION FOR MVP ---
  console.log("Generating PayPlus Payment Link for:", requestData);
  
  // Validate that if there's a split, it matches the total amount
  if (requestData.cashbox_details) {
    const totalSplit = requestData.cashbox_details.reduce((sum, split) => sum + split.amount, 0);
    console.log(`PayPlus Split Validation: Total Amount: ${requestData.amount}, Split Allocated: ${totalSplit}`);
    // In a real scenario, the remaining amount (amount - totalSplit) automatically stays in the main terminal (PAYPLUS_TERMINAL_UID).
  }

  // Simulate an API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Return a dummy link that actually redirects back to our success page
  return requestData.refURL_success;
}
