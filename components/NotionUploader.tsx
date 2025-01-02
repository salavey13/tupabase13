"use client";

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { parseNotionHtml } from '@/lib/notion-parser';
import { toast } from 'sonner';

export function NotionUploader() {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // First, read the file content
      const text = await file.text();
      
      // Parse the HTML content
      const eventData = await parseNotionHtml(text);
      
      // Upload the HTML file to Supabase for reference
      const fileExt = 'html';
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `notion-pages/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Save the event data to the database
      const { error: dbError } = await supabase
        .from('events')
        .insert([eventData]);

      if (dbError) {
        throw dbError;
      }

      toast.success('Event created successfully from Notion page!');
    } catch (error) {
      console.error('Error processing Notion page:', error);
      toast.error('Failed to process Notion page');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="default"
        className="bg-gray-800 hover:bg-gray-700 text-white"
        disabled={uploading}
      >
        <label className="cursor-pointer flex items-center gap-2">
          <Upload className="h-4 w-4" />
          {uploading ? 'Processing...' : 'Upload Notion HTML'}
          <input
            type="file"
            className="hidden"
            accept=".html"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </Button>
    </div>
  );
}