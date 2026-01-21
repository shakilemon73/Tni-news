import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, MousePointer, ExternalLink, CircleDollarSign, Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import {
  getAllAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  Advertisement
} from '@/lib/services/advertisement-service';
import { getSiteSettings, updateSiteSettings } from '@/lib/services/settings-service';
import { uploadMedia } from '@/lib/services/media-service';
import { useAuth } from '@/hooks/use-auth';

interface AdFormData {
  title: string;
  type: 'banner' | 'sponsored' | 'sidebar';
  image_url: string;
  link_url: string;
  content: string;
  position: string;
  slot: string;
  priority: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const defaultFormData: AdFormData = {
  title: '',
  type: 'banner',
  image_url: '',
  link_url: '',
  content: '',
  position: 'homepage',
  slot: 'top',
  priority: 1,
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  is_active: true
};

const AdminAdvertisements = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<AdFormData>(defaultFormData);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // AdSense settings
  const [adsenseClientId, setAdsenseClientId] = useState('');
  const [adsenseEnabled, setAdsenseEnabled] = useState(false);
  const [adsenseSlots, setAdsenseSlots] = useState({
    header: '',
    sidebar: '',
    article_top: '',
    article_bottom: '',
    in_feed: ''
  });

  // Fetch advertisements
  const { data: advertisements = [], isLoading } = useQuery({
    queryKey: ['admin-advertisements'],
    queryFn: getAllAdvertisements
  });

  // Fetch AdSense settings
  useEffect(() => {
    getSiteSettings().then(settings => {
      if (settings) {
        setAdsenseClientId((settings as any).adsense_client_id || '');
        setAdsenseEnabled((settings as any).adsense_enabled || false);
        setAdsenseSlots((settings as any).adsense_slots || {
          header: '',
          sidebar: '',
          article_top: '',
          article_bottom: '',
          in_feed: ''
        });
      }
    });
  }, []);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createAdvertisement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
      toast.success('বিজ্ঞাপন তৈরি হয়েছে');
      closeDialog();
    },
    onError: (error) => {
      toast.error('বিজ্ঞাপন তৈরিতে সমস্যা হয়েছে');
      console.error(error);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Advertisement> }) =>
      updateAdvertisement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
      toast.success('বিজ্ঞাপন আপডেট হয়েছে');
      closeDialog();
    },
    onError: (error) => {
      toast.error('বিজ্ঞাপন আপডেটে সমস্যা হয়েছে');
      console.error(error);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAdvertisement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
      toast.success('বিজ্ঞাপন মুছে ফেলা হয়েছে');
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      toast.error('বিজ্ঞাপন মুছতে সমস্যা হয়েছে');
      console.error(error);
    }
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingAd(null);
    setFormData(defaultFormData);
  };

  const openEditDialog = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      type: ad.type as 'banner' | 'sponsored' | 'sidebar',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      content: ad.content || '',
      position: ad.position,
      slot: ad.slot || '',
      priority: ad.priority,
      start_date: ad.start_date.split('T')[0],
      end_date: ad.end_date?.split('T')[0] || '',
      is_active: ad.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const adData = {
      ...formData,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      image_url: formData.image_url || null,
      link_url: formData.link_url || null,
      content: formData.content || null,
      slot: formData.slot || null
    };

    if (editingAd) {
      updateMutation.mutate({ id: editingAd.id, data: adData });
    } else {
      createMutation.mutate(adData);
    }
  };

  const handleSaveAdsense = async () => {
    try {
      await updateSiteSettings({
        adsense_client_id: adsenseClientId,
        adsense_enabled: adsenseEnabled,
        adsense_slots: adsenseSlots
      } as any);
      toast.success('AdSense সেটিংস সেভ হয়েছে');
    } catch (error) {
      toast.error('AdSense সেটিংস সেভ করতে সমস্যা হয়েছে');
      console.error(error);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'banner': return 'ব্যানার';
      case 'sponsored': return 'স্পন্সরড';
      case 'sidebar': return 'সাইডবার';
      default: return type;
    }
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'homepage': return 'হোমপেজ';
      case 'article': return 'আর্টিকেল';
      case 'category': return 'ক্যাটাগরি';
      default: return position;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">বিজ্ঞাপন ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground">সকল বিজ্ঞাপন এবং AdSense পরিচালনা করুন</p>
        </div>
      </div>

      <Tabs defaultValue="ads">
        <TabsList>
          <TabsTrigger value="ads">বিজ্ঞাপন সমূহ</TabsTrigger>
          <TabsTrigger value="adsense" className="flex items-center gap-1">
            <CircleDollarSign className="h-4 w-4" />
            Google AdSense
          </TabsTrigger>
        </TabsList>

        {/* Custom Ads Tab */}
        <TabsContent value="ads" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              নতুন বিজ্ঞাপন
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">লোড হচ্ছে...</div>
              ) : advertisements.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  কোনো বিজ্ঞাপন নেই। নতুন বিজ্ঞাপন যোগ করুন।
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>শিরোনাম</TableHead>
                      <TableHead>ধরন</TableHead>
                      <TableHead>অবস্থান</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead className="text-center">ইম্প্রেশন</TableHead>
                      <TableHead className="text-center">ক্লিক</TableHead>
                      <TableHead className="text-right">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advertisements.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {ad.image_url && (
                              <img
                                src={ad.image_url}
                                alt={ad.title}
                                className="w-12 h-8 object-cover rounded"
                              />
                            )}
                            <span>{ad.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(ad.type)}</Badge>
                        </TableCell>
                        <TableCell>
                          {getPositionLabel(ad.position)}
                          {ad.slot && <span className="text-muted-foreground"> ({ad.slot})</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                            {ad.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            {ad.impressions.toLocaleString('bn-BD')}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <MousePointer className="h-3 w-3 text-muted-foreground" />
                            {ad.clicks.toLocaleString('bn-BD')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {ad.link_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(ad.link_url!, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(ad)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirmId(ad.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AdSense Tab */}
        <TabsContent value="adsense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5" />
                Google AdSense সেটআপ
              </CardTitle>
              <CardDescription>
                Google AdSense বিজ্ঞাপন দেখাতে এখানে আপনার AdSense তথ্য দিন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-base">AdSense সক্রিয় করুন</Label>
                  <p className="text-sm text-muted-foreground">
                    এটি চালু করলে সাইটে AdSense বিজ্ঞাপন দেখাবে
                  </p>
                </div>
                <Switch
                  checked={adsenseEnabled}
                  onCheckedChange={setAdsenseEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adsense-client">AdSense Client ID (ca-pub-XXXXXX)</Label>
                <Input
                  id="adsense-client"
                  value={adsenseClientId}
                  onChange={(e) => setAdsenseClientId(e.target.value)}
                  placeholder="ca-pub-1234567890123456"
                />
                <p className="text-xs text-muted-foreground">
                  Google AdSense থেকে আপনার Publisher ID কপি করুন
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Ad Unit Slots</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slot-header">হেডার Ad Slot ID</Label>
                    <Input
                      id="slot-header"
                      value={adsenseSlots.header}
                      onChange={(e) => setAdsenseSlots({ ...adsenseSlots, header: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slot-sidebar">সাইডবার Ad Slot ID</Label>
                    <Input
                      id="slot-sidebar"
                      value={adsenseSlots.sidebar}
                      onChange={(e) => setAdsenseSlots({ ...adsenseSlots, sidebar: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slot-article-top">আর্টিকেল উপরে Ad Slot ID</Label>
                    <Input
                      id="slot-article-top"
                      value={adsenseSlots.article_top}
                      onChange={(e) => setAdsenseSlots({ ...adsenseSlots, article_top: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slot-article-bottom">আর্টিকেল নিচে Ad Slot ID</Label>
                    <Input
                      id="slot-article-bottom"
                      value={adsenseSlots.article_bottom}
                      onChange={(e) => setAdsenseSlots({ ...adsenseSlots, article_bottom: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slot-in-feed">ইন-ফিড Ad Slot ID</Label>
                    <Input
                      id="slot-in-feed"
                      value={adsenseSlots.in_feed}
                      onChange={(e) => setAdsenseSlots({ ...adsenseSlots, in_feed: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveAdsense}>
                  AdSense সেটিংস সেভ করুন
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AdSense সেটআপ গাইড</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://www.google.com/adsense" target="_blank" rel="noopener" className="text-primary hover:underline">
                    Google AdSense
                  </a>-এ সাইন ইন করুন
                </li>
                <li>নতুন Ad Unit তৈরি করুন (Display ads, In-feed ads, etc.)</li>
                <li>প্রতিটি Ad Unit-এর Slot ID কপি করে উপরে পেস্ট করুন</li>
                <li>AdSense সক্রিয় করুন এবং সেটিংস সেভ করুন</li>
                <li>AdSense স্বয়ংক্রিয়ভাবে সাইটে বিজ্ঞাপন দেখাবে</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAd ? 'বিজ্ঞাপন সম্পাদনা' : 'নতুন বিজ্ঞাপন তৈরি করুন'}
            </DialogTitle>
            <DialogDescription>
              বিজ্ঞাপনের তথ্য পূরণ করুন
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">শিরোনাম *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">ধরন</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'banner' | 'sponsored' | 'sidebar') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">ব্যানার</SelectItem>
                    <SelectItem value="sponsored">স্পন্সরড কন্টেন্ট</SelectItem>
                    <SelectItem value="sidebar">সাইডবার</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">অবস্থান</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homepage">হোমপেজ</SelectItem>
                    <SelectItem value="article">আর্টিকেল পেজ</SelectItem>
                    <SelectItem value="category">ক্যাটাগরি পেজ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slot">স্লট</Label>
                <Select
                  value={formData.slot}
                  onValueChange={(value) => setFormData({ ...formData, slot: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">উপরে (Top)</SelectItem>
                    <SelectItem value="middle">মাঝখানে (Middle)</SelectItem>
                    <SelectItem value="bottom">নিচে (Bottom)</SelectItem>
                    <SelectItem value="sidebar">সাইডবার</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">অগ্রাধিকার (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>বিজ্ঞাপনের ছবি</Label>
              
              {/* Image Preview */}
              {formData.image_url && (
                <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={formData.image_url}
                    alt="Ad preview"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Upload Area */}
              {!formData.image_url && (
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">ছবি আপলোড করতে ক্লিক করুন</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF (সর্বোচ্চ 5MB)</p>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (file.size > 5 * 1024 * 1024) {
                    toast.error('ফাইল সাইজ ৫MB এর বেশি হতে পারবে না');
                    return;
                  }

                  setIsUploading(true);
                  try {
                    const media = await uploadMedia(file, user?.id);
                    if (media) {
                      setFormData({ ...formData, image_url: media.file_url });
                      toast.success('ছবি আপলোড হয়েছে');
                    }
                  } catch (error) {
                    console.error('Upload error:', error);
                    toast.error('ছবি আপলোড করতে সমস্যা হয়েছে');
                  } finally {
                    setIsUploading(false);
                    e.target.value = '';
                  }
                }}
              />

              {/* Upload Button */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      আপলোড হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      ছবি আপলোড করুন
                    </>
                  )}
                </Button>
              </div>

              {/* Or URL Input */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">অথবা URL দিন</span>
                </div>
              </div>
              
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/ad-image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_url">লিংক URL</Label>
              <Input
                id="link_url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://advertiser-website.com"
              />
            </div>

            {formData.type === 'sponsored' && (
              <div className="space-y-2">
                <Label htmlFor="content">কন্টেন্ট</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  placeholder="স্পন্সরড কন্টেন্টের বিবরণ..."
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">শুরুর তারিখ *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">শেষ তারিখ (ঐচ্ছিক)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">সক্রিয়</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                বাতিল
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingAd ? 'আপডেট করুন' : 'তৈরি করুন'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>বিজ্ঞাপন মুছে ফেলুন?</DialogTitle>
            <DialogDescription>
              এই বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলা হবে। এটি পূর্বাবস্থায় ফেরানো যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              বাতিল
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
            >
              মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAdvertisements;
