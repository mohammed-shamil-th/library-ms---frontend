'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { selectIsAuthenticated, selectIsAdmin } from '@/store/slices/authSlice';

export default function AdminRoute({ children }) {
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only check after component mounts (client-side only)
    setIsChecking(false);

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isAdmin, router]);

  // Show loading during initial check to prevent hydration mismatch
  if (isChecking) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // After check, show loading if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return <>{children}</>;
}

