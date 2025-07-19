import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ScoreboardDisplayProps {
  data: any;
  isOverlay?: boolean;
}

export default function ScoreboardDisplay({ data, isOverlay = false }: ScoreboardDisplayProps) {
  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No active match</p>
        </CardContent>
      </Card>
    );
  }

  const { match, homeTeam, awayTeam, gameState } = data;

  return (
    <Card className={`w-full ${isOverlay ? 'bg-transparent border-none shadow-none' : ''}`}>
      {!isOverlay && (
        <div className="broadcast-header text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Live Scoreboard</h2>
            <div className="flex items-center space-x-2 text-sm">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>LIVE</span>
              </span>
              <span className="text-gray-300">|</span>
              <span>Best of {match.format}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Scoreboard */}
      <div className="broadcast-bg text-white p-8 min-h-[400px]">
        
        {/* Team Logos and Names */}
        <div className="grid grid-cols-3 gap-4 items-center mb-8">
          {/* Home Team */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600">
              {homeTeam?.logoPath ? (
                <img 
                  src={homeTeam.logoPath} 
                  alt={homeTeam.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <i className="fas fa-volleyball-ball text-2xl text-gray-400"></i>
              )}
            </div>
            <h3 className="text-xl font-condensed font-bold">{homeTeam?.name || 'HOME'}</h3>
            <p className="text-sm text-gray-300">{homeTeam?.location || ''}</p>
          </div>
          
          {/* VS Indicator */}
          <div className="text-center">
            <div className="text-4xl font-condensed font-black text-secondary">VS</div>
          </div>
          
          {/* Away Team */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600">
              {awayTeam?.logoPath ? (
                <img 
                  src={awayTeam.logoPath} 
                  alt={awayTeam.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <i className="fas fa-volleyball-ball text-2xl text-gray-400"></i>
              )}
            </div>
            <h3 className="text-xl font-condensed font-bold">{awayTeam?.name || 'AWAY'}</h3>
            <p className="text-sm text-gray-300">{awayTeam?.location || ''}</p>
          </div>
        </div>
        
        {/* Current Set Score */}
        <div className="grid grid-cols-3 gap-4 items-center mb-6">
          <div className="text-center">
            <div className="text-6xl font-condensed font-black text-white score-animate">
              {gameState?.homeScore || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-300">
              SET {match.currentSet}
            </div>
          </div>
          <div className="text-center">
            <div className="text-6xl font-condensed font-black text-white score-animate">
              {gameState?.awayScore || 0}
            </div>
          </div>
        </div>
        
        {/* Match Score (Sets Won) */}
        <div className="grid grid-cols-3 gap-4 items-center mb-6">
          <div className="text-center">
            <div className="text-2xl font-condensed font-bold text-secondary">
              {match.homeSetsWon}
            </div>
            <div className="text-sm text-gray-400">SETS WON</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-1 bg-gray-600 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-condensed font-bold text-secondary">
              {match.awaySetsWon}
            </div>
            <div className="text-sm text-gray-400">SETS WON</div>
          </div>
        </div>
        
        {/* Previous Sets Score History */}
        {gameState?.displayOptions?.showSetHistory && match.setHistory && (
          <div className="border-t border-gray-600 pt-4">
            <h4 className="text-center text-sm font-semibold text-gray-300 mb-3">SET HISTORY</h4>
            {match.setHistory.map((set: any, index: number) => (
              <div key={index} className="grid grid-cols-4 gap-2 text-center text-sm mb-2">
                <div className="text-gray-400">Set {set.setNumber}</div>
                <div className="font-bold">{set.homeScore}</div>
                <div className="font-bold">{set.awayScore}</div>
                <div className={set.winner ? "text-green-400" : "text-yellow-400"}>
                  <i className={`fas ${set.winner ? 'fa-check' : 'fa-play'}`}></i>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Sponsor Logo Area */}
        {gameState?.displayOptions?.showSponsors && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-4 text-xs text-gray-400">
              <span>Powered by</span>
              <div className="w-16 h-8 bg-gray-700 rounded flex items-center justify-center">
                <span className="text-xs">LOGO</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
