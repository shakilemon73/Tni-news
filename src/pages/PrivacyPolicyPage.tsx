import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { getPageBySlug, type Page } from '@/lib/services/page-service';
import { ContentPageSkeleton } from '@/components/skeletons';
import DOMPurify from 'dompurify';

const PrivacyPolicyPage = () => {
  const [pageData, setPageData] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const page = await getPageBySlug('privacy-policy');
        setPageData(page);
      } catch (error) {
        console.error('Error loading privacy policy:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <ContentPageSkeleton />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="news-container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">{pageData?.title || 'গোপনীয়তা নীতি'}</h1>
          <p className="text-muted-foreground">
            সর্বশেষ আপডেট: {pageData ? formatDate(pageData.updated_at) : 'জানুয়ারি ২০২৬'}
          </p>
        </div>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(pageData?.content || '<p>কনটেন্ট লোড হচ্ছে...</p>') 
          }}
        />
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
