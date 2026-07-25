import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
/* @ts-ignore - CSS module */
import './global.css';
import { ClerkApolloProvider } from './components/Apollo-provider';
import { RoleGuard } from './components/RoleGuard';
import { Toaster } from '@erkhes-monorepo/shadcn';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Crowdfunding Platform',
  description: 'Student & Teacher project funding platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <ClerkApolloProvider>
            <RoleGuard>
              {children}
              <Toaster />
            </RoleGuard>
          </ClerkApolloProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
