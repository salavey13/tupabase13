'use client'

import { useState, useEffect } from 'react'
import { ImagePlus, Loader2, X, Link, Upload } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BottomSheet } from '@/components/bottom-sheet'
import { Event } from '@/lib/database'

interface ImageSelectorProps {
  onImageSelect: (url: string) => void
  selectedImage?: string
  selectedEvent?: Event | null
}

export async function uploadImage(file: File) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `public/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: signedUrl, error: signError } = await supabase.storage
      .from('project-images')
      .createSignedUrl(filePath, 31536000) // 1 year expiry

    if (signError) throw signError
    return signedUrl.signedUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export async function uploadImageFromUrl(url: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })
    return await uploadImage(file)
  } catch (error) {
    console.error('Error uploading image from URL:', error)
    throw error
  }
}

export function ImageSelector({ onImageSelect, selectedImage, selectedEvent }: ImageSelectorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(selectedImage)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  useEffect(() => {
    loadExistingImages()
  }, [])

  useEffect(() => {
    if (selectedEvent?.image_url && !imageUrl) {
      setImageUrl(selectedEvent.image_url)
      onImageSelect(selectedEvent.image_url)
    }
  }, [selectedEvent, imageUrl, onImageSelect])

  async function loadExistingImages() {
    try {
      const { data, error } = await supabase.storage
        .from('project-images')
        .list('public')

      if (error) throw error

      const urls = await Promise.all(
        data.map(async (file) => {
          const { data: signedUrl, error: signError } = await supabase.storage
            .from('project-images')
            .createSignedUrl(`public/${file.name}`, 31536000)

          if (signError) throw signError
          return signedUrl.signedUrl
        })
      )

      setExistingImages(urls)
    } catch (error) {
      console.error('Error loading images:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const publicUrl = await uploadImage(file)
      setImageUrl(publicUrl)
      onImageSelect(publicUrl)
      await loadExistingImages()
      setIsOpen(false)
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlUpload = async () => {
    if (!urlInput) return

    setIsUploading(true)
    try {
      const publicUrl = await uploadImageFromUrl(urlInput)
      setImageUrl(publicUrl)
      onImageSelect(publicUrl)
      await loadExistingImages()
      setUrlInput('')
      setIsOpen(false)
    } catch (error) {
      console.error('Error uploading image from URL:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label>Image</Label>
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="w-full justify-start"
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          {imageUrl ? 'Change image' : 'Add image'}
        </Button>
      </div>

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="space-y-6">
          <div className="text-2xl font-semibold text-white">Add image</div>
          
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="url"
                placeholder="Paste image URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="pr-20 bg-[#2C2C2E] border-0 text-white"
              />
              <Button
                size="sm"
                onClick={handleUrlUpload}
                disabled={!urlInput || isUploading}
                className="absolute right-1 top-1 h-7"
              >
                <Link className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-[#2C2C2E] hover:bg-[#3C3C3E] transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center"
                >
                  <Upload className="h-8 w-8 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-400">
                    {isUploading ? 'Uploading...' : 'Click to upload'}
                  </span>
                </motion.div>
              </label>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : existingImages.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {existingImages.map((url) => (
                <motion.button
                  key={url}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-blue-500"
                  onClick={() => {
                    setImageUrl(url)
                    onImageSelect(url)
                    setIsOpen(false)
                  }}
                >
                  <Image
                    src={url}
                    alt="Uploaded image"
                    fill
                    className="object-cover"
                  />
                </motion.button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">No images uploaded yet</p>
          )}
        </div>
      </BottomSheet>

      {imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={imageUrl}
            alt="Selected image"
            fill
            className="object-contain"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => {
              setImageUrl('')
              onImageSelect('')
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

