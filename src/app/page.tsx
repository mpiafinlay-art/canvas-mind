"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirigir directamente a /board/new para que los usuarios inicien en tableros
    router.replace('/board/new');
  }, [router]);
  
  return null;
}
