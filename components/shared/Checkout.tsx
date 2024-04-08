"use client";

import { useEffect } from "react";
import { Button } from "../ui/button";
import { redirect } from "next/navigation";
import { addDB } from "@/lib/database/indexedDB";

const Checkout = ({
    plan,
    amount,
    credits,
    buyerId,
}: {
    plan: string;
    amount: number;
    credits: number;
    buyerId: string;
}) => {
    // useEffect(() => {
        
    // }, []);

    const onCheckout = async () => {
        await addDB({plan, amount, credits, buyerId});

        // const queryParams = new URLSearchParams({
        //     plan,
        //     amount: amount.toString(),
        //     credits: credits.toString(),
        //     buyerId,
        // });
        
        redirect('/payment');
    };

    return (
        <form action={onCheckout} method="POST">
            <section>
                <Button
                    type="submit"
                    role="link"
                    className="w-full rounded-full bg-purple-gradient bg-cover"
                >
                    Buy Credit
                </Button>
            </section>
        </form>
    );
};

export default Checkout;