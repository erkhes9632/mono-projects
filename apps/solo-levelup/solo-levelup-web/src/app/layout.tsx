import './global.css';
import type { Metadata } from 'next';
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import { ApolloWrapper } from '../providers/apollo-provider';
import { SyncUserProvider } from '../providers/sync-user-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Solo LevelUp — Goal Tracker',
  description:
    'AI-powered goal tracking. Set goals, get daily tasks on Telegram, and get AI-verified progress.',
  icons: {
    icon:
      'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><rect width=%2232%22 height=%2232%22 rx=%228%22 fill=%22%238b5cf6%22/><path d=%22M10 22l6-10 6 10%22 stroke=%22white%22 stroke-width=%222.5%22 fill=%22none%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col relative overflow-x-hidden bg-zinc-950 text-zinc-100">
          {/* Glow orbs */}
          <div className="glow-orb glow-orb--violet" aria-hidden="true" />
          <div className="glow-orb glow-orb--pink" aria-hidden="true" />
          <div className="glow-orb glow-orb--cyan" aria-hidden="true" />

          <ApolloWrapper>
            <SyncUserProvider>
              <header className="relative z-10 flex justify-between items-center px-6 py-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/20 to-pink-600/10 border border-violet-500/20">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="url(#layoutGrad)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <defs>
                        <linearGradient id="layoutGrad" x1="0" y1="0" x2="24" y2="24">
                          <stop stopColor="#8b5cf6" />
                          <stop offset="1" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                      <path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-10.5L2 9h7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">Solo LevelUp</span>
                </div>

                <nav className="flex items-center gap-2">
                  <Show when="signed-out">
                    <SignInButton />
                    <SignUpButton>
                      <button className="btn-glow rounded-full bg-violet-600 text-white font-medium text-xs h-8 px-3.5 cursor-pointer hover:bg-violet-500">
                        Create Account
                      </button>
                    </SignUpButton>
                  </Show>
                  <Show when="signed-in">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-500">{geistSans.variable}</span>
                      <UserButton
                        appearance={{
                          elements: {
                            userButton: {
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.1)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            },
                          },
                        }}
                      />
                    </div>
                  </Show>
                </nav>
              </header>
              <main className="relative z-10 flex-1">{children}</main>
            </SyncUserProvider>
          </ApolloWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
