'use client';

import React, { useEffect } from 'react';
import { AuthScreen } from '../components/AuthScreen';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    // When directly accessing or refreshing the /login route, ensure previous token cache is cleared
    logout();
  }, []);

  return (
    <AuthScreen onSuccess={() => router.push('/')} />
  );
}
