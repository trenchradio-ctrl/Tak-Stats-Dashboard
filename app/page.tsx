'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <Dashboard />;
}
