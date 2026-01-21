import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, User, Loader2, Reply, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getArticleComments, createComment, Comment } from '@/lib/services/comment-service';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface CommentSectionProps {
  articleId: string;
}

const CommentSection = ({ articleId }: CommentSectionProps) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyGuestName, setReplyGuestName] = useState('');
  const [replyGuestEmail, setReplyGuestEmail] = useState('');

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const data = await getArticleComments(articleId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      toast.error('মন্তব্য লিখুন');
      return;
    }

    // Guest validation
    if (!user && !guestName.trim()) {
      toast.error('আপনার নাম লিখুন');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createComment({
        article_id: articleId,
        user_id: user?.id || null,
        author_name: user ? (profile?.full_name || 'ব্যবহারকারী') : guestName.trim(),
        author_email: user?.email || guestEmail || null,
        content: commentText.trim(),
        parent_id: null,
      });
      
      toast.success('মন্তব্য সফলভাবে পাঠানো হয়েছে! অনুমোদনের পর প্রদর্শিত হবে।');
      setCommentText('');
      setGuestName('');
      setGuestEmail('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('মন্তব্য পাঠাতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) {
      toast.error('উত্তর লিখুন');
      return;
    }

    if (!user && !replyGuestName.trim()) {
      toast.error('আপনার নাম লিখুন');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createComment({
        article_id: articleId,
        user_id: user?.id || null,
        author_name: user ? (profile?.full_name || 'ব্যবহারকারী') : replyGuestName.trim(),
        author_email: user?.email || replyGuestEmail || null,
        content: replyText.trim(),
        parent_id: parentId,
      });
      
      toast.success('উত্তর সফলভাবে পাঠানো হয়েছে! অনুমোদনের পর প্রদর্শিত হবে।');
      setReplyingTo(null);
      setReplyText('');
      setReplyGuestName('');
      setReplyGuestEmail('');
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('উত্তর পাঠাতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Separate parent comments and replies
  const parentComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          মন্তব্য ({parentComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user ? getInitials(profile?.full_name || 'U') : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              {!user && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="guestName">নাম *</Label>
                    <Input
                      id="guestName"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="আপনার নাম"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestEmail">ইমেইল (ঐচ্ছিক)</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="আপনার ইমেইল"
                    />
                  </div>
                </div>
              )}
              
              {user && (
                <p className="text-sm text-muted-foreground">
                  {profile?.full_name || user.email} হিসেবে মন্তব্য করছেন
                </p>
              )}
              
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="আপনার মন্তব্য লিখুন..."
                rows={3}
              />
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  মন্তব্য অনুমোদনের পর প্রদর্শিত হবে
                </p>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      পাঠানো হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      মন্তব্য করুন
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>

        <Separator />

        {/* Comments List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : parentComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {parentComments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted">
                      {getInitials(comment.author_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{comment.author_name}</span>
                      {comment.user_id && (
                        <Badge variant="secondary" className="text-xs">সদস্য</Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(comment.created_at), 'dd MMM yyyy, hh:mm a', { locale: bn })}
                      </span>
                    </div>
                    <p className="text-foreground/90 leading-relaxed">{comment.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-muted-foreground hover:text-primary"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      উত্তর দিন
                    </Button>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-4 pl-4 border-l-2 border-muted space-y-3">
                        {!user && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>নাম *</Label>
                              <Input
                                value={replyGuestName}
                                onChange={(e) => setReplyGuestName(e.target.value)}
                                placeholder="আপনার নাম"
                              />
                            </div>
                            <div>
                              <Label>ইমেইল (ঐচ্ছিক)</Label>
                              <Input
                                type="email"
                                value={replyGuestEmail}
                                onChange={(e) => setReplyGuestEmail(e.target.value)}
                                placeholder="আপনার ইমেইল"
                              />
                            </div>
                          </div>
                        )}
                        <Textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="উত্তর লিখুন..."
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'উত্তর দিন'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText('');
                            }}
                          >
                            বাতিল
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {getReplies(comment.id).length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-muted space-y-4">
                        {getReplies(comment.id).map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-muted text-xs">
                                {getInitials(reply.author_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{reply.author_name}</span>
                                {reply.user_id && (
                                  <Badge variant="secondary" className="text-xs">সদস্য</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(reply.created_at), 'dd MMM yyyy', { locale: bn })}
                                </span>
                              </div>
                              <p className="text-sm text-foreground/90">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentSection;
