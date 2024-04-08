"use server";

import fetch from 'node-fetch';

const secretKey = `${process.env.TOSS_PAYMENTS_SECRET_KEY}`;

async function confirmPayment(paymentInfo: { paymentKey?: string | null; orderId?: string | null; amount?: string | null } = {}) {
    const { paymentKey, orderId, amount } = paymentInfo;
    // console.log('secretKey: ',secretKey);
    const encryptedSecretKey =
      'Basic ' + Buffer.from(secretKey + ':').toString('base64');
  
    const response = await fetch(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        method: 'POST',
        body: JSON.stringify({ orderId, amount, paymentKey }),
        headers: {
          Authorization: encryptedSecretKey,
          'Content-Type': 'application/json',
        },
      },
    );
    const data = await response.json();
    console.log(data);
  
    return data;
  }
  
  export { confirmPayment };