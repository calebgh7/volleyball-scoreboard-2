import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ImageUpload } from './image-upload';
import { useToast } from '../hooks/use-toast';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

interface Team {
  id: number;
  userId: string;
  name: string;
  location: string;
  logoPath?: string;
  logoPublicId?: string;
  colorScheme: string;
  customColor?: string;
  customTextColor: string;
  customSetBackgroundColor: string;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeamManagerProps {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamManager({ user, token, isOpen, onClose }: TeamManagerProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    colorScheme: 'blue',
    customColor: '',
    customTextColor: '#FFFFFF',
    customSetBackgroundColor: '#000000'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadTeams();
    }
  }, [isOpen]);

  const loadTeams = async () => {
    try {
      const response = await fetch('/api/teams', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const createTeam = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Team name is required",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          isTemplate: false
        })
      });

      if (response.ok) {
        const newTeam = await response.json();
        setTeams(prev => [...prev, newTeam]);
        resetForm();
        toast({
          title: "Success",
          description: "Team created successfully",
        });
      } else {
        throw new Error('Failed to create team');
      }
    } catch (error) {
      console.error('Failed to create team:', error);
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updateTeam = async (teamId: number, updates: Partial<Team>) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedTeam = await response.json();
        setTeams(prev => prev.map(team => 
          team.id === teamId ? updatedTeam : team
        ));
        toast({
          title: "Success",
          description: "Team updated successfully",
        });
      } else {
        throw new Error('Failed to update team');
      }
    } catch (error) {
      console.error('Failed to update team:', error);
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteTeam = async (teamId: number) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setTeams(prev => prev.filter(team => team.id !== teamId));
        toast({
          title: "Success",
          description: "Team deleted successfully",
        });
      } else {
        throw new Error('Failed to delete team');
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogoUpload = async (imageData: string, filename: string, teamId: number) => {
    try {
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageData, filename, teamId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Update team with logo information
      await updateTeam(teamId, {
        logoPublicId: result.logo.publicId
      });

      // Reload teams to get updated data
      await loadTeams();
    } catch (error) {
      throw error;
    }
  };

  const handleLogoDelete = async (publicId: string, teamId: number) => {
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

      // Update team to remove logo reference
      await updateTeam(teamId, {
        logoPublicId: undefined
      });

      // Reload teams to get updated data
      await loadTeams();
    } catch (error) {
      throw error;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      colorScheme: 'blue',
      customColor: '',
      customTextColor: '#FFFFFF',
      customSetBackgroundColor: '#000000'
    });
  };

  const startEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      location: team.location,
      colorScheme: team.colorScheme,
      customColor: team.customColor || '',
      customTextColor: team.customTextColor,
      customSetBackgroundColor: team.customSetBackgroundColor
    });
  };

  const saveEdit = async () => {
    if (!editingTeam) return;

    try {
      await updateTeam(editingTeam.id, formData);
      setEditingTeam(null);
      resetForm();
    } catch (error) {
      // Error handling is done in updateTeam
    }
  };

  const cancelEdit = () => {
    setEditingTeam(null);
    resetForm();
  };

  const colorSchemes = [
    { id: 'blue', name: 'Blue', color: '#3B82F6' },
    { id: 'red', name: 'Red', color: '#EF4444' },
    { id: 'green', name: 'Green', color: '#10B981' },
    { id: 'purple', name: 'Purple', color: '#8B5CF6' },
    { id: 'orange', name: 'Orange', color: '#F59E0B' },
    { id: 'pink', name: 'Pink', color: '#EC4899' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </DialogTitle>
          <DialogDescription>
            Create and manage your volleyball teams
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Eagles"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="teamLocation">Location</Label>
                  <Input
                    id="teamLocation"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Central High"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label>Color Scheme</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, colorScheme: scheme.id }))}
                      className={`p-2 rounded border-2 transition-all ${
                        formData.colorScheme === scheme.id
                          ? 'border-primary scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: scheme.color }}
                      title={scheme.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={createTeam}
                  disabled={isCreating || !formData.name.trim()}
                  className="flex-1"
                >
                  {isCreating ? 'Creating...' : 'Create Team'}
                </Button>
                {editingTeam && (
                  <>
                    <Button onClick={saveEdit} className="flex-1">
                      Save Changes
                    </Button>
                    <Button onClick={cancelEdit} variant="outline">
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Teams List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Teams</h3>
            {teams.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  No teams created yet. Create your first team above.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {teams.map((team) => (
                  <Card key={team.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: colorSchemes.find(c => c.id === team.colorScheme)?.color || '#3B82F6' }}
                          >
                            {team.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{team.name}</h4>
                            <p className="text-sm text-muted-foreground">{team.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(team)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteTeam(team.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Team Logo Upload */}
                      <div className="mt-4">
                        <ImageUpload
                          type="logo"
                          teamId={team.id}
                          onUpload={(imageData, filename) => handleLogoUpload(imageData, filename, team.id)}
                          onDelete={(publicId) => handleLogoDelete(publicId, team.id)}
                          currentImage={team.logoPublicId ? {
                            publicId: team.logoPublicId,
                            url: `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload/${team.logoPublicId}`,
                            thumbnailUrl: `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload/c_fill,w_150,h_150/${team.logoPublicId}`
                          } : undefined}
                          className="border-0 shadow-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
