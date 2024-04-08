import Order from '@/components/shared/Order'
import React from 'react'
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/actions/user.actions';

const Payment = async () => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  console.log('user: ' , user);

  return (
    <Order 
      userId={user._id}
      username={user.username}
      email={user.email}
    />
  )
}

export default Payment