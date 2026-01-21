
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { Bell, BookOpen, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BreakingNews from "./BreakingNews";
import PersonalizationToggle from "./PersonalizationToggle";
import TrendingTopics from "./TrendingTopics";

const Layout = () => {
  const { toast } = useToast();
  const [showNotification, setShowNotification] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Check for live updates periodically
  useEffect(() => {
    // Simulate a new update after 10 seconds
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);

  // Track reading progress and scroll position
  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTop / scrollHeight * 100;
      setReadingProgress(Math.min(progress, 100));
      
      // Show scroll to top button when user scrolls down 300px
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', updateReadingProgress);
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);
  
  const handleNotificationClick = () => {
    setShowNotification(false);
    toast({
      title: "নতুন আপডেট",
      description: "সর্বশেষ খবর পড়ুন",
      action: (
        <Button variant="outline" size="sm">
          দেখুন
        </Button>
      ),
    });
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip to main content - Farai Madzima Accessibility */}
      <a href="#main-content" className="skip-link">
        মূল বিষয়বস্তুতে যান
      </a>
      
      <Navbar />
      <BreakingNews />
      <TrendingTopics />
      
      {/* Reading Progress Bar - Don Norman Feedback */}
      {readingProgress > 0 && (
        <div 
          className="fixed top-0 left-0 z-50 w-full h-1 bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(readingProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
        >
          <div 
            className="h-full bg-primary transition-all duration-150 ease-out" 
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}
      
      {/* Fixed Action Buttons - Luke Wroblewski Touch Targets */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
        <PersonalizationToggle />
        
        {showNotification && (
          <Button 
            onClick={handleNotificationClick} 
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full flex items-center gap-2 touch-target shadow-elevated animate-scale-in"
            aria-live="polite"
          >
            <Bell size={16} /> 
            <span>নতুন আপডেট</span>
          </Button>
        )}
        
        <Button
          variant="outline"
          size="icon"
          className="bg-background shadow-soft rounded-full touch-target hover-lift"
          title="কত সময় পড়া হয়েছে"
          aria-label="Reading time tracker"
        >
          <BookOpen className="h-5 w-5" />
        </Button>
        
        {showScrollTop && (
          <Button
            variant="default"
            size="icon"
            className="rounded-full shadow-elevated touch-target animate-slide-in hover-lift"
            onClick={scrollToTop}
            aria-label="উপরে যান"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Main Content */}
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
