'use client';

import { CreateUser } from '../components/CreateUser';
import { GetUser } from '../components/GetUser';
import { AuthProvider } from '../../context/AuthContext';

const Page = () => {
  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-[#020202] text-white p-8 md:p-16 antialiased selection:bg-neutral-800 select-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <header className="border-b border-neutral-800/80 pb-6 flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-[0.15em] text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                Identity & Workspace
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-neutral-400 font-mono text-[11px] font-bold tracking-[0.2em] bg-neutral-900/40 px-4 py-1.5 rounded-full border border-neutral-800/60">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              STATUS: <span className="text-indigo-400">CORE_READY</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start">
            <div className="lg:col-span-5">
              <CreateUser />
            </div>
            <div className="lg:col-span-7">
              <GetUser />
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default Page;
