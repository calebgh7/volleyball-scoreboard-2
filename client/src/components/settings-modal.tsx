import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Settings, Palette, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from './image-upload';
import { useToast } from '../hooks/use-toast';

interface SettingsModalProps {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  isOpen: boolean;
  onClose: () => void;
}

interface UserSettings {
  id?: number;
  userId: string;
  sponsorLogoPath?: string;
  sponsorLogoPublicId?: string;
  primaryColor: string;
  accentColor: string;
  theme: string;
  defaultMatchFormat: number;
  autoSave: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function SettingsModal({ user, token, isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<UserSettings>({
    userId: user.id,
    primaryColor: '#1565C0',
    accentColor: '#FF6F00',
    theme: 'standard',
    defaultMatchFormat: 5,
    autoSave: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [cloudinaryStatus, setCloudinaryStatus] = useState<{
    configured: boolean;
    usage?: any;
  }>({ configured: false });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      checkCloudinaryStatus();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.message !== 'No settings found') {
          setSettings(data);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const checkCloudinaryStatus = async () => {
    try {
      const response = await fetch('/api/cloudinary/status');
      if (response.ok) {
        const data = await response.json();
        setCloudinaryStatus(data);
      }
    } catch (error) {
      console.error('Failed to check Cloudinary status:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Your settings have been saved successfully",
        });
        onClose();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Save failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSponsorUpload = async (imageData: string, filename: string) => {
    try {
      const response = await fetch('/api/upload/sponsor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageData, filename })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      setSettings(prev => ({
        ...prev,
        sponsorLogoPublicId: result.logo.publicId
      }));

      // Reload settings to get updated data
      await loadSettings();
    } catch (error) {
      throw error;
    }
  };

  const handleSponsorDelete = async (publicId: string) => {
    try {
      const response = await fetch(`/api/upload/${publicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }

      setSettings(prev => ({
        ...prev,
        sponsorLogoPublicId: undefined
      }));

      // Reload settings to get updated data
      await loadSettings();
    } catch (error) {
      throw error;
    }
  };

  const currentSponsorImage = settings.sponsorLogoPublicId ? {
    publicId: settings.sponsorLogoPublicId,
    url: `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload/${settings.sponsorLogoPublicId}`,
    thumbnailUrl: `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload/c_fill,w_300,h_300/${settings.sponsorLogoPublicId}`
  } : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize your scoreboard appearance and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={user.name}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cloudinary Status */}
          {cloudinaryStatus.configured && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Cloud Storage Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Cloudinary is configured and ready for image uploads.
                  {cloudinaryStatus.usage && (
                    <div className="mt-2 space-y-1">
                      <div>Plan: {cloudinaryStatus.usage.plan}</div>
                      <div>Credits: {cloudinaryStatus.usage.credits}</div>
                      <div>Storage: {Math.round(cloudinaryStatus.usage.storage / 1024 / 1024)}MB</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sponsor Image Upload */}
          <ImageUpload
            type="sponsor"
            onUpload={handleSponsorUpload}
            onDelete={handleSponsorDelete}
            currentImage={currentSponsorImage}
          />

          {/* Color Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Scheme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#1565C0"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                      placeholder="#FF6F00"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Match Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Match Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defaultFormat">Default Match Format</Label>
                <select
                  id="defaultFormat"
                  value={settings.defaultMatchFormat}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultMatchFormat: parseInt(e.target.value) }))}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value={3}>Best of 3</option>
                  <option value={5}>Best of 5</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="autoSave"
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="autoSave">Auto-save match progress</Label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={saveSettings} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
