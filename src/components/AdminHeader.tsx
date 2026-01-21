import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, Search, User, LogOut, Home, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/services';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

const AdminHeader = ({ toggleSidebar }: AdminHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast.success('সফলভাবে লগআউট হয়েছে');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('লগআউট করতে সমস্যা হয়েছে');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (email: string | undefined) => {
    if (!email) return 'A';
    return email.charAt(0).toUpperCase();
  };
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-border sticky top-0 z-30">
      <div className="px-4 py-3 flex justify-between items-center">
        {/* Left side */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 touch-action-manipulation"
            aria-label="মেনু টগল"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Breadcrumb/Title - Hidden on mobile */}
          <div className="hidden sm:flex items-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>সাইট দেখুন</span>
            </Link>
          </div>
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 relative touch-action-manipulation"
            onClick={() => navigate('/admin/notifications')}
            aria-label="বিজ্ঞপ্তি"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
          </Button>
          
          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-10 gap-2 px-2 touch-action-manipulation"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">অ্যাডমিন</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email || 'admin@example.com'}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  প্রোফাইল
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/" className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  সাইট দেখুন
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? 'লগআউট হচ্ছে...' : 'লগআউট'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
