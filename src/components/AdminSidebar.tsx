import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FolderTree, 
  ImageIcon, 
  Settings, 
  Users, 
  BarChart3,
  MessageCircle,
  BellRing,
  PlayCircle,
  Newspaper,
  FileEdit,
  Megaphone,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSiteSettings } from '@/lib/services/settings-service';
import type { SiteSettings } from '@/types/database';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ElementType;
  description?: string;
}

interface AdminSidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, isMobile, onClose }: AdminSidebarProps) => {
  const location = useLocation();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(console.error);
  }, []);

  const siteName = settings?.site_name || 'নিউজ পোর্টাল';
  
  // Organized menu with better context-based icons
  const sidebarItems: SidebarItem[] = [
    { name: 'ড্যাশবোর্ড', path: '/admin', icon: LayoutDashboard, description: 'সার্বিক পরিসংখ্যান' },
    { name: 'আর্টিকেল', path: '/admin/articles', icon: FileText, description: 'সংবাদ ও লেখা' },
    { name: 'বিভাগসমূহ', path: '/admin/categories', icon: FolderTree, description: 'ক্যাটেগরি ব্যবস্থাপনা' },
    { name: 'মিডিয়া', path: '/admin/media', icon: ImageIcon, description: 'ছবি ও ফাইল' },
    { name: 'ভিডিও', path: '/admin/videos', icon: PlayCircle, description: 'ভিডিও পোস্ট' },
    { name: 'ই-পেপার', path: '/admin/epaper', icon: Newspaper, description: 'ডিজিটাল সংবাদপত্র' },
    { name: 'বিজ্ঞাপন', path: '/admin/advertisements', icon: Megaphone, description: 'অ্যাড ম্যানেজমেন্ট' },
    { name: 'ব্যবহারকারী', path: '/admin/users', icon: Users, description: 'ইউজার ও রোল' },
    { name: 'মন্তব্য', path: '/admin/comments', icon: MessageCircle, description: 'কমেন্ট মডারেশন' },
    { name: 'বিজ্ঞপ্তি', path: '/admin/notifications', icon: BellRing, description: 'নোটিফিকেশন' },
    { name: 'পরিসংখ্যান', path: '/admin/analytics', icon: BarChart3, description: 'অ্যানালিটিক্স' },
    { name: 'পেজসমূহ', path: '/admin/pages', icon: FileEdit, description: 'স্ট্যাটিক পেজ' },
    { name: 'সেটিংস', path: '/admin/settings', icon: Settings, description: 'সাইট কনফিগারেশন' },
  ];

  // If mobile and not open, don't render
  if (isMobile && !isOpen) {
    return null;
  }
  
  const sidebarClasses = cn(
    "bg-white dark:bg-gray-900 border-r border-border h-screen flex flex-col",
    isMobile ? "fixed top-0 left-0 z-50 w-72 shadow-xl transition-transform duration-300 ease-in-out" : "w-64 lg:w-72",
    isMobile && !isOpen && "-translate-x-full"
  );
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Newspaper className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">{siteName}</h1>
              <p className="text-xs text-muted-foreground">অ্যাডমিন প্যানেল</p>
            </div>
          </div>
          {isMobile && (
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors touch-action-manipulation"
              aria-label="সাইডবার বন্ধ করুন"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="px-3">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const isExactMatch = location.pathname === item.path;
                const isPrefixMatch = 
                  item.path !== '/admin' && 
                  location.pathname.startsWith(item.path);
                const isActive = isExactMatch || isPrefixMatch;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={isMobile ? onClose : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        "min-h-[44px] touch-action-manipulation", // Touch-friendly size
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      )} />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{item.name}</span>
                        {!isMobile && item.description && (
                          <p className={cn(
                            "text-xs truncate mt-0.5",
                            isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </ScrollArea>
        
        {/* Footer */}
        <div className="p-3 border-t border-border shrink-0">
          <div className="px-3 py-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} {siteName}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
