'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderPlus,
  History,
  User,
  GraduationCap,
  Coins,
  Settings,
  HelpCircle,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@erkhes-monorepo/shadcn';

export function StudentSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  // Бэкэнд логикуудад зориулсан бүх цэснүүд (Англи хэл дээр)
  const menuItems = [
    { name: 'Dashboard', href: '/student-dashboard', icon: LayoutDashboard },
    {
      name: 'Propose Project',
      href: '/student-dashboard/createProject',
      icon: FolderPlus,
    },
    { name: 'My Wallet', href: '/student-dashboard/profile', icon: Coins },
    {
      name: 'Transaction History',
      href: '/student-dashboard/transactions',
      icon: History,
    },
  ];

  const secondaryMenuItems = [
    { name: 'Settings', href: '/student-dashboard/settings', icon: Settings },
    {
      name: 'Help & Support',
      href: '/student-dashboard/support',
      icon: HelpCircle,
    },
  ];

  return (
    <Sidebar className="border-r border-zinc-800 bg-zinc-950 text-zinc-100 w-72 flex flex-col justify-between">
      <div>
        {/* HEADER (Premium Dark Logo) */}
        <SidebarHeader className="p-6 border-b border-zinc-900 flex flex-row items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight block">
              STUDENT HUB
            </span>
            <span className="text-[10px] font-black text-blue-500 tracking-widest uppercase block -mt-0.5">
              SCHOOL FUNDING
            </span>
          </div>
        </SidebarHeader>

        {/* MAIN NAVIGATION */}
        <SidebarContent className="p-4 pt-6 space-y-6">
          <div>
            <span className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-3">
              Core Features
            </span>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} className="relative block group">
                      {/* Dark Mode Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="active-pill-dark"
                          className="absolute inset-0 bg-zinc-900 border-l-[3px] border-blue-500 rounded-xl"
                          transition={{
                            type: 'spring',
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}

                      <div
                        className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                          isActive
                            ? 'text-white font-semibold'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`}
                        />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>

          {/* SECONDARY NAVIGATION */}
          <div>
            <span className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-3">
              Preferences
            </span>
            <SidebarMenu className="space-y-1">
              {secondaryMenuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} className="relative block group">
                      {isActive && (
                        <div className="absolute inset-0 bg-zinc-900 border-l-[3px] border-blue-500 rounded-xl" />
                      )}
                      <div
                        className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'text-white'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-zinc-500 group-hover:scale-110 transition-transform" />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        </SidebarContent>
      </div>

      {/* FOOTER (Dark Profile Card) */}
      <SidebarFooter className="p-4 border-t border-zinc-900 bg-zinc-900/20 flex flex-row items-center gap-3 m-2 rounded-xl">
        <div className="transition-transform active:scale-95">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  'w-9 h-9 rounded-xl border border-zinc-800 shadow-xl',
              },
            }}
          />
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-xs font-bold text-zinc-200 truncate leading-none mb-1.5">
            {user?.fullName || 'Loading...'}
          </p>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black bg-zinc-800 text-blue-400 border border-zinc-700/60 uppercase tracking-wider">
            {(user?.unsafeMetadata?.role as string) || 'STUDENT'}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
