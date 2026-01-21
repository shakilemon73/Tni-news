import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, Loader2, FileText, Eye, Wand2, Download, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  getEPapers, 
  createEPaper, 
  updateEPaper, 
  deleteEPaper,
  uploadEPaperPDF,
  uploadEPaperBlob,
  fetchArticlesForEPaper,
  fetchCategoriesForEPaper,
  type EPaper 
} from '@/lib/services/epaper-service';
import { generateNewspaperHTML, formatBengaliDate } from '@/lib/utils/newspaper-generator';
import { getSiteSettings } from '@/lib/services/settings-service';
import { Category, Article } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminEPaper = () => {
  const [epapers, setEpapers] = useState<EPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<EPaper | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    publish_date: '',
    pdf_url: '',
    thumbnail: '',
    status: 'draft' as 'draft' | 'published'
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Generator states
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateDate, setGenerateDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [articleLimit, setArticleLimit] = useState(30);
  
  // Preview states
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [generatedMetadata, setGeneratedMetadata] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fetchedArticles, setFetchedArticles] = useState<Article[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEPapers();
    loadCategories();
  }, []);

  const fetchEPapers = async () => {
    try {
      setIsLoading(true);
      const data = await getEPapers();
      setEpapers(data);
    } catch (error) {
      console.error('Error fetching e-papers:', error);
      toast.error('ই-পেপার লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchCategoriesForEPaper();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleOpenForm = (epaper?: EPaper) => {
    if (epaper) {
      setEditItem(epaper);
      setFormData({
        title: epaper.title,
        publish_date: epaper.publish_date,
        pdf_url: epaper.pdf_url,
        thumbnail: epaper.thumbnail || '',
        status: epaper.status
      });
    } else {
      setEditItem(null);
      setFormData({
        title: '',
        publish_date: new Date().toISOString().split('T')[0],
        pdf_url: '',
        thumbnail: '',
        status: 'draft'
      });
    }
    setPdfFile(null);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.publish_date) {
      toast.error('শিরোনাম এবং তারিখ আবশ্যক');
      return;
    }

    try {
      setIsSaving(true);
      
      let pdfUrl = formData.pdf_url;
      
      if (pdfFile) {
        const filename = `${Date.now()}-${pdfFile.name}`;
        pdfUrl = await uploadEPaperPDF(pdfFile, filename);
      }

      if (!pdfUrl && !editItem) {
        toast.error('PDF ফাইল আবশ্যক');
        return;
      }

      const data = {
        title: formData.title,
        publish_date: formData.publish_date,
        pdf_url: pdfUrl,
        thumbnail: formData.thumbnail || null,
        status: formData.status
      };

      if (editItem) {
        await updateEPaper(editItem.id, data);
        toast.success('ই-পেপার আপডেট হয়েছে');
      } else {
        await createEPaper(data);
        toast.success('ই-পেপার তৈরি হয়েছে');
      }

      setIsFormOpen(false);
      fetchEPapers();
    } catch (error) {
      console.error('Error saving e-paper:', error);
      toast.error('সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      await deleteEPaper(deleteId);
      setEpapers(epapers.filter(e => e.id !== deleteId));
      toast.success('ই-পেপার মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('মুছতে সমস্যা হয়েছে');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(c => c.id));
    }
  };

  // Generate e-paper from articles
  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      toast.info('আর্টিকেল ফেচ করা হচ্ছে...');
      
      // Fetch articles directly from Supabase
      const articles = await fetchArticlesForEPaper({
        date: generateDate,
        categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
        articleLimit
      });
      
      if (articles.length === 0) {
        toast.error('কোন প্রকাশিত আর্টিকেল পাওয়া যায়নি');
        return;
      }
      
      setFetchedArticles(articles);
      
      // Fetch settings
      const settings = await getSiteSettings();
      
      // Generate HTML
      const html = generateNewspaperHTML({
        articles,
        categories,
        settings: settings || { site_name: 'বাংলা সংবাদ' },
        publishDate: generateDate
      });
      
      setGeneratedHtml(html);
      setGeneratedMetadata({
        date: generateDate,
        formattedDate: formatBengaliDate(generateDate),
        articleCount: articles.length,
        siteName: settings?.site_name || 'বাংলা সংবাদ'
      });
      
      setShowGenerateDialog(false);
      setShowPreview(true);
      toast.success(`${articles.length}টি আর্টিকেল দিয়ে সংবাদপত্র তৈরি হয়েছে`);
      
    } catch (error) {
      console.error('Error generating e-paper:', error);
      toast.error('সংবাদপত্র তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save generated PDF
  const handleSaveGeneratedPDF = async () => {
    if (!previewRef.current || !generatedMetadata) return;

    try {
      setIsSaving(true);
      toast.info('PDF তৈরি হচ্ছে...');

      const iframe = previewRef.current.querySelector('iframe');
      if (!iframe || !iframe.contentDocument) {
        throw new Error('Preview not available');
      }

      const iframeDoc = iframe.contentDocument;
      const pages = iframeDoc.querySelectorAll('.page');
      
      if (pages.length === 0) {
        throw new Error('No pages found');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      const pdfBlob = pdf.output('blob');
      const filename = `epaper-${generatedMetadata.date}.pdf`;
      
      const pdfUrl = await uploadEPaperBlob(pdfBlob, filename);
      
      await createEPaper({
        title: `${generatedMetadata.siteName} - ${generatedMetadata.formattedDate}`,
        publish_date: generatedMetadata.date,
        pdf_url: pdfUrl,
        status: 'published'
      });

      toast.success('ই-পেপার সংরক্ষণ ও প্রকাশ হয়েছে');
      setShowPreview(false);
      setGeneratedHtml(null);
      fetchEPapers();
    } catch (error) {
      console.error('Error saving PDF:', error);
      toast.error('PDF সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  // Download generated PDF without saving
  const handleDownloadPDF = async () => {
    if (!previewRef.current || !generatedMetadata) return;

    try {
      setIsSaving(true);
      toast.info('PDF তৈরি হচ্ছে...');

      const iframe = previewRef.current.querySelector('iframe');
      if (!iframe || !iframe.contentDocument) {
        throw new Error('Preview not available');
      }

      const iframeDoc = iframe.contentDocument;
      const pages = iframeDoc.querySelectorAll('.page');
      
      if (pages.length === 0) {
        throw new Error('No pages found');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      pdf.save(`${generatedMetadata.siteName}-${generatedMetadata.date}.pdf`);
      toast.success('PDF ডাউনলোড হয়েছে');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('PDF ডাউনলোড করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">ই-পেপার ব্যবস্থাপনা</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setShowGenerateDialog(true)}
            variant="default"
            className="flex items-center gap-2"
          >
            <Wand2 size={16} />
            <span>সংবাদপত্র তৈরি করুন</span>
          </Button>
          <Button onClick={() => handleOpenForm()} variant="outline" className="flex items-center gap-2">
            <Plus size={16} />
            <span>ম্যানুয়াল আপলোড</span>
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">স্বয়ংক্রিয় সংবাদপত্র তৈরি</h3>
              <p className="text-sm text-blue-700 mt-1">
                "সংবাদপত্র তৈরি করুন" বাটনে ক্লিক করে তারিখ ও ক্যাটাগরি সিলেক্ট করুন। সিলেক্টেড ক্যাটাগরির আর্টিকেল দিয়ে সংবাদপত্র স্টাইলে PDF তৈরি হবে।
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : epapers.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">কোন ই-পেপার নেই</p>
          <p className="text-sm text-gray-400 mt-2">উপরের বাটন ব্যবহার করে সংবাদপত্র তৈরি করুন</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {epapers.map((epaper) => (
            <Card key={epaper.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{epaper.title}</CardTitle>
                  <Badge className={epaper.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {epaper.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {epaper.thumbnail ? (
                  <img 
                    src={epaper.thumbnail} 
                    alt={epaper.title}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded mb-4 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <p className="text-sm text-gray-500 mb-4">{formatDate(epaper.publish_date)}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={epaper.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-1" />
                      দেখুন
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleOpenForm(epaper)}>
                    <Edit className="h-4 w-4 mr-1" />
                    সম্পাদনা
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteId(epaper.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>সংবাদপত্র তৈরি করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>প্রকাশের তারিখ</Label>
              <Input
                type="date"
                value={generateDate}
                onChange={(e) => setGenerateDate(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">এই তারিখের প্রকাশিত আর্টিকেল নেওয়া হবে</p>
            </div>
            
            <div>
              <Label>আর্টিকেল সংখ্যা (সর্বোচ্চ)</Label>
              <Input
                type="number"
                value={articleLimit}
                onChange={(e) => setArticleLimit(parseInt(e.target.value) || 30)}
                min={5}
                max={100}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>ক্যাটাগরি নির্বাচন করুন</Label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={selectAllCategories}
                >
                  {selectedCategories.length === categories.length ? 'সব বাদ দিন' : 'সব নির্বাচন'}
                </Button>
              </div>
              <ScrollArea className="h-48 border rounded-md p-3">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <label
                        htmlFor={category.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-gray-500 mt-1">
                {selectedCategories.length === 0 
                  ? 'সব ক্যাটাগরি থেকে আর্টিকেল নেওয়া হবে' 
                  : `${selectedCategories.length}টি ক্যাটাগরি নির্বাচিত`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>বাতিল</Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  তৈরি করুন
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? 'ই-পেপার সম্পাদনা' : 'নতুন ই-পেপার'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>শিরোনাম *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="ই-পেপার শিরোনাম"
              />
            </div>
            <div>
              <Label>প্রকাশের তারিখ *</Label>
              <Input
                type="date"
                value={formData.publish_date}
                onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
              />
            </div>
            <div>
              <Label>PDF ফাইল {!editItem && '*'}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setPdfFile(e.target.files[0]);
                  }
                }}
              />
              <div className="flex gap-2">
                <Input
                  value={pdfFile?.name || formData.pdf_url || ''}
                  placeholder="PDF ফাইল নির্বাচন করুন"
                  readOnly
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  ব্রাউজ
                </Button>
              </div>
            </div>
            <div>
              <Label>থাম্বনেইল URL</Label>
              <Input
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="থাম্বনেইল ছবির URL"
              />
            </div>
            <div>
              <Label>স্ট্যাটাস</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'draft' | 'published') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">খসড়া</SelectItem>
                  <SelectItem value="published">প্রকাশিত</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>বাতিল</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>সংবাদপত্র প্রিভিউ - {generatedMetadata?.formattedDate}</span>
              <Badge variant="secondary">{generatedMetadata?.articleCount || 0}টি আর্টিকেল</Badge>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 h-[calc(90vh-180px)]">
            <div ref={previewRef} className="bg-gray-100 p-4">
              {generatedHtml && (
                <iframe
                  srcDoc={generatedHtml}
                  className="w-full bg-white shadow-lg"
                  style={{ minHeight: '1200px', border: 'none' }}
                  title="E-Paper Preview"
                />
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter className="flex-shrink-0 gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              বাতিল
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF} disabled={isSaving}>
              <Download className="h-4 w-4 mr-2" />
              ডাউনলোড
            </Button>
            <Button onClick={handleSaveGeneratedPDF} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  সংরক্ষণ হচ্ছে...
                </>
              ) : (
                'সংরক্ষণ ও প্রকাশ করুন'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ই-পেপার মুছে ফেলুন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই ই-পেপারটি স্থায়ীভাবে মুছে ফেলা হবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'মুছছে...' : 'মুছে ফেলুন'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEPaper;
