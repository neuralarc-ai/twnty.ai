import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';

// This endpoint should be called by a cron job every 2 hours
// You can use services like cron-job.org or Vercel Cron Jobs

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all published articles
    const { data: articles, error } = await supabase
      .from(TABLES.ARTICLES)
      .select('id, views, likes')
      .eq('status', 'published');

    if (error) throw error;

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: 'No articles to update' });
    }

    // Update each article with random boosts
    const updates = articles.map(async (article) => {
      const likesBoost = Math.floor(Math.random() * 5) + 6; // 6-10
      const viewsBoost = Math.floor(Math.random() * 331) + 100; // 100-430

      return supabase
        .from(TABLES.ARTICLES)
        .update({
          likes: (article.likes || 0) + likesBoost,
          views: (article.views || 0) + viewsBoost,
        })
        .eq('id', article.id);
    });

    await Promise.all(updates);

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${articles.length} articles with engagement boosts`,
      articlesUpdated: articles.length 
    });

  } catch (error) {
    console.error('Error boosting engagement:', error);
    return NextResponse.json({ 
      error: 'Failed to boost engagement',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}