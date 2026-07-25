'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorizing, setIsAuthorizing] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setIsAuthorizing(false);
      return;
    }

    const role = user.unsafeMetadata?.role;
    const isOnboarded = user.unsafeMetadata?.isOnboarded;

    if (!isOnboarded) {
      if (pathname !== '/onboarding') {
        router.push('/onboarding');
      } else {
        setIsAuthorizing(false);
      }
      return;
    }

    if (pathname === '/' || pathname === '/onboarding') {
      if (role === 'STUDENT') {
        router.push('/student-dashboard');
      } else if (role === 'TEACHER') {
        router.push('/teacher-dashboard');
      }
      return;
    }

    if (role === 'STUDENT' && pathname.startsWith('/teacher')) {
      router.push('/student-dashboard');
      return;
    }

    if (role === 'TEACHER' && pathname.startsWith('/student')) {
      router.push('/teacher-dashboard');
      return;
    }

    setIsAuthorizing(false);
  }, [isLoaded, user, pathname, router]);

  if (!isLoaded || isAuthorizing) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#2D323E]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E85D3A]"></div>
      </div>
    );
  }

  return <>{children}</>;
}
