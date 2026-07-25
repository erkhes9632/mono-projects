'use client';

import { SidebarProvider } from '@erkhes-monorepo/shadcn';
import { StudentSidebar } from '../components/student-sidebar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#2D323E]">
        <StudentSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 lg:p-10 xl:p-12 max-w-7xl w-full mx-auto transition-all duration-300">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
