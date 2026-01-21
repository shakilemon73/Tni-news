import { useState, useEffect, useRef } from 'react';
import { Loader2, Save, Globe, Image as ImageIcon, Upload, Link, Sparkles, Eye, EyeOff, CheckCircle2, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AdminSettingsSkeleton } from '@/components/skeletons/AdminSkeletons';
import { getSettings, updateSettings, type Settings } from '@/lib/services/settings-service';
import { uploadFile } from '@/lib/services/media-service';

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    logo: '',
    favicon: '',
    header_logo_display: 'both' as 'logo_only' | 'text_only' | 'both',
    footer_logo_display: 'both' as 'logo_only' | 'text_only' | 'both',
    facebook: '',
    twitter: '',
    youtube: '',
    instagram: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    gemini_api_key: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getSettings();
      if (data) {
        setSettings(data);
        const socialMedia = (data.social_media as Record<string, string>) || {};
        setFormData({
          site_name: data.site_name || '',
          site_description: data.site_description || '',
          logo: data.logo || '',
          favicon: data.favicon || '',
          header_logo_display: (socialMedia.header_logo_display as 'logo_only' | 'text_only' | 'both') || (socialMedia.logo_display as 'logo_only' | 'text_only' | 'both') || 'both',
          footer_logo_display: (socialMedia.footer_logo_display as 'logo_only' | 'text_only' | 'both') || 'both',
          facebook: socialMedia.facebook || '',
          twitter: socialMedia.twitter || '',
          youtube: socialMedia.youtube || '',
          instagram: socialMedia.instagram || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          contact_address: data.contact_address || '',
          gemini_api_key: (data as any).gemini_api_key || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('সেটিংস লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updateData = {
        site_name: formData.site_name,
        site_description: formData.site_description,
        logo: formData.logo || null,
        favicon: formData.favicon || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        contact_address: formData.contact_address || null,
        gemini_api_key: formData.gemini_api_key || null,
        social_media: {
          facebook: formData.facebook,
          twitter: formData.twitter,
          youtube: formData.youtube,
          instagram: formData.instagram,
          header_logo_display: formData.header_logo_display,
          footer_logo_display: formData.footer_logo_display
        }
      };
      
      // Use updateSiteSettings which handles both create and update
      const { updateSiteSettings } = await import('@/lib/services/settings-service');
      const savedSettings = await updateSiteSettings(updateData);
      
      if (savedSettings) {
        setSettings(savedSettings);
      }
      
      toast.success('সেটিংস সংরক্ষিত হয়েছে');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      if (error?.message?.includes('row-level security') || error?.message?.includes('permission denied')) {
        toast.error('অনুমতি নেই। শুধুমাত্র অ্যাডমিন সেটিংস পরিবর্তন করতে পারে।');
      } else {
        toast.error(error?.message ? `সংরক্ষণ করতে সমস্যা হয়েছে: ${error.message}` : 'সংরক্ষণ করতে সমস্যা হয়েছে');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const publicUrl = await uploadFile('media', 'logos', file);
      setFormData({ ...formData, logo: publicUrl });
      toast.success('লোগো আপলোড হয়েছে');
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast.error('লোগো আপলোড করতে সমস্যা হয়েছে');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingFavicon(true);
      const publicUrl = await uploadFile('media', 'favicons', file);
      setFormData({ ...formData, favicon: publicUrl });
      toast.success('ফেভিকন আপলোড হয়েছে');
    } catch (error: any) {
      console.error('Favicon upload error:', error);
      toast.error('ফেভিকন আপলোড করতে সমস্যা হয়েছে');
    } finally {
      setIsUploadingFavicon(false);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <AdminSettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            সেটিংস
          </h1>
          <p className="text-muted-foreground mt-1">ওয়েবসাইটের সমস্ত সেটিংস পরিচালনা করুন</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 min-h-[44px]">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              সংরক্ষণ হচ্ছে...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              সংরক্ষণ করুন
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full sm:w-auto flex-wrap h-auto p-1 gap-1">
          <TabsTrigger value="general" className="min-h-[40px]">সাধারণ</TabsTrigger>
          <TabsTrigger value="contact" className="min-h-[40px]">যোগাযোগ</TabsTrigger>
          <TabsTrigger value="appearance" className="min-h-[40px]">চেহারা</TabsTrigger>
          <TabsTrigger value="social" className="min-h-[40px]">সোশ্যাল মিডিয়া</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1 min-h-[40px]">
            <Sparkles className="h-3 w-3" />
            AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>সাধারণ সেটিংস</CardTitle>
              <CardDescription>ওয়েবসাইটের মৌলিক তথ্য</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>সাইটের নাম</Label>
                <Input
                  value={formData.site_name}
                  onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                  placeholder="বাংলা টাইমস"
                />
              </div>
              <div>
                <Label>সাইটের বিবরণ</Label>
                <Textarea
                  value={formData.site_description}
                  onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
                  placeholder="আপনার নিউজ পোর্টালের সংক্ষিপ্ত বিবরণ"
                  rows={3}
                />
              </div>
              
              {/* Header Logo Display Toggle */}
              <div>
                <Label className="mb-2 block">হেডারে লোগো প্রদর্শন</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    type="button"
                    variant={formData.header_logo_display === 'logo_only' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, header_logo_display: 'logo_only' })}
                  >
                    শুধু লোগো
                  </Button>
                  <Button
                    type="button"
                    variant={formData.header_logo_display === 'text_only' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, header_logo_display: 'text_only' })}
                  >
                    শুধু টেক্সট
                  </Button>
                  <Button
                    type="button"
                    variant={formData.header_logo_display === 'both' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, header_logo_display: 'both' })}
                  >
                    দুইটাই
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  নির্বাচন করুন হেডারে লোগো, সাইটের নাম অথবা দুইটাই দেখাতে চান
                </p>
              </div>

              {/* Footer Logo Display Toggle */}
              <div>
                <Label className="mb-2 block">ফুটারে লোগো প্রদর্শন</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    type="button"
                    variant={formData.footer_logo_display === 'logo_only' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, footer_logo_display: 'logo_only' })}
                  >
                    শুধু লোগো
                  </Button>
                  <Button
                    type="button"
                    variant={formData.footer_logo_display === 'text_only' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, footer_logo_display: 'text_only' })}
                  >
                    শুধু টেক্সট
                  </Button>
                  <Button
                    type="button"
                    variant={formData.footer_logo_display === 'both' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, footer_logo_display: 'both' })}
                  >
                    দুইটাই
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  নির্বাচন করুন ফুটারে লোগো, সাইটের নাম অথবা দুইটাই দেখাতে চান
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>যোগাযোগ তথ্য</CardTitle>
              <CardDescription>ফুটারে প্রদর্শিত যোগাযোগ তথ্য</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ইমেইল</Label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <Label>ফোন নম্বর</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+৮৮০ ১৭১২ ৩৪৫৬৭৮"
                />
              </div>
              <div>
                <Label>ঠিকানা</Label>
                <Textarea
                  value={formData.contact_address}
                  onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                  placeholder="বাড়ি #১২, রোড #১১, ব্লক #ই&#10;বনানী, ঢাকা-১২১৩&#10;বাংলাদেশ"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>চেহারা</CardTitle>
              <CardDescription>লোগো এবং ফেভিকন সেটিংস</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Section */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4" />
                  লোগো
                </Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={formData.logo}
                          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="flex items-center gap-2"
                    >
                      {isUploadingLogo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      আপলোড
                    </Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>
                  {formData.logo && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                      <div className="w-20 h-12 border rounded flex items-center justify-center bg-background">
                        <img 
                          src={formData.logo} 
                          alt="Logo" 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, logo: '' })}
                        className="text-destructive hover:text-destructive"
                      >
                        মুছুন
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Favicon Section */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4" />
                  ফেভিকন
                </Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={formData.favicon}
                          onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                          placeholder="https://example.com/favicon.ico"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={isUploadingFavicon}
                      className="flex items-center gap-2"
                    >
                      {isUploadingFavicon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      আপলোড
                    </Button>
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/*,.ico"
                      className="hidden"
                      onChange={handleFaviconUpload}
                    />
                  </div>
                  {formData.favicon && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                      <div className="w-12 h-12 border rounded flex items-center justify-center bg-background">
                        <img 
                          src={formData.favicon} 
                          alt="Favicon" 
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, favicon: '' })}
                        className="text-destructive hover:text-destructive"
                      >
                        মুছুন
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>সোশ্যাল মিডিয়া</CardTitle>
              <CardDescription>সোশ্যাল মিডিয়া লিংকসমূহ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ফেসবুক</Label>
                <Input
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <Label>টুইটার / X</Label>
                <Input
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div>
                <Label>ইউটিউব</Label>
                <Input
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  placeholder="https://youtube.com/yourchannel"
                />
              </div>
              <div>
                <Label>ইনস্টাগ্রাম</Label>
                <Input
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI ইন্টিগ্রেশন
              </CardTitle>
              <CardDescription>
                Gemini AI সংযোগ করুন স্বয়ংক্রিয়ভাবে সংক্ষিপ্ত বিবরণ, কীওয়ার্ড, ট্যাগ এবং আর্টিকেল সাজেশন তৈরি করতে
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="gemini_api_key" className="flex items-center gap-2">
                  Gemini API Key
                  {formData.gemini_api_key && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </Label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Input
                      id="gemini_api_key"
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.gemini_api_key}
                      onChange={(e) => setFormData({ ...formData, gemini_api_key: e.target.value })}
                      placeholder="AIzaSy..."
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Google AI Studio থেকে API Key সংগ্রহ করুন: 
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    aistudio.google.com/app/apikey
                  </a>
                </p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-medium mb-2">AI ফিচারসমূহ:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>সংক্ষিপ্ত বিবরণ:</strong> আর্টিকেল থেকে স্বয়ংক্রিয়ভাবে ২ লাইনের সারাংশ</li>
                  <li>• <strong>কীওয়ার্ড:</strong> SEO-এর জন্য স্বয়ংক্রিয় কীওয়ার্ড</li>
                  <li>• <strong>ট্যাগ:</strong> প্রাসঙ্গিক ট্যাগ স্বয়ংক্রিয়ভাবে যোগ</li>
                  <li>• <strong>সাজেশন:</strong> সম্পর্কিত আর্টিকেল আইডিয়া</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">নিরাপত্তা নোট</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  API Key সুরক্ষিতভাবে Supabase ডাটাবেসে সংরক্ষিত হয় এবং শুধুমাত্র সার্ভার-সাইড এজ ফাংশন থেকে অ্যাক্সেস করা হয়।
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
