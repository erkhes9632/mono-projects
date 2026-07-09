'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!isLoaded || !user || !role) return;

    try {
      setLoading(true);

      await user.update({
        unsafeMetadata: {
          role: role,
          isOnboarded: true,
        },
      });

      if (role === 'STUDENT') {
        router.push('/student-dashboard');
      } else {
        router.push('/teacher-dashboard');
      }

      router.refresh();
    } catch (err) {
      console.error('Clerk update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Complete Your Profile
        </h1>
        <p className="text-gray-500 mb-8">
          Please select your role to continue.
        </p>

        <div className="flex gap-4 mb-8">
          <div
            onClick={() => setRole('STUDENT')}
            className={`flex-1 p-6 border-2 rounded-xl cursor-pointer bg-white ${
              role === 'STUDENT'
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-gray-200'
            }`}
          >
            <span className="text-4xl block mb-3">👨‍🎓</span>
            <h3 className="text-lg font-semibold">Student</h3>
          </div>

          <div
            onClick={() => setRole('TEACHER')}
            className={`flex-1 p-6 border-2 rounded-xl cursor-pointer bg-white ${
              role === 'TEACHER'
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-gray-200'
            }`}
          >
            <span className="text-4xl block mb-3">👩‍🏫</span>
            <h3 className="text-lg font-semibold">Teacher</h3>
          </div>
        </div>

        {role && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? 'Saving...' : 'Get Started'}
          </button>
        )}
      </div>
    </div>
  );
}
