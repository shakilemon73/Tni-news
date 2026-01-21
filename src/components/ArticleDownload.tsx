import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, FileImage, FileText, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getSiteSettings } from '@/lib/services/settings-service';
import type { Article, Category, SiteSettings } from '@/types/database';

interface ArticleDownloadProps {
  article: Article;
  categoryName: string;
  authorName?: string;
}

// Helper function to format date in Bengali
const formatDateBengali = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Helper function to format time in Bengali
const formatTimeBengali = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Strip HTML tags for plain text
const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

// Truncate text to a certain length
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Split content into paragraphs for better formatting
const splitIntoParagraphs = (text: string): string[] => {
  return text
    .split(/\n\n+|\r\n\r\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
};

// Download template settings interface
interface DownloadTemplateSettings {
  headerStyle: 'banner' | 'text';
  showLogo: boolean;
  showSiteName: boolean;
  showTagline: boolean;
  showFooterLogo: boolean;
  footerEmail: string;
  footerWebsite: string;
  showTags: boolean;
  showExcerpt: boolean;
  columns: 1 | 2;
}

const ArticleDownload = ({ article, categoryName, authorName }: ArticleDownloadProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [downloadType, setDownloadType] = useState<'png' | 'pdf'>('png');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  const siteName = settings?.site_name || 'বাংলা টাইমস';
  const siteTagline = settings?.site_description ? settings.site_description.substring(0, 50) : 'বিশ্বস্ত সংবাদের ঠিকানা';
  const currentDate = formatDateBengali(article.publish_date);
  const currentTime = formatTimeBengali(article.publish_date);
  const plainContent = stripHtml(article.content);
  const contentParagraphs = splitIntoParagraphs(plainContent);

  // Get download template settings from social_media config
  const socialMedia = settings?.social_media || {};
  const templateSettings: DownloadTemplateSettings = {
    headerStyle: (socialMedia.download_header_style as 'banner' | 'text') || 'banner',
    showLogo: socialMedia.download_show_logo !== false,
    showSiteName: socialMedia.download_show_site_name !== false,
    showTagline: socialMedia.download_show_tagline !== false,
    showFooterLogo: socialMedia.download_show_footer_logo !== false,
    footerEmail: socialMedia.download_footer_email || settings?.contact_email || 'info@example.com',
    footerWebsite: socialMedia.download_footer_website || 'www.example.com',
    showTags: socialMedia.download_show_tags !== false,
    showExcerpt: socialMedia.download_show_excerpt !== false,
    columns: (socialMedia.download_columns as 1 | 2) || 2,
  };

  const generateImage = async () => {
    if (!templateRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const link = document.createElement('a');
      link.download = `${article.slug || 'article'}-bangla-times.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('ছবি ডাউনলোড হয়েছে');
      setShowPreview(false);
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('ছবি তৈরিতে সমস্যা হয়েছে');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    if (!templateRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${article.slug || 'article'}-bangla-times.pdf`);
      
      toast.success('PDF ডাউনলোড হয়েছে');
      setShowPreview(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('PDF তৈরিতে সমস্যা হয়েছে');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            ডাউনলোড
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => {
              setDownloadType('png');
              setShowPreview(true);
            }} 
            className="gap-2 cursor-pointer"
          >
            <FileImage className="h-4 w-4" />
            ছবি হিসেবে ডাউনলোড (PNG)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              setDownloadType('pdf');
              setShowPreview(true);
            }} 
            className="gap-2 cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            PDF হিসেবে ডাউনলোড
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>ডাউনলোড প্রিভিউ</span>
              <div className="flex gap-2">
                {downloadType === 'png' ? (
                  <Button 
                    size="sm" 
                    onClick={generateImage}
                    disabled={isGenerating}
                    className="gap-2"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileImage className="h-4 w-4" />}
                    PNG ডাউনলোড
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="gap-2"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    PDF ডাউনলোড
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Newspaper Template */}
          <div 
            ref={templateRef} 
            className="bg-white p-8 shadow-lg border"
            style={{ 
              width: '800px', 
              fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
              color: '#000000'
            }}
          >
            {/* Header - Newspaper Masthead */}
            <div className="border-b-4 border-black pb-4 mb-4">
              <div className="text-center">
                {/* Banner Style Header */}
                {templateSettings.headerStyle === 'banner' ? (
                  <>
                    {templateSettings.showLogo && settings?.logo && (
                      <div className="flex justify-center mb-2">
                        <img 
                          src={settings.logo} 
                          alt={siteName}
                          className="h-12 w-auto object-contain"
                          crossOrigin="anonymous"
                        />
                      </div>
                    )}
                    {templateSettings.showSiteName && (
                      <h1 
                        className="text-4xl font-bold mb-1"
                        style={{ 
                          fontFamily: "'Hind Siliguri', serif",
                          letterSpacing: '2px',
                          color: '#1a1a1a'
                        }}
                      >
                        {siteName}
                      </h1>
                    )}
                    {templateSettings.showTagline && (
                      <p className="text-sm mb-2" style={{ color: '#4a4a4a' }}>{siteTagline}</p>
                    )}
                  </>
                ) : (
                  /* Text Only Header */
                  <>
                    {templateSettings.showSiteName && (
                      <h1 
                        className="text-3xl font-bold mb-1"
                        style={{ 
                          fontFamily: "'Hind Siliguri', serif",
                          color: '#1a1a1a'
                        }}
                      >
                        {siteName}
                      </h1>
                    )}
                    {templateSettings.showTagline && (
                      <p className="text-sm mb-2" style={{ color: '#4a4a4a' }}>{siteTagline}</p>
                    )}
                  </>
                )}
                <div className="flex justify-between items-center text-xs border-t pt-2" style={{ color: '#555555', borderColor: '#cccccc' }}>
                  <span>প্রকাশ: {currentDate}, {currentTime}</span>
                  <span className="font-semibold" style={{ color: '#b91c1c' }}>{categoryName}</span>
                  <span>{templateSettings.footerWebsite}</span>
                </div>
              </div>
            </div>

            {/* Article Title */}
            <h2 
              className="text-2xl font-bold mb-3 leading-relaxed"
              style={{ 
                lineHeight: '1.5',
                color: '#1a1a1a'
              }}
            >
              {article.title}
            </h2>

            {/* Author & Date Line */}
            <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: '#4a4a4a' }}>
              <span className="font-semibold">{authorName || 'স্টাফ রিপোর্টার'}</span>
              <span style={{ color: '#999999' }}>|</span>
              <span>{currentDate}</span>
            </div>

            {/* Excerpt/Subtitle */}
            {templateSettings.showExcerpt && article.excerpt && (
              <div 
                className="mb-4 p-4 border-l-4"
                style={{ lineHeight: '1.6', backgroundColor: '#f9f9f9', borderColor: '#333333' }}
              >
                <p className="text-base font-medium" style={{ color: '#444444' }}>
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Featured Image Only */}
            {article.featured_image && (
              <div className="mb-4">
                <img 
                  src={article.featured_image} 
                  alt={article.title}
                  className="w-full h-auto max-h-80 object-cover"
                  crossOrigin="anonymous"
                />
                <p className="text-xs mt-1 text-right italic" style={{ color: '#666666' }}>
                  ছবি: {article.image_credit || siteName}
                </p>
              </div>
            )}

            {/* Article Content Preview - Better formatted paragraphs */}
            <div 
              className="text-sm leading-relaxed text-justify mb-6"
              style={{ 
                lineHeight: '1.8',
                columnCount: templateSettings.columns,
                columnGap: '24px',
                color: '#333333'
              }}
            >
              {contentParagraphs.slice(0, 8).map((paragraph, idx) => (
                <p key={idx} className="mb-3" style={{ textIndent: idx === 0 ? '0' : '1.5em' }}>
                  {truncateText(paragraph, 400)}
                </p>
              ))}
              {contentParagraphs.length > 8 && (
                <p className="italic" style={{ color: '#666666' }}>...আরও পড়ুন</p>
              )}
            </div>

            {/* Tags */}
            {templateSettings.showTags && article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 pt-4 border-t" style={{ borderColor: '#e5e5e5' }}>
                <span className="text-xs font-semibold" style={{ color: '#4a4a4a' }}>ট্যাগ:</span>
                {article.tags.slice(0, 5).map((tag, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 rounded"
                    style={{ backgroundColor: '#f0f0f0', color: '#333333' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="border-t-2 border-black pt-4 mt-4">
              <div className="flex justify-between items-center text-xs" style={{ color: '#4a4a4a' }}>
                <div className="flex items-center gap-2">
                  {templateSettings.showFooterLogo && settings?.logo && (
                    <img 
                      src={settings.logo} 
                      alt={siteName}
                      className="h-8 w-auto object-contain"
                      crossOrigin="anonymous"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{siteName}</p>
                    <p>{siteTagline}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p>ই-মেইল: {templateSettings.footerEmail}</p>
                  <p>ওয়েবসাইট: {templateSettings.footerWebsite}</p>
                </div>
              </div>
              <div className="text-center mt-3 pt-3 border-t" style={{ borderColor: '#cccccc' }}>
                <p className="text-xs" style={{ color: '#666666' }}>
                  © {new Date().getFullYear()} {siteName}। সর্বস্বত্ব সংরক্ষিত।
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ArticleDownload;
