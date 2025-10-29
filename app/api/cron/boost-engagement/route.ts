import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TABLES } from '@/lib/supabase';

// This endpoint should be called by a cron job every hour for best results
// Over 24 hours, this will add ~20-30 likes and ~10-15 comments per article
// Use external cron service (cron-job.org) for hourly execution
// Vercel cron (daily) can run simultaneously but hourly external cron is recommended

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
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Vercel Cron Jobs: Check for Vercel's cron authorization header
    // Vercel automatically sends "x-vercel-cron" header for internal cron jobs
    const vercelCronHeader = request.headers.get('x-vercel-cron');
    
    // Also support external cron services via CRON_SECRET
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If using Vercel Cron, x-vercel-cron header is present
    // Otherwise, verify CRON_SECRET for external services
    if (!vercelCronHeader) {
      // External cron service - require CRON_SECRET
    if (!cronSecret) {
        console.error('CRON_SECRET not configured for external cron');
        return NextResponse.json({ 
          error: 'CRON_SECRET not configured',
          message: 'CRON_SECRET environment variable is missing'
        }, { status: 500 });
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
        console.error('Unauthorized external cron request', { 
          hasHeader: !!authHeader,
          headerLength: authHeader?.length || 0,
          secretLength: cronSecret?.length || 0
        });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      console.log('Vercel cron job detected');
    }

    // Verify Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co') {
      console.error('Supabase not configured', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlValue: supabaseUrl?.substring(0, 30) + '...'
      });
      return NextResponse.json({ 
        error: 'Supabase not configured',
        message: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid'
      }, { status: 500 });
    }

    // Create a fresh Supabase client with verified credentials
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created, fetching articles...');

    // Get all published articles
    // Dynamically detect which columns exist (views, likes)
    let articles: any[] = [];
    let hasViewsColumn = false;
    let hasLikesColumn = false;
    
    console.log('Attempting to fetch articles...');
    
    // Try to fetch with both views and likes first
    let fetchedArticles: any[] | null = null;
    let fetchError: any = null;
    
    const initialResult = await supabase
      .from(TABLES.ARTICLES)
      .select('id, title, views, likes')
      .eq('status', 'published');

    fetchedArticles = initialResult.data;
    fetchError = initialResult.error;

    if (fetchError) {
      const err = fetchError as any;
      const errorCode = err?.code;
      const errorMessage = String(err?.message || '').toLowerCase();
      
      // Check if it's a column missing error
      if (errorCode === '42703' && errorMessage.includes('does not exist')) {
        const missingViews = errorMessage.includes('views');
        const missingLikes = errorMessage.includes('likes');
        
        console.warn('Column check:', { missingViews, missingLikes });
        
        // Try fetching with just likes (if views is missing)
        if (missingViews && !missingLikes) {
          console.log('Retrying with likes only (no views column)...');
          const result = await supabase
            .from(TABLES.ARTICLES)
            .select('id, title, likes')
            .eq('status', 'published');
          
          fetchedArticles = result.data;
          fetchError = result.error;
          
          if (!fetchError) {
            hasViewsColumn = false;
            hasLikesColumn = true;
          }
        }
        
        // Try fetching with just views (if likes is missing)
        if (fetchError && missingLikes && !missingViews) {
          console.log('Retrying with views only (no likes column)...');
          const result = await supabase
            .from(TABLES.ARTICLES)
            .select('id, title, views')
            .eq('status', 'published');
          
          fetchedArticles = result.data;
          fetchError = result.error;
          
          if (!fetchError) {
            hasViewsColumn = true;
            hasLikesColumn = false;
          }
        }
        
        // Try fetching with minimal columns (both missing)
        if (fetchError && missingViews && missingLikes) {
          console.log('Retrying with minimal columns (no views or likes)...');
          const result = await supabase
            .from(TABLES.ARTICLES)
            .select('id, title')
            .eq('status', 'published');
          
          fetchedArticles = result.data;
          fetchError = result.error;
          
          if (!fetchError) {
            hasViewsColumn = false;
            hasLikesColumn = false;
          }
        }
        
        if (fetchError) {
          console.error('Failed to fetch articles:', fetchError);
          throw fetchError;
        }
      } else {
        // Not a column error, throw it
        console.error('Supabase query error (not column related):', fetchError);
        throw fetchError;
      }
    } else {
      // Successfully fetched with both columns
      hasViewsColumn = true;
      hasLikesColumn = true;
    }
    
    // Normalize articles with default values
    articles = (fetchedArticles || []).map((a: any) => ({
      ...a,
      views: hasViewsColumn ? (a.views ?? 0) : 0,
      likes: hasLikesColumn ? (a.likes ?? 0) : 0
    }));
    
    console.log(`Fetched ${articles.length} articles (hasViews: ${hasViewsColumn}, hasLikes: ${hasLikesColumn})`);

    if (!articles || articles.length === 0) {
      console.log('No published articles found');
      return NextResponse.json({ message: 'No articles to update' });
    }

    console.log(`Processing ${articles.length} published articles`);

    let likesAdded = 0;
    let commentsAdded = 0;
    let viewsAdded = 0;

    // Update each article with gradual boosts
    const updates = articles.map(async (article) => {
      try {
      // Calculate hourly amounts to spread throughout the day
      // Target: 20-30 likes/day, 10-15 comments/day (spread over ~24 hourly runs)
      // Per hour: ~1 like/hour, ~0.5 comments/hour on average
      
      // Add 1 like per article per hour (80% chance, so ~20 likes/day)
      // This spreads likes naturally throughout 24 hours
      const shouldAddLike = Math.random() > 0.2; // 80% chance
      const likesBoost = shouldAddLike ? 1 : 0;

      // Add 1 comment per article per hour (40-50% chance, so ~10-15 comments/day)
      // This spreads comments naturally throughout 24 hours
      const shouldAddComment = Math.random() > 0.5; // 50% chance
      const commentsToAdd = shouldAddComment ? 1 : 0;
      
      // Add views proportional to likes (2.5x to 4x ratio)
      // When a like is added, add 3-4 views (2.5-4x, rounded to 3-4)
      // This ensures views scale naturally with engagement
      let viewsBoost = 0;
      if (likesBoost > 0) {
        // Add 3-4 views per like (2.5-4x range, rounded to 3-4)
        viewsBoost = Math.floor(Math.random() * 2) + 3; // 3-4 views per like
      }

      // Update likes and views (only if columns exist)
      // Only update if there's something to update and column exists
      if ((likesBoost > 0 && hasLikesColumn) || (viewsBoost > 0 && hasViewsColumn)) {
        const updateData: any = {};
        
        if (likesBoost > 0 && hasLikesColumn) {
          updateData.likes = (article.likes || 0) + likesBoost;
        }
        
        if (viewsBoost > 0 && hasViewsColumn) {
          updateData.views = (article.views || 0) + viewsBoost;
        }
        
        // Only update if we have something to update
        if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from(TABLES.ARTICLES)
            .update(updateData)
          .eq('id', article.id);
        
        if (updateError) {
          console.error(`Error updating article ${article.id}:`, updateError);
            throw new Error(`Failed to update article ${article.id}: ${updateError.message || JSON.stringify(updateError)}`);
          }
        }
      } else {
        // Both columns missing - can't update engagement stats
        console.warn(`Skipping engagement update for article ${article.id} - views and likes columns not available`);
      }

      // Add single comment if selected (spread throughout the day)
      if (commentsToAdd > 0) {
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
          // Don't throw - continue with other operations
        } else {
          commentsAdded++;
        }
      }

      likesAdded += likesBoost;
      viewsAdded += viewsBoost;
      } catch (err) {
        // Wrap individual article errors so Promise.all doesn't fail completely
        console.error(`Error processing article ${article.id}:`, err);
        throw err;
      }
    });

    try {
    await Promise.all(updates);
    } catch (err) {
      console.error('Error in Promise.all(updates):', err);
      throw err;
    }
    
    console.log('Engagement boost completed', {
      articlesUpdated: articles.length,
      likesAdded,
      commentsAdded,
      viewsAdded
    });

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${articles.length} articles with engagement boosts`,
      articlesUpdated: articles.length,
      likesAdded,
      commentsAdded,
      viewsAdded
    });

  } catch (error: unknown) {
    // Log the raw error first
    console.error('Raw error boosting engagement:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    
    // Better error extraction for various error types
    let errorMessage = 'Unknown error occurred';
    let errorCode: string | undefined;
    let errorDetails: any = null;
    
    if (error === null || error === undefined) {
      errorMessage = 'Error is null or undefined';
    } else if (error instanceof Error) {
      errorMessage = error.message || error.name || 'Error occurred';
      errorCode = error.name;
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else if (typeof error === 'object') {
      // Handle Supabase errors and other object errors
      const err = error as any;
      errorCode = err.code || err.error_code || err.error_code || 'UNKNOWN';
      errorMessage = err.message || err.error_description || err.details || err.hint || err.toString() || 'Database operation failed';
      
      // Extract Supabase-specific error info
      if (err.hint) {
        errorMessage = `${errorMessage}. Hint: ${err.hint}`;
      }
      
      errorDetails = {
        code: err.code,
        message: err.message,
        details: err.details,
        hint: err.hint
      };
      
      // Try to stringify for logging
      try {
        console.error('Error object details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      } catch (e) {
        console.error('Could not stringify error:', e);
      }
    } else {
      errorMessage = String(error);
    }
    
    // Always include full error info in response for debugging
    // Use consistent error response format
    const errorResponse: any = {
      error: 'Failed to boost engagement',
      message: errorMessage,
      timestamp: new Date().toISOString()
    };
    
    if (errorCode) {
      errorResponse.code = errorCode;
    }
    
    if (errorDetails) {
      errorResponse.details = errorDetails;
    } else if (error !== null && error !== undefined) {
      errorResponse.details = { raw: String(error) };
    }
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}