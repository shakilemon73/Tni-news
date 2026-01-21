import { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { getPageBySlug, type Page } from '@/lib/services/page-service';
import { ContentPageSkeleton } from '@/components/skeletons';
import DOMPurify from 'dompurify';

const NewsletterPage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [preferences, setPreferences] = useState({
    daily: true,
    weekly: false,
    breaking: true,
    sports: false,
    tech: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageData, setPageData] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const page = await getPageBySlug('newsletter');
        setPageData(page);
      } catch (error) {
        console.error('Error loading newsletter page:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('ইমেইল দিন');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    toast.success('নিউজলেটার সাবস্ক্রিপশন সফল হয়েছে!');
    setEmail('');
    setName('');
  };

  const newsletters = [
    {
      id: 'daily',
      name: 'দৈনিক সংবাদ সারাংশ',
      description: 'প্রতিদিন সকালে দিনের গুরুত্বপূর্ণ সংবাদগুলো আপনার ইনবক্সে'
    },
    {
      id: 'weekly',
      name: 'সাপ্তাহিক বিশ্লেষণ',
      description: 'সপ্তাহের সেরা প্রতিবেদন ও বিশ্লেষণ'
    },
    {
      id: 'breaking',
      name: 'ব্রেকিং নিউজ',
      description: 'জরুরি সংবাদ আপডেট তাৎক্ষণিকভাবে'
    },
    {
      id: 'sports',
      name: 'খেলার খবর',
      description: 'সকল খেলার আপডেট ও স্কোর'
    },
    {
      id: 'tech',
      name: 'প্রযুক্তি আপডেট',
      description: 'প্রযুক্তি বিশ্বের সর্বশেষ খবর'
    }
  ];

  if (isLoading) {
    return <ContentPageSkeleton />;
  }

  return (
    <div className="news-container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Mail className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-4">{pageData?.title || 'নিউজলেটার সাবস্ক্রাইব করুন'}</h1>
          {pageData?.content ? (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pageData.content) }}
            />
          ) : (
            <p className="text-muted-foreground">
              আপনার ইনবক্সে সরাসরি সর্বশেষ সংবাদ পান। আপনার পছন্দ অনুযায়ী নিউজলেটার বেছে নিন।
            </p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>আপনার তথ্য</CardTitle>
            <CardDescription>নিউজলেটার পেতে আপনার ইমেইল দিন</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">নাম (ঐচ্ছিক)</label>
                  <Input
                    type="text"
                    placeholder="আপনার নাম"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">ইমেইল *</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-4 block">নিউজলেটার পছন্দ</label>
                <div className="space-y-4">
                  {newsletters.map((newsletter) => (
                    <div key={newsletter.id} className="flex items-start gap-3">
                      <Checkbox
                        id={newsletter.id}
                        checked={preferences[newsletter.id as keyof typeof preferences]}
                        onCheckedChange={(checked) => 
                          setPreferences(prev => ({...prev, [newsletter.id]: checked}))
                        }
                      />
                      <div>
                        <label htmlFor={newsletter.id} className="font-medium cursor-pointer">
                          {newsletter.name}
                        </label>
                        <p className="text-sm text-muted-foreground">{newsletter.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'সাবস্ক্রাইব হচ্ছে...' : 'সাবস্ক্রাইব করুন'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                সাবস্ক্রাইব করে আপনি আমাদের <a href="/privacy-policy" className="underline">গোপনীয়তা নীতি</a> মেনে নিচ্ছেন।
                যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewsletterPage;
