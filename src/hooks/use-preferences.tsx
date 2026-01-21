
import { useContext } from 'react';
import { UserPreferencesContext } from '../App';
import { toast } from 'sonner';

export const usePreferences = () => {
  const context = useContext(UserPreferencesContext);
  
  if (!context) {
    throw new Error('usePreferences must be used within a UserPreferencesProvider');
  }
  
  const {
    fontSize,
    setFontSize,
    darkMode,
    setDarkMode,
    language,
    setLanguage,
    recommendedContent,
    setRecommendedContent,
  } = context;
  
  // Helper function to update font size with notification
  const updateFontSize = (size: string) => {
    setFontSize(size);
    document.documentElement.style.setProperty('--font-size-multiplier', 
      size === 'small' ? '0.9' : 
      size === 'large' ? '1.1' : 
      '1');
    
    toast.success(`ফন্টের আকার পরিবর্তন করা হয়েছে`);
  };
  
  // Helper function to toggle dark mode with notification
  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    toast.success(newValue ? 'ডার্ক মোড সক্রিয় করা হয়েছে' : 'লাইট মোড সক্রিয় করা হয়েছে');
  };
  
  // Helper function to change language with notification
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    toast.success(`ভাষা পরিবর্তন করা হয়েছে: ${lang === 'bn' ? 'বাংলা' : 'English'}`);
  };
  
  // Helper function to toggle recommended content with notification
  const toggleRecommendedContent = () => {
    const newValue = !recommendedContent;
    setRecommendedContent(newValue);
    toast.success(newValue ? 'ব্যক্তিগতকৃত বিষয়বস্তু সক্রিয় করা হয়েছে' : 'ব্যক্তিগতকৃত বিষয়বস্তু নিষ্ক্রিয় করা হয়েছে');
  };
  
  return {
    fontSize,
    updateFontSize,
    darkMode,
    toggleDarkMode,
    language,
    changeLanguage,
    recommendedContent,
    toggleRecommendedContent
  };
};
