import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TABLES } from '@/lib/supabase';

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
    // Try to select views column, but handle if it doesn't exist
    let articles: any[] = [];
    let hasViewsColumn = true;
    
    const { data: articlesWithViews, error: viewsError } = await supabase
      .from(TABLES.ARTICLES)
      .select('id, title, views, likes')
      .eq('status', 'published');

    if (viewsError) {
      // Check if error is due to missing views column
      if (viewsError.code === '42703' || viewsError.message?.includes('does not exist')) {
        console.warn('Views column does not exist, fetching articles without views');
        hasViewsColumn = false;
        
        // Try again without views column
        const { data: articlesWithoutViews, error: noViewsError } = await supabase
          .from(TABLES.ARTICLES)
          .select('id, title, likes')
          .eq('status', 'published');
        
        if (noViewsError) {
          console.error('Supabase query error:', noViewsError);
          throw noViewsError;
        }
        
        articles = (articlesWithoutViews || []).map((a: any) => ({ ...a, views: 0 }));
      } else {
        console.error('Supabase query error:', viewsError);
        throw viewsError;
      }
    } else {
      articles = articlesWithViews || [];
    }

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
      // Only update if there's something to update
      if (likesBoost > 0 || viewsBoost > 0) {
        const updateData: any = {};
        
        if (likesBoost > 0) {
          updateData.likes = (article.likes || 0) + likesBoost;
        }
        
        // Only update views if the column exists (graceful fallback)
        if (viewsBoost > 0 && hasViewsColumn) {
          updateData.views = (article.views || 0) + viewsBoost;
        } else if (viewsBoost > 0 && !hasViewsColumn) {
          // Column doesn't exist - skip views update but continue
          console.warn(`Views column not available, skipping views update for article ${article.id}`);
        }
        
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
            throw new Error(`Failed to insert comment for article ${article.id}: ${commentError.message || JSON.stringify(commentError)}`);
        }
        
        commentsAdded++;
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