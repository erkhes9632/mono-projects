'use client';

import { useUser } from '@clerk/nextjs';

export default function StudentProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded)
    return <div className="text-center py-12">Loading Profile...</div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">👤 My Profile</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage your student account information.
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <img
            src={user?.imageUrl}
            alt="Profile"
            className="w-16 h-16 rounded-full border border-gray-200"
          />
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {user?.fullName}
            </h3>
            <p className="text-sm text-gray-500">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400 block font-medium mb-1">
              Account Role
            </span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-semibold text-xs inline-block uppercase">
              {(user?.unsafeMetadata?.role as string) || 'STUDENT'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium mb-1">
              Student ID (Clerk)
            </span>
            <span className="font-mono text-xs text-gray-600 block truncate">
              {user?.id}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <span className="text-gray-400 block text-sm font-medium mb-2">
            My Balance
          </span>
          <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
            <span className="text-gray-600 font-medium">
              Available Student Coins
            </span>
            <span className="text-xl font-black text-emerald-600">
              🪙 100 Coins
            </span>
            {/* Жишээ коин утга, дараа нь DB-ээс татаж сольж болно */}
          </div>
        </div>
      </div>
    </div>
  );
}
