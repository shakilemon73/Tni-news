import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'editor' | 'reader' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isReader: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as Profile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Fetch user role - try user_roles table first, fall back to profiles table
  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      // First try user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!roleError && roleData?.role) {
        return roleData.role as UserRole;
      }

      // Fallback to profiles table role column
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (!profileError && profileData?.role) {
        // Map old role values - if profile has 'editor' but no user_roles entry, treat as reader
        const role = profileData.role as string;
        if (role === 'admin') return 'admin';
        if (role === 'editor') return 'editor';
        return 'reader';
      }

      return 'reader'; // Default to reader
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return 'reader';
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile and role fetch with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(setProfile);
            fetchUserRole(session.user.id).then(setRole);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          fetchProfile(session.user.id),
          fetchUserRole(session.user.id)
        ]).then(([profileData, roleData]) => {
          setProfile(profileData);
          setRole(roleData);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login')) {
          toast.error('ভুল ইমেইল বা পাসওয়ার্ড');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('অনুগ্রহ করে আপনার ইমেইল নিশ্চিত করুন');
        } else {
          toast.error('লগইন করতে সমস্যা হয়েছে');
        }
        return { error };
      }

      toast.success('সফলভাবে লগইন হয়েছে!');
      return { error: null };
    } catch (error) {
      toast.error('লগইন করতে সমস্যা হয়েছে');
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে');
        } else {
          toast.error('অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে');
        }
        return { error };
      }

      toast.success('অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল যাচাই করুন।');
      return { error: null };
    } catch (error) {
      toast.error('অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে');
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      toast.success('সফলভাবে লগআউট হয়েছে');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('লগআউট করতে সমস্যা হয়েছে');
    }
  };

  // Computed role checks
  const isAdmin = role === 'admin';
  const isEditor = role === 'editor' || role === 'admin';
  const isReader = role === 'reader';

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast.error('প্রোফাইল আপডেট করতে সমস্যা হয়েছে');
        return { error };
      }

      // Refresh profile
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);
      toast.success('প্রোফাইল আপডেট হয়েছে');
      return { error: null };
    } catch (error) {
      toast.error('প্রোফাইল আপডেট করতে সমস্যা হয়েছে');
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isLoading,
        isAdmin,
        isEditor,
        isReader,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
