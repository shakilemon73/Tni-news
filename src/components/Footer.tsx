import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from "lucide-react";
import { getCategories } from "@/lib/services/category-service";
import { getSiteSettings } from "@/lib/services/settings-service";
import type { Category, SiteSettings } from "@/types/database";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, settingsData] = await Promise.all([
          getCategories(),
          getSiteSettings()
        ]);
        setCategories(categoriesData); // Show all categories
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading footer data:', error);
      }
    };
    loadData();
  }, []);
  
  const features = [
    { name: 'ই-পেপার', url: '/epaper' },
    { name: 'আর্কাইভ', url: '/archives' },
    { name: 'ফটো গ্যালারি', url: '/gallery' },
    { name: 'ভিডিও', url: '/videos' },
    { name: 'পডকাস্ট', url: '/podcasts' },
    { name: 'সাবস্ক্রিপশন', url: '/subscription' },
    { name: 'নিউজলেটার', url: '/newsletter' },
  ];
  
  const socialMedia = settings?.social_media as Record<string, string> || {};
  
  const socialLinks = [
    { icon: Facebook, url: socialMedia.facebook || '#', label: 'Facebook' },
    { icon: Twitter, url: socialMedia.twitter || '#', label: 'Twitter' },
    { icon: Instagram, url: socialMedia.instagram || '#', label: 'Instagram' },
    { icon: Youtube, url: socialMedia.youtube || '#', label: 'Youtube' },
  ];

  const siteName = settings?.site_name || 'নিউজ পোর্টাল';
  const logoDisplay = socialMedia.footer_logo_display || 'both';

  return (
    <footer className="bg-news-900" role="contentinfo">
      <div className="news-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About - Dieter Rams: Useful & Understandable */}
          <div className="stagger-item">
            <div className="flex items-center gap-3 mb-4">
              {(settings?.logo && (logoDisplay === 'logo_only' || logoDisplay === 'both')) && (
                <img 
                  src={settings.logo} 
                  alt={siteName}
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
              )}
              {(logoDisplay === 'text_only' || logoDisplay === 'both') && (
                <h2 className="text-xl font-bold text-white">{siteName}</h2>
              )}
            </div>
            <p className="mb-4 text-gray-300 leading-relaxed">
              {settings?.site_description || `${siteName} হল বাংলাদেশের একটি আধুনিক সংবাদ প্লাটফর্ম, যা সারা বিশ্বের বাংলা ভাষাভাষী মানুষের জন্য নির্ভরযোগ্য এবং সময়োপযোগী সংবাদ সরবরাহ করে।`}
            </p>
            {/* Social Links - Luke Wroblewski: 44px Touch Targets */}
            <div className="flex space-x-3" role="list" aria-label="সোশ্যাল মিডিয়া লিংক">
              {socialLinks.map((social) => (
                <a 
                  key={social.label}
                  href={social.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-news-800 p-2.5 rounded-full hover:bg-primary transition-all duration-200 text-white touch-target hover-lift"
                  aria-label={social.label}
                  role="listitem"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
          
          {/* News Categories - Steve Krug: Clear Navigation */}
          <nav className="stagger-item" aria-labelledby="footer-categories">
            <h3 id="footer-categories" className="text-lg font-semibold mb-4 text-white">সংবাদ বিভাগ</h3>
            <ul className="space-y-2" role="list">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      to={`/category/${category.slug}`} 
                      className="text-gray-300 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all duration-200" />
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">বিভাগ লোড হচ্ছে...</li>
              )}
            </ul>
          </nav>
          
          {/* Features - Susan Weinschenk: Scannable Lists */}
          <nav className="stagger-item" aria-labelledby="footer-features">
            <h3 id="footer-features" className="text-lg font-semibold mb-4 text-white">বিশেষ বিভাগ</h3>
            <ul className="space-y-2" role="list">
              {features.map((feature) => (
                <li key={feature.url}>
                  <Link 
                    to={feature.url} 
                    className="text-gray-300 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all duration-200" />
                    {feature.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Contact - Alan Cooper: Goal-Oriented */}
          <div className="stagger-item">
            <h3 className="text-lg font-semibold mb-4 text-white">যোগাযোগ করুন</h3>
            <address className="space-y-3 text-gray-300 not-italic">
              {settings?.contact_email && (
                <a 
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors duration-200 group"
                >
                  <span className="bg-news-800 p-2 rounded-full group-hover:bg-primary transition-colors duration-200">
                    <Mail size={14} className="text-white" />
                  </span>
                  <span>{settings.contact_email}</span>
                </a>
              )}
              {settings?.contact_phone && (
                <a 
                  href={`tel:${settings.contact_phone}`}
                  className="flex items-center gap-2 hover:text-white transition-colors duration-200 group"
                >
                  <span className="bg-news-800 p-2 rounded-full group-hover:bg-primary transition-colors duration-200">
                    <Phone size={14} className="text-white" />
                  </span>
                  <span>{settings.contact_phone}</span>
                </a>
              )}
              {settings?.contact_address && (
                <p className="pt-2 text-gray-300 whitespace-pre-line leading-relaxed">
                  {settings.contact_address}
                </p>
              )}
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 mt-3 text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
              >
                যোগাযোগ ফর্ম 
                <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </address>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar - Jonathan Ive: Minimal & Purposeful */}
      <div className="border-t border-news-800">
        <div className="news-container py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-white">&copy; {currentYear} {siteName}। সর্বস্বত্ব সংরক্ষিত।</p>
            <nav className="flex flex-wrap justify-center gap-4" aria-label="ফুটার লিংক">
              <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors duration-200">
                গোপনীয়তা নীতি
              </Link>
              <Link to="/terms" className="text-gray-300 hover:text-white transition-colors duration-200">
                ব্যবহারের শর্তাবলী
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200">
                আমাদের সম্পর্কে
              </Link>
              <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
                যোগাযোগ
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
