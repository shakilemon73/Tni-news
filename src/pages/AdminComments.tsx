import { useState, useEffect } from 'react';
import { Check, X, Trash2, Loader2, MessageCircle, Filter, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  getComments, 
  updateCommentStatus, 
  deleteComment,
  getCommentStats,
  type Comment 
} from '@/lib/services/comment-service';
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

const AdminComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [activeTab]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const data = await getComments(activeTab);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('মন্তব্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getCommentStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      await updateCommentStatus(id, 'approved');
      toast.success('মন্তব্য অনুমোদিত হয়েছে');
      fetchComments();
      fetchStats();
    } catch (error) {
      console.error('Error approving:', error);
      toast.error('অনুমোদন করতে সমস্যা হয়েছে');
    } finally {
      setProcessingIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleReject = async (id: string) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      await updateCommentStatus(id, 'rejected');
      toast.success('মন্তব্য প্রত্যাখ্যান করা হয়েছে');
      fetchComments();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error('প্রত্যাখ্যান করতে সমস্যা হয়েছে');
    } finally {
      setProcessingIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      await deleteComment(deleteId);
      setComments(comments.filter(c => c.id !== deleteId));
      toast.success('মন্তব্য মুছে ফেলা হয়েছে');
      fetchStats();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('মুছতে সমস্যা হয়েছে');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">অনুমোদিত</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">প্রত্যাখ্যাত</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">অপেক্ষমান</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalComments = stats.pending + stats.approved + stats.rejected;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">মন্তব্য ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground mt-1">
            মোট {totalComments}টি মন্তব্য • {stats.pending}টি মডারেশন বাকি
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={activeTab === 'pending' ? 'ring-2 ring-amber-500/50' : ''}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">অপেক্ষমান</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={activeTab === 'approved' ? 'ring-2 ring-emerald-500/50' : ''}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">অনুমোদিত</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={activeTab === 'rejected' ? 'ring-2 ring-red-500/50' : ''}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">প্রত্যাখ্যাত</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="h-3.5 w-3.5 hidden sm:block" />
            অপেক্ষমান
            {stats.pending > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">{stats.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">অনুমোদিত</TabsTrigger>
          <TabsTrigger value="rejected">প্রত্যাখ্যাত</TabsTrigger>
          <TabsTrigger value="all">সব</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">মন্তব্য লোড হচ্ছে...</p>
            </div>
          ) : comments.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">কোন মন্তব্য নেই</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const isProcessing = processingIds.includes(comment.id);
                
                return (
                  <Card key={comment.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {comment.author_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-base">{comment.author_name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{comment.author_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(comment.status)}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/90 mb-4 leading-relaxed">{comment.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {comment.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              onClick={() => handleApprove(comment.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-1.5" />
                              )}
                              অনুমোদন
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleReject(comment.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                              ) : (
                                <X className="h-4 w-4 mr-1.5" />
                              )}
                              প্রত্যাখ্যান
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(comment.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          মুছুন
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>মন্তব্য মুছে ফেলুন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই মন্তব্যটি স্থায়ীভাবে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  মুছছে...
                </>
              ) : (
                'মুছে ফেলুন'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminComments;
