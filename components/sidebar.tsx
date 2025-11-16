'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FolderKanban, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  DollarSign,
  Gavel,
  ClipboardCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  TrendingUp,
  Briefcase,
  Scale,
  UserCog,
  Bell
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
  userEmail?: string;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export function Sidebar({ userRole, userEmail, isCollapsed: externalIsCollapsed, setIsCollapsed: externalSetIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const supabase = createClient();

  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const setIsCollapsed = externalSetIsCollapsed || setInternalIsCollapsed;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  // Navigation items based on role - More comprehensive
  const getNavItems = () => {
    const roleBasedItems: Record<string, Array<{ 
      href: string; 
      label: string; 
      icon: any;
      description?: string;
    }>> = {
      'System_Administrator': [
        { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & stats' },
        { href: '/projects', label: 'All Projects', icon: FolderKanban, description: 'View all projects' },
        { href: '/dashboard/planner', label: 'Proposals', icon: FileText, description: 'Project proposals' },
        { href: '/dashboard/ldc', label: 'Development Council', icon: ListChecks, description: 'AIP & prioritization' },
        { href: '/dashboard/budget', label: 'Budget', icon: DollarSign, description: 'Fund allocation' },
        { href: '/dashboard/bac', label: 'BAC', icon: Gavel, description: 'Bidding & procurement' },
        { href: '/dashboard/inspector', label: 'Inspector', icon: ClipboardCheck, description: 'Project monitoring' },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, description: 'View all notifications' },
        { href: '/dashboard/admin/users', label: 'Users', icon: Users, description: 'User management' },
        { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings, description: 'System settings' },
      ],
      'Planner': [
        { href: '/dashboard/planner', label: 'My Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/planner/new-proposal', label: 'New Proposal', icon: FileText },
        { href: '/projects', label: 'All Projects', icon: FolderKanban },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      ],
      'Development_Council': [
        { href: '/dashboard/ldc', label: 'My Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/ldc/generate-aip', label: 'Generate AIP', icon: FileText },
        { href: '/projects', label: 'All Projects', icon: FolderKanban },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      ],
      'Budget_Officer': [
        { href: '/dashboard/budget', label: 'My Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/budget', label: 'Budget Allocation', icon: DollarSign },
        { href: '/projects', label: 'All Projects', icon: FolderKanban },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      ],
      'BAC_Secretariat': [
        { href: '/dashboard/bac', label: 'My Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/bac', label: 'Manage Bids', icon: Gavel },
        { href: '/projects', label: 'All Projects', icon: FolderKanban },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      ],
      'Technical_Inspector': [
        { href: '/dashboard/inspector', label: 'My Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/inspector', label: 'Inspections', icon: ClipboardCheck },
        { href: '/projects', label: 'All Projects', icon: FolderKanban },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      ],
      'Contractor': [
        { href: '/dashboard/contractor', label: 'My Dashboard', icon: LayoutDashboard },
        { href: '/projects', label: 'Available Bids', icon: FolderKanban },
        { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      ],
      'Public_User': [
        { href: '/projects', label: 'Public Projects', icon: Eye },
      ],
    };

    return roleBasedItems[userRole || 'Public_User'] || [
      { href: '/projects', label: 'Public Projects', icon: Eye },
    ];
  };

  const navItems = getNavItems();
  
  const getRoleDisplayName = () => {
    if (!userRole) return 'Guest';
    return userRole.replace(/_/g, ' ');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background border rounded-md shadow-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-screen bg-card border-r z-40',
          'transition-all duration-300 ease-in-out flex flex-col',
          // Mobile behavior
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop collapsible behavior
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
          // Always full width on mobile
          'w-64'
        )}
      >
        {/* Header */}
        <div className="p-4 pt-5 border-b flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              {/* <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold">B</span>
              </div> */}
              <div className="min-w-0">
                <h1 className="text-sm font-bold truncate">BuildTrack-LGU</h1>
                {/* {userRole && (
                  <p className="text-xs text-muted-foreground truncate">
                    {getRoleDisplayName()}
                  </p>
                )} */}
              </div>
            </div>
          )}
          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 hover:bg-muted rounded-md transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                      'transition-all duration-150 group relative',
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                      isCollapsed && 'justify-center'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={20} className="shrink-0" />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <span className="block truncate text-sm font-medium">{item.label}</span>
                        {item.description && !isActive && (
                          <span className="block truncate text-xs opacity-70">{item.description}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t space-y-2">
          {!isCollapsed && userEmail && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs text-muted-foreground truncate font-medium">{userEmail}</p>
              <p className="text-xs text-muted-foreground/70 truncate">{getRoleDisplayName()}</p>
            </div>
          )}
          <Button
            variant="outline"
            className={cn(
              'w-full',
              isCollapsed ? 'px-2' : 'justify-start'
            )}
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={20} className={cn(isCollapsed ? '' : 'mr-2')} />
            {!isCollapsed && 'Logout'}
          </Button>
        </div>
      </aside>
    </>
  );
}
