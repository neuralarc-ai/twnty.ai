"use client";
import { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase-client";

export default function BulkGenerator() {
  const router = useRouter();
  const [mode, setMode] = useState<'articles' | 'images'>('articles'); // 'articles' or 'images'
  const [topicsFile, setTopicsFile] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [currentProgress, setCurrentProgress] = useState<{ stage: string; progress: number; total: number; message: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new log entries are added
  useEffect(() => {
    if (logContainerRef.current) {
      setTimeout(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTo({
            top: logContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [progressLog]);

  // Dropzone for topics CSV/Excel (single)
  const {
    getRootProps: getTopicsRootProps,
    getInputProps: getTopicsInputProps,
    isDragActive: isTopicsDragActive,
  } = useDropzone({
    accept: {
      "text/csv": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "application/vnd.ms-excel": [],
    },
    multiple: false,
    onDrop: (files) => {
      if (files.length > 0) setTopicsFile(files[0]);
    },
  });

  // Dropzone for images (multiple)
  const {
    getRootProps: getImagesRootProps,
    getInputProps: getImagesInputProps,
    isDragActive: isImagesDragActive,
  } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    onDrop: (files) => setImages(files),
  });

  // Handle image-only uploads
  const handleImageOnlyUpload = async () => {
    if (images.length === 0) {
      setStatus("Please select at least one image.");
      return;
    }
    
    setLoading(true);
    setProgressLog([]);
    setStatus("");
    setCurrentProgress(null);
    setShowModal(true);
    setIsComplete(false);
    setIsError(false);
    
    try {
      const supabase = getSupabaseClient();
      
      setProgressLog(prev => [...prev, `Uploading ${images.length} images directly to storage...`]);
      setCurrentProgress({ stage: 'uploading', progress: 0, total: images.length, message: 'Uploading images...' });
      
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const timestamp = Date.now();
        const safeName = image.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${safeName}`;
        
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('article-images')
            .upload(filename, image, {
              contentType: image.type,
              upsert: false,
            });
          
          if (uploadError) {
            throw new Error(`Failed to upload ${image.name}: ${uploadError.message}`);
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('article-images')
            .getPublicUrl(filename);
          
          uploadedUrls.push(publicUrl);
          const progress = i + 1;
          setCurrentProgress({ 
            stage: 'uploading', 
            progress, 
            total: images.length, 
            message: `Uploaded ${progress}/${images.length} images` 
          });
          setProgressLog(prev => [...prev, `Uploaded image ${progress}/${images.length}: ${image.name}`]);
        } catch (uploadErr: any) {
          throw new Error(`Failed to upload image ${image.name}: ${uploadErr.message}`);
        }
      }
      
      setProgressLog(prev => [...prev, `Successfully uploaded ${uploadedUrls.length} images to storage`]);
      setIsComplete(true);
      setStatus(`Successfully uploaded ${uploadedUrls.length} images!`);
      setLoading(false);
      setImages([]);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        handleCloseModal(true);
      }, 3000);
    } catch (e: any) {
      setIsError(true);
      setStatus(e.message || "Error while uploading images");
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // If in images-only mode, handle image uploads only
    if (mode === 'images') {
      await handleImageOnlyUpload();
      return;
    }
    
    // Article generation mode
    if (!topicsFile || images.length === 0) {
      setStatus("Please select a topics file and at least one image.");
      return;
    }
    
    // Only check topics file size (images will be uploaded directly to Supabase)
    const maxTopicsSize = 1 * 1024 * 1024; // 1MB for topics file (should be enough for CSV/Excel)
    if (topicsFile.size > maxTopicsSize) {
      setStatus(`Topics file size (${(topicsFile.size / 1024 / 1024).toFixed(2)}MB) exceeds the limit (1MB). Please use a smaller file.`);
      return;
    }
    
    setLoading(true);
    setProgressLog([]);
    setStatus("");
    setCurrentProgress(null);
    setShowModal(true);
    setIsComplete(false);
    setIsError(false);
    
    try {
      const supabase = getSupabaseClient();
      
      // Step 1: Upload images directly to Supabase Storage from client
      setProgressLog(prev => [...prev, `Uploading ${images.length} images directly to storage...`]);
      setCurrentProgress({ stage: 'uploading', progress: 0, total: images.length, message: 'Uploading images...' });
      
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const timestamp = Date.now();
        const safeName = image.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${safeName}`;
        
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('article-images')
            .upload(filename, image, {
              contentType: image.type,
              upsert: false,
            });
          
          if (uploadError) {
            throw new Error(`Failed to upload ${image.name}: ${uploadError.message}`);
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('article-images')
            .getPublicUrl(filename);
          
          imageUrls.push(publicUrl);
          const progress = i + 1;
          setCurrentProgress({ 
            stage: 'uploading', 
            progress, 
            total: images.length, 
            message: `Uploaded ${progress}/${images.length} images` 
          });
          setProgressLog(prev => [...prev, `Uploaded image ${progress}/${images.length}: ${image.name}`]);
        } catch (uploadErr: any) {
          throw new Error(`Failed to upload image ${image.name}: ${uploadErr.message}`);
        }
      }
      
      setProgressLog(prev => [...prev, `Successfully uploaded ${imageUrls.length} images`]);
      setCurrentProgress({ 
        stage: 'uploading', 
        progress: images.length, 
        total: images.length, 
        message: 'All images uploaded' 
      });
      
      // Step 2: Send topics file + image URLs to API
      setProgressLog(prev => [...prev, 'Sending topics and image URLs to server...']);
      
      const fd = new FormData();
      fd.append("topicsFile", topicsFile);
      fd.append("imageUrls", JSON.stringify(imageUrls)); // Send URLs as JSON string
      
      const res = await fetch("/api/admin/bulk-generator", { method: "POST", body: fd });
      
      // Check if response is JSON before parsing
      const contentType = res.headers.get("content-type") || "";
      let data;
      
      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch (jsonError: any) {
          const errorMsg = `Failed to parse response: ${jsonError.message || "Invalid JSON response"}`;
          throw new Error(errorMsg);
        }
      } else {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Step 3: Start listening to progress updates for article generation
      const jobId = data.jobId;
      if (jobId) {
        const eventSource = new EventSource(`/api/admin/bulk-generator?jobId=${jobId}`);
        
        eventSource.onmessage = (event) => {
          try {
            const progress = JSON.parse(event.data);
            setCurrentProgress(progress);
            setProgressLog(prev => [...prev, progress.message]);
            
            if (progress.stage === 'complete') {
              setIsComplete(true);
              setStatus(`Successfully scheduled articles!`);
              setLoading(false);
              eventSource.close();
              setTopicsFile(null);
              setImages([]);
              // Auto-close after 3 seconds and refresh
              setTimeout(() => {
                handleCloseModal(true);
              }, 3000);
            } else if (progress.stage === 'error') {
              setIsError(true);
              setStatus(`Error: ${progress.message}`);
              setLoading(false);
              eventSource.close();
            }
          } catch (e) {
            console.error('Error parsing progress:', e);
          }
        };
        
        eventSource.onerror = () => {
          eventSource.close();
          if (!currentProgress || (currentProgress.stage !== 'complete' && currentProgress.stage !== 'error')) {
            setIsError(true);
            setStatus("Connection closed. Check server logs for status.");
            setLoading(false);
          }
        };
      }
    } catch (e: any) {
      setIsError(true);
      setStatus(e.message || "Error while processing");
      setLoading(false);
    }
  };

  const handleCloseModal = (refresh = false) => {
    setShowModal(false);
    setProgressLog([]);
    setCurrentProgress(null);
    setIsComplete(false);
    setIsError(false);
    setStatus("");
    if (refresh) {
      router.refresh();
    }
  };

  return (
    <>
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 pt-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Bulk Article Generator</h1>
        <p className="text-gray-600 mb-4">
          {mode === 'articles' 
            ? 'Upload a CSV/XLSX of topics and a set of images. Images will be uploaded directly to storage (no size limit). We will generate articles and schedule them hourly.'
            : 'Upload images directly to storage. No size limit - perfect for bulk image storage.'}
        </p>
        
        {/* Mode Selector */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('articles');
              setTopicsFile(null);
              setStatus('');
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === 'articles'
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Generate Articles
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('images');
              setTopicsFile(null);
              setStatus('');
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === 'images'
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Upload Images Only
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Topics uploader - Only show in articles mode */}
        {mode === 'articles' && (
          <div className="bg-white border border-gray-200 p-6 rounded">
            <label className="block text-sm font-medium mb-2">Upload Topics CSV/Excel *</label>
          <div
            {...getTopicsRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isTopicsDragActive ? "border-black bg-gray-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getTopicsInputProps()} />
            <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            {topicsFile ? (
              <p className="text-sm text-gray-700 font-semibold">{topicsFile.name}</p>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-1">Drag & drop a CSV or Excel file here, or click to select</p>
                <p className="text-xs text-gray-500">Supports: CSV, XLSX</p>
              </div>
            )}
          </div>
          </div>
        )}

        {/* Images uploader */}
        <div className="bg-white border border-gray-200 p-6 rounded">
          <label className="block text-sm font-medium mb-2">
            Upload Images (multiple) {mode === 'articles' ? '*' : ''}
          </label>
          <div
            {...getImagesRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isImagesDragActive ? "border-black bg-gray-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getImagesInputProps()} />
            <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            {images.length > 0 ? (
              <div className="flex flex-wrap gap-4 justify-center">
                {images.map((img, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <img src={URL.createObjectURL(img)} alt="Preview" className="w-20 h-16 object-cover rounded mb-1 border border-gray-200" />
                    <span className="text-xs text-gray-700 max-w-[120px] truncate">{img.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-1">Drag & drop images here, or click to select</p>
                <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF, WebP</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium rounded-lg disabled:opacity-50"
          >
            {loading 
              ? (mode === 'images' ? "Uploading..." : "Processing...") 
              : (mode === 'images' ? "Upload Images" : "Generate Articles")}
          </button>
        </div>

        {/* Status message for errors outside modal */}
        {status && !showModal && (
          <div className={`p-4 border rounded text-sm ${
            status.includes('Error') || status.includes('Error:') 
              ? 'border-red-200 bg-red-50 text-red-800' 
              : status.includes('Successfully')
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-gray-200 bg-white text-gray-800'
          }`}>
            {status}
          </div>
        )}
      </div>
    </div>

      {/* Progress Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => !loading && handleCloseModal(false)}
          />
          
          {/* Modal */}
          <div className={`relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all ${
            isComplete ? 'scale-105' : 'scale-100'
          }`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${
              isComplete ? 'bg-green-50 border-green-200' : 
              isError ? 'bg-red-50 border-red-200' : 
              'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {isComplete ? 'Processing Complete!' : 
                   isError ? 'Processing Error' : 
                   'Processing Progress'}
                </h3>
                {!loading && (
                  <button
                    onClick={() => handleCloseModal(isComplete)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Completion Animation */}
              {isComplete && (
                <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                    <CheckCircle2 size={80} className="relative text-green-500 animate-scale-in" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-green-700 animate-fade-in">
                    {status}
                  </p>
                  <p className="mt-2 text-sm text-gray-600 text-center animate-fade-in">
                    Articles have been scheduled and will publish automatically
                  </p>
                </div>
              )}

              {/* Error Animation */}
              {isError && (
                <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                  <AlertCircle size={80} className="text-red-500 animate-scale-in" />
                  <p className="mt-4 text-lg font-semibold text-red-700 animate-fade-in">
                    {status}
                  </p>
                </div>
              )}

              {/* Progress Content (when not complete/error) */}
              {!isComplete && !isError && currentProgress && (
                <>
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{currentProgress.message}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {currentProgress.total > 0 ? `${Math.round((currentProgress.progress / currentProgress.total) * 100)}%` : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-black to-gray-800 h-3 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                        style={{ width: currentProgress.total > 0 ? `${Math.min((currentProgress.progress / currentProgress.total) * 100, 100)}%` : '0%' }}
                      >
                        {currentProgress.progress > 0 && (
                          <span className="text-xs text-white font-medium">
                            {currentProgress.progress}/{currentProgress.total}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Log */}
                  {progressLog.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Activity Log</h4>
                      <div 
                        ref={logContainerRef}
                        className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto"
                      >
                        {progressLog.map((msg, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-start gap-2 text-sm text-gray-700 py-1 animate-slide-in"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              msg.includes('Error') ? 'bg-red-500' : 
                              msg.includes('Successfully') || msg.includes('Scheduled') ? 'bg-green-500' :
                              msg.includes('Generating') ? 'bg-blue-500' : 'bg-gray-400'
                            }`} />
                            <span className="flex-1">{msg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {(isComplete || isError) && (
              <div className={`px-6 py-4 border-t ${
                isComplete ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <button
                  onClick={() => handleCloseModal(isComplete)}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                    isComplete 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isComplete ? 'Close & Refresh' : 'Close'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
