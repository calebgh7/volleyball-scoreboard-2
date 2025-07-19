import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { incrementScore, decrementScore, resetCurrentSet, completeSet } from "@/lib/scoreboard-state";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import LogoUpload from "./logo-upload";
import { Gamepad2, Users, Settings, Radio, Plus, Minus, Check, RotateCcw, Save, ExternalLink, Download, Upload } from "lucide-react";

interface ControlPanelProps {
  data: any;
}

export default function ControlPanel({ data }: ControlPanelProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No active match</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { match, homeTeam, awayTeam, gameState } = data;

  const handleScoreChange = async (team: 'home' | 'away', increment: boolean) => {
    try {
      setIsUpdating(true);
      const currentScore = team === 'home' ? gameState.homeScore : gameState.awayScore;
      
      if (increment) {
        await incrementScore(team, match.id, currentScore);
      } else {
        await decrementScore(team, match.id, currentScore);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetSet = async () => {
    try {
      await resetCurrentSet(match.id);
      toast({
        title: "Success",
        description: "Set scores reset"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset scores",
        variant: "destructive"
      });
    }
  };

  const handleCompleteSet = async () => {
    try {
      await completeSet(
        match.id, 
        gameState.homeScore, 
        gameState.awayScore, 
        match.currentSet, 
        match.setHistory
      );
      toast({
        title: "Success",
        description: "Set completed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete set",
        variant: "destructive"
      });
    }
  };

  const handleTeamUpdate = async (teamId: number, field: string, value: string) => {
    try {
      await apiRequest('PATCH', `/api/teams/${teamId}`, { [field]: value });
      queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
      toast({
        title: "Success",
        description: "Team updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive"
      });
    }
  };

  const handleDisplayOptionChange = async (option: string, value: boolean) => {
    try {
      const newOptions = { ...gameState.displayOptions, [option]: value };
      await apiRequest('PATCH', `/api/game-state/${match.id}`, { 
        displayOptions: newOptions 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update display options",
        variant: "destructive"
      });
    }
  };

  const openOverlayWindow = () => {
    const overlayUrl = `${window.location.origin}/?overlay=true`;
    window.open(overlayUrl, 'Scoreboard Overlay', 'width=1920,height=1080,toolbar=no,menubar=no,scrollbars=no,status=no');
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Score Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gamepad2 className="mr-2 h-5 w-5 text-primary" />
            Score Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Home Team Controls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">{homeTeam?.name || 'HOME'}</span>
              <span className="text-2xl font-condensed font-bold text-primary">
                {gameState?.homeScore || 0}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleScoreChange('home', true)}
                disabled={isUpdating}
                className="bg-accent hover:bg-accent/90 text-white py-3"
              >
                <Plus className="mr-2 h-4 w-4" />
                +1
              </Button>
              <Button 
                onClick={() => handleScoreChange('home', false)}
                disabled={isUpdating}
                variant="destructive"
                className="py-3"
              >
                <Minus className="mr-2 h-4 w-4" />
                -1
              </Button>
            </div>
          </div>
          
          {/* Away Team Controls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">{awayTeam?.name || 'AWAY'}</span>
              <span className="text-2xl font-condensed font-bold text-primary">
                {gameState?.awayScore || 0}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleScoreChange('away', true)}
                disabled={isUpdating}
                className="bg-accent hover:bg-accent/90 text-white py-3"
              >
                <Plus className="mr-2 h-4 w-4" />
                +1
              </Button>
              <Button 
                onClick={() => handleScoreChange('away', false)}
                disabled={isUpdating}
                variant="destructive"
                className="py-3"
              >
                <Minus className="mr-2 h-4 w-4" />
                -1
              </Button>
            </div>
          </div>
          
          {/* Set Management */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleCompleteSet}
                className="bg-secondary hover:bg-secondary/90 text-white"
              >
                <Check className="mr-2 h-4 w-4" />
                End Set
              </Button>
              <Button 
                onClick={handleResetSet}
                variant="outline"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Team Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Team Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Home Team Setup */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Home Team</Label>
            <Input 
              value={homeTeam?.name || ''}
              onChange={(e) => handleTeamUpdate(homeTeam?.id, 'name', e.target.value)}
              placeholder="Team Name"
              className="mb-2"
            />
            <Input 
              value={homeTeam?.location || ''}
              onChange={(e) => handleTeamUpdate(homeTeam?.id, 'location', e.target.value)}
              placeholder="School/Location"
            />
          </div>
          
          {/* Away Team Setup */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Away Team</Label>
            <Input 
              value={awayTeam?.name || ''}
              onChange={(e) => handleTeamUpdate(awayTeam?.id, 'name', e.target.value)}
              placeholder="Team Name"
              className="mb-2"
            />
            <Input 
              value={awayTeam?.location || ''}
              onChange={(e) => handleTeamUpdate(awayTeam?.id, 'location', e.target.value)}
              placeholder="School/Location"
            />
          </div>
          
          {/* Logo Upload Zones */}
          <div className="grid grid-cols-2 gap-4">
            <LogoUpload 
              teamId={homeTeam?.id} 
              currentLogo={homeTeam?.logoPath}
              label="Home Logo"
            />
            <LogoUpload 
              teamId={awayTeam?.id} 
              currentLogo={awayTeam?.logoPath}
              label="Away Logo"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Match Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-primary" />
            Match Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Match Format */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Match Format</Label>
            <Select value={match.format.toString()}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Best of 3 Sets</SelectItem>
                <SelectItem value="5">Best of 5 Sets</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Display Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showSetHistory"
                checked={gameState?.displayOptions?.showSetHistory}
                onCheckedChange={(checked) => handleDisplayOptionChange('showSetHistory', !!checked)}
              />
              <Label htmlFor="showSetHistory" className="text-sm text-gray-700">
                Show Set History
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showSponsors"
                checked={gameState?.displayOptions?.showSponsors}
                onCheckedChange={(checked) => handleDisplayOptionChange('showSponsors', !!checked)}
              />
              <Label htmlFor="showSponsors" className="text-sm text-gray-700">
                Show Sponsor Logo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showTimer"
                checked={gameState?.displayOptions?.showTimer}
                onCheckedChange={(checked) => handleDisplayOptionChange('showTimer', !!checked)}
              />
              <Label htmlFor="showTimer" className="text-sm text-gray-700">
                Show Match Timer
              </Label>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Match
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Export & Streaming */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Radio className="mr-2 h-5 w-5 text-primary" />
            Streaming Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={openOverlayWindow}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Overlay Window
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p><strong>Streaming Tip:</strong> Use the overlay window as a browser source in OBS or similar streaming software. Recommended size: 1920x1080.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
