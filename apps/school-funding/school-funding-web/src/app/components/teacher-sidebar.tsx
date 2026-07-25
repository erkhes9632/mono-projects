'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Menu,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@erkhes-monorepo/shadcn';

export function TeacherSidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/teacher-dashboard', icon: LayoutDashboard },
    {
      name: 'Review Projects',
      href: '/teacher-dashboard/review',
      icon: CheckSquare,
    },
    { name: 'Students', href: '/teacher-dashboard/students', icon: Users },
  ];

  return (
    <Sidebar
      className={`border-r border-[#E85D3A]/20 bg-[#242831] text-[#EAE2D5] flex flex-col justify-between min-h-screen font-sans transition-all duration-300 ease-in-out fixed z-30 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="flex flex-col bg-[#242831] flex-1 overflow-hidden">
        <SidebarHeader className="px-5 py-6 flex flex-row items-center gap-3.5 shrink-0 border-b border-[#E85D3A]/20">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2.5 rounded-xl bg-[#E85D3A]/10 hover:bg-[#E85D3A]/20 text-[#EAE2D5]/70 hover:text-[#E85D3A] transition-all border border-[#E85D3A]/20 focus:outline-none shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#E85D3A]/15 border border-[#E85D3A]/20 shrink-0">
                  <Sparkles className="w-4 h-4 text-[#E85D3A]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#EAE2D5] tracking-tight leading-none">
                    Teacher Portal
                  </span>
                  <span className="text-[10px] font-semibold tracking-widest text-[#EAE2D5]/70 uppercase mt-1">
                    Review &amp; Manage
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SidebarHeader>

        <SidebarContent className="px-3.5 pt-5 space-y-6 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#EAE2D5]/70">
                  Teacher Tools
                </span>
              </div>
            )}
            <SidebarMenu className="space-y-1.5">
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
                          layoutId="teacher-active-pill"
                          className="absolute inset-0 bg-[#E85D3A]/20 rounded-xl border border-[#E85D3A]/40"
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 35,
                          }}
                        />
                      )}
                      <div
                        className={`relative w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3.5'} py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'text-[#EAE2D5] font-semibold'
                            : 'text-[#EAE2D5]/70 hover:bg-[#E85D3A]/10 hover:text-[#E85D3A]'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-[#E85D3A]' : 'text-[#EAE2D5]/70 group-hover:text-[#E85D3A]'}`}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                        </div>
                        {!isCollapsed && (
                          <span className="ml-3 truncate text-xs font-semibold tracking-wide">
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

      <SidebarFooter className="p-3.5 shrink-0 border-t border-[#E85D3A]/20 bg-[#242831]">
        <div
          className={`p-3 rounded-xl bg-[#E85D3A]/10 border border-[#E85D3A]/20 flex flex-row items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}
        >
          <div
            className="shrink-0 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9 rounded-lg border border-[#E85D3A]/20',
                },
              }}
            />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden flex-1 flex flex-col justify-center select-none group">
              {!isLoaded ? (
                <div className="space-y-1.5 animate-pulse">
                  <div className="h-3 bg-[#E85D3A]/20 rounded w-20" />
                  <div className="h-2 bg-[#E85D3A]/10 rounded w-12" />
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-[#EAE2D5] truncate leading-tight group-hover:text-[#E85D3A] transition-colors">
                    {user?.fullName || user?.username || 'Teacher'}
                  </p>
                  <span className="text-[10px] text-[#EAE2D5]/70 font-semibold tracking-wider uppercase truncate mt-0.5 block">
                    TEACHER
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
