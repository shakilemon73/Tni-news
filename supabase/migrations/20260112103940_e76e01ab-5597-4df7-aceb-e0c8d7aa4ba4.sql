-- Create pages table for managing static content (About, Privacy, Terms, Contact, etc.)
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  meta_description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Pages are viewable by everyone"
ON public.pages
FOR SELECT
USING (true);

CREATE POLICY "Only admins can manage pages"
ON public.pages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Insert default pages
INSERT INTO public.pages (slug, title, content, meta_description) VALUES
('about', 'আমাদের সম্পর্কে', '<h2>আমাদের গল্প</h2><p>২০১৫ সালে একদল তরুণ ও উদ্যমী সাংবাদিক মিলে বাংলা টাইমস প্রতিষ্ঠা করেন। তাদের লক্ষ্য ছিল ডিজিটাল যুগে বাংলা ভাষায় মানসম্মত সংবাদ সেবা প্রদান করা।</p><p>আজ বাংলা টাইমস বাংলাদেশের অন্যতম প্রধান অনলাইন সংবাদ মাধ্যম। আমাদের প্রতিদিন লাখ লাখ পাঠক দেশ-বিদেশ থেকে সংবাদ পড়তে আসেন।</p>', 'বাংলা টাইমস সম্পর্কে জানুন'),
('privacy-policy', 'গোপনীয়তা নীতি', '<h2>ভূমিকা</h2><p>বাংলা টাইমস আপনার গোপনীয়তাকে অত্যন্ত গুরুত্বের সাথে বিবেচনা করে। এই গোপনীয়তা নীতি ব্যাখ্যা করে কিভাবে আমরা আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষা করি।</p><h2>আমরা যে তথ্য সংগ্রহ করি</h2><ul><li>অ্যাকাউন্ট তথ্য: নাম, ইমেইল, পাসওয়ার্ড</li><li>ব্যবহারের তথ্য: পড়া নিবন্ধ, সার্চ হিস্ট্রি</li><li>ডিভাইস তথ্য: ব্রাউজার, অপারেটিং সিস্টেম</li></ul>', 'বাংলা টাইমসের গোপনীয়তা নীতি'),
('terms', 'ব্যবহারের শর্তাবলী', '<h2>শর্তাবলী গ্রহণ</h2><p>বাংলা টাইমস ওয়েবসাইট ব্যবহার করে আপনি এই শর্তাবলী মেনে নিচ্ছেন। যদি আপনি এই শর্তাবলীতে সম্মত না হন, দয়া করে আমাদের সেবা ব্যবহার করবেন না।</p><h2>সেবার বিবরণ</h2><p>বাংলা টাইমস একটি অনলাইন সংবাদ প্ল্যাটফর্ম যা বাংলা ভাষায় সংবাদ, বিশ্লেষণ এবং তথ্য সরবরাহ করে।</p>', 'বাংলা টাইমসের ব্যবহারের শর্তাবলী'),
('contact', 'যোগাযোগ করুন', '<h2>আমাদের সাথে যোগাযোগ করুন</h2><p>যেকোনো প্রশ্ন বা পরামর্শের জন্য নিচের মাধ্যমে যোগাযোগ করতে পারেন।</p><h3>অফিস ঠিকানা</h3><p>বাড়ি #১২, রোড #১১, ব্লক #ই, বনানী, ঢাকা-১২১৩, বাংলাদেশ</p><h3>ইমেইল</h3><p>contact@banglatimes.com</p><h3>ফোন</h3><p>+৮৮০ ১৭১২ ৩৪৫৬৭৮</p>', 'বাংলা টাইমসের সাথে যোগাযোগ করুন'),
('subscription', 'সাবস্ক্রিপশন', '<h2>সাবস্ক্রিপশন প্ল্যান</h2><p>আপনার প্রয়োজন অনুযায়ী সঠিক প্ল্যান বেছে নিন। বিজ্ঞাপন মুক্ত অভিজ্ঞতা, এক্সক্লুসিভ কনটেন্ট এবং আরও অনেক কিছু পান।</p>', 'বাংলা টাইমসে সাবস্ক্রাইব করুন'),
('newsletter', 'নিউজলেটার', '<h2>নিউজলেটার সাবস্ক্রাইব করুন</h2><p>আপনার ইনবক্সে সরাসরি সর্বশেষ সংবাদ পান। আপনার পছন্দ অনুযায়ী নিউজলেটার বেছে নিন।</p>', 'বাংলা টাইমস নিউজলেটার'),
('podcasts', 'পডকাস্ট', '<h2>পডকাস্ট</h2><p>শীঘ্রই আমাদের পডকাস্ট সেকশন চালু হচ্ছে। সংবাদ, বিশ্লেষণ এবং বিশেষ সাক্ষাৎকার শুনতে আমাদের সাথেই থাকুন।</p>', 'বাংলা টাইমস পডকাস্ট');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();