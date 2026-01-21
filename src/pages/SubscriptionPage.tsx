import { useState, useEffect } from 'react';
import { Check, Star, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { getPageBySlug, type Page } from '@/lib/services/page-service';
import { ContentPageSkeleton } from '@/components/skeletons';
import DOMPurify from 'dompurify';

const SubscriptionPage = () => {
  const [pageData, setPageData] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const page = await getPageBySlug('subscription');
        setPageData(page);
      } catch (error) {
        console.error('Error loading subscription page:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const plans = [
    {
      name: 'বেসিক',
      price: 'বিনামূল্যে',
      description: 'সাধারণ পাঠকদের জন্য',
      icon: Star,
      features: [
        'সকল সংবাদ পড়ুন',
        'বিজ্ঞাপনসহ',
        'সীমিত আর্কাইভ অ্যাক্সেস',
        'সাধারণ নিউজলেটার'
      ],
      buttonText: 'বর্তমান প্ল্যান',
      highlighted: false
    },
    {
      name: 'প্রিমিয়াম',
      price: '৳১৯৯/মাস',
      description: 'নিয়মিত পাঠকদের জন্য',
      icon: Crown,
      features: [
        'সকল সংবাদ পড়ুন',
        'বিজ্ঞাপন মুক্ত অভিজ্ঞতা',
        'সম্পূর্ণ আর্কাইভ অ্যাক্সেস',
        'প্রিমিয়াম নিউজলেটার',
        'ই-পেপার ডাউনলোড',
        'এক্সক্লুসিভ কনটেন্ট'
      ],
      buttonText: 'সাবস্ক্রাইব করুন',
      highlighted: true
    },
    {
      name: 'প্রফেশনাল',
      price: '৳৪৯৯/মাস',
      description: 'ব্যবসায়ী ও গবেষকদের জন্য',
      icon: Zap,
      features: [
        'সকল প্রিমিয়াম সুবিধা',
        'API অ্যাক্সেস',
        'ডাটা এক্সপোর্ট',
        'অগ্রাধিকার সাপোর্ট',
        'কাস্টম রিপোর্ট',
        'মাল্টি-ইউজার অ্যাক্সেস'
      ],
      buttonText: 'যোগাযোগ করুন',
      highlighted: false
    }
  ];

  if (isLoading) {
    return <ContentPageSkeleton />;
  }

  return (
    <div className="news-container py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">{pageData?.title || 'সাবস্ক্রিপশন প্ল্যান'}</h1>
        {pageData?.content ? (
          <div 
            className="prose prose-lg max-w-2xl mx-auto"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pageData.content) }}
          />
        ) : (
          <p className="text-muted-foreground max-w-2xl mx-auto">
            আপনার প্রয়োজন অনুযায়ী সঠিক প্ল্যান বেছে নিন। বিজ্ঞাপন মুক্ত অভিজ্ঞতা, 
            এক্সক্লুসিভ কনটেন্ট এবং আরও অনেক কিছু পান।
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={plan.highlighted ? 'border-primary shadow-lg relative' : ''}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                জনপ্রিয়
              </div>
            )}
            <CardHeader className="text-center">
              <plan.icon className={`h-10 w-10 mx-auto mb-2 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <p className="text-3xl font-bold mt-4">{plan.price}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.highlighted ? 'default' : 'outline'}
                disabled={plan.name === 'বেসিক'}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          সকল প্রিমিয়াম প্ল্যান ১৪ দিনের ফ্রি ট্রায়াল সহ আসে। যেকোনো সময় বাতিল করতে পারবেন।
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPage;
