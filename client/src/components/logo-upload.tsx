import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Upload, X, Image, AlertCircle, CheckCircle } from "lucide-react";

interface LogoUploadProps {
  teamId: number;
  currentLogo?: string | null;
  label: string;
  onLogoChange?: (logoPath: string) => void;
}

interface ImageValidation {
  isValid: boolean;
  width: number;
  height: number;
  size: number;
  format: string;
  errors: string[];
}

export default function LogoUpload({ teamId, currentLogo, label, onLogoChange }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [validation, setValidation] = useState<ImageValidation | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Ensure we're in a browser environment
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Enhanced image validation
  const validateImage = useCallback((file: File): Promise<ImageValidation> => {
    return new Promise((resolve) => {
      const errors: string[] = [];
      
      // File size validation (10MB max for high-quality logos)
      if (file.size > 10 * 1024 * 1024) {
        errors.push('File size must be less than 10MB');
      }
      
      // File type validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        errors.push('Only JPEG, PNG, GIF, SVG, and WebP files are allowed');
      }
      
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.Image) {
        // Image dimensions validation using browser Image constructor
        const img = new window.Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          
          // Minimum dimensions
          if (width < 64 || height < 64) {
            errors.push('Image must be at least 64x64 pixels');
          }
          
          // Maximum dimensions - increased for high-quality logos
          if (width > 4096 || height > 4096) {
            errors.push('Image must be no larger than 4096x4096 pixels');
          }
          
          // Aspect ratio check - more flexible for various logo shapes
          const aspectRatio = width / height;
          if (aspectRatio < 0.25 || aspectRatio > 4) {
            errors.push('Image should have a reasonable aspect ratio (0.25 to 4.0)');
          }
          
          resolve({
            isValid: errors.length === 0,
            width,
            height,
            size: file.size,
            format: file.type,
            errors
          });
        };
        
        img.onerror = () => {
          errors.push('Invalid image file');
          resolve({
            isValid: false,
            width: 0,
            height: 0,
            size: file.size,
            format: file.type,
            errors
          });
        };
        
        img.src = URL.createObjectURL(file);
      } else {
        // Fallback for server-side rendering - skip dimension validation
        resolve({
          isValid: errors.length === 0,
          width: 0,
          height: 0,
          size: file.size,
          format: file.type,
          errors
        });
      }
    });
  }, []);

  // Create preview for validation
  const createPreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setValidation(null);
    setPreview(null);
    
    try {
      // Validate image
      const imageValidation = await validateImage(file);
      setValidation(imageValidation);
      
      if (!imageValidation.isValid) {
        toast({
          title: "Validation Error",
          description: imageValidation.errors.join(', '),
          variant: "destructive"
        });
        return;
      }
      
      // Create preview
      createPreview(file);
      
      // Convert file to base64 for Cloudinary API
      const base64 = await fileToBase64(file);

      // Upload logo to Cloudinary
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          filename: file.name,
          teamId: teamId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      // Update UI and notify parent with the Cloudinary URL
      queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
      onLogoChange?.(result.logo.url);
      
      toast({
        title: "Success",
        description: "Logo uploaded successfully to Cloudinary",
        variant: "default"
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

  const handleRemoveLogo = async () => {
    try {
      // For now, we'll just clear the logo without deleting from Cloudinary
      // You can implement deletion later if needed
      queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
      onLogoChange?.('');
      setPreview(null);
      setValidation(null);
      
      toast({
        title: "Success",
        description: "Logo removed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove logo",
        variant: "destructive"
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const displayLogo = preview || currentLogo;
  const hasLogo = displayLogo && !isUploading;

  // Don't render until we're in the client environment
  if (!isClient) {
    return (
      <div className="text-center">
        <Card className="w-full h-28 border-2 border-dashed border-gray-300 bg-gray-50">
          <div className="h-full flex flex-col items-center justify-center p-2">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-1"></div>
              <p className="text-xs text-gray-500">Loading...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Card 
        className={`w-full h-28 border-2 border-dashed transition-all duration-200 cursor-pointer ${
          dragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : hasLogo 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <div className="h-full flex flex-col items-center justify-center p-2 relative">
          {isUploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-1"></div>
              <p className="text-xs text-gray-500">Uploading...</p>
            </div>
          ) : hasLogo ? (
            <div className="text-center relative group">
              <img 
                src={displayLogo} 
                alt={label}
                className="h-16 w-16 object-cover rounded mx-auto mb-1 shadow-sm"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLogo();
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-green-600 flex items-center justify-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Uploaded
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xs text-gray-400 mt-1">Click or drag to upload</p>
            </div>
          )}
        </div>
      </Card>
      
      {/* Validation Info */}
      {validation && (
        <div className={`mt-2 p-2 rounded text-xs ${
          validation.isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <div className="flex items-center justify-center mb-1">
            {validation.isValid ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            <span className="font-medium">
              {validation.isValid ? 'Valid Image' : 'Validation Issues'}
            </span>
          </div>
          <div className="text-center">
            <div>{validation.width} × {validation.height} pixels</div>
            <div>{(validation.size / 1024).toFixed(1)} KB</div>
            {!validation.isValid && (
              <div className="mt-1">
                {validation.errors.map((error, index) => (
                  <div key={index} className="text-red-600">• {error}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
