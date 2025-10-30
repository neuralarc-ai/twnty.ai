import { supabase, TABLES } from '@/lib/supabase';

function hoursBetween(a: Date, b: Date): number {
  return Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60);
}

async function getLastRun(): Promise<Date | null> {
  const { data, error } = await supabase
    .from(TABLES.SETTINGS)
    .select('value')
    .eq('key', 'last_hourly_boost')
    .maybeSingle();

  if (error) {
    console.error('hourlyBoost: failed to read last run', error);
    return null;
  }

  if (!data?.value) return null;
  const d = new Date(data.value as string);
  return isNaN(d.getTime()) ? null : d;
}

async function setLastRun(date: Date): Promise<void> {
  const { error } = await supabase
    .from(TABLES.SETTINGS)
    .upsert({ key: 'last_hourly_boost', value: date.toISOString() }, { onConflict: 'key' });
  if (error) {
    console.error('hourlyBoost: failed to set last run', error);
  }
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function maybeRunHourlyBoost(): Promise<void> {
  try {
    const now = new Date();
    const lastRun = await getLastRun();

    if (lastRun && hoursBetween(lastRun, now) < 1) {
      return; // not due yet
    }

    // Fetch published articles with current likes/views
    const { data: articles, error: fetchError } = await supabase
      .from(TABLES.ARTICLES)
      .select('id, likes, views, status')
      .eq('status', 'published');

    if (fetchError) {
      console.error('hourlyBoost: failed to load articles', fetchError);
      return;
    }

    if (!articles || articles.length === 0) {
      await setLastRun(now);
      return;
    }

    // Apply small random increments to simulate organic engagement
    for (const article of articles) {
      const currentLikes = article.likes || 0;
      const currentViews = article.views || 0;

      // 0-2 likes per hour
      const likesInc = randomInt(0, 2);
      // 10-15 views per hour regardless of likes
      const viewsInc = randomInt(10, 15);

      const updateData: Record<string, number> = {};
      if (likesInc > 0) updateData.likes = currentLikes + likesInc;
      if (viewsInc > 0) updateData.views = currentViews + viewsInc;

      if (Object.keys(updateData).length === 0) continue;

      const { error: updateError } = await supabase
        .from(TABLES.ARTICLES)
        .update(updateData)
        .eq('id', article.id);

      if (updateError) {
        console.error(`hourlyBoost: failed to update article ${article.id}`, updateError);
      }
    }

    await setLastRun(now);
  } catch (err) {
    console.error('hourlyBoost: unexpected error', err);
  }
}


