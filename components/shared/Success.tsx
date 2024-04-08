"use client";

import { confirmPayment } from '@/app/api/tossPayments/route';
import { createOderTransaction } from '@/lib/actions/transaction.actions';
import "@/public/assets/css/payments_style.css"
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { NextResponse } from "next/server";
import { deleteDB, getDB } from '@/lib/database/indexedDB';

export default function Success() {
    const searchParams = useSearchParams();
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    
    const handleConfirmPayment = async () => {
        try {
            const paymentInfo = {
                paymentKey: paymentKey,
                orderId: orderId,
                amount: amount,
            };
    
            const confirmResponse = await confirmPayment(paymentInfo);
            console.log('confirmResponse:', confirmResponse);
    
            if (confirmResponse.status === 'DONE') {
                setIsConfirmed(true);
            }
    
            const data = await getDB("", orderId);
            console.log('Success orderId로 확인 완료: ', data);
    
            if (data.length > 0) {
                console.log('Success data.length 0보다 큼, 마지막 리스트 가져오기: ', data[data.length - 1]);
            }
    
            const transaction = {
                paymentKey: confirmResponse.paymentKey,
                orderId: confirmResponse.orderId,
                orderName: confirmResponse.orderName,
                amount: confirmResponse.totalAmount,
                status: confirmResponse.status,
                credits: data[data.length - 1].credits,
                method: confirmResponse.method,
                buyerId: data[data.length - 1].buyerId,
                requestedAt: confirmResponse.requestedAt,
                createdAt: new Date()
            };
    
            const newTransaction = await createOderTransaction(transaction);
            console.log('newTransaction: ', newTransaction);
    
            const result = await deleteDB(data[0].buyerId, "");
            console.log('Success 삭제완료: ', result);
    
            // Redirect to the profile page
            // const router = useRouter();
            // router.push("/profile");
        } catch (error) {
            console.error('Error confirming payment:', error);
        } finally {
            console.log('완료!!!!');
        }
    };

  return (
    <div className="wrapper w-100">
    {isConfirmed ? (
        <div
        className="flex-column align-center confirm-success w-100 max-w-540"
        style={{
            display: "flex"
        }}
        >
        <img
            src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
            width="120"
            height="120"
        />
        <h2 className="title">결제를 완료했어요</h2>
        <div className="response-section w-100">
            <div className="flex justify-between">
            <span className="response-label">결제 금액</span>
            <span id="amount" className="response-text">
                {amount}
            </span>
            </div>
            <div className="flex justify-between">
            <span className="response-label">주문번호</span>
            <span id="orderId" className="response-text">
                {orderId}
            </span>
            </div>
            <div className="flex justify-between">
            <span className="response-label">paymentKey</span>
            <span id="paymentKey" className="response-text">
                {paymentKey}
            </span>
            </div>
        </div>

        <div className="w-100 button-group">
            <a className="btn primary" href='/my/payment-logs' target="_blank" rel="noreferrer noopener">테스트 결제내역 확인하기</a>
            <div className="flex" style={{ gap: "16px" }}>
            <a
                className="btn w-100"
                href="https://developers.tosspayments.com/sandbox"
            >
                다시 테스트하기
            </a>
            <a
                className="btn w-100"
                href="https://docs.tosspayments.com/guides/payment-widget/integration"
                target="_blank"
                rel="noopner noreferer"
            >
                결제 연동 문서가기
            </a>
            </div>
        </div>
        </div>
    ) : (
        <div className="flex-column align-center confirm-loading w-100 max-w-540">
        <div className="flex-column align-center">
            <img
            src="https://static.toss.im/lotties/loading-spot-apng.png"
            width="120"
            height="120"
            />
            <h2 className="title text-center">결제 요청까지 성공했어요.</h2>
            <h4 className="text-center description">결제 승인하고 완료해보세요.</h4>
        </div>
        <div className="w-100">
            <button className="btn primary w-100" onClick={handleConfirmPayment}>
            결제 승인하기
        </button>
        </div>
        </div>
    )}
    </div>
  );
}