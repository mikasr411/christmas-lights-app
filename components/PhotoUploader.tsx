'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { Upload, Image as ImageIcon } from 'lucide-react'

export function PhotoUploader() {
  const [uploading, setUploading] = useState(false)
  const { currentProject, setCurrentProject } = useAppStore()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        setCurrentProject({
          ...currentProject,
          photoUrl: url,
          title: currentProject?.title || 'New Project',
          status: 'draft'
        })
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }, [currentProject, setCurrentProject])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload House Photo</CardTitle>
        <CardDescription>
          Upload a clear photo of the house front elevation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          {currentProject?.photoUrl ? (
            <div className="space-y-2">
              <ImageIcon className="mx-auto h-12 w-12 text-green-500" />
              <p className="text-sm text-green-600">Photo uploaded successfully</p>
              <Button variant="outline" size="sm">
                Replace Photo
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive ? 'Drop the photo here' : 'Drag & drop or click to select'}
              </p>
              <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
            </div>
          )}
        </div>
        {uploading && (
          <div className="mt-4 text-center">
            <p className="text-sm text-blue-600">Uploading...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}




