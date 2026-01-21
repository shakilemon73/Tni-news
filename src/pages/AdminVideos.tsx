import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Video, Eye, PlayCircle, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AdminVideosSkeleton } from '@/components/skeletons/AdminSkeletons';
import { 
  getVideos, 
  createVideo, 
  updateVideo, 
  deleteVideo,
  type VideoPost 
} from '@/lib/services/video-service';
import { getCategories } from '@/lib/services/category-service';
import { Category } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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

const AdminVideos = () => {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<VideoPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail: '',
    status: 'draft' as 'draft' | 'published',
    category_ids: [] as string[],
    tags: [] as string[]
  });

  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const data = await getVideos();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('ভিডিও লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleOpenForm = (video?: VideoPost) => {
    if (video) {
      setEditItem(video);
      setFormData({
        title: video.title,
        description: video.description || '',
        video_url: video.video_url,
        thumbnail: video.thumbnail || '',
        status: video.status as 'draft' | 'published',
        category_ids: video.category_ids || [],
        tags: video.tags || []
      });
    } else {
      setEditItem(null);
      setFormData({
        title: '',
        description: '',
        video_url: '',
        thumbnail: '',
        status: 'draft',
        category_ids: [],
        tags: []
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.video_url) {
      toast.error('শিরোনাম এবং ভিডিও URL আবশ্যক');
      return;
    }

    try {
      setIsSaving(true);

      const data = {
        title: formData.title,
        description: formData.description || null,
        video_url: formData.video_url,
        thumbnail: formData.thumbnail || null,
        status: formData.status,
        category_ids: formData.category_ids,
        tags: formData.tags
      };

      if (editItem) {
        await updateVideo(editItem.id, data);
        toast.success('ভিডিও আপডেট হয়েছে');
      } else {
        await createVideo(data);
        toast.success('ভিডিও তৈরি হয়েছে');
      }

      setIsFormOpen(false);
      fetchVideos();
    } catch (error: any) {
      console.error('Error saving video:', error);
      if (error.message?.includes('row-level security')) {
        toast.error('এই কাজটি করার অনুমতি নেই। আপনি এডিটর বা অ্যাডমিন কিনা নিশ্চিত করুন।');
      } else {
        toast.error('সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      await deleteVideo(deleteId);
      setVideos(videos.filter(v => v.id !== deleteId));
      toast.success('ভিডিও মুছে ফেলা হয়েছে');
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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '';
  };

  if (isLoading) {
    return <AdminVideosSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Film className="h-6 w-6 text-primary" />
            </div>
            ভিডিও ম্যানেজমেন্ট
          </h1>
          <p className="text-muted-foreground mt-1">ভিডিও কন্টেন্ট পরিচালনা করুন</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="whitespace-nowrap">
            <PlayCircle className="h-3 w-3 mr-1" />
            {videos.length} ভিডিও
          </Badge>
          <Button onClick={() => handleOpenForm()} className="flex items-center gap-2 min-h-[44px]">
            <Plus size={16} />
            <span>নতুন ভিডিও</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      {videos.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <Video className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">কোন ভিডিও নেই</h3>
          <p className="text-muted-foreground mb-4">নতুন ভিডিও যোগ করে শুরু করুন</p>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            ভিডিও যোগ করুন
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              {video.thumbnail ? (
                <div className="aspect-video relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle className="h-8 w-8 text-primary ml-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold line-clamp-2 flex-1">{video.title}</h3>
                  <Badge className={`shrink-0 ${video.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {video.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                  </Badge>
                </div>
                {video.category_ids && video.category_ids.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {video.category_ids.slice(0, 2).map((catId) => (
                      <Badge key={catId} variant="outline" className="text-xs">
                        {getCategoryName(catId)}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">{formatDate(video.created_at)}</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild className="flex-1 min-h-[40px]">
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-1" />
                      দেখুন
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleOpenForm(video)} className="flex-1 min-h-[40px]">
                    <Edit className="h-4 w-4 mr-1" />
                    সম্পাদনা
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteId(video.id)} className="min-h-[40px] text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              {editItem ? 'ভিডিও সম্পাদনা' : 'নতুন ভিডিও'}
            </DialogTitle>
            <DialogDescription>
              {editItem ? 'ভিডিওর তথ্য আপডেট করুন' : 'নতুন ভিডিও যোগ করুন'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <Label>শিরোনাম *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="ভিডিও শিরোনাম"
              />
            </div>
            <div>
              <Label>বিবরণ</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="ভিডিওর সংক্ষিপ্ত বিবরণ"
                rows={3}
              />
            </div>
            <div>
              <Label>ভিডিও URL *</Label>
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
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
              <Label>বিভাগ</Label>
              <Select
                value={formData.category_ids[0] || ''}
                onValueChange={(value) => setFormData({ ...formData, category_ids: [value] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ভিডিও মুছে ফেলুন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই ভিডিওটি স্থায়ীভাবে মুছে ফেলা হবে।
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

export default AdminVideos;
