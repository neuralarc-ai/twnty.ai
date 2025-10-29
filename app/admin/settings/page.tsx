'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Save, Users, User, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'author'>('users');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Author Settings
  const [authorData, setAuthorData] = useState({
    name: '',
    bio: '',
    photo_url: '',
    linkedin_url: '',
    twitter_url: '',
    website_url: '',
  });
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);

  // User Management
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
  });

  useEffect(() => {
    fetchAuthorInfo();
  }, []);

  const fetchAuthorInfo = async () => {
    try {
      const response = await fetch('/api/admin/author');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setAuthorData({
            name: data.name || '',
            bio: data.bio || '',
            photo_url: data.photo_url || '',
            linkedin_url: data.linkedin_url || '',
            twitter_url: data.twitter_url || '',
            website_url: data.website_url || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching author info:', error);
    }
  };

  const saveAuthorInfo = async () => {
    setSaving(true);
    setMessage('');
    try {
      let photoUrl = authorData.photo_url;
      
      if (uploadedPhoto) {
        const formData = new FormData();
        formData.append('file', uploadedPhoto);
        
        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          photoUrl = uploadData.url;
        }
      }

      const response = await fetch('/api/admin/author', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...authorData,
          photo_url: photoUrl,
        }),
      });

      if (response.ok) {
        setMessage('Author information saved successfully!');
        fetchAuthorInfo();
      } else {
        setMessage('Failed to save author information');
      }
    } catch (error) {
      setMessage('Failed to save author information');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const addUser = async () => {
    if (!newUser.email || !newUser.password) {
      alert('Email and password are required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setMessage('User added successfully!');
        setNewUser({ email: '', password: '', name: '' });
      } else {
        setMessage('Failed to add user');
      }
    } catch (error) {
      setMessage('Failed to add user');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const onPhotoDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedPhoto(acceptedFiles[0]);
      const previewUrl = URL.createObjectURL(acceptedFiles[0]);
      setAuthorData({ ...authorData, photo_url: previewUrl });
    }
  };

  const { getRootProps: getPhotoRootProps, getInputProps: getPhotoInputProps, isDragActive: isPhotoDragActive } = useDropzone({
    onDrop: onPhotoDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-serif font-bold mb-2">Settings</h1>
          <p className="text-gray-600">Configure your blog settings</p>
          <p className="text-sm text-gray-500 mt-2">
            Note: API keys are managed through environment variables in .env.local
          </p>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('author')}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === 'author'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <User size={16} className="inline mr-2" />
              About Author
            </button>
          </div>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white border border-gray-200 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Add New Admin User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={addUser}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Users size={20} />
              <span>{saving ? 'Adding...' : 'Add User'}</span>
            </button>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Note: User management is currently simplified. In production, implement proper user authentication and role management.
              </p>
            </div>
          </div>
        )}

        {/* About Author Tab */}
        {activeTab === 'author' && (
          <div className="bg-white border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={authorData.name}
                onChange={(e) => setAuthorData({ ...authorData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={authorData.bio}
                onChange={(e) => setAuthorData({ ...authorData, bio: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Author Photo</label>
              <div
                {...getPhotoRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isPhotoDragActive ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getPhotoInputProps()} />
                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                {uploadedPhoto ? (
                  <p className="text-sm text-gray-600">
                    Selected: {uploadedPhoto.name}
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Drag & drop a photo here, or click to select
                    </p>
                    <p className="text-xs text-gray-500">
                      Recommended: Square image, at least 400x400px
                    </p>
                  </div>
                )}
              </div>
              {authorData.photo_url && (
                <div className="mt-4">
                  <img src={authorData.photo_url} alt="Author" className="w-32 h-32 rounded-full object-cover" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  value={authorData.linkedin_url}
                  onChange={(e) => setAuthorData({ ...authorData, linkedin_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Twitter URL</label>
                <input
                  type="url"
                  value={authorData.twitter_url}
                  onChange={(e) => setAuthorData({ ...authorData, twitter_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Website URL</label>
                <input
                  type="url"
                  value={authorData.website_url}
                  onChange={(e) => setAuthorData({ ...authorData, website_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <button
              onClick={saveAuthorInfo}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              <span>{saving ? 'Saving...' : 'Save Author Info'}</span>
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
