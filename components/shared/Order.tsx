"use client";

import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, PaymentWidgetInstance, ANONYMOUS } from "@tosspayments/payment-widget-sdk";
import { customAlphabet } from "nanoid";
import { Button } from "../ui/button";
import { redirect, useSearchParams } from 'next/navigation';
import { deleteDB, getDB, updateDB } from "@/lib/database/indexedDB";

export default function Order({
    userId,
    username,
    email,
    // amount,
}: {
    userId: string;
    username: string;
    email: string;
    // amount: number;
}) {
  // const searchParams = useSearchParams();
  const [plan, setPlan] = useState<string | null>("")
  const [amount, setAmount] = useState<number>(0)
  const [credits, setCredits] = useState<number>(0)
  const [buyerId, setBuyerId] = useState<string>("")

  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const paymentMethodsWidgetRef = useRef<ReturnType<PaymentWidgetInstance["renderPaymentMethods"]> | null>(null);

  const clientKey = `${process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY}`;

  // const plan = searchParams.get("plan");
  // const amount = Number(searchParams.get("amount"));
  // const credits = searchParams.get("credits");
  // const buyerId = searchParams.get("buyerId");
  console.log('plan: ' , plan);
  console.log('amount: ' , amount);
  console.log('credits: ' , credits);
  console.log('buyerId: ' , buyerId);
  console.log('userId: ' , userId);
  
  // if (buyerId === "" || buyerId !== userId) redirect("/credits");
  
  // 주문번호 생성 로직
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const yymmdd = year + month + day;

  const customNanoid = customAlphabet(
    "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    5
  );
  const orderId = yymmdd + customNanoid();
  // const amount = 4000;

  useEffect(() => {
    // 결제창 로드
    (async () => {
      // getDB 함수 호출
      const data = await getDB(userId, ""); // 여기서 id는 실제로 사용되지 않습니다.
      console.log('data.length:', data); // 데이터 출력
      if (data.length > 0) {
        setPlan(data[0].plan);
        setAmount(data[0].amount);
        setCredits(data[0].credits);
        setBuyerId(data[0].buyerId);
      }

      await updateDB(userId, orderId);
      const paymentWidget = await loadPaymentWidget(clientKey,  userId); // 비회원 customerKey

      const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
       	"#payment-widget",
         amount
        //  { value: price,
        //   currency: 'USD',
        //   country: 'US'
        //  },
        //  { variantKey: "DEFAULT" }
      );
      paymentWidget.renderAgreement("#agreement");

      paymentWidgetRef.current = paymentWidget;
      paymentMethodsWidgetRef.current = paymentMethodsWidget;
    })();
  }, [amount]);

  const onCheckout = async () => {
    const paymentWidget = paymentWidgetRef.current;

    try {
      await paymentWidget?.requestPayment({
        orderId: orderId,
        orderName: plan || "",
        customerName: username,
        customerEmail:email,
        successUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/success`,
        failUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/payment/fail`,
        // * 다국어 결제창 설정 *
        useInternationalCardOnly: true,
      });
      console.log('window.location.search:' , window.location.search);
    } catch (err) {
      console.log("결제 승인 및 주문 저장과정에서 에러가 발생했습니다. " + err);
    }

};

// const onIndexedDBDeleteClick = async () => {
//   const result = await deleteDB(buyerId, "");
//   console.log('삭제완료: ', result);
// }
// const onIndexedDBOrderIdCheck = async () => {
//   const result = await getDB("", orderId);
//   console.log('orderId로 확인 완료: ', result);
// }

  return (
        <section>
          <div id="payment-widget" style={{ width: "100%" }} />
          <div id="agreement" style={{ width: "100%" }} />
          <Button
              type="submit"
              role="link"
              className="w-full rounded-full bg-purple-gradient bg-cover"
              onClick={onCheckout}
          >
              결제하기
          </Button>
          {/* <Button
              type="submit"
              role="link"
              className="w-full rounded-full bg-purple-gradient bg-cover"
              onClick={onIndexedDBDeleteClick}
          >
              indexedDB삭제
          </Button>
          <Button
              type="submit"
              role="link"
              className="w-full rounded-full bg-purple-gradient bg-cover"
              onClick={onIndexedDBOrderIdCheck}
          >
              indexedDB orderId확인
          </Button> */}
        </section>
  );

}