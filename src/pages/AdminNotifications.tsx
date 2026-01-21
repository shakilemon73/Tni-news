import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Bell, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  getNotifications, 
  createNotification, 
  deleteNotification,
  type Notification 
} from '@/lib/services/notification-service';
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

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    link: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('বিজ্ঞপ্তি লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      link: ''
    });
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.message) {
      toast.error('শিরোনাম এবং বার্তা আবশ্যক');
      return;
    }

    try {
      setIsSaving(true);
      
      await createNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        link: formData.link || null
      });

      toast.success('বিজ্ঞপ্তি তৈরি হয়েছে');
      setIsFormOpen(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('বিজ্ঞপ্তি তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      await deleteNotification(deleteId);
      setNotifications(notifications.filter(n => n.id !== deleteId));
      toast.success('বিজ্ঞপ্তি মুছে ফেলা হয়েছে');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('মুছতে সমস্যা হয়েছে');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">সফল</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">সতর্কতা</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">ত্রুটি</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">তথ্য</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">বিজ্ঞপ্তি ব্যবস্থাপনা</h1>
        <Button onClick={handleOpenForm} className="flex items-center gap-2">
          <Plus size={16} />
          <span>নতুন বিজ্ঞপ্তি</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{notifications.length}</p>
              <p className="text-sm text-gray-500">মোট</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {notifications.filter(n => n.type === 'info').length}
              </p>
              <p className="text-sm text-gray-500">তথ্য</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {notifications.filter(n => n.type === 'warning').length}
              </p>
              <p className="text-sm text-gray-500">সতর্কতা</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {notifications.filter(n => n.type === 'error').length}
              </p>
              <p className="text-sm text-gray-500">ত্রুটি</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">কোন বিজ্ঞপ্তি নেই</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{notification.title}</CardTitle>
                    {getTypeBadge(notification.type)}
                    {notification.is_read && (
                      <Badge variant="outline">পড়া হয়েছে</Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{notification.message}</p>
                {notification.link && (
                  <p className="text-sm text-blue-600 mb-4">
                    লিংক: <a href={notification.link} target="_blank" rel="noopener noreferrer">{notification.link}</a>
                  </p>
                )}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setDeleteId(notification.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    মুছুন
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন বিজ্ঞপ্তি</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>শিরোনাম *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="বিজ্ঞপ্তির শিরোনাম"
              />
            </div>
            <div>
              <Label>বার্তা *</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="বিজ্ঞপ্তির বিস্তারিত"
                rows={4}
              />
            </div>
            <div>
              <Label>ধরন</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'info' | 'success' | 'warning' | 'error') => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">তথ্য</SelectItem>
                  <SelectItem value="success">সফল</SelectItem>
                  <SelectItem value="warning">সতর্কতা</SelectItem>
                  <SelectItem value="error">ত্রুটি</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>লিংক (ঐচ্ছিক)</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>বাতিল</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  পাঠানো হচ্ছে...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  পাঠান
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>বিজ্ঞপ্তি মুছে ফেলুন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই বিজ্ঞপ্তিটি স্থায়ীভাবে মুছে ফেলা হবে।
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

export default AdminNotifications;
