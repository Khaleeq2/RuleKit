'use client';

import { useEffect, useState, useRef } from 'react';
import { Upload, FileText, Cloud, Clock, HardDrive, Image, File, Trash2, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeaderSimple } from '@/app/components/PageHeader';

interface Asset {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return Image;
  if (['pdf'].includes(ext || '')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/assets/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
      }

      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`);
      loadAssets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="px-8 py-10 max-w-[1200px] xl:max-w-[1280px] mx-auto">
      <PageHeaderSimple
        title="Assets"
        subtitle="Upload and manage files for validation"
      />

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative mb-6 p-10 rounded-lg border-2 border-dashed cursor-pointer
          transition-all duration-300 text-center group
          ${dragActive 
            ? 'border-[var(--foreground)] bg-[var(--muted)] scale-[1.01]' 
            : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--foreground)]/25 hover:bg-[var(--muted)]/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={uploading}
          className="hidden"
        />
        
        <div className={`
          w-16 h-16 rounded-lg mx-auto mb-5 flex items-center justify-center
          transition-all duration-300
          ${dragActive 
            ? 'bg-[var(--foreground)] text-[var(--background)] scale-110' 
            : 'bg-[var(--foreground)] text-[var(--background)] group-hover:scale-110'
          }
        `}>
          {uploading ? (
            <svg className="animate-spin w-7 h-7" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <Cloud className="w-7 h-7" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
          {uploading ? 'Uploading...' : dragActive ? 'Drop files here' : 'Upload your files'}
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-md mx-auto">
          Drag and drop your files here, or click to browse. Supports PDF, DOC, images, and more.
        </p>
        
        {!uploading && (
          <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-md hover:opacity-90 transition-opacity">
            <Upload className="w-4 h-4" />
            Choose Files
          </button>
        )}

        {/* File type badges */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {['PDF', 'DOC', 'PNG', 'JPG'].map((type) => (
            <span key={type} className="px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg">
              {type}
            </span>
          ))}
          <span className="px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg">
            +more
          </span>
        </div>
      </div>

      {/* Assets List Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Your Files</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {loading ? 'Loading...' : `${assets.length} file${assets.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--muted)] rounded-md" />
                <div className="flex-1">
                  <div className="h-4 w-1/4 bg-[var(--muted)] rounded mb-2" />
                  <div className="h-3 w-1/6 bg-[var(--muted)] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-12 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-lg bg-[var(--muted)] flex items-center justify-center mx-auto mb-5">
            <HardDrive className="w-8 h-8 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            No files yet
          </h3>
          <p className="text-[var(--muted-foreground)] max-w-sm mx-auto">
            Upload your first file to start validating against your rules.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {assets.map((asset, index) => {
            const FileIcon = getFileIcon(asset.name);
            return (
              <div
                key={asset.id}
                className="group bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--foreground)]/15 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-5 h-5 text-[var(--foreground)]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--foreground)] truncate">{asset.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {formatFileSize(asset.size)}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(asset.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="p-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-200">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-200">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-all duration-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
