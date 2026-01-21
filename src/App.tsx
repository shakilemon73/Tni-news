import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createContext, useState, useEffect, Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./hooks/use-auth";
import ErrorBoundary from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";
import HomePage from "./pages/HomePage";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import EPaperPage from "./pages/EPaperPage";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import UserDashboard from "./pages/UserDashboard";
import VideosPage from "./pages/VideosPage";
import ArchivesPage from "./pages/ArchivesPage";
import GalleryPage from "./pages/GalleryPage";
import PodcastsPage from "./pages/PodcastsPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import NewsletterPage from "./pages/NewsletterPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import AboutPage from "./pages/AboutPage";
import CategoriesListPage from "./pages/CategoriesListPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminArticles from "./pages/AdminArticles";
import AdminArticleEditor from "./pages/AdminArticleEditor";
import AdminCategories from './pages/AdminCategories';
import AdminVideos from './pages/AdminVideos';
import AdminMedia from './pages/AdminMedia';
import AdminComments from './pages/AdminComments';
import AdminEPaper from './pages/AdminEPaper';
import AdminUsers from './pages/AdminUsers';
import AdminNotifications from './pages/AdminNotifications';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSettings from './pages/AdminSettings';
import AdminPages from './pages/AdminPages';
import AdminAdvertisements from './pages/AdminAdvertisements';
import ContactPage from './pages/ContactPage';
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

// Create a user preferences context
export const UserPreferencesContext = createContext({
  fontSize: "medium",
  setFontSize: (size: string) => {},
  darkMode: false,
  setDarkMode: (enabled: boolean) => {},
  language: "bn",
  setLanguage: (lang: string) => {},
  recommendedContent: true,
  setRecommendedContent: (enabled: boolean) => {},
});

const queryClient = new QueryClient();

const App = () => {
  // User preferences state
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("bangla-times-font-size") || "medium";
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("bangla-times-dark-mode") === "true";
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("bangla-times-language") || "bn";
  });
  const [recommendedContent, setRecommendedContent] = useState(() => {
    return localStorage.getItem("bangla-times-recommended") !== "false";
  });
  
  // Update local storage when preferences change
  useEffect(() => {
    localStorage.setItem("bangla-times-font-size", fontSize);
  }, [fontSize]);
  
  useEffect(() => {
    localStorage.setItem("bangla-times-dark-mode", darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  
  useEffect(() => {
    localStorage.setItem("bangla-times-language", language);
  }, [language]);
  
  useEffect(() => {
    localStorage.setItem("bangla-times-recommended", recommendedContent.toString());
  }, [recommendedContent]);

  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserPreferencesContext.Provider value={{
            fontSize,
            setFontSize,
            darkMode,
            setDarkMode,
            language,
            setLanguage,
            recommendedContent,
            setRecommendedContent,
          }}>
            <TooltipProvider>
              <ErrorBoundary>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
                        <Route path="article/:id" element={<ArticlePage />} />
                        <Route path="category/:slug" element={<CategoryPage />} />
                        <Route path="epaper" element={<EPaperPage />} />
                        <Route path="search" element={<SearchPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="auth" element={<AuthPage />} />
                        <Route path="dashboard" element={<UserDashboard />} />
                        <Route path="videos" element={<VideosPage />} />
                        <Route path="archives" element={<ArchivesPage />} />
                        <Route path="gallery" element={<GalleryPage />} />
                        <Route path="podcasts" element={<PodcastsPage />} />
                        <Route path="subscription" element={<SubscriptionPage />} />
                        <Route path="newsletter" element={<NewsletterPage />} />
                        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="terms" element={<TermsPage />} />
                        <Route path="about" element={<AboutPage />} />
                        <Route path="categories" element={<CategoriesListPage />} />
                        <Route path="contact" element={<ContactPage />} />
                      </Route>
                    
                      {/* Admin routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="articles" element={<AdminArticles />} />
                        <Route path="articles/new" element={<AdminArticleEditor />} />
                        <Route path="articles/edit/:id" element={<AdminArticleEditor />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="videos" element={<AdminVideos />} />
                        <Route path="media" element={<AdminMedia />} />
                        <Route path="epaper" element={<AdminEPaper />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="comments" element={<AdminComments />} />
                        <Route path="notifications" element={<AdminNotifications />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="pages" element={<AdminPages />} />
                        <Route path="advertisements" element={<AdminAdvertisements />} />
                      </Route>
                    
                      {/* Catch-all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </ErrorBoundary>
            </TooltipProvider>
          </UserPreferencesContext.Provider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
