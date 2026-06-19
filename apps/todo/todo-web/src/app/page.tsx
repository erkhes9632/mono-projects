'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const RevealText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';

  useEffect(() => {
    let iteration = 0;
    let interval: NodeJS.Timeout;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setDisplayText(() => {
          return text
            .split('')
            .map((char, index) => {
              if (index < iteration) return text[index];
              if (char === ' ') return ' ';
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
        });

        if (iteration >= text.length) {
          clearInterval(interval);
        }
        iteration += 1 / 3;
      }, 25);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay]);

  return (
    <span className="font-bold tracking-widest">{displayText || text}</span>
  );
};

const Page = () => {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#020202] p-8 md:p-16 text-white overflow-hidden antialiased font-sans select-none">
      <div
        className="absolute inset-0 transition-all duration-700 ease-out pointer-events-none opacity-30 blur-[130px] rounded-full scale-110"
        style={{
          background:
            hovered === 'signin'
              ? 'radial-gradient(circle at 75% 50%, #3b82f6 0%, transparent 55%)'
              : hovered === 'todo'
                ? 'radial-gradient(circle at 25% 50%, #10b981 0%, transparent 55%)'
                : 'radial-gradient(circle at 50% 50%, #262626 0%, transparent 40%)',
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

      <header className="w-full flex justify-between items-center z-10 border-b border-neutral-800/60 pb-6">
        <div>
          <h2 className="text-sm font-black tracking-[0.3em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {mounted ? <RevealText text="TODO HUNT" /> : 'TODO HUNT'}
          </h2>
        </div>
        <div className="text-right font-mono text-[12px] font-medium uppercase tracking-[0.2em] text-neutral-400">
          {mounted ? (
            <RevealText text="Plan your day, hunt your goals." delay={300} />
          ) : (
            'Plan your day, hunt your goals.'
          )}
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto my-auto z-10 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 pt-16">
        <div
          onClick={() => router.push('/createUser')}
          onMouseEnter={() => setHovered('signin')}
          onMouseLeave={() => setHovered(null)}
          className="group cursor-pointer flex flex-col justify-between border-t-2 border-neutral-800 pt-8 h-64 md:h-80 transition-all duration-300 hover:border-blue-500"
        >
          <span className="font-mono text-xs font-bold tracking-[0.4em] text-neutral-500 transition-colors duration-300 group-hover:text-blue-400">
            01 // AUTHORIZE
          </span>
          <div className="flex items-end justify-between overflow-hidden">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter transition-all duration-500 group-hover:translate-x-4 text-neutral-200 group-hover:text-white group-hover:drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]">
              Sign In
              <span className="text-blue-500 inline-block transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                .
              </span>
            </h1>
            <span className="text-3xl font-light text-neutral-500 transition-all duration-500 transform group-hover:-translate-y-4 group-hover:translate-x-2 group-hover:text-blue-400">
              →
            </span>
          </div>
        </div>

        <div
          onClick={() => router.push('/createUser')}
          onMouseEnter={() => setHovered('todo')}
          onMouseLeave={() => setHovered(null)}
          className="group cursor-pointer flex flex-col justify-between border-t-2 border-neutral-800 pt-8 h-64 md:h-80 transition-all duration-300 hover:border-emerald-500"
        >
          <span className="font-mono text-xs font-bold tracking-[0.4em] text-neutral-500 transition-colors duration-300 group-hover:text-emerald-400">
            02 // INITIALIZE
          </span>
          <div className="flex items-end justify-between overflow-hidden">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter transition-all duration-500 group-hover:translate-x-4 text-neutral-200 group-hover:text-white group-hover:drop-shadow-[0_0_30px_rgba(16,185,129,0.6)]">
              Create Todo
              <span className="text-emerald-500 inline-block transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                .
              </span>
            </h1>
            <span className="text-3xl font-light text-neutral-500 transition-all duration-500 transform group-hover:-translate-y-4 group-hover:translate-x-2 group-hover:text-emerald-400">
              →
            </span>
          </div>
        </div>
      </main>

      <footer className="w-full flex justify-between items-end text-[11px] font-mono font-bold tracking-[0.25em] text-neutral-500 z-10 border-t border-neutral-800/80 pt-8">
        <div className="hover:text-white transition-colors duration-300">
          TODO-HUNT ©2026
        </div>
        <div className="hidden sm:flex items-center gap-3 text-neutral-400 bg-neutral-900/50 px-4 py-1.5 rounded-full border border-neutral-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping relative inline-flex">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          </span>
          STATUS: <span className="text-emerald-400">READY TO HUNT</span>
        </div>
        <div className="animate-pulse text-neutral-300 tracking-[0.3em]">
          CLICK TO START
        </div>
      </footer>
    </div>
  );
};

export default Page;
