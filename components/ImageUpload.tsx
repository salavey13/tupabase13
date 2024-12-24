"use client";

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/image-upload';

interface ImageUploadProps {
  onUpload: (url: string) => void;
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const url = await uploadImage(file);
      onUpload(url);
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        className="bg-gray-800 hover:bg-gray-700 text-white"
        disabled={uploading}
      >
        <label className="cursor-pointer flex items-center gap-2">
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </Button>
    </div>
  );
}