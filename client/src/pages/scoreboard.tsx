import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import ScoreboardDisplay from "@/components/scoreboard-display";
import ControlPanel from "@/components/control-panel";
import { SettingsModal } from "@/components/settings-modal";
import { TemplateManager } from "@/components/template-manager";
import { TeamManager } from "@/components/team-manager";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, Tv, FolderOpen, Users } from "lucide-react";

interface ScoreboardProps {
  user: any;
  token: string;
  onLogout: () => void;
}

export default function Scoreboard({ user, token, onLogout }: ScoreboardProps) {
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false);
  
  // Simple test state to see if React is working
  const [testInput, setTestInput] = useState("Test Input");
  const [testCount, setTestCount] = useState(0);

  const { data: currentMatch, isLoading } = useQuery<{
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
    settings?: any;
  }>({
    queryKey: ['/api/current-match'],
    refetchInterval: false, // Disable automatic refetching to prevent page refreshes
    staleTime: 30000, // Data is fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Debug logging to see when data changes
  console.log('Scoreboard render - currentMatch:', currentMatch);
  console.log('Scoreboard render - isLoading:', isLoading);

  const openOverlayWindow = () => {
    const overlayUrl = `${window.location.origin}/?overlay=true`;
    window.open(overlayUrl, 'Scoreboard Overlay', 'width=1920,height=1080,toolbar=no,menubar=no,scrollbars=no,status=no');
  };

  const handleLoadTemplate = (template: any) => {
    // TODO: Implement template loading logic
    console.log('Loading template:', template);
    setIsTemplateManagerOpen(false);
  };

  // Team update function
  const handleTeamUpdate = async (team: 'home' | 'away', field: string, value: string) => {
    try {
      console.log('🔧 handleTeamUpdate called with:', { team, field, value });
      console.log('🔧 currentMatch:', currentMatch);
      
      const teamId = team === 'home' ? currentMatch?.homeTeam?.id : currentMatch?.awayTeam?.id;
      console.log('🔧 teamId:', teamId);
      
      if (!teamId) {
        console.error('❌ No team ID found for:', team);
        return;
      }

      console.log(`🔧 Updating ${team} team ${field} to:`, value, 'Team ID:', teamId);

      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      console.log('🔧 API response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('🔧 API response data:', responseData);
        
        // Refresh the data to show updated team information
        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
        console.log(`✅ Team ${team} ${field} updated to:`, value);
      } else {
        const errorData = await response.json();
        console.error('❌ Team update failed:', errorData);
      }
    } catch (error) {
      console.error('❌ Failed to update team:', error);
    }
  };

  // Score update function
  const handleScoreUpdate = async (team: 'home' | 'away', increment: boolean) => {
    try {
      const currentScore = team === 'home' ? currentMatch?.gameState?.homeScore : currentMatch?.gameState?.awayScore;
      const newScore = increment ? (currentScore || 0) + 1 : Math.max(0, (currentScore || 0) - 1);

      const response = await fetch('/api/scores', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: currentMatch?.match?.id,
          homeScore: team === 'home' ? newScore : currentMatch?.gameState?.homeScore,
          awayScore: team === 'away' ? newScore : currentMatch?.gameState?.awayScore,
        }),
      });

      if (response.ok) {
        // Refresh the data to show updated scores
        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
        console.log(`Score updated for ${team} team:`, newScore);
      }
    } catch (error) {
      console.error('Failed to update score:', error);
    }
  };

  // Sets won update function
  const handleSetsWonUpdate = async (team: 'home' | 'away', value: number) => {
    try {
      const response = await fetch(`/api/matches/${currentMatch?.match?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [team === 'home' ? 'homeSetsWon' : 'awaySetsWon']: value,
        }),
      });

      if (response.ok) {
        // Refresh the data to show updated sets won
        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
        console.log(`Sets won updated for ${team} team:`, value);
      }
    } catch (error) {
      console.error('Failed to update sets won:', error);
    }
  };

  // Logo update function
  const handleLogoUpdate = async (teamId: string, logoUrl: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logoPath: logoUrl }),
      });

      if (response.ok) {
        // Refresh the data to show updated logo
        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
        console.log(`Logo updated for team ${teamId}:`, logoUrl);
      }
    } catch (error) {
      console.error('Failed to update logo:', error);
    }
  };

  // Match format update function
  const handleMatchFormatUpdate = async (format: number) => {
    try {
      const response = await fetch(`/api/matches/${currentMatch?.match?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      });

      if (response.ok) {
        // Refresh the data to show updated format
        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
        console.log(`Match format updated to:`, format);
      }
    } catch (error) {
      console.error('Failed to update match format:', error);
    }
  };

  // Complete set function
  const handleCompleteSet = async () => {
    try {
      const response = await fetch('/api/sets/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: currentMatch?.match?.id,
          homeScore: currentMatch?.gameState?.homeScore,
          awayScore: currentMatch?.gameState?.awayScore,
          setNumber: currentMatch?.match?.currentSet,
          setHistory: currentMatch?.match?.setHistory || [],
        }),
      });

      if (response.ok) {
        // Refresh the data to show updated set information
        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
        console.log('Set completed successfully');
      }
    } catch (error) {
      console.error('Failed to complete set:', error);
    }
  };

  // Reset set function
  const handleResetSet = async () => {
    try {
      const response = await fetch('/api/scores/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: currentMatch?.match?.id,
        }),
      });

      if (response.ok) {
        // Refresh the data to show reset scores
        queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
        console.log('Set scores reset successfully');
      }
    } catch (error) {
      console.error('Failed to reset set:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-volleyball-ball text-white text-lg"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">VolleyScore Pro</h1>
                  <p className="text-sm text-gray-500">Live Streaming Scoreboard</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            
            {/* Simple Test Section - Show even while loading */}
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">🧪 React Functionality Test (Loading State)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-2">Test Input:</label>
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => {
                      console.log("🔧 Test input changed to:", e.target.value);
                      setTestInput(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-yellow-400 rounded-md text-yellow-900"
                    placeholder="Type here to test React"
                  />
                  <p className="text-sm text-yellow-600 mt-1">Current value: <strong>{testInput}</strong></p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-700 mb-2">Test Button:</label>
                  <button
                    onClick={() => {
                      console.log("🔧 Test button clicked! Count:", testCount + 1);
                      setTestCount(testCount + 1);
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    Click Me ({testCount})
                  </button>
                  <p className="text-sm text-yellow-600 mt-1">Clicks: <strong>{testCount}</strong></p>
                </div>
              </div>
              <div className="mt-3 text-xs text-yellow-600">
                <p>If you can type in the input and click the button, React is working!</p>
                <p>Check the browser console for debug logs.</p>
                <p><strong>Status: Loading data...</strong></p>
              </div>
            </div>
            
            {/* Loading Spinner */}
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading scoreboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const urlParams = new URLSearchParams(window.location.search);
  const isOverlay = urlParams.get('overlay') === 'true';

  if (isOverlay) {
    return (
      <div className="min-h-screen bg-transparent">
        <ScoreboardDisplay 
          data={currentMatch} 
          isOverlay={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-volleyball-ball text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">VolleyScore Pro</h1>
                <p className="text-sm text-gray-500">Live Streaming Scoreboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span>Welcome, {user?.name || user?.email}</span>
                <LogoutButton onLogout={onLogout} />
              </div>
              <Button 
                onClick={() => setIsTemplateManagerOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Templates
              </Button>
              <Button 
                onClick={() => setIsTeamManagerOpen(true)}
                className="bg-indigo-600 hover:bg-blue-700 text-white"
              >
                <Users className="mr-2 h-4 w-4" />
                Teams
              </Button>
              <Button 
                onClick={openOverlayWindow}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Tv className="mr-2 h-4 w-4" />
                Overlay Mode
              </Button>
              <Button 
                onClick={() => setIsSettingsOpen(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          
          {/* Simple Test Section */}
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">🧪 React Functionality Test</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-2">Test Input:</label>
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => {
                    console.log("🔧 Test input changed to:", e.target.value);
                    setTestInput(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-yellow-400 rounded-md text-yellow-900"
                  placeholder="Type here to test React"
                />
                <p className="text-sm text-yellow-600 mt-1">Current value: <strong>{testInput}</strong></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-2">Test Button:</label>
                <button
                  onClick={() => {
                    console.log("🔧 Test button clicked! Count:", testCount + 1);
                    setTestCount(testCount + 1);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Click Me ({testCount})
                </button>
                <p className="text-sm text-yellow-600 mt-1">Clicks: <strong>{testCount}</strong></p>
              </div>
            </div>
            <div className="mt-3 text-xs text-yellow-600">
              <p>If you can type in the input and click the button, React is working!</p>
              <p>Check the browser console for debug logs.</p>
            </div>
          </div>
          
          {/* Additional Simple Test */}
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">🔧 Direct React Test</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Simple Input:</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-blue-400 rounded-md text-blue-900"
                  placeholder="Type anything here"
                  onChange={(e) => console.log("🔧 Direct input change:", e.target.value)}
                />
              </div>
              <div>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => console.log("🔧 Direct button clicked!")}
                >
                  Test Button
                </button>
              </div>
              <div className="text-xs text-blue-600">
                <p>These inputs and buttons should work even if the main app has issues.</p>
                <p>Check console for logs when you interact with them.</p>
              </div>
            </div>
          </div>
          
          {/* Scoreboard Display */}
          <div>
            <ScoreboardDisplay data={currentMatch} />
          </div>
          
          {/* Control Panel */}
          <div>
            <ControlPanel 
              data={currentMatch || null}
              onScoreUpdate={handleScoreUpdate}
              onTeamUpdate={handleTeamUpdate}
              onSetsWonUpdate={handleSetsWonUpdate}
              onLogoUpdate={handleLogoUpdate}
              onMatchFormatUpdate={handleMatchFormatUpdate}
              onCompleteSet={handleCompleteSet}
              onResetSet={handleResetSet}
            />
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        user={user}
        token={token}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Template Manager Modal */}
      <Dialog open={isTemplateManagerOpen} onOpenChange={setIsTemplateManagerOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scoreboard Templates</DialogTitle>
            <DialogDescription>
              Save and load your scoreboard configurations
            </DialogDescription>
          </DialogHeader>
          <TemplateManager
            token={token}
            currentMatch={currentMatch}
            currentSettings={currentMatch?.settings}
            onLoadTemplate={handleLoadTemplate}
          />
        </DialogContent>
      </Dialog>

      {/* Team Manager Modal */}
      <TeamManager
        user={user}
        token={token}
        isOpen={isTeamManagerOpen}
        onClose={() => setIsTeamManagerOpen(false)}
      />
    </div>
  );
}
