import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Building, Palette } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    enabled: isOpen,
  });

  const [formData, setFormData] = useState({
    primaryColor: "#1565C0",
    accentColor: "#FF6F00",
    theme: "standard",
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        primaryColor: settings.primaryColor || "#1565C0",
        accentColor: settings.accentColor || "#FF6F00",
        theme: settings.theme || "standard",
      });
    }
  }, [settings]);

  const applySettingsToCSS = (settings: any) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', settings.primaryColor);
    root.style.setProperty('--accent', settings.accentColor);
    
    // Convert hex colors to HSL for CSS variables
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      
      return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
    };
    
    root.style.setProperty('--primary-hsl', hexToHsl(settings.primaryColor));
    root.style.setProperty('--accent-hsl', hexToHsl(settings.accentColor));
  };

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      await apiRequest('PATCH', '/api/settings', formData);
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      
      // Apply settings immediately to CSS
      applySettingsToCSS(formData);
      
      // Force refresh the global settings
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      
      toast({
        title: "Success",
        description: "Settings updated successfully"
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSponsorLogoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/settings/sponsor-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Success",
        description: "Sponsor logo uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload sponsor logo",
        variant: "destructive"
      });
    }
  };

  const themes = [
    { id: "standard", name: "Standard", active: formData.theme === "standard" },
    { id: "minimal", name: "Minimal", active: formData.theme === "minimal" },
    { id: "detailed", name: "Detailed", active: formData.theme === "detailed" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Theme Customization */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Theme & Colors
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Primary Color
                </Label>
                <Input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="h-10"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Accent Color
                </Label>
                <Input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="h-10"
                />
              </div>
            </div>
          </div>
          
          {/* Sponsor Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Sponsor Configuration
            </h3>
            <Card 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleSponsorLogoUpload(file);
                };
                input.click();
              }}
            >
              <Building className="text-3xl text-gray-400 mb-3 mx-auto h-12 w-12" />
              <p className="text-gray-600 font-medium">Upload Sponsor Logo</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 2MB</p>
              {settings?.sponsorLogoPath && (
                <div className="mt-3">
                  <img 
                    src={settings.sponsorLogoPath} 
                    alt="Sponsor Logo"
                    className="h-12 mx-auto object-contain"
                  />
                </div>
              )}
            </Card>
          </div>
          
          {/* Layout Presets */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Presets</h3>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((theme) => (
                <Button
                  key={theme.id}
                  variant={theme.active ? "default" : "outline"}
                  onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                  className="p-3 h-auto"
                >
                  <div className="text-xs font-medium">{theme.name}</div>
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-primary text-white"
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
