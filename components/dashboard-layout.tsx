'use client';

import { Sidebar } from '@/components/sidebar';
import { TopNavbar } from '@/components/top-navbar';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: string;
  userEmail?: string;
}

export function DashboardLayout({ children, userRole, userEmail }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        userRole={userRole} 
        userEmail={userEmail} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      {/* Main content - adjusts based on sidebar state */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <TopNavbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

