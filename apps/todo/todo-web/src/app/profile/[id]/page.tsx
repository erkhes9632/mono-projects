'use client';

import { useAuth, AuthProvider } from '../../../context/AuthContext';
import { Button } from '@erkhes-monorepo/shadcn';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CreateTodo } from '../../components/CreateTodo';
import { GetTodos } from '../../components/GetTodo';
import { useMutation, useQuery } from '@apollo/client/react';
import { DELETE_USER, GET_USER_BY_ID } from '../../graphql/user';
import { LogOut, Trash2, ShieldCheck, BarChart3 } from 'lucide-react';

function ProfileContent() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER);

  const { data: userData } = useQuery(GET_USER_BY_ID, {
    skip: !currentUser?.id,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center font-mono text-xs font-bold tracking-[0.3em] text-neutral-500 animate-pulse uppercase">
        ⚡ Loading workspace profile...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="text-red-500 text-xs font-black uppercase tracking-[0.3em] bg-red-500/5 px-4 py-2 border border-red-500/20 rounded-md shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          [ ERR_AUTH_REQUIRED ]
        </div>
        <p className="text-sm text-neutral-400 max-w-xs font-medium tracking-wide">
          No authorized user session found on this network node.
        </p>
        <Button
          className="bg-white text-black font-black hover:bg-neutral-200 rounded-xl px-6 h-12 text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          onClick={() => router.push('/')}
        >
          Return to Identity Matrix
        </Button>
      </div>
    );
  }

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Are you sure you want to permanently terminate this profile account? All recorded logs will be purged.',
      )
    )
      return;
    try {
      await deleteUser({ variables: { id: currentUser.id } });
      logout();
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  const usersList = (userData as any)?.getUsers || [];
  const matchedUser = usersList.find((u: any) => u.id === currentUser.id);
  const dbUser = matchedUser || currentUser || { level: 1, xp: 0 };

  const currentLevel = dbUser.level ?? 1;
  const currentXp = dbUser.xp ?? 0;
  const xpNeeded = currentLevel * 100;
  const xpPercentage = Math.min((currentXp / xpNeeded) * 100, 100);

  return (
    <div className="min-h-screen bg-[#020202] text-neutral-100 antialiased selection:bg-neutral-800 selection:text-white select-none relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

      <header className="w-full max-w-7xl mx-auto flex justify-between items-center px-6 md:px-12 h-24 border-b-2 border-neutral-900 relative z-10">
        <div className="flex items-center gap-5">
          <div className="h-6 w-[2px] bg-indigo-500 shadow-[0_0_10px_#4f46e5]" />
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] font-black tracking-[0.3em] text-neutral-500 uppercase block">
              Account Terminal
            </span>
            <h2 className="text-base font-bold text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              {currentUser.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/createUser')}
            className="text-xs font-black uppercase tracking-widest border-2 border-neutral-800 px-5 h-10 rounded-xl hover:border-neutral-400 hover:text-white text-neutral-400 transition-all duration-300"
          >
            Switch User
          </button>
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-neutral-900/60 border-2 border-neutral-800 hover:border-red-500 hover:text-red-400 text-neutral-400 px-5 h-10 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          >
            <LogOut className="h-4 w-4 stroke-[2.5]" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 px-6 md:px-12 py-16 relative z-10">
        <div className="lg:col-span-5 space-y-12 flex flex-col justify-between">
          <div className="space-y-10">
            <div className="space-y-3">
              <span className="text-xs font-mono font-black tracking-[0.3em] text-indigo-400 uppercase block">
                // Account Parameters
              </span>
              <h1 className="text-xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                {currentUser.name}
              </h1>
              <p className="text-sm font-mono font-medium text-neutral-400 tracking-wide">
                {currentUser.email}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="border-2 border-neutral-800/80 bg-neutral-950/60 p-5 rounded-2xl space-y-4 hover:border-indigo-500 transition-colors duration-500 group">
                <div className="flex justify-between items-center text-neutral-500">
                  <span className="text-[10px] font-mono font-black uppercase tracking-[0.15em]">
                    Clearance
                  </span>
                  <ShieldCheck className="h-4 w-4 text-indigo-500 group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] transition-all" />
                </div>
                <div className="text-2xl font-black text-white tracking-wide">
                  Tier {currentLevel}
                </div>
              </div>

              <div className="border-2 border-neutral-800/80 bg-neutral-950/60 p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:border-emerald-500 transition-colors duration-500 group">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.15em]">
                      Performance
                    </span>
                    <BarChart3 className="h-4 w-4 text-emerald-500 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] transition-all" />
                  </div>
                  <div className="text-2xl font-black text-white tracking-tight">
                    {currentXp}{' '}
                    <span className="text-xs font-mono font-bold text-neutral-500">
                      / {xpNeeded} XP
                    </span>
                  </div>
                </div>

                <div className="w-full h-[5px] bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/50">
                  <div
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-700 ease-out"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t-2 border-neutral-900 max-w-md">
              <CreateTodo />
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-600 hover:text-red-500 transition-colors duration-300 uppercase tracking-widest"
            >
              <Trash2 className="h-4 w-4" />
              <span>
                {deleting ? 'Terminating Account...' : 'Decommission Profile'}
              </span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <GetTodos />
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfileContent />
    </AuthProvider>
  );
}
