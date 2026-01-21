import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Copy, Search, Grid, List, Loader2, Image as ImageIcon, Upload, FolderOpen, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getMediaFiles, uploadMedia, deleteMedia, type MediaFile } from '@/lib/services/media-service';
import { getSession } from '@/lib/services/supabase-service';
import { AdminMediaSkeleton } from '@/components/skeletons/AdminSkeletons';
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

const AdminMedia = () => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Get current user session
        const session = await getSession();
        if (session?.user?.id) {
          setCurrentUserId(session.user.id);
        }
        
        await fetchMedia();
      } catch (error) {
        console.error('Error initializing:', error);
      }
    };
    
    init();
  }, []);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const data = await getMediaFiles();
      setMedia(data);
    } catch (error: any) {
      console.error('Error fetching media:', error);
      if (error.message?.includes('row-level security')) {
        toast.error('মিডিয়া লোড করতে অনুমতি নেই');
      } else {
        toast.error('মিডিয়া লোড করতে সমস্যা হয়েছে');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!currentUserId) {
      toast.error('আপলোড করতে লগইন করুন');
      return;
    }

    try {
      setIsUploading(true);
      
      for (const file of Array.from(files)) {
        // Check file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name}: ফাইল সাইজ ১০MB এর বেশি`);
          continue;
        }
        
        await uploadMedia(file, currentUserId);
      }
      
      toast.success(`${files.length} ফাইল আপলোড হয়েছে`);
      await fetchMedia();
    } catch (error: any) {
      console.error('Error uploading:', error);
      if (error.message?.includes('row-level security')) {
        toast.error('আপলোড করার অনুমতি নেই');
      } else if (error.message?.includes('Payload too large')) {
        toast.error('ফাইল সাইজ অনেক বড়');
      } else {
        toast.error('আপলোড করতে সমস্যা হয়েছে');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      const mediaToDelete = media.find(m => m.id === deleteId);
      if (mediaToDelete) {
        // Pass file_url to handle R2 deletion
        await deleteMedia(deleteId, mediaToDelete.file_path, mediaToDelete.file_url);
        setMedia(media.filter(m => m.id !== deleteId));
        toast.success('ফাইল মুছে ফেলা হয়েছে');
      }
    } catch (error: any) {
      console.error('Error deleting:', error);
      if (error.message?.includes('row-level security')) {
        toast.error('এই ফাইল মুছতে অনুমতি নেই');
      } else {
        toast.error('মুছতে সমস্যা হয়েছে');
      }
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL কপি হয়েছে');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredMedia = media.filter(m => 
    m.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <AdminMediaSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            মিডিয়া লাইব্রেরি
          </h1>
          <p className="text-muted-foreground mt-1">ছবি, ভিডিও এবং ফাইল পরিচালনা করুন</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf"
            className="hidden"
            onChange={handleUpload}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !currentUserId}
            className="flex items-center gap-2 min-h-[44px]"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload size={16} />}
            <span>{isUploading ? 'আপলোড হচ্ছে...' : 'নতুন আপলোড'}</span>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ফাইল খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="whitespace-nowrap">
            <FileImage className="h-3 w-3 mr-1" />
            {filteredMedia.length} ফাইল
          </Badge>
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-9 w-9"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-9 w-9"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <ImageIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">কোন মিডিয়া নেই</h3>
          <p className="text-muted-foreground mb-4">নতুন ফাইল আপলোড করে শুরু করুন</p>
          <Button onClick={() => fileInputRef.current?.click()} disabled={!currentUserId}>
            <Upload className="h-4 w-4 mr-2" />
            আপলোড করুন
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-square relative bg-muted">
                {item.file_type?.startsWith('image/') ? (
                  <img 
                    src={item.file_url} 
                    alt={item.alt_text || item.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" onClick={() => copyUrl(item.file_url)} className="h-9 w-9">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => setDeleteId(item.id)} className="h-9 w-9">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{item.filename}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(item.file_size)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMedia.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                  {item.file_type?.startsWith('image/') ? (
                    <img 
                      src={item.file_url} 
                      alt={item.alt_text || item.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.filename}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{formatFileSize(item.file_size)}</Badge>
                    <Badge variant="secondary" className="text-xs">{item.file_type?.split('/')[1] || 'Unknown'}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => copyUrl(item.file_url)} className="h-10 w-10">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => setDeleteId(item.id)} className="h-10 w-10 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ফাইল মুছে ফেলুন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই ফাইলটি স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
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

export default AdminMedia;
