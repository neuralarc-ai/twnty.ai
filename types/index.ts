export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  audio_url?: string;
  video_url?: string;
  external_links?: string[];
  hashtags?: string[];
  author_id?: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
}

export interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
}

export interface Like {
  id: string;
  article_id: string;
  user_ip: string;
  created_at: string;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  created_at: string;
}

export interface AuthorInfo {
  id: string;
  title?: string;
  description?: string;
  photo_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Visitor {
  id: string;
  article_id?: string;
  user_ip?: string;
  user_agent?: string;
  visited_at: string;
}

export interface DashboardStats {
  totalArticles: number;
  totalVisitors: number;
  totalLikes: number;
  totalComments: number;
  recentArticles: Article[];
  popularArticles: Article[];
}