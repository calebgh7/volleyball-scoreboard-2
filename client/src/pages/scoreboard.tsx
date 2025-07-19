import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ScoreboardDisplay from "@/components/scoreboard-display";
import ControlPanel from "@/components/control-panel";
import SettingsModal from "@/components/settings-modal";
import { Button } from "@/components/ui/button";
import { Settings, Tv } from "lucide-react";

export default function Scoreboard() {
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: currentMatch, isLoading } = useQuery({
    queryKey: ['/api/current-match'],
    refetchInterval: 1000, // Real-time updates
  });

  const openOverlayWindow = () => {
    const overlayUrl = `${window.location.origin}/?overlay=true`;
    window.open(overlayUrl, 'Scoreboard Overlay', 'width=1920,height=1080,toolbar=no,menubar=no,scrollbars=no,status=no');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scoreboard...</p>
        </div>
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
              <Button 
                onClick={openOverlayWindow}
                className="bg-secondary hover:bg-secondary/90 text-white"
              >
                <Tv className="mr-2 h-4 w-4" />
                Overlay Mode
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsSettingsOpen(true)}
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Scoreboard Display */}
          <div className="lg:col-span-3">
            <ScoreboardDisplay data={currentMatch} />
          </div>
          
          {/* Control Panel */}
          <div className="lg:col-span-2">
            <ControlPanel data={currentMatch} />
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
