import { useState, useEffect } from 'react';
import { Users, Target, Award, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getPageBySlug, type Page } from '@/lib/services/page-service';
import { getSiteSettings, type SiteSettings } from '@/lib/services/settings-service';
import { AboutPageSkeleton } from '@/components/skeletons';
import DOMPurify from 'dompurify';

const AboutPage = () => {
  const [pageData, setPageData] = useState<Page | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [page, siteSettings] = await Promise.all([
          getPageBySlug('about'),
          getSiteSettings()
        ]);
        setPageData(page);
        setSettings(siteSettings);
      } catch (error) {
        console.error('Error loading about page:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = [
    { label: 'প্রতিষ্ঠা সাল', value: '২০১৫' },
    { label: 'দৈনিক পাঠক', value: '১০ লাখ+' },
    { label: 'সাংবাদিক দল', value: '১০০+' },
    { label: 'দেশে পাঠক', value: '৫০+' }
  ];

  const values = [
    {
      icon: Target,
      title: 'সত্যের প্রতি নিষ্ঠা',
      description: 'আমরা সঠিক, নির্ভুল এবং নিরপেক্ষ সংবাদ পরিবেশনে প্রতিশ্রুতিবদ্ধ।'
    },
    {
      icon: Users,
      title: 'পাঠক কেন্দ্রিক',
      description: 'আমাদের পাঠকদের চাহিদা এবং মতামত আমাদের কাজের কেন্দ্রবিন্দু।'
    },
    {
      icon: Award,
      title: 'গুণগত মান',
      description: 'আমরা সর্বোচ্চ সাংবাদিকতার মান বজায় রাখতে সচেষ্ট।'
    },
    {
      icon: Globe,
      title: 'বৈশ্বিক দৃষ্টিভঙ্গি',
      description: 'স্থানীয় এবং আন্তর্জাতিক উভয় সংবাদে আমরা সমান গুরুত্ব দিই।'
    }
  ];

  if (isLoading) {
    return <AboutPageSkeleton />;
  }

  const siteName = settings?.site_name || 'বাংলা টাইমস';

  return (
    <div className="news-container py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">{pageData?.title || 'আমাদের সম্পর্কে'}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {siteName} বাংলাদেশ এবং বিশ্বব্যাপী বাংলা ভাষাভাষী মানুষের জন্য 
          নির্ভরযোগ্য সংবাদ সেবা প্রদানে নিবেদিত।
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="py-6">
              <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dynamic Content from Database */}
      {pageData?.content && (
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pageData.content) }}
            />
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1504711434969-e33886168f5c"
                alt={`${siteName} নিউজরুম`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </section>
      )}

      {/* Values */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">আমাদের মূল্যবোধ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index}>
              <CardContent className="py-6 text-center">
                <value.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-muted rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">যোগাযোগ করুন</h2>
        <p className="text-muted-foreground mb-6">
          আমাদের সাথে যোগাযোগ করতে চাইলে নিচের মাধ্যমগুলো ব্যবহার করুন
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div>
            <p className="font-semibold">ইমেইল</p>
            <p className="text-muted-foreground">{settings?.contact_email || 'উল্লেখ করা হয়নি'}</p>
          </div>
          <div>
            <p className="font-semibold">ফোন</p>
            <p className="text-muted-foreground">{settings?.contact_phone || 'উল্লেখ করা হয়নি'}</p>
          </div>
          <div>
            <p className="font-semibold">ঠিকানা</p>
            <p className="text-muted-foreground">{settings?.contact_address || 'উল্লেখ করা হয়নি'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
