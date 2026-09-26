import Link from 'next/link';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    id: 'goals',
    title: 'Goal Setting',
    description:
      'Define your main goal — AI breaks it into objectives and daily tasks automatically.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: 'tasks',
    title: 'Daily Tasks',
    description:
      'Get your daily task on Telegram at the scheduled time. Do it, reply, and get verified.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    id: 'ai',
    title: 'AI Verification',
    description:
      'Your reply is evaluated by LLM against the task criteria — instant feedback on whether you did it.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    ),
  },
  {
    id: 'progress',
    title: 'Progress Dashboard',
    description:
      'Visualize your entire goal tree — objectives, tasks, completion rates, all in real time.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export default async function Page() {
  return (
    <div className="relative min-h-screen flex flex-col bg-grid">
      {/* Glow orbs */}
      <div className="glow-orb glow-orb--violet" aria-hidden="true" />
      <div className="glow-orb glow-orb--pink" aria-hidden="true" />
      <div className="glow-orb glow-orb--cyan" aria-hidden="true" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-center p-6">
        <Link
          href="/dashboard"
          className="btn-glow rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:shadow-xl hover:shadow-violet-600/30"
        >
          Sign in
        </Link>
      </nav>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
        {/* Logo mark */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-pink-600/10 border border-violet-500/20 shadow-lg shadow-violet-600/10">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#logoGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="24" y2="24">
                <stop stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-10.5L2 9h7z" />
          </svg>
        </div>

        <h1 className="text-6xl font-bold tracking-tight text-white sm:text-7xl">
          Solo{' '}
          <span className="text-gradient">LevelUp</span>
        </h1>

        <p className="mt-4 max-w-lg text-base text-zinc-400 sm:text-lg">
          Set a goal. Get daily tasks on Telegram. Let AI verify your progress.
          <br />
          <span className="text-zinc-500">Level up, one day at a time.</span>
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="btn-glow rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:shadow-xl hover:shadow-violet-600/30"
          >
            Start Your Goal
            <svg className="ml-2 -mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/n8n-setup"
            className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-6 py-3 text-sm font-medium text-zinc-400 transition hover:border-zinc-700/60 hover:text-zinc-200"
          >
            n8n Setup Guide
          </Link>
        </div>

        {/* Feature grid */}
        <div className="mt-12 w-full max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>

        {/* Stats mockup */}
        <div className="mt-12 w-full max-w-md">
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5 text-left">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              How it works
            </p>
            <div className="mt-4 space-y-3">
              {[
                { step: '01', title: 'Create a goal', desc: 'In the dashboard or via bot' },
                { step: '02', title: 'AI decomposes it', desc: 'Objectives + daily tasks generated' },
                { step: '03', title: 'Telegram delivers tasks', desc: 'At your scheduled time each day' },
                { step: '04', title: 'You reply, AI verifies', desc: 'Instant feedback, progress updates' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 h-6 w-6 rounded-lg bg-zinc-800/60 flex items-center justify-center text-[10px] font-bold text-violet-400">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-zinc-200">{item.title}</p>
                    <p className="text-[11px] text-zinc-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-between px-6 py-4 border-t border-zinc-800/40 text-[11px] text-zinc-600">
        <span>Solo LevelUp</span>
        <span>Powered by Cloudflare, n8n &amp; Telegram</span>
      </footer>
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="group relative rounded-xl border border-zinc-800/40 bg-zinc-900/20 p-5 transition border-zinc-700/40 bg-zinc-900/40">
      {/* Mouse-tracking glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139,92,246,0.06), transparent 40%)',
        }}
      />

      <div className="relative flex items-start gap-3">
        <div className="shrink-0 mt-0.5 h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 transition-colors group-hover:bg-violet-500/20 group-hover:border-violet-500/30">
          {feature.icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-200 transition-colors group-hover:text-white">
            {feature.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}
