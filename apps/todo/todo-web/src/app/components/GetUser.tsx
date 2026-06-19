'use client';

import { GET_USER } from '../graphql/user';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Zap, ArrowRight } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
}

interface GetUsersData {
  getUsers: User[];
}

export const GetUser = () => {
  const { data, loading, error } = useQuery<GetUsersData>(GET_USER);
  const { loginAsUser } = useAuth();
  const router = useRouter();

  if (loading)
    return (
      <div className="text-xs font-mono font-bold tracking-widest text-neutral-500 p-8 animate-pulse uppercase">
        ⚡ Scanning database network...
      </div>
    );

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-red-500/20 bg-neutral-950/60 p-8 text-center space-y-4 font-mono shadow-[0_0_30px_rgba(239,68,68,0.1)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border-2 border-red-500 bg-red-500/10 text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-wider text-neutral-300 uppercase">
            Database connection interrupted.
          </p>
          <p className="text-[11px] font-bold text-red-500 tracking-tight">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.getUsers.length === 0)
    return (
      <div className="text-xs font-mono font-bold tracking-widest text-neutral-500 p-8 uppercase">
        // No active cores found.
      </div>
    );

  const handleUserClick = (user: User) => {
    loginAsUser(user);
    router.push(`/profile/${user.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xs font-black text-neutral-400 tracking-[0.2em] uppercase">
          Active Identities
        </h2>
        <span className="font-mono text-[11px] font-bold text-neutral-500 bg-neutral-900/60 px-3 py-1 rounded-md border border-neutral-800/80">
          TOTAL:{' '}
          <span className="text-white font-black">{data.getUsers.length}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.getUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => handleUserClick(user)}
            className="group relative cursor-pointer rounded-2xl border-2 border-neutral-900 bg-neutral-950/40 p-6 transition-all duration-500 hover:border-emerald-500 hover:bg-neutral-900/20 flex flex-col justify-between space-y-6 overflow-hidden hover:shadow-[0_0_35px_rgba(16,185,129,0.15)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start z-10">
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-neutral-200 group-hover:text-white transition-colors tracking-tight group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  {user.name}
                </h3>
                <p className="text-xs text-neutral-500 font-mono font-medium max-w-[200px] truncate group-hover:text-neutral-400 transition-colors">
                  {user.email}
                </p>
              </div>
              <span className="text-neutral-700 group-hover:text-emerald-400 transition-all duration-500 transform group-hover:translate-x-2 group-hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>

            <div className="pt-4 border-t border-neutral-900/80 grid grid-cols-2 gap-4 z-10 text-[11px] font-mono font-bold tracking-wider">
              <div className="flex items-center gap-2 text-amber-500/90 bg-amber-500/5 px-2.5 py-1 rounded-md border border-amber-500/10">
                <Shield className="h-3.5 w-3.5" />
                <span>
                  LVL{' '}
                  <strong className="text-white font-black">
                    {user.level ?? 1}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-emerald-500/90 bg-emerald-500/5 px-2.5 py-1 rounded-md border border-emerald-500/10 justify-end">
                <Zap className="h-3.5 w-3.5" />
                <span>
                  XP{' '}
                  <strong className="text-white font-black">
                    {user.xp ?? 0}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
