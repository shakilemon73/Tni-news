
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { toast } from 'sonner';
import { Toaster } from "@/components/ui/sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import { getSession, getUserProfile } from '@/lib/services';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        console.info('AdminLayout: Initializing authentication check');
        
        // Get current session
        console.info('Checking existing session');
        const session = await getSession();
        
        if (!session) {
          // No session, redirect to login
          toast('লগইন করুন', {
            description: 'অ্যাডমিন প্যানেল অ্যাকসেস করতে লগইন করুন',
            action: {
              label: 'লগইন',
              onClick: () => navigate('/admin/login')
            }
          });
          navigate('/admin/login');
          return;
        }
        
        console.info('User logged in:', !!session);
        console.info(`Fetching profile for user ID: ${session.user.id}`);
        
        // Get user profile to check if admin/editor
        const profile = await getUserProfile(session.user.id);
        
        console.info('Profile found:', JSON.stringify(profile, null, 2));
        
        // Get user role from user_roles table
        const { getUserRole } = await import('@/lib/services');
        const userRole = await getUserRole(session.user.id);
        
        if (!userRole || !['admin', 'editor'].includes(userRole)) {
          toast('অনুমতি নেই', {
            description: 'এই পেজ অ্যাকসেস করার অনুমতি নেই',
            action: {
              label: 'হোমে যাই',
              onClick: () => navigate('/')
            }
          });
          navigate('/');
          return;
        }
        
        // User is authenticated and authorized
        setIsAuthenticated(true);
        console.info('User profile on initial load:', JSON.stringify(profile, null, 2));
        
      } catch (error) {
        console.error('Authentication error:', error);
        toast('অ্যারর!', {
          description: 'সেশন চেক করতে সমস্যা হয়েছে',
          action: {
            label: 'আবার চেষ্টা',
            onClick: () => window.location.reload()
          }
        });
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Cleanup subscription
    return () => {
      console.info('Cleaning up auth subscription');
    };
  }, [navigate]);
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // If still checking auth status, show loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated, Outlet will handle redirect
  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-gray-100 safe-area-inset">
      {/* Sidebar for Desktop */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        isMobile={isMobile} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 pb-safe">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Toast container */}
      <Toaster position={isMobile ? "top-center" : "bottom-right"} />
    </div>
  );
};

export default AdminLayout;
