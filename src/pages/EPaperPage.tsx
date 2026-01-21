import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Share2, Calendar, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { EPaperPageSkeleton } from '@/components/skeletons';
import { 
  getLatestEPaper, 
  getEPaperByDate, 
  getEPaperDates,
  type EPaper 
} from '@/lib/services/epaper-service';

const EPaperPage = () => {
  const [currentEPaper, setCurrentEPaper] = useState<EPaper | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      const [latestEPaper, dates] = await Promise.all([
        getLatestEPaper(),
        getEPaperDates()
      ]);
      
      setCurrentEPaper(latestEPaper);
      setAvailableDates(dates.map(d => new Date(d)));
      
      if (latestEPaper) {
        setDate(new Date(latestEPaper.publish_date));
      }
    } catch (error) {
      console.error('Error loading e-paper:', error);
      toast.error('ই-পেপার লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = async (newDate: Date | undefined) => {
    if (!newDate) return;
    
    setDate(newDate);
    const dateStr = newDate.toISOString().split('T')[0];
    
    try {
      setIsLoading(true);
      const epaper = await getEPaperByDate(dateStr);
      
      if (epaper) {
        setCurrentEPaper(epaper);
      } else {
        toast.error('এই তারিখের ই-পেপার পাওয়া যায়নি');
      }
    } catch (error) {
      console.error('Error loading e-paper:', error);
      toast.error('ই-পেপার লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevDate = () => {
    if (!date || availableDates.length === 0) return;
    
    const currentIndex = availableDates.findIndex(
      d => d.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
    
    if (currentIndex < availableDates.length - 1) {
      handleDateChange(availableDates[currentIndex + 1]);
    }
  };

  const handleNextDate = () => {
    if (!date || availableDates.length === 0) return;
    
    const currentIndex = availableDates.findIndex(
      d => d.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
    
    if (currentIndex > 0) {
      handleDateChange(availableDates[currentIndex - 1]);
    }
  };
  
  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(zoomLevel + 10);
    }
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(zoomLevel - 10);
    }
  };

  const handleShare = async () => {
    if (!currentEPaper) return;
    
    try {
      await navigator.share({
        title: currentEPaper.title,
        url: window.location.href
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('লিংক কপি হয়েছে');
    }
  };
  
  const formatBanglaDate = (dateValue: Date | undefined) => {
    if (!dateValue) return '';
    return new Intl.DateTimeFormat('bn-BD', {
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      weekday: 'long'
    }).format(dateValue);
  };

  const isDateAvailable = (checkDate: Date) => {
    return availableDates.some(
      d => d.toISOString().split('T')[0] === checkDate.toISOString().split('T')[0]
    );
  };

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="news-container">
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          {/* E-Paper Header */}
          <div className="border-b p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <h1 className="text-2xl font-bold">ই-পেপার</h1>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrevDate}
                    disabled={isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatBanglaDate(date)}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        initialFocus
                        disabled={(checkDate) => !isDateAvailable(checkDate)}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNextDate}
                    disabled={isLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* E-Paper Controls */}
          {currentEPaper && (
            <div className="border-b bg-muted/50 p-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">{currentEPaper.title}</h2>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleZoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm min-w-[50px] text-center">{zoomLevel}%</span>
                    <Button variant="outline" size="sm" onClick={handleZoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={currentEPaper.pdf_url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-1" />
                        ডাউনলোড
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-1" />
                      শেয়ার
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* E-Paper Content */}
          <div className="min-h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : currentEPaper ? (
              <div className="p-4 flex justify-center bg-muted">
                <div 
                  style={{ 
                    width: `${zoomLevel}%`, 
                    maxWidth: '1000px',
                    transition: 'width 0.3s ease-in-out'
                  }}
                >
                  <iframe
                    src={`${currentEPaper.pdf_url}#view=FitH`}
                    className="w-full bg-white shadow-lg rounded"
                    style={{ 
                      height: '80vh',
                      minHeight: '800px',
                      border: 'none'
                    }}
                    title={currentEPaper.title}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
                <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-medium text-muted-foreground mb-2">
                  কোন ই-পেপার পাওয়া যায়নি
                </h3>
                <p className="text-muted-foreground">
                  এই তারিখের জন্য কোন ই-পেপার প্রকাশিত হয়নি।
                </p>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          {currentEPaper && (
            <div className="md:hidden border-t p-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href={currentEPaper.pdf_url} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  ডাউনলোড
                </a>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                শেয়ার
              </Button>
            </div>
          )}
        </div>

        {/* Archive Info */}
        {availableDates.length > 0 && (
          <div className="mt-6 bg-card rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">সংরক্ষণাগার</h3>
            <p className="text-muted-foreground mb-4">
              মোট {availableDates.length}টি ই-পেপার সংরক্ষিত আছে।
            </p>
            <div className="flex flex-wrap gap-2">
              {availableDates.slice(0, 10).map((d, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateChange(d)}
                  className={date?.toISOString().split('T')[0] === d.toISOString().split('T')[0] ? 'border-primary' : ''}
                >
                  {new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'short' }).format(d)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EPaperPage;
