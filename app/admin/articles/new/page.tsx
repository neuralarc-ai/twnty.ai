'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import ArticlePreviewModal from '@/components/ArticlePreviewModal';
import RichTextEditor from '@/components/RichTextEditor';
import { Wand2, Upload, X, Calendar, Link as LinkIcon, Music, Video, Eye, RefreshCw } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [articleGenerated, setArticleGenerated] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    teaser: '',
    featured_image: '',
    audio_url: '',
    video_url: '',
    external_links: [] as string[],
    hashtags: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    scheduled_at: '',
  });

  const [newLink, setNewLink] = useState('');
  const [newHashtag, setNewHashtag] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedImage(acceptedFiles[0]);
      // Create preview URL
      const previewUrl = URL.createObjectURL(acceptedFiles[0]);
      setFormData(prevData => ({ ...prevData, featured_image: previewUrl }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const handleGenerateWithAI = async () => {
    const promptToUse = aiPrompt;
    
    if (!promptToUse.trim()) {
      alert('Please enter a topic or prompt');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/admin/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: promptToUse 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('AI Generated Data:', data); // Debug log
        
        // Explicitly set the form data with the generated content
        setFormData(prevData => ({
          ...prevData,
          title: data.title || '',
          content: data.content || '',
          hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
          teaser: data.excerpt || '',
        }));
        
        console.log('Setting form data with title:', data.title);
        console.log('Setting form data with excerpt:', data.excerpt);
        console.log('Setting form data with hashtags:', data.hashtags);
        
        // Save the prompt and mark as generated
        setLastPrompt(promptToUse);
        setArticleGenerated(true);
        setShowAIModal(false);
        setAiPrompt('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate article');
      }
    } catch (error) {
      console.error('Error generating article:', error);
      alert('Failed to generate article');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lastPrompt) {
      alert('No previous prompt found');
      return;
    }
    
    setGenerating(true);
    try {
      const response = await fetch('/api/admin/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: lastPrompt 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('AI Regenerated Data:', data); // Debug log
        
        // Explicitly set the form data with the generated content
        setFormData(prevData => ({
          ...prevData,
          title: data.title || '',
          content: data.content || '',
          hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
          teaser: data.excerpt || '',
        }));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to regenerate article');
      }
    } catch (error) {
      console.error('Error regenerating article:', error);
      alert('Failed to regenerate article');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl: string | null = null;
      
      // If there's a new uploaded image, upload it first
      if (uploadedImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', uploadedImage);
        
        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        } else {
          alert('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      } else if (formData.featured_image) {
        // If there's an existing image URL, check if it's valid (not a blob URL)
        if (formData.featured_image.startsWith('blob:')) {
          // Don't save blob URLs - they're temporary and won't work
          console.warn('Rejecting blob URL - image must be uploaded first');
          imageUrl = null;
        } else {
          // Existing valid URL (from Supabase Storage or external)
          imageUrl = formData.featured_image;
        }
      }

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          teaser: formData.teaser || formData.content.substring(0, 200) + '...',
          featured_image: imageUrl,
          audio_url: formData.audio_url,
          video_url: formData.video_url,
          external_links: formData.external_links,
          hashtags: formData.hashtags,
          status: formData.status,
          scheduled_at: formData.scheduled_at || null,
        }),
      });

      if (response.ok) {
        router.push('/admin/articles');
      } else {
        const errorData = await response.json();
        alert(`Failed to create article: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  const addExternalLink = () => {
    if (newLink.trim()) {
      setFormData({
        ...formData,
        external_links: [...formData.external_links, newLink.trim()],
      });
      setNewLink('');
    }
  };

  const removeExternalLink = (index: number) => {
    setFormData({
      ...formData,
      external_links: formData.external_links.filter((_, i) => i !== index),
    });
  };

  const addHashtag = () => {
    if (newHashtag.trim()) {
      setFormData({
        ...formData,
        hashtags: [...formData.hashtags, newHashtag.trim().replace('#', '')],
      });
      setNewHashtag('');
    }
  };

  const removeHashtag = (index: number) => {
    setFormData({
      ...formData,
      hashtags: formData.hashtags.filter((_, i) => i !== index),
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">New Article</h1>
            <p className="text-gray-600">Create a new blog article</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors rounded-lg"
            >
              <Wand2 size={20} />
              <span>Generate with AI</span>
            </button>
            {articleGenerated && (
              <button
                onClick={handleRegenerate}
                disabled={generating}
                className="flex items-center space-x-2 px-4 py-2 border-2 border-black text-black hover:bg-gray-100 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={20} className={generating ? 'animate-spin' : ''} />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-white border border-gray-200 p-6">
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prevData => ({ ...prevData, title: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
              placeholder="Enter article title"
            />
          </div>

          {/* Content */}
          <div className="bg-white border border-gray-200 p-6">
            <label className="block text-sm font-medium mb-2">Content *</label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData(prevData => ({ ...prevData, content: value }))}
              placeholder="Start writing your article..."
            />
            <p className="text-sm text-gray-600 mt-2">
              Word count: {formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Use the toolbar to format your text with bold, italic, headings, lists, and more.
            </p>
          </div>

          {/* Excerpt */}
          <div className="bg-white border border-gray-200 p-6">
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <textarea
              value={formData.teaser}
              onChange={(e) => setFormData(prevData => ({ ...prevData, teaser: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
              placeholder="Brief summary of the article"
            />
          </div>

          {/* Image Upload */}
          <div className="bg-white border border-gray-200 p-6">
            <label className="block text-sm font-medium mb-2">Featured Image</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload size={48} className="mx-auto mb-4 text-gray-400" />
              {uploadedImage ? (
                <p className="text-sm text-gray-600">
                  Selected: {uploadedImage.name}
                </p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Drag & drop an image here, or click to select
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports: JPG, PNG, GIF, WebP
                  </p>
                </div>
              )}
            </div>
            {formData.featured_image && (
              <div className="mt-4">
                <img src={formData.featured_image} alt="Preview" className="max-w-xs rounded-lg" />
              </div>
            )}
            {/* Aspect Ratio Guidelines */}
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">Recommended Aspect Ratios:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• <strong>Home Page (Featured):</strong> 5:2 or 2.5:1 (wide landscape)</li>
                <li>• <strong>Home Page (Cards):</strong> 2:1 (wide landscape)</li>
                <li>• <strong>Article Page:</strong> 16:10 or 8:5 (desktop), 16:9 (tablet/mobile)</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                Images will be automatically cropped to fit. Best results with landscape-oriented images.
              </p>
            </div>
          </div>

          {/* Media URLs */}
          <div className="bg-white border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Music size={16} className="mr-2" />
                Audio URL
              </label>
              <input
                type="url"
                value={formData.audio_url}
                onChange={(e) => setFormData(prevData => ({ ...prevData, audio_url: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                placeholder="https://example.com/audio.mp3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center">
                <Video size={16} className="mr-2" />
                Video URL
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData(prevData => ({ ...prevData, video_url: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                placeholder="https://example.com/video.mp4"
              />
            </div>
          </div>

          {/* External Links */}
          <div className="bg-white border border-gray-200 p-6">
            <label className="block text-sm font-medium mb-2 flex items-center">
              <LinkIcon size={16} className="mr-2" />
              External Links
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExternalLink())}
                className="flex-1 px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                placeholder="https://example.com"
              />
              <button
                type="button"
                onClick={addExternalLink}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.external_links.length > 0 && (
              <div className="space-y-2">
                {formData.external_links.map((link, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm truncate">{link}</span>
                    <button
                      type="button"
                      onClick={() => removeExternalLink(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hashtags */}
          <div className="bg-white border border-gray-200 p-6">
            <label className="block text-sm font-medium mb-2">Hashtags (SEO)</label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                className="flex-1 px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                placeholder="technology"
              />
              <button
                type="button"
                onClick={addHashtag}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.hashtags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded">
                    <span className="text-sm">#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeHashtag(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Publishing Options */}
          <div className="bg-white border border-gray-200 p-6">
            <label className="block text-sm font-medium mb-2">Publishing</label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={(e) => setFormData(prevData => ({ ...prevData, status: e.target.value as any }))}
                    className="mr-2"
                  />
                  <span>Save as Draft</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={(e) => setFormData(prevData => ({ ...prevData, status: e.target.value as any }))}
                    className="mr-2"
                  />
                  <span>Publish Now</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="scheduled"
                    checked={formData.status === 'scheduled'}
                    onChange={(e) => setFormData(prevData => ({ ...prevData, status: e.target.value as any }))}
                    className="mr-2"
                  />
                  <span>Schedule</span>
                </label>
              </div>

              {formData.status === 'scheduled' && (
                <div className="flex items-center space-x-2">
                  <Calendar size={20} className="text-gray-400" />
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData(prevData => ({ ...prevData, scheduled_at: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/admin/articles')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="px-6 py-3 border-2 border-black text-black hover:bg-gray-100 transition-colors font-medium flex items-center space-x-2"
              >
                <Eye size={20} />
                <span>Preview</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setFormData(prevData => ({ ...prevData, status: 'draft' }));
                  setTimeout(() => handleSubmit(new Event('submit') as any), 100);
                }}
                disabled={loading || !formData.title || !formData.content}
                className="px-6 py-3 border-2 border-black text-black hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save as Draft
              </button>
              
              <button
                type="submit"
                disabled={loading || !formData.title || !formData.content}
                className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>
        </form>

        {/* Preview Modal */}
        {showPreview && (
          <ArticlePreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            article={{
              title: formData.title,
              content: formData.content,
              teaser: formData.teaser,
              featured_image: formData.featured_image,
              hashtags: formData.hashtags,
              audio_url: formData.audio_url,
              video_url: formData.video_url,
              external_links: formData.external_links,
            }}
          />
        )}
      </div>

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif font-bold flex items-center">
                <Wand2 size={24} className="mr-2" />
                Generate Article with AI
              </h2>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  What would you like to write about?
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                  placeholder="E.g., 'The future of artificial intelligence in healthcare' or 'Top 10 productivity tips for remote workers'"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 text-sm rounded">
                ✨ AI will generate a fully formatted article with HTML, including headings, bold text, lists, and proper spacing - ready to publish!
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleGenerateWithAI}
                  disabled={generating}
                  className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
                >
                  {generating ? 'Generating...' : 'Generate Article'}
                </button>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}