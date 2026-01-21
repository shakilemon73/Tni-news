import { supabase } from '../supabase';

export type AIAction = 'summarize' | 'keywords' | 'tags' | 'suggestions';

export interface ArticleSuggestion {
  title: string;
  description: string;
}

export interface AIResponse {
  summary?: string;
  data?: string[] | ArticleSuggestion[];
  error?: string;
}

export const generateAIContent = async (
  action: AIAction,
  content: string,
  title?: string
): Promise<AIResponse> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `https://lgxeeairbvukecqomfwj.supabase.co/functions/v1/article-ai`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action, content, title }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'AI generation failed');
    }

    return result;
  } catch (error) {
    console.error('AI service error:', error);
    throw error;
  }
};

export const generateSummary = async (content: string, title?: string): Promise<string> => {
  const result = await generateAIContent('summarize', content, title);
  return result.summary || '';
};

export const generateKeywords = async (content: string, title?: string): Promise<string[]> => {
  const result = await generateAIContent('keywords', content, title);
  if (Array.isArray(result.data)) {
    return result.data as string[];
  }
  return [];
};

export const generateTags = async (content: string, title?: string): Promise<string[]> => {
  const result = await generateAIContent('tags', content, title);
  if (Array.isArray(result.data)) {
    return result.data as string[];
  }
  return [];
};

export const generateSuggestions = async (content: string, title?: string): Promise<ArticleSuggestion[]> => {
  const result = await generateAIContent('suggestions', content, title);
  if (Array.isArray(result.data)) {
    return result.data as ArticleSuggestion[];
  }
  return [];
};