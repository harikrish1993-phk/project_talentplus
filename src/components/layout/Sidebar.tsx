'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  Calendar,
  BarChart3,
  Settings,
  Building2,
  Search,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Role-based menu items with business-friendly labels
  const getMenuItems = () => {
    const role = user?.role || 'recruiter';

    const baseItems = [
      {
        name: 'My Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        roles: ['all'],
      },
      {
        name: 'Job Openings',
        path: '/jobs',
        icon: Briefcase,
        roles: ['all'],
      },
      {
        name: 'Candidates',
        path: '/candidates',
        icon: Users,
        roles: ['all'],
      },
      {
        name: 'Find Candidates',
        path: '/match',
        icon: Search,
        roles: ['all'],
        tooltip: 'Search and match candidates to jobs',
      },
      {
        name: 'Candidate Submissions',
        path: '/submissions',
        icon: FileText,
        roles: ['all'],
      },
      {
        name: 'Interviews',
        path: '/interviews',
        icon: Calendar,
        roles: ['all'],
      },
      {
        name: 'Clients',
        path: '/clients',
        icon: Building2,
        roles: ['super_admin', 'manager', 'senior_recruiter'],
      },
    ];

    // Management & Admin items
    const managementItems = [
      {
        name: 'Reports & Analytics',
        path: '/reports',
        icon: BarChart3,
        roles: ['super_admin', 'manager'],
      },
      {
        name: 'Administrator Dashboard',
        path: '/dashboard/owner',
        icon: LayoutDashboard,
        roles: ['super_admin'],
      },
      {
        name: 'Manager Dashboard',
        path: '/dashboard/team-lead',
        icon: Users,
        roles: ['manager'],
      },
    ];

    // System items
    const systemItems = [
      {
        name: 'Settings',
        path: '/settings',
        icon: Settings,
        roles: ['all'],
      },
      {
        name: 'Help & Support',
        path: '/help',
        icon: HelpCircle,
        roles: ['all'],
      },
    ];

    // Filter based on user role
    const filterByRole = (items: any[]) => {
      return items.filter(item => 
        item.roles.includes('all') || item.roles.includes(role)
      );
    };

    return {
      main: filterByRole(baseItems),
      management: filterByRole(managementItems),
      system: filterByRole(systemItems),
    };
  };

  const menuItems = getMenuItems();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className={cn('pb-12 w-64 border-r bg-card', className)}>
      <div className="space-y-4 py-4">
        {/* Logo */}
        <div className="px-3 py-2">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              TalentPulse
            </h2>
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="px-3 py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main
          </h3>
          <div className="space-y-1">
            {menuItems.main.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                title={item.tooltip}
              >
                <Button
                  variant={pathname === item.path ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname === item.path && 'bg-secondary'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Management (if applicable) */}
        {menuItems.management.length > 0 && (
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Management
            </h3>
            <div className="space-y-1">
              {menuItems.management.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                >
                  <Button
                    variant={pathname === item.path ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      pathname === item.path && 'bg-secondary'
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* System */}
        <div className="px-3 py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            System
          </h3>
          <div className="space-y-1">
            {menuItems.system.map((item) => (
              <Link
                key={item.path}
                href={item.path}
              >
                <Button
                  variant={pathname === item.path ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname === item.path && 'bg-secondary'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
            
            {/* Sign Out */}
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-3 py-2 mt-auto">
            <div className="px-4 py-2 bg-muted rounded-lg">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {getRoleLabel(user.role)}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// Helper function to get business-friendly role labels
function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    super_admin: 'Company Administrator',
    manager: 'Recruitment Manager',
    senior_recruiter: 'Senior Recruiter',
    recruiter: 'Recruiter',
    coordinator: 'Recruitment Coordinator',
  };
  
  return roleLabels[role] || role;
}