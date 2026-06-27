import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Plus, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ value = [], onChange, maxFiles = 5 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (value.length + acceptedFiles.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} images`);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const res = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        onChange([...value, ...res.data.urls]);
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  }, [value, onChange, maxFiles]);

  const removeImage = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    disabled: isUploading || value.length >= maxFiles,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-square rounded-xl overflow-hidden border group bg-gray-50">
            <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {value.length < maxFiles && (
          <div
            {...getRootProps()}
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
              isDragActive ? "border-primary bg-green-50" : "border-gray-200 hover:border-primary hover:bg-gray-50",
              (isUploading || value.length >= maxFiles) && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <>
                <Plus className="w-8 h-8 text-gray-300" />
                <p className="text-xs font-bold text-gray-400 uppercase mt-2">Add Image</p>
              </>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 italic">
        Max {maxFiles} images. PNG, JPG or WebP (Max 5MB each).
      </p>
    </div>
  );
}
