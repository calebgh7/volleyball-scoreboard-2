import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';

export default function CloudinaryTest() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{
    type: 'logo' | 'sponsor';
    publicId: string;
    url: string;
    thumbnailUrl: string;
    filename: string;
  }>>([]);
  const { toast } = useToast();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleLogoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          filename: file.name,
          teamId: 1
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      setUploadedImages(prev => [...prev, {
        type: 'logo',
        publicId: result.logo.publicId,
        url: result.logo.url,
        thumbnailUrl: result.logo.thumbnailUrl,
        filename: file.name
      }]);

      toast({
        title: "Success",
        description: "Logo uploaded successfully to Cloudinary!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload logo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSponsorUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      
      const response = await fetch('/api/upload/sponsor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          filename: file.name
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      setUploadedImages(prev => [...prev, {
        type: 'sponsor',
        publicId: result.logo.publicId,
        url: result.logo.url,
        thumbnailUrl: result.logo.thumbnailUrl,
        filename: file.name
      }]);

      toast({
        title: "Success",
        description: "Sponsor logo uploaded successfully to Cloudinary!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload sponsor logo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (publicId: string) => {
    try {
      const response = await fetch(`/api/upload/${publicId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }

      setUploadedImages(prev => prev.filter(img => img.publicId !== publicId));
      
      toast({
        title: "Success",
        description: "Image deleted successfully from Cloudinary!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete image",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (type: 'logo' | 'sponsor') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (type === 'logo') {
        await handleLogoUpload(files[0]);
      } else {
        await handleSponsorUpload(files[0]);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cloudinary Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <Label>Upload Team Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect('logo')}
                disabled={isUploading}
              />
              <p className="text-sm text-gray-600">
                Upload a team logo to test the Cloudinary integration
              </p>
            </div>

            {/* Sponsor Upload */}
            <div className="space-y-3">
              <Label>Upload Sponsor Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect('sponsor')}
                disabled={isUploading}
              />
              <p className="text-sm text-gray-600">
                Upload a sponsor logo to test the Cloudinary integration
              </p>
            </div>
          </div>

          {isUploading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Uploading to Cloudinary...</p>
            </div>
          )}

          {/* Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Uploaded Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadedImages.map((image) => (
                  <Card key={image.publicId}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{image.type}</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(image.publicId)}
                          >
                            Delete
                          </Button>
                        </div>
                        <img
                          src={image.thumbnailUrl}
                          alt={image.filename}
                          className="w-full h-32 object-cover rounded border"
                        />
                        <div className="text-xs text-gray-600 space-y-1">
                          <p><strong>Filename:</strong> {image.filename}</p>
                          <p><strong>Public ID:</strong> {image.publicId}</p>
                          <p><strong>Type:</strong> {image.type}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(image.url, '_blank')}
                          >
                            View Full Size
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(image.url)}
                          >
                            Copy URL
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
