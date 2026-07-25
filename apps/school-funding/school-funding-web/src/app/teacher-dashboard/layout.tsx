'use client';

import { SidebarProvider } from '@erkhes-monorepo/shadcn';
import { TeacherSidebar } from '../components/teacher-sidebar';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#2D323E]">
        <TeacherSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="p-8 lg:p-12 max-w-5xl w-full mx-auto transition-all duration-300">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
