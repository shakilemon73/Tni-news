export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      advertisements: {
        Row: {
          clicks: number
          content: string | null
          created_at: string
          end_date: string | null
          id: string
          image_url: string | null
          impressions: number
          is_active: boolean
          link_url: string | null
          position: string
          priority: number
          slot: string | null
          start_date: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          clicks?: number
          content?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          is_active?: boolean
          link_url?: string | null
          position?: string
          priority?: number
          slot?: string | null
          start_date?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          clicks?: number
          content?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          is_active?: boolean
          link_url?: string | null
          position?: string
          priority?: number
          slot?: string | null
          start_date?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_id: string
          category_ids: string[] | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          gallery_credits: string[] | null
          gallery_images: string[] | null
          id: string
          image_credit: string | null
          publish_date: string
          seo_metadata: Json | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id: string
          category_ids?: string[] | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          gallery_credits?: string[] | null
          gallery_images?: string[] | null
          id?: string
          image_credit?: string | null
          publish_date?: string
          seo_metadata?: Json | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string
          category_ids?: string[] | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          gallery_credits?: string[] | null
          gallery_images?: string[] | null
          id?: string
          image_credit?: string | null
          publish_date?: string
          seo_metadata?: Json | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          article_id: string
          author_email: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          parent_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          article_id: string
          author_email?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          article_id?: string
          author_email?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      epapers: {
        Row: {
          created_at: string
          id: string
          pdf_url: string
          publish_date: string
          status: string
          thumbnail: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pdf_url: string
          publish_date: string
          status?: string
          thumbnail?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pdf_url?: string
          publish_date?: string
          status?: string
          thumbnail?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          file_path: string
          file_size: number | null
          file_type: string | null
          file_url: string
          filename: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          filename: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          filename?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      menus: {
        Row: {
          created_at: string
          id: string
          items: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          article_id: string
          id: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          view_date: string
          viewed_at: string
        }
        Insert: {
          article_id: string
          id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          view_date?: string
          viewed_at?: string
        }
        Update: {
          article_id?: string
          id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          view_date?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string
          created_at: string
          id: string
          meta_description: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          meta_description?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          meta_description?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_history: {
        Row: {
          article_id: string
          id: string
          read_at: string | null
          read_duration_seconds: number | null
          user_id: string
        }
        Insert: {
          article_id: string
          id?: string
          read_at?: string | null
          read_duration_seconds?: number | null
          user_id: string
        }
        Update: {
          article_id?: string
          id?: string
          read_at?: string | null
          read_duration_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_history_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_articles: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_articles_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          adsense_client_id: string | null
          adsense_enabled: boolean | null
          adsense_slots: Json | null
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          favicon: string | null
          gemini_api_key: string | null
          id: string
          logo: string | null
          site_description: string | null
          site_name: string
          social_media: Json | null
          updated_at: string
        }
        Insert: {
          adsense_client_id?: string | null
          adsense_enabled?: boolean | null
          adsense_slots?: Json | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          favicon?: string | null
          gemini_api_key?: string | null
          id?: string
          logo?: string | null
          site_description?: string | null
          site_name?: string
          social_media?: Json | null
          updated_at?: string
        }
        Update: {
          adsense_client_id?: string | null
          adsense_enabled?: boolean | null
          adsense_slots?: Json | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          favicon?: string | null
          gemini_api_key?: string | null
          id?: string
          logo?: string | null
          site_description?: string | null
          site_name?: string
          social_media?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      themes: {
        Row: {
          active: boolean
          config: Json | null
          created_at: string
          file_url: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          config?: Json | null
          created_at?: string
          file_url?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          config?: Json | null
          created_at?: string
          file_url?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      video_posts: {
        Row: {
          category_ids: string[] | null
          created_at: string
          description: string | null
          id: string
          publish_date: string
          status: string
          tags: string[] | null
          thumbnail: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          category_ids?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          publish_date?: string
          status?: string
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          category_ids?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          publish_date?: string
          status?: string
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      widgets: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          name: string
          position: number
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          name: string
          position?: number
          type: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          name?: string
          position?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_comments: {
        Row: {
          article_id: string | null
          author_name: string | null
          content: string | null
          created_at: string | null
          id: string | null
          parent_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          author_name?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          author_name?: string | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_comments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_user_role: { Args: { _user_id: string }; Returns: string }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_admin_or_editor: { Args: { _user_id: string }; Returns: boolean }
      is_reader: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
