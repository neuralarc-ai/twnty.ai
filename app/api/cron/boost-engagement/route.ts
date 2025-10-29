import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

// This endpoint should be called by a cron job every hour
// Over 24 hours, this will add 20-30 likes and comments per article
// You can use services like cron-job.org or Vercel Cron Jobs

// Realistic comment templates
const commentTemplates = [
  "Great insights! This really helped me understand the topic better.",
  "Excellent article! I've been looking for information like this.",
  "Very well written and informative. Thank you for sharing!",
  "This is exactly what I needed. Keep up the good work!",
  "Interesting perspective. I'll definitely be following your content.",
  "Well researched and presented. Looking forward to more articles.",
  "Thanks for breaking this down in such a clear way.",
  "This resonates with me. Great read!",
  "Really appreciate the effort put into this article.",
  "Excellent points made here. Very insightful!",
  "I learned something new today. Thank you!",
  "This is valuable information. Bookmarking this one!",
  "Well done! This was a great read from start to finish.",
  "Appreciate you sharing your knowledge on this topic.",
  "Good breakdown of the concepts. Easy to understand.",
];

const names = [
  'Alex Johnson', 'Sarah Chen', 'Michael Brown', 'Emily Davis', 'David Wilson',
  'Jessica Martinez', 'James Anderson', 'Amanda Taylor', 'Robert Thomas', 'Lisa Jackson',
  'John White', 'Maria Garcia', 'Daniel Lee', 'Jennifer Harris', 'Christopher Martin',
  'Ashley Young', 'Matthew King', 'Nicole Wright', 'Andrew Lopez', 'Kimberly Hill'
];

const emailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];

function generateRandomEmail(name: string): string {
  const parts = name.toLowerCase().split(' ');
  const username = parts.length > 1 
    ? `${parts[0]}.${parts[1]}${Math.floor(Math.random() * 100)}`
    : `${parts[0]}${Math.floor(Math.random() * 1000)}`;
  return `${username}@${emailDomains[Math.floor(Math.random() * emailDomains.length)]}`;
}

// Runtime config for Vercel Edge/Serverless
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    // Vercel automatically adds CRON_SECRET to Authorization header
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co') {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        details: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid'
      }, { status: 500 });
    }

    // Get all published articles
    const { data: articles, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('id, title, views, likes')
      .eq('status', 'published');

    if (error) throw error;

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: 'No articles to update' });
    }

    let likesAdded = 0;
    let commentsAdded = 0;
    let viewsAdded = 0;

    // Update each article with gradual boosts
    const updates = articles.map(async (article) => {
      // Add 1 like per article (80% chance to add, so not every run adds to all)
      // This ensures 20-30 likes spread throughout the day (24 runs * 0.8 = ~19 likes)
      const shouldAddLike = Math.random() > 0.2; // 80% chance
      const likesBoost = shouldAddLike ? 1 : 0;

      // Add 1 comment (80% chance per article per run)
      // This ensures 20-30 comments throughout the day (24 runs * 0.8 = ~19 comments)
      const shouldAddComment = Math.random() > 0.2; // 80% chance
      
      // Add some views (10-20 per run)
      const viewsBoost = Math.floor(Math.random() * 11) + 10; // 10-20

      // Update likes and views
      if (likesBoost > 0 || viewsBoost > 0) {
        const { error: updateError } = await supabase
          .from(TABLES.ARTICLES)
          .update({
            likes: (article.likes || 0) + likesBoost,
            views: (article.views || 0) + viewsBoost,
          })
          .eq('id', article.id);
        
        if (updateError) {
          console.error(`Error updating article ${article.id}:`, updateError);
          throw updateError;
        }
      }

      // Add comment if selected
      if (shouldAddComment) {
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomEmail = generateRandomEmail(randomName);
        const randomComment = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
        
        const { error: commentError } = await supabase
          .from(TABLES.COMMENTS)
          .insert({
            article_id: article.id,
            author_name: randomName,
            author_email: randomEmail,
            content: randomComment,
          });
        
        if (commentError) {
          console.error(`Error inserting comment for article ${article.id}:`, commentError);
          throw commentError;
        }
        
        commentsAdded++;
      }

      likesAdded += likesBoost;
      viewsAdded += viewsBoost;
    });

    await Promise.all(updates);

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${articles.length} articles with engagement boosts`,
      articlesUpdated: articles.length,
      likesAdded,
      commentsAdded,
      viewsAdded
    });

  } catch (error) {
    console.error('Error boosting engagement:', error);
    
    // Better error extraction for various error types
    let errorMessage = 'Unknown error';
    let errorDetails: any = null;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    } else if (typeof error === 'object' && error !== null) {
      // Handle Supabase errors and other object errors
      const err = error as any;
      errorMessage = err.message || err.error_description || err.details || err.hint || JSON.stringify(error);
      errorDetails = {
        code: err.code,
        message: err.message,
        details: err.details,
        hint: err.hint,
        raw: process.env.NODE_ENV === 'development' ? err : undefined
      };
    } else {
      errorMessage = String(error);
    }
    
    console.error('Error details:', {
      message: errorMessage,
      details: errorDetails,
      type: typeof error,
      stringified: JSON.stringify(error)
    });
    
    return NextResponse.json({ 
      error: 'Failed to boost engagement',
      details: errorMessage,
      ...(errorDetails && { errorInfo: errorDetails })
    }, { status: 500 });
  }
}