import { useState, useEffect } from 'react';
import { Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPageBySlug, type Page } from '@/lib/services/page-service';
import { ContentPageSkeleton } from '@/components/skeletons';
import DOMPurify from 'dompurify';

const PodcastsPage = () => {
  const [pageData, setPageData] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const page = await getPageBySlug('podcasts');
        setPageData(page);
      } catch (error) {
        console.error('Error loading podcasts page:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <ContentPageSkeleton />;
  }

  return (
    <div className="news-container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{pageData?.title || 'পডকাস্ট'}</h1>
        <p className="text-muted-foreground">আমাদের অডিও কনটেন্ট শুনুন</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <Headphones className="h-20 w-20 mx-auto mb-6 text-primary" />
          
          {pageData?.content ? (
            <div 
              className="prose prose-lg max-w-none mb-6 text-left"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pageData.content) }}
            />
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">শীঘ্রই আসছে!</h2>
              <p className="text-muted-foreground mb-6">
                আমরা শীঘ্রই আমাদের পডকাস্ট সেকশন চালু করতে যাচ্ছি। 
                সংবাদ, বিশ্লেষণ এবং বিশেষ সাক্ষাৎকার শুনতে আমাদের সাথেই থাকুন।
              </p>
            </>
          )}
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" disabled>
              Spotify
            </Button>
            <Button variant="outline" disabled>
              Apple Podcasts
            </Button>
            <Button variant="outline" disabled>
              Google Podcasts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PodcastsPage;
