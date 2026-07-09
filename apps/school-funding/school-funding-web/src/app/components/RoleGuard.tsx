'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && user) {
      const role = user.unsafeMetadata?.role;
      const isOnboarded = user.unsafeMetadata?.isOnboarded;

      if (!isOnboarded) {
        if (pathname !== '/onboarding') {
          router.push('/onboarding');
        }
        return;
      }

      if (pathname === '/') {
        if (role === 'STUDENT') {
          router.push('/student-dashboard');
        } else if (role === 'TEACHER') {
          router.push('/teacher-dashboard');
        }
        return;
      }

      if (role === 'STUDENT' && pathname.startsWith('/teacher')) {
        router.push('/student-dashboard');
      }

      if (role === 'TEACHER' && pathname.startsWith('/student')) {
        router.push('/teacher-dashboard');
      }
    }
  }, [isLoaded, user, pathname, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
