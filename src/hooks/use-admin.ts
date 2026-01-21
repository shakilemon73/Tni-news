
import { useState } from 'react';
import { toast } from 'sonner';
import { signIn, signUp, signOut } from '@/lib/services';

export const useAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      if (!email || !password) {
        toast('ইনপুট মিসিং', {
          description: 'ইমেইল এবং পাসওয়ার্ড দিন'
        });
        return null;
      }
      
      const { data, error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      if (!data?.user) {
        throw new Error('No user returned');
      }
      
      return data.user;
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message.includes('Invalid login')) {
        toast('লগইন ত্রুটি', {
          description: 'ভুল ইমেইল বা পাসওয়ার্ড'
        });
      } else if (error.message.includes('Email not confirmed')) {
        toast('ইমেইল নিশ্চিত করুন', {
          description: 'অনুগ্রহ করে আপনার ইমেইল নিশ্চিত করুন'
        });
      } else {
        toast('লগইন ত্রুটি', {
          description: 'লগইন করতে সমস্যা হয়েছে'
        });
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      
      if (!email || !password || !fullName) {
        toast('ইনপুট মিসিং', {
          description: 'সমস্ত প্রয়োজনীয় তথ্য দিন'
        });
        return null;
      }
      
      const { data, error } = await signUp(email, password, { full_name: fullName });
      
      if (error) {
        throw error;
      }
      
      return data.user;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message.includes('already registered')) {
        toast('ইমেইল বিদ্যমান', {
          description: 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে'
        });
      } else {
        toast('নিবন্ধন ত্রুটি', {
          description: 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে'
        });
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast('লগআউট ত্রুটি', {
        description: 'লগআউট করতে সমস্যা হয়েছে'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    login,
    register,
    logout,
    isLoading
  };
};
