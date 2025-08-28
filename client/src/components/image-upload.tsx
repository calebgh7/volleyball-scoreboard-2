import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface ImageUploadProps {
  onUpload: (imageData: string, filename: string) => Promise<void>;
  onDelete?: (publicId: string) => Promise<void>;
  currentImage?: {
    publicId: string;
    url: string;
    thumbnailUrl?: string;
  };
  type: 'logo' | 'sponsor';
  teamId?: number;
  className?: string;
}

export function ImageUpload({ 
  onUpload, 
  onDelete, 
  currentImage, 
  type, 
  teamId,
  className 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragging(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, WebP)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      await onUpload(base64, file.name);
      toast({
        title: "Upload successful",
        description: `${type === 'logo' ? 'Logo' : 'Sponsor image'} uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleDelete = async () => {
    if (!currentImage?.publicId || !onDelete) return;
    
    try {
      await onDelete(currentImage.publicId);
      toast({
        title: "Image deleted",
        description: `${type === 'logo' ? 'Logo' : 'Sponsor image'} deleted successfully`,
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete image",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {type === 'logo' ? 'Team Logo' : 'Sponsor Image'}
        </CardTitle>
        <CardDescription>
          {type === 'logo' 
            ? 'Upload a team logo (JPG, PNG, GIF, WebP, max 5MB)'
            : 'Upload a sponsor image (JPG, PNG, GIF, WebP, max 5MB)'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentImage ? (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={currentImage.thumbnailUrl || currentImage.url}
                alt={type === 'logo' ? 'Team logo' : 'Sponsor image'}
                className="w-full h-32 object-contain rounded-lg border"
              />
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={handleDelete}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Current image: {currentImage.publicId}
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragging ? 'Drop your image here' : 'Drag and drop your image here'}
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse
              </p>
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mt-4"
              disabled={isUploading}
            />
          </div>
        )}

        {isUploading && (
          <div className="text-center text-sm text-muted-foreground">
            Uploading...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
