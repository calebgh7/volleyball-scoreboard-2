import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { incrementScore, decrementScore, resetCurrentSet, completeSet, resetMatch, emergencyResetMatch } from "@/lib/scoreboard-state";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import LogoUpload from "./logo-upload";
import { Gamepad2, Users, Settings, Radio, Check, RotateCcw, Save, ExternalLink, Upload, Plus } from "lucide-react";

interface ControlPanelProps {
  data: {
    match: {
      id: string;
      currentSet: number;
      format: number;
      homeSetsWon: number;
      awaySetsWon: number;
      setHistory: Array<{setNumber: number, homeScore: number, awayScore: number, winner: 'home' | 'away' | null}>;
    };
    homeTeam: {
      id: string;
      name: string;
      logoPath?: string;
      colorScheme: string;
      customColor?: string;
      customTextColor?: string;
      customSetBackgroundColor?: string;
    };
    awayTeam: {
      id: string;
      name: string;
      logoPath?: string;
      colorScheme: string;
      customColor?: string;
      customTextColor?: string;
      customSetBackgroundColor?: string;
    };
    gameState: {
      homeScore: number;
      awayScore: number;
      displayOptions: {
        showSetHistory: boolean;
        showSponsors: boolean;
        showTimer: boolean;
      };
    };
  } | null;
}

export default function ControlPanel({ data }: ControlPanelProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

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
      
      // Refresh the data to show updated scores
      queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
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
      
      // Refresh the data to show reset scores
      queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
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
      console.log('🎯 Starting set completion...');
      console.log('🎯 Current data:', { match, gameState });
      
      await completeSet(
        match.id, 
        gameState.homeScore, 
        gameState.awayScore, 
        match.currentSet, 
        match.setHistory
      );
      
      console.log('🎯 Set completion successful!');
      
      toast({
        title: "Success",
        description: "Set completed"
      });
      
      // Refresh the data to show updated set information
      queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
    } catch (error) {
      console.error('❌ Error in handleCompleteSet:', error);
      toast({
        title: "Error",
        description: "Failed to complete set",
        variant: "destructive"
      });
    }
  };

  const handleTeamUpdate = async (teamId: number, field: string, value: string) => {
    try {
      // For custom color, validate only if it's a complete hex code
      if (field === 'customColor' && value && value.length === 7) {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(value)) {
          toast({
            title: "Invalid Color",
            description: "Please enter a valid hex color code (e.g., #FF0000)",
            variant: "destructive"
          });
          return;
        }
      }

      const response = await apiRequest('PATCH', `/api/teams/${teamId}`, { [field]: value });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
        toast({
          title: "Success",
          description: "Team updated successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive"
      });
    }
  };

  const handleMatchFormatChange = async (value: string) => {
    try {
      const response = await apiRequest('PATCH', `/api/matches/${match.id}`, { format: parseInt(value) });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
        toast({
          title: "Success",
          description: "Match format updated"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update match format",
        variant: "destructive"
      });
    }
  };

  const handleDisplayOptionChange = async (option: string, value: any) => {
    try {
      const currentOptions = gameState?.displayOptions || {};
      const updatedOptions = { ...currentOptions, [option]: value };
      
      const response = await apiRequest('PATCH', `/api/game-state/${gameState.id}`, { displayOptions: updatedOptions });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
        toast({
          title: "Success",
          description: "Display option updated"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update display option",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gamepad2 className="mr-2 h-5 w-5 text-primary" />
            Score Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Simple Team Controls */}
          <div className="grid grid-cols-2 gap-4">
            {/* Home Team */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-center mb-3">
                <div className="text-lg font-bold text-gray-800">{homeTeam?.name || 'HOME'}</div>
                <div className="text-xs text-gray-500">Set {match?.currentSet || 1} of {match?.format || 5}</div>
              </div>
              
              {/* Current Score */}
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-800 mb-2">{gameState?.homeScore || 0}</div>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleScoreChange('home', false)}
                    disabled={isUpdating || (gameState?.homeScore || 0) <= 0}
                    className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-xs text-gray-500">points</span>
                  <button
                    onClick={() => handleScoreChange('home', true)}
                    disabled={isUpdating}
                    className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Sets Won */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{match?.homeSetsWon || 0}</div>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={async () => {
                      try {
                        const newSetsWon = Math.max(0, (match?.homeSetsWon || 0) - 1);
                        await fetch(`/api/matches/${match.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ homeSetsWon: newSetsWon })
                        });
                        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to update sets won",
                          variant: "destructive"
                        });
                      }
                    }}
                    className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center"
                    disabled={isUpdating}
                  >
                    -
                  </button>
                  <span className="text-xs text-gray-500">sets</span>
                  <button
                    onClick={async () => {
                      try {
                        const newSetsWon = Math.min(5, (match?.homeSetsWon || 0) + 1);
                        await fetch(`/api/matches/${match.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ homeSetsWon: newSetsWon })
                        });
                        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to update sets won",
                          variant: "destructive"
                        });
                      }
                    }}
                    className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold flex items-center justify-center"
                    disabled={isUpdating}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {/* Away Team */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-center mb-3">
                <div className="text-lg font-bold text-gray-800">{awayTeam?.name || 'AWAY'}</div>
                <div className="text-xs text-gray-500">Set {match?.currentSet || 1} of {match?.format || 5}</div>
              </div>
              
              {/* Current Score */}
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-800 mb-2">{gameState?.awayScore || 0}</div>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleScoreChange('away', false)}
                    disabled={isUpdating || (gameState?.awayScore || 0) <= 0}
                    className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-xs text-gray-500">points</span>
                  <button
                    onClick={() => handleScoreChange('away', true)}
                    disabled={isUpdating}
                    className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Sets Won */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{match?.awaySetsWon || 0}</div>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={async () => {
                      try {
                        const newSetsWon = Math.max(0, (match?.awaySetsWon || 0) - 1);
                        await fetch(`/api/matches/${match.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ awaySetsWon: newSetsWon })
                        });
                        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to update sets won",
                          variant: "destructive"
                        });
                      }
                    }}
                    className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center"
                    disabled={isUpdating}
                  >
                    -
                  </button>
                  <span className="text-xs text-gray-500">sets</span>
                  <button
                    onClick={async () => {
                      try {
                        const newSetsWon = Math.min(5, (match?.awaySetsWon || 0) + 1);
                        await fetch(`/api/matches/${match.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ awaySetsWon: newSetsWon })
                        });
                        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to update sets won",
                          variant: "destructive"
                        });
                      }
                    }}
                    className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold flex items-center justify-center"
                    disabled={isUpdating}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Match Actions */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleResetSet}
                disabled={isUpdating}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Set
              </Button>
              <Button 
                onClick={handleCompleteSet}
                disabled={isUpdating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                title="Complete the current set and advance to the next set"
              >
                <Check className="mr-2 h-4 w-4" />
                Complete Set
              </Button>
              
              <Button 
                onClick={async () => {
                  try {
                    await emergencyResetMatch(match.id);
                    toast({
                      title: "Success",
                      description: "Match data reset to valid state"
                    });
                    
                    // Refresh the data to show reset match
                    queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to reset match data",
                      variant: "destructive"
                    });
                  }
                }}
                variant="destructive"
                className="w-full col-span-2"
                disabled={isUpdating}
                title="Reset corrupted match data to valid state"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Match
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Team Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Team Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Home Team Section */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Home Team */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Home Team</Label>
                <Input 
                  value={homeTeam?.name || ''}
                  onChange={(e) => handleTeamUpdate(homeTeam?.id, 'name', e.target.value)}
                  placeholder="Team Name"
                  className="mb-2"
                />
              </div>
              
              {/* Home Team Colors */}
              <div className="border-t pt-4">
                <Label className="text-xs text-gray-600 mb-2 block">Team Colors</Label>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Preset</Label>
                    <Select 
                      value={homeTeam?.colorScheme || 'pink'} 
                      onValueChange={(value) => handleTeamUpdate(homeTeam?.id, 'colorScheme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pink">Pink</SelectItem>
                        <SelectItem value="cyan">Cyan</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="yellow">Yellow</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Custom Hex</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                        style={{ 
                          backgroundColor: homeTeam?.colorScheme === 'custom' && homeTeam?.customColor 
                            ? homeTeam.customColor 
                            : (homeTeam?.colorScheme === 'pink' ? '#ec4899' : 
                               homeTeam?.colorScheme === 'cyan' ? '#22d3ee' :
                               homeTeam?.colorScheme === 'orange' ? '#fb923c' :
                               homeTeam?.colorScheme === 'purple' ? '#a855f7' :
                               homeTeam?.colorScheme === 'green' ? '#22c55e' :
                               homeTeam?.colorScheme === 'red' ? '#ef4444' :
                               homeTeam?.colorScheme === 'blue' ? '#3b82f6' :
                               homeTeam?.colorScheme === 'yellow' ? '#eab308' : '#ec4899')
                        }}
                      ></div>
                      <Input
                        type="text"
                        placeholder="#FF0000"
                        value={homeTeam?.customColor || ''}
                        onChange={(e) => handleTeamUpdate(homeTeam?.id, 'customColor', e.target.value)}
                        className="font-mono text-sm flex-1"
                        disabled={homeTeam?.colorScheme !== 'custom'}
                      />
                    </div>
                  </div>
                </div>
                {/* Secondary Color for Custom Scheme */}
                {homeTeam?.colorScheme === 'custom' && (
                  <div className="mb-2">
                    <Label className="text-xs text-gray-500 mb-1 block">Text Color Hex</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                        style={{ 
                          backgroundColor: homeTeam?.customTextColor || '#FFFFFF'
                        }}
                      ></div>
                      <Input
                        type="text"
                        placeholder="#FFFFFF"
                        value={homeTeam?.customTextColor || '#FFFFFF'}
                        onChange={(e) => handleTeamUpdate(homeTeam?.id, 'customTextColor', e.target.value)}
                        className="font-mono text-sm flex-1"
                      />
                    </div>
                  </div>
                )}
                {/* Set Total Background Color for Custom Scheme */}
                {homeTeam?.colorScheme === 'custom' && (
                  <div className="mb-2">
                    <Label className="text-xs text-gray-500 mb-1 block">Set Total Background Hex</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                        style={{ 
                          backgroundColor: homeTeam?.customSetBackgroundColor || '#000000'
                        }}
                      ></div>
                      <Input
                        type="text"
                        placeholder="#000000"
                        value={homeTeam?.customSetBackgroundColor || '#000000'}
                        onChange={(e) => handleTeamUpdate(homeTeam?.id, 'customSetBackgroundColor', e.target.value)}
                        className="font-mono text-sm flex-1"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <LogoUpload 
                teamId={homeTeam?.id} 
                currentLogo={homeTeam?.logoPath}
                label="Home Logo"
              />
            </div>
            
            {/* Right Column - Away Team */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Away Team</Label>
                <Input 
                  value={awayTeam?.name || ''}
                  onChange={(e) => handleTeamUpdate(awayTeam?.id, 'name', e.target.value)}
                  placeholder="Team Name"
                  className="mb-2"
                />
              </div>
              
              {/* Away Team Colors */}
              <div className="border-t pt-4">
                <Label className="text-xs text-gray-600 mb-2 block">Team Colors</Label>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Preset</Label>
                    <Select 
                      value={awayTeam?.colorScheme || 'cyan'} 
                      onValueChange={(value) => handleTeamUpdate(awayTeam?.id, 'colorScheme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pink">Pink</SelectItem>
                        <SelectItem value="cyan">Cyan</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="yellow">Yellow</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">Custom Hex</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                        style={{ 
                          backgroundColor: awayTeam?.colorScheme === 'custom' && awayTeam?.customColor 
                            ? awayTeam.customColor 
                            : (awayTeam?.colorScheme === 'pink' ? '#ec4899' : 
                               awayTeam?.colorScheme === 'cyan' ? '#22d3ee' :
                               awayTeam?.colorScheme === 'orange' ? '#fb923c' :
                               awayTeam?.colorScheme === 'purple' ? '#a855f7' :
                               awayTeam?.colorScheme === 'green' ? '#22c55e' :
                               awayTeam?.colorScheme === 'red' ? '#ef4444' :
                               awayTeam?.colorScheme === 'blue' ? '#3b82f6' :
                               awayTeam?.colorScheme === 'yellow' ? '#eab308' : '#22d3ee')
                        }}
                      ></div>
                      <Input
                        type="text"
                        placeholder="#00FF00"
                        value={awayTeam?.customColor || ''}
                        onChange={(e) => handleTeamUpdate(awayTeam?.id, 'customColor', e.target.value)}
                        className="font-mono text-sm flex-1"
                        disabled={awayTeam?.colorScheme !== 'custom'}
                      />
                    </div>
                  </div>
                </div>
                {/* Secondary Color for Custom Scheme */}
                {awayTeam?.colorScheme === 'custom' && (
                  <div className="mb-2">
                    <Label className="text-xs text-gray-500 mb-1 block">Text Color Hex</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ 
                          backgroundColor: awayTeam?.customTextColor || '#FFFFFF'
                        }}
                      ></div>
                      <Input
                        type="text"
                        placeholder="#FFFFFF"
                        value={awayTeam?.customTextColor || '#FFFFFF'}
                        onChange={(e) => handleTeamUpdate(awayTeam?.id, 'customTextColor', e.target.value)}
                        className="font-mono text-sm flex-1"
                      />
                    </div>
                  </div>
                )}
                {/* Set Total Background Color for Custom Scheme */}
                {awayTeam?.colorScheme === 'custom' && (
                  <div className="mb-2">
                    <Label className="text-xs text-gray-500 mb-1 block">Set Total Background Hex</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                        style={{ 
                          backgroundColor: awayTeam?.customSetBackgroundColor || '#000000'
                        }}
                      ></div>
                      <Input
                        type="text"
                        placeholder="#000000"
                        value={awayTeam?.customSetBackgroundColor || '#000000'}
                        onChange={(e) => handleTeamUpdate(awayTeam?.id, 'customSetBackgroundColor', e.target.value)}
                        className="font-mono text-sm flex-1"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <LogoUpload 
                teamId={awayTeam?.id} 
                currentLogo={awayTeam?.logoPath}
                label="Away Logo"
              />
            </div>
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
            <Select value={match.format.toString()} onValueChange={handleMatchFormatChange}>
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
          
          {/* Sponsor Logo Upload */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Sponsor Logo</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Upload Sponsor Logo</p>
              <p className="text-xs text-gray-500">Click or drag to upload</p>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      // Convert file to base64 for Cloudinary API
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
                      
                      if (response.ok) {
                        const result = await response.json();
                        queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
                        toast({
                          title: "Success",
                          description: "Sponsor logo uploaded to Cloudinary"
                        });
                      } else {
                        const error = await response.json();
                        throw new Error(error.error || 'Upload failed');
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: error instanceof Error ? error.message : "Failed to upload sponsor logo",
                        variant: "destructive"
                      });
                    }
                  }
                }}
                className="hidden"
                id="sponsor-logo-upload"
              />
              <Button
                size="sm"
                className="mt-2 bg-green-500 hover:bg-green-600 text-white"
                onClick={() => document.getElementById('sponsor-logo-upload')?.click()}
              >
                Choose File
              </Button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <Button 
              onClick={async () => {
                try {
                  await resetMatch(match.id);
                  toast({
                    title: "Success",
                    description: "Match reset successfully"
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to reset match",
                    variant: "destructive"
                  });
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Match
            </Button>
            <Button 
              onClick={async () => {
                try {
                  // Create new match logic here
                  toast({
                    title: "Success",
                    description: "New match created"
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to create new match",
                    variant: "destructive"
                  });
                }
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Match
            </Button>
            <Button className="bg-gray-500 hover:bg-gray-600 text-white">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Streaming Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Radio className="mr-2 h-5 w-5 text-primary" />
            Streaming Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => window.open('/?overlay=true', 'Scoreboard Overlay', 'width=1920,height=1080,toolbar=no,menubar=no,scrollbars=no,status=no')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Overlay Window
          </Button>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p><strong>Streaming Tip:</strong> Use the overlay window as a browser source in OBS or similar streaming software. Recommended size: 1920x1080.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
