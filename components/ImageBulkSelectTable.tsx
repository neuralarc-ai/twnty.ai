'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Download, Eye, Grid3x3, List } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Image {
  name: string;
  url: string;
  size: number;
  created_at: string;
  updated_at: string;
  mimetype: string;
}

interface ImageBulkSelectTableProps {
  images: Image[];
}

export default function ImageBulkSelectTable({ images }: ImageBulkSelectTableProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deletingSingle, setDeletingSingle] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNames(new Set(images.map(img => img.name)));
    } else {
      setSelectedNames(new Set());
    }
  };

  const handleSelectOne = (name: string, checked: boolean) => {
    const newSelected = new Set(selectedNames);
    if (checked) {
      newSelected.add(name);
    } else {
      newSelected.delete(name);
    }
    setSelectedNames(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedNames.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedNames.size} image(s)? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/admin/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageNames: Array.from(selectedNames) }),
      });

      if (response.ok) {
        setSelectedNames(new Set());
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete images');
      }
    } catch (error) {
      console.error('Error deleting images:', error);
      alert('Failed to delete images');
    } finally {
      setDeleting(false);
    }
  };

  const handleSingleDelete = async (imageName: string) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    setDeletingSingle(imageName);
    try {
      const response = await fetch('/api/admin/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageNames: [imageName] }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    } finally {
      setDeletingSingle(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const allSelected = images.length > 0 && selectedNames.size === images.length;
  const someSelected = selectedNames.size > 0 && selectedNames.size < images.length;
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <div className="border border-gray-200 bg-white overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Uploaded Images ({images.length})
            </h2>
            {selectedNames.size > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                ({selectedNames.size} selected)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle Buttons */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Grid View"
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Table View"
              >
                <List size={18} />
              </button>
            </div>
            {selectedNames.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium rounded disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : `Delete Selected (${selectedNames.size})`}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {images.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-600">
                  No images uploaded yet. Use the Bulk Generator to upload images.
                </td>
              </tr>
            ) : (
              images.map((image: Image) => (
                <tr key={image.name} className={`hover:bg-gray-50 ${selectedNames.has(image.name) ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedNames.has(image.name)}
                      onChange={(e) => handleSelectOne(image.name, e.target.checked)}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <img 
                      src={image.url} 
                      alt={image.name}
                      className="w-20 h-20 object-cover rounded border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EBroken%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 max-w-xs truncate" title={image.name}>
                      {image.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {image.mimetype}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatFileSize(image.size)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {image.created_at 
                      ? (
                        <div>
                          <div className="font-medium">
                            {format(new Date(image.created_at), 'MMM d, yyyy h:mm a')}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(image.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      ) : (
                        'Unknown'
                      )
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <Eye size={18} />
                      </a>
                      <a
                        href={image.url}
                        download={image.name}
                        className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
                        title="Download"
                      >
                        <Download size={18} />
                      </a>
                      <button
                        onClick={() => handleSingleDelete(image.name)}
                        disabled={deletingSingle === image.name}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingSingle === image.name ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="p-6">
          {/* Select All Checkbox for Grid View */}
          {images.length > 0 && (
            <div className="mb-4 flex items-center gap-2 pb-4 border-b border-gray-200">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <label className="text-sm font-medium text-gray-700">
                Select All ({images.length} images)
              </label>
              {selectedNames.size > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  ({selectedNames.size} selected)
                </span>
              )}
            </div>
          )}

          {images.length === 0 ? (
            <div className="py-12 text-center text-gray-600">
              No images uploaded yet. Use the Bulk Generator to upload images.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {images.map((image: Image) => (
                <div
                  key={image.name}
                  className={`relative group border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-all ${
                    selectedNames.has(image.name) ? 'ring-2 ring-blue-500 border-blue-500' : ''
                  }`}
                >
                  {/* Checkbox Overlay */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedNames.has(image.name)}
                      onChange={(e) => handleSelectOne(image.name, e.target.checked)}
                      className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black shadow-md"
                    />
                  </div>

                  {/* Image */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="14"%3EBroken%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {/* Action Buttons Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        title="View"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye size={16} />
                      </a>
                      <a
                        href={image.url}
                        download={image.name}
                        className="p-2 bg-white text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        title="Download"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={16} />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSingleDelete(image.name);
                        }}
                        disabled={deletingSingle === image.name}
                        className="p-2 bg-white text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingSingle === image.name ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-2 bg-white">
                    <div className="text-xs font-medium text-gray-900 truncate" title={image.name}>
                      {image.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                      <span>{formatFileSize(image.size)}</span>
                      {image.created_at && (
                        <span className="truncate ml-2">
                          {formatDistanceToNow(new Date(image.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

