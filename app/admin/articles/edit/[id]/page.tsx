'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { Wand2, Upload, X, Calendar, Link as LinkIcon, Music, Video } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import RichTextEditor from '@/components/RichTextEditor';

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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

  useEffect(() => {
    fetchArticle();
  }, [params.id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/admin/articles/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title || '',
          content: data.content || '',
          teaser: data.teaser || '',
          featured_image: data.featured_image || '',
          audio_url: data.audio_url || '',
          video_url: data.video_url || '',
          external_links: data.external_links || [],
          hashtags: data.hashtags || [],
          status: data.status || 'draft',
          scheduled_at: data.scheduled_at ? data.scheduled_at.substring(0, 16) : '',
        });
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedImage(acceptedFiles[0]);
      const previewUrl = URL.createObjectURL(acceptedFiles[0]);
      setFormData({ ...formData, featured_image: previewUrl });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = formData.featured_image;
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
        }
      }

      const response = await fetch(`/api/admin/articles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          featured_image: imageUrl,
        }),
      });

      if (response.ok) {
        router.push('/admin/articles');
      } else {
        alert('Failed to update article');
      }
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Failed to update article');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading article...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold mb-2">Edit Article</h1>
          <p className="text-gray-600">Update your blog article</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="bg-white border border-gray-200 p-6">
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Start writing your article..."
            />
            <p className="text-sm text-gray-600 mt-2">
              Word count: {formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Use the toolbar to format your text with bold, italic, headings, lists, and more.
            </p>
          </div>

          {/* Teaser */}
          <div className="bg-white border border-gray-200 p-6">
            <label className="block text-sm font-medium mb-2">Teaser</label>
            <textarea
              value={formData.teaser}
              onChange={(e) => setFormData({ ...formData, teaser: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="mr-2"
                  />
                  <span>Save as Draft</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="mr-2"
                  />
                  <span>Publish Now</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="scheduled"
                    checked={formData.status === 'scheduled'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
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
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    className="px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}