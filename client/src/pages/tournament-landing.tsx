import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Tv, Users, ExternalLink, QrCode, Smartphone } from "lucide-react";

export default function TournamentLanding() {
  const [showQR, setShowQR] = useState(false);

  const baseUrl = window.location.origin;
  const controlPanelUrl = `${baseUrl}/control`;
  const overlayUrl = `${baseUrl}/control?overlay=true`;

  const openOverlayWindow = () => {
    window.open(overlayUrl, 'Scoreboard Overlay', 'width=1920,height=1080,toolbar=no,menubar=no,scrollbars=no,status=no');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-volleyball-ball text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">VolleyScore Pro</h1>
                <p className="text-sm text-gray-300">Tournament Scoreboard System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => window.open('/control', '_blank')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Live Tournament Scoreboard
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Professional volleyball scoreboard overlay for live streaming and tournament displays. 
            Seamlessly integrate with OBS, Streamlabs, and other broadcasting software.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Control Panel Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Users className="mr-3 h-6 w-6 text-blue-400" />
                Control Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Manage scores, teams, and match settings. Perfect for scorekeepers and tournament officials.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => window.open(controlPanelUrl, '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Control Panel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(controlPanelUrl)}
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Overlay Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Tv className="mr-3 h-6 w-6 text-orange-400" />
                Stream Overlay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Clean, transparent overlay for live streams. Add as a browser source in OBS or similar software.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={openOverlayWindow}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Tv className="mr-2 h-4 w-4" />
                  Open Overlay
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(overlayUrl)}
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            Setup Instructions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Access Control Panel</h4>
              <p className="text-gray-300 text-sm">
                Open the control panel to set up teams, scores, and match settings.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Configure Match</h4>
              <p className="text-gray-300 text-sm">
                Set team names, upload logos, and configure match format (Best of 3 or 5).
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Add to Stream</h4>
              <p className="text-gray-300 text-sm">
                Use the overlay URL as a browser source in OBS, Streamlabs, or similar software.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Access */}
        <div className="mt-16 text-center">
          <Button 
            onClick={() => setShowQR(!showQR)}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <QrCode className="mr-2 h-4 w-4" />
            {showQR ? 'Hide' : 'Show'} Mobile QR Code
          </Button>
          
          {showQR && (
            <div className="mt-6 p-6 bg-white rounded-lg inline-block">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-gray-500 text-sm">QR Code</span>
                </div>
                <p className="text-sm text-gray-600">Scan to access on mobile</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-400">
          <p className="text-sm">
            VolleyScore Pro - Professional Tournament Scoreboard System
          </p>
          <p className="text-xs mt-2">
            Perfect for volleyball tournaments, live streams, and broadcasting
          </p>
        </footer>
      </main>
    </div>
  );
}
