import { useState, useEffect } from 'react';
import { Loader2, FileText, Pencil, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getPages, updatePage, type Page } from '@/lib/services/page-service';

const AdminPages = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    meta_description: ''
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setIsLoading(true);
      const data = await getPages();
      setPages(data);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('পেজ লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      content: page.content,
      meta_description: page.meta_description || ''
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingPage) return;
    
    try {
      setIsSaving(true);
      const result = await updatePage(editingPage.id, formData);
      if (!result) {
        toast.error('পেজ আপডেট করতে ব্যর্থ। আপনি লগইন আছেন কিনা নিশ্চিত করুন।');
        return;
      }
      toast.success('পেজ সফলভাবে আপডেট হয়েছে');
      setIsDialogOpen(false);
      loadPages();
    } catch (error: any) {
      console.error('Error saving page:', error);
      if (error?.message?.includes('row-level security')) {
        toast.error('আপনার পেজ এডিট করার অনুমতি নেই। অ্যাডমিন হিসেবে লগইন করুন।');
      } else {
        toast.error('পেজ সেভ করতে সমস্যা হয়েছে');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">পেজ ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground">স্ট্যাটিক পেজগুলো এডিট করুন</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            সকল পেজ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>পেজ নাম</TableHead>
                <TableHead>স্লাগ</TableHead>
                <TableHead>সর্বশেষ আপডেট</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">/{page.slug}</code>
                  </TableCell>
                  <TableCell>{formatDate(page.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(page)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      এডিট
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>পেজ এডিট করুন: {editingPage?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">শিরোনাম</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="meta_description">মেটা বিবরণ (SEO)</Label>
              <Input
                id="meta_description"
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="content">কনটেন্ট (HTML)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                <X className="h-4 w-4 mr-1" />
                বাতিল
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                সেভ করুন
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPages;
