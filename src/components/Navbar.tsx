import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';
import { useCategories } from '@/hooks/use-categories';
import WeatherWidget from './WeatherWidget';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSiteSettings } from '@/lib/services/settings-service';
import NavbarSkeleton from './skeletons/NavbarSkeleton';
import type { SiteSettings } from '@/types/database';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const isMobile = useIsMobile();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use React Query for categories - enables real-time updates (show all categories)
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData || [];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        const settingsData = await getSiteSettings();
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic navigation items from categories
  const navItems = [
    ...categories.map(cat => ({ name: cat.name, url: `/category/${cat.slug}` })),
    { name: 'ই-পেপার', url: '/epaper' }
  ];

  // Check if a nav item is active
  const isActiveNavItem = (url: string) => {
    // Exact match for non-category pages
    if (url === '/epaper') {
      return location.pathname === '/epaper';
    }
    // For category pages, check if current path starts with the category URL
    return location.pathname === url || location.pathname.startsWith(`${url}/`);
  };

  const siteName = settings?.site_name || 'নিউজ পোর্টাল';
  const socialMedia = settings?.social_media as Record<string, string> || {};
  const logoDisplay = socialMedia.header_logo_display || socialMedia.logo_display || 'both';

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const currentDate = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Show skeleton while loading
  const isLoading = settingsLoading || categoriesLoading;
  
  if (isLoading) {
    return <NavbarSkeleton />;
  }

  return (
    <>
      <header className="relative z-20 animate-fade-in">
        {/* Top Bar - Fixed contrast issues */}
        <div className="bg-news-900 py-1.5 sm:py-2">
          <div className="news-container flex justify-between items-center">
            <div className="text-xs sm:text-sm text-white truncate max-w-[200px] sm:max-w-none">{currentDate}</div>
            <div className="flex items-center gap-2 sm:gap-4">
              <WeatherWidget />
            </div>
          </div>
        </div>
        
        {/* Main Navbar */}
        <div className={cn(
          "bg-background border-b transition-all duration-300",
          scrolled ? "sticky top-0 shadow-md" : ""
        )}>
          <div className="news-container py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
                {(settings?.logo && (logoDisplay === 'logo_only' || logoDisplay === 'both')) && (
                  <img 
                    src={settings.logo} 
                    alt={siteName}
                    className="h-8 sm:h-10 md:h-12 w-auto object-contain flex-shrink-0"
                  />
                )}
                {(logoDisplay === 'text_only' || logoDisplay === 'both') && (
                  <div className="flex flex-col min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">{siteName}</h1>
                    {settings?.site_description && (
                      <span className="text-xs md:text-sm text-muted-foreground hidden sm:block truncate">
                        {settings.site_description.length > 50 
                          ? settings.site_description.substring(0, 50) + '...' 
                          : settings.site_description}
                      </span>
                    )}
                  </div>
                )}
              </Link>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleSearch} aria-label="Search">
                  <Search className="h-5 w-5" />
                </Button>
                
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url || ''} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getInitials(profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard">ড্যাশবোর্ড</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile">প্রোফাইল</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        লগআউট
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/auth">
                    <Button variant="ghost" size="icon" aria-label="Login">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                
                {isMobile && (
                  <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Menu">
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Expandable Search */}
            {searchOpen && (
              <div className="py-4 border-t animate-fade-in">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const searchInput = e.currentTarget.elements.namedItem('search') as HTMLInputElement;
                  window.location.href = `/search?q=${encodeURIComponent(searchInput.value)}`;
                }} className="flex gap-2">
                  <input 
                    type="text" 
                    name="search"
                    placeholder="আপনার অনুসন্ধান লিখুন..."
                    className="w-full border border-input rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    autoFocus
                  />
                  <Button type="submit">অনুসন্ধান</Button>
                  <Button type="button" variant="outline" onClick={toggleSearch}>বাতিল</Button>
                </form>
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-2">জনপ্রিয় অনুসন্ধান:</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 4).map(cat => (
                      <Link key={cat.id} to={`/category/${cat.slug}`} className="bg-muted hover:bg-muted/80 px-3 py-1 rounded-full text-sm">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="border-t hidden md:block">
            <div className="news-container">
              <ul className="flex items-center gap-6 py-2 overflow-x-auto">
                {navItems.map((item) => (
                  <li key={item.url}>
                    <Link 
                      to={item.url}
                      className={cn(
                        "whitespace-nowrap text-sm font-medium py-2 block border-b-2 transition-colors",
                        isActiveNavItem(item.url)
                          ? "text-primary border-primary"
                          : "text-foreground hover:text-primary border-transparent hover:border-primary/50"
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </header>
      
      {/* Mobile Menu - Rendered outside header to avoid stacking context issues */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-background z-[100] overflow-hidden animate-fade-in">
          <div className="h-full flex flex-col">
            <div className="news-container py-4 flex justify-between items-center flex-shrink-0 border-b">
              <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                {(settings?.logo && (logoDisplay === 'logo_only' || logoDisplay === 'both')) && (
                  <img 
                    src={settings.logo} 
                    alt={siteName}
                    className="h-8 w-auto object-contain"
                  />
                )}
                {(logoDisplay === 'text_only' || logoDisplay === 'both') && (
                  <span className="text-2xl font-bold text-foreground">{siteName}</span>
                )}
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto news-container py-4">
              <div className="mb-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const searchInput = e.currentTarget.elements.namedItem('mobileSearch') as HTMLInputElement;
                  window.location.href = `/search?q=${encodeURIComponent(searchInput.value)}`;
                  setMobileMenuOpen(false);
                }} className="flex gap-2">
                  <input 
                    type="text" 
                    name="mobileSearch"
                    placeholder="আপনার অনুসন্ধান লিখুন..."
                    className="w-full border border-input rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  />
                  <Button type="submit">অনুসন্ধান</Button>
                </form>
              </div>
              
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <li key={item.url}>
                    <Link 
                      to={item.url}
                      className={cn(
                        "text-lg font-medium py-3 px-3 block rounded-md transition-colors",
                        isActiveNavItem(item.url)
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:text-primary hover:bg-muted"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
