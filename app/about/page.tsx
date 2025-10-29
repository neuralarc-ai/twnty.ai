import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase, TABLES } from '@/lib/supabase';
import Image from 'next/image';
import { Linkedin, Twitter, Globe } from 'lucide-react';

async function getAuthorInfo() {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return null;
    }

    const { data, error } = await supabase
      .from(TABLES.AUTHOR)
      .select('*')
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching author info:', error);
    return null;
  }
}

export const revalidate = 60;

export default async function AboutPage() {
  const author = await getAuthorInfo();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-center">
            About
          </h1>

          {author ? (
            <div className="space-y-8">
              {/* Author Photo */}
              {author.photo_url && (
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-black">
                    <Image
                      src={author.photo_url}
                      alt="Author"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Title */}
              {author.name && (
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-center">
                  {author.name}
                </h2>
              )}

              {/* Description */}
              {author.bio && (
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {author.bio}
                  </p>
                </div>
              )}

              {/* Social Links */}
              {(author.linkedin_url || author.twitter_url || author.website_url) && (
                <div className="flex justify-center space-x-6 pt-8 border-t border-gray-200">
                  {author.linkedin_url && (
                    <a
                      href={author.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors"
                    >
                      <Linkedin size={20} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {author.twitter_url && (
                    <a
                      href={author.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors"
                    >
                      <Twitter size={20} />
                      <span>Twitter</span>
                    </a>
                  )}
                  {author.website_url && (
                    <a
                      href={author.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors"
                    >
                      <Globe size={20} />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">Author information not available yet.</p>
              <p className="text-sm text-gray-500 mt-2">Please check back later.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}