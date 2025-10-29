import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const TABLES = {
  ARTICLES: 'twnty_articles',
  COMMENTS: 'twnty_comments',
  LIKES: 'twnty_likes',
  SETTINGS: 'twnty_settings',
  AUTHOR: 'twnty_author',
  VISITORS: 'twnty_visitors',
  ADMIN_USERS: 'twnty_users',
};

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';
};

// Database initialization SQL
export const initializeDatabase = async () => {
  // This should be run once to set up the database
  const sql = `
    -- Create articles table
    CREATE TABLE IF NOT EXISTS twnty_articles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      image_url TEXT,
      audio_url TEXT,
      video_url TEXT,
      external_links TEXT[],
      hashtags TEXT[],
      author_id UUID,
      status TEXT DEFAULT 'draft',
      scheduled_at TIMESTAMP WITH TIME ZONE,
      published_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0
    );

    -- Create comments table
    CREATE TABLE IF NOT EXISTS twnty_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      article_id UUID REFERENCES twnty_articles(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      author_email TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create likes table
    CREATE TABLE IF NOT EXISTS twnty_likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      article_id UUID REFERENCES twnty_articles(id) ON DELETE CASCADE,
      user_ip TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(article_id, user_ip)
    );

    -- Create settings table
    CREATE TABLE IF NOT EXISTS twnty_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create admin_users table
    CREATE TABLE IF NOT EXISTS twnty_admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create author_info table
    CREATE TABLE IF NOT EXISTS twnty_author (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT,
      description TEXT,
      photo_url TEXT,
      linkedin_url TEXT,
      twitter_url TEXT,
      website_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create visitors table for analytics
    CREATE TABLE IF NOT EXISTS twnty_visitors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      article_id UUID REFERENCES twnty_articles(id) ON DELETE CASCADE,
      user_ip TEXT,
      user_agent TEXT,
      visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_twnty_articles_status ON twnty_articles(status);
    CREATE INDEX IF NOT EXISTS idx_twnty_articles_published_at ON twnty_articles(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_twnty_comments_article_id ON twnty_comments(article_id);
    CREATE INDEX IF NOT EXISTS idx_twnty_likes_article_id ON twnty_likes(article_id);
    CREATE INDEX IF NOT EXISTS idx_twnty_visitors_article_id ON twnty_visitors(article_id);
  `;
  
  return sql;
};