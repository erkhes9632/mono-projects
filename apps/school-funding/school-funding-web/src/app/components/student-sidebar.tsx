'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {
  LayoutDashboard,
  FolderPlus,
  History,
  Menu,
  Sparkles,
  Coins,
  User,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@erkhes-monorepo/shadcn';

const GET_MY_COINS = gql`
  query GetUserById {
    getUserById {
      coinBalance
    }
  }
`;

export function StudentSidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: coinData } = useQuery<{
    getUserById: { coinBalance: number } | null;
  }>(GET_MY_COINS, { pollInterval: 30000, fetchPolicy: 'network-only' });

  const coinBalance = coinData?.getUserById?.coinBalance ?? 0;

  const menuItems = [
    { name: 'Explore', href: '/student-dashboard', icon: LayoutDashboard },
    {
      name: 'Propose',
      href: '/student-dashboard/createProject',
      icon: FolderPlus,
    },
    {
      name: 'My Projects',
      href: '/student-dashboard/myProjects',
      icon: History,
    },
    { name: 'Profile', href: '/student-dashboard/profile', icon: User },
  ];

  return (
    <Sidebar
      className={`border-r border-[#E85D3A]/20 bg-[#242831] text-[#EAE2D5] fixed flex flex-col justify-between min-h-screen font-sans transition-all duration-300 ease-in-out  z-30 ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      <div className="flex flex-col bg-[#242831] flex-1 overflow-hidden">
        <SidebarHeader className="px-4 py-5 flex flex-row items-center gap-3 shrink-0 border-b border-[#E85D3A]/20">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-[#E85D3A]/10 hover:bg-[#E85D3A]/20 text-[#EAE2D5]/70 hover:text-[#E85D3A] transition-all border border-[#E85D3A]/20 focus:outline-none shrink-0"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E85D3A]/15 border border-[#E85D3A]/20 shrink-0">
                  <Sparkles className="w-4 h-4 text-[#E85D3A]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#EAE2D5] tracking-tight leading-none">
                    CrowdFundHub
                  </span>
                  <span className="text-[9px] font-semibold tracking-[0.15em] text-[#EAE2D5]/70 uppercase mt-0.5">
                    Student Portal
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SidebarHeader>

        <SidebarContent className="px-3 pt-6 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#EAE2D5]/40">
                  Navigation
                </span>
              </div>
            )}

            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <Link
                      href={item.href}
                      className="relative block group"
                      title={isCollapsed ? item.name : undefined}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-[#E85D3A]/20 rounded-xl border border-[#E85D3A]/40"
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 35,
                          }}
                        />
                      )}
                      <div
                        className={`relative w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'text-[#EAE2D5]'
                            : 'text-[#EAE2D5]/70 hover:text-[#E85D3A] hover:bg-[#E85D3A]/10'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? 'text-[#E85D3A]'
                              : 'text-[#EAE2D5]/70 group-hover:text-[#E85D3A]'
                          }`}
                        >
                          <Icon className="w-[18px] h-[18px] shrink-0" />
                        </div>
                        {!isCollapsed && (
                          <span className="ml-3 text-xs font-semibold tracking-wide">
                            {item.name}
                          </span>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        </SidebarContent>
      </div>

      <SidebarFooter className="p-3 shrink-0 border-t border-[#E85D3A]/20 bg-[#242831]">
        <div className="mb-2 px-3 py-2 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#E85D3A]" />
              {!isCollapsed && (
                <span className="text-[10px] font-semibold text-[#EAE2D5]/70 uppercase tracking-wider">
                  Balance
                </span>
              )}
            </div>
            <motion.span
              key={coinBalance}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-sm font-extrabold text-[#E85D3A]"
            >
              {coinBalance}
            </motion.span>
          </div>
        </div>

        <div
          className={`p-2.5 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}
        >
          <div
            className="shrink-0 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8 rounded-lg border border-[#E85D3A]/20',
                },
              }}
            />
          </div>
          {!isCollapsed && (
            <Link
              href="/student-dashboard/profile"
              className="overflow-hidden flex-1 flex flex-col justify-center select-none group"
            >
              {!isLoaded ? (
                <div className="space-y-1 animate-pulse">
                  <div className="h-2.5 bg-[#E85D3A]/20 rounded w-16" />
                  <div className="h-2 bg-[#E85D3A]/10 rounded w-10" />
                </div>
              ) : (
                <>
                  <p className="text-[11px] font-semibold text-[#EAE2D5] truncate leading-tight group-hover:text-[#E85D3A] transition-colors">
                    {user?.fullName || user?.username || 'Student'}
                  </p>
                  <span className="text-[9px] text-[#EAE2D5]/70 font-medium tracking-wider uppercase truncate mt-0.5 block">
                    Student
                  </span>
                </>
              )}
            </Link>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
