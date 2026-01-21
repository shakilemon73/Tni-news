import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { getPageBySlug } from '@/lib/services/page-service';
import { getSiteSettings } from '@/lib/services/settings-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ContactPageSkeleton } from '@/components/skeletons';
import type { Page, SiteSettings } from '@/types/database';

const ContactPage = () => {
  const [pageData, setPageData] = useState<Page | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [page, siteSettings] = await Promise.all([
          getPageBySlug('contact'),
          getSiteSettings()
        ]);
        setPageData(page);
        setSettings(siteSettings);
      } catch (error) {
        console.error('Error loading contact page:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "বার্তা পাঠানো হয়েছে",
      description: "আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
    });
    
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <ContactPageSkeleton />;
  }

  const siteName = settings?.site_name || 'নিউজ পোর্টাল';
  const socialMedia = settings?.social_media as Record<string, string> || {};

  return (
    <>
      <Helmet>
        <title>যোগাযোগ করুন - {siteName}</title>
        <meta name="description" content={pageData?.meta_description || `${siteName}-এর সাথে যোগাযোগ করুন`} />
      </Helmet>

      <div className="news-container py-8">
        <h1 className="text-3xl font-bold mb-6">যোগাযোগ করুন</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-card rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">আমাদের মেসেজ করুন</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="আপনার নাম"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="ইমেইল ঠিকানা"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="বিষয়"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="আপনার বার্তা লিখুন..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                বার্তা পাঠান
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">যোগাযোগের তথ্য</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">ইমেইল</p>
                    <a href={`mailto:${settings?.contact_email || 'contact@example.com'}`} className="text-muted-foreground hover:text-primary">
                      {settings?.contact_email || 'contact@example.com'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">ফোন</p>
                    <a href={`tel:${settings?.contact_phone || ''}`} className="text-muted-foreground hover:text-primary">
                      {settings?.contact_phone || 'উল্লেখ করা হয়নি'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">ঠিকানা</p>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {settings?.contact_address || 'উল্লেখ করা হয়নি'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic content from database */}
            {pageData?.content && (
              <div className="bg-card rounded-lg p-6 shadow prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
