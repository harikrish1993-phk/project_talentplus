// ============================================================================
// Navigation Component - Main layout wrapper with Sidebar and Header
// Path: components/Navigation.tsx
// ============================================================================

'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { toast } from 'react-hot-toast';

interface NavigationProps {
  children?: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Public routes that don't need navigation
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Fetch user details from database
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching user:', error);
          } else {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error in fetchUser:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isPublicRoute) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [pathname, isPublicRoute]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const handleSearch = (query: string) => {
    // Implement global search
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleNotificationClick = () => {
    router.push('/notifications');
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  // Don't render navigation on public routes
  if (isPublicRoute) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        userRole={user?.role || 'recruiter'} 
        onLogout={handleLogout} 
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          userName={user?.full_name || user?.email || 'User'}
          userEmail={user?.email || ''}
          userAvatar={user?.avatar_url}
          notificationCount={0}
          onSearch={handleSearch}
          onNotificationClick={handleNotificationClick}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
          onLogout={handleLogout}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}