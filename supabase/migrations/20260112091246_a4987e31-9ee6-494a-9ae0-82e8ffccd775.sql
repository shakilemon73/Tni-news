-- Insert categories from the mock data
INSERT INTO public.categories (name, slug, description) VALUES
('বাংলাদেশ', 'bangladesh', 'বাংলাদেশ সংক্রান্ত সকল সংবাদ'),
('আন্তর্জাতিক', 'international', 'আন্তর্জাতিক সংবাদ'),
('খেলা', 'sports', 'খেলাধুলা সংক্রান্ত সংবাদ'),
('বিনোদন', 'entertainment', 'বিনোদন জগতের খবর'),
('অর্থনীতি', 'economy', 'অর্থনৈতিক সংবাদ'),
('পরিবেশ', 'environment', 'পরিবেশ সংক্রান্ত সংবাদ'),
('শিক্ষা', 'education', 'শিক্ষা সংক্রান্ত সংবাদ'),
('প্রযুক্তি', 'technology', 'প্রযুক্তি সংবাদ'),
('পর্যটন', 'tourism', 'পর্যটন সংক্রান্ত সংবাদ')
ON CONFLICT (slug) DO NOTHING;