'use client';

import React from 'react';
import { AuthScreen } from '../components/AuthScreen';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthScreen onSuccess={() => router.push('/')} />
  );
}
