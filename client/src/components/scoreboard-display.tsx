import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TEAM_COLOR_SCHEMES, THEME_PRESETS, getTeamColors } from "@/lib/color-scheme";
import { useEffect, useState } from "react";

interface ScoreboardDisplayProps {
  data: any;
  isOverlay?: boolean;
}

export default function ScoreboardDisplay({ data, isOverlay = false }: ScoreboardDisplayProps) {
  const [dynamicStyles, setDynamicStyles] = useState<string>('');
  const [settings, setSettings] = useState<any>(null);

  // Fetch settings for sponsor logo
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settingsData = await response.json();
          setSettings(settingsData);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    
    fetchSettings();
  }, []);

  if (!data) {
    return (
      <Card className={`w-full ${isOverlay ? 'bg-transparent border-none shadow-none' : ''}`}>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No active match</p>
        </CardContent>
      </Card>
    );
  }

  const { match, homeTeam, awayTeam, gameState } = data;

  // Apply dynamic colors and themes
  useEffect(() => {
    const homeColorScheme = homeTeam?.colorScheme || 'pink';
    const awayColorScheme = awayTeam?.colorScheme || 'cyan';
    const theme = gameState?.theme || 'default';

    const homeColors = getTeamColors(homeColorScheme, homeTeam?.customColor, homeTeam?.customTextColor);
    const awayColors = getTeamColors(awayColorScheme, awayTeam?.customColor, awayTeam?.customTextColor);
    const themeColors = THEME_PRESETS[theme] || THEME_PRESETS.default;

    const styles = `
      :root {
        --home-primary: ${homeColors.primary};
        --home-secondary: ${homeColors.secondary};
        --home-highlight: ${homeColors.highlight};
        --home-glow: ${homeColors.glow};
        
        --away-primary: ${awayColors.primary};
        --away-secondary: ${awayColors.secondary};
        --away-highlight: ${awayColors.highlight};
        --away-glow: ${awayColors.glow};
        
        --theme-background: ${themeColors.background};
        --theme-surface: ${themeColors.surface};
        --theme-border: ${themeColors.border};
        --theme-text: ${themeColors.text};
        --theme-primary: ${themeColors.primary};
      }
    `;

    setDynamicStyles(styles);
  }, [homeTeam?.colorScheme, awayTeam?.colorScheme, gameState?.theme]);

  // Get team colors dynamically
    const getTeamColorsLocal = (team: 'home' | 'away') => {
    const colorScheme = team === 'home'
      ? (homeTeam?.colorScheme || 'pink')
      : (awayTeam?.colorScheme || 'cyan');
    
    const customColor = team === 'home' 
      ? homeTeam?.customColor 
      : awayTeam?.customColor;
    
    const customTextColor = team === 'home'
      ? homeTeam?.customTextColor
      : awayTeam?.customTextColor;
    
    const customSetBackgroundColor = team === 'home'
      ? homeTeam?.customSetBackgroundColor
      : awayTeam?.customSetBackgroundColor;
    
    return getTeamColors(colorScheme, customColor, customTextColor, customSetBackgroundColor);
  };

  const homeColors = getTeamColorsLocal('home');
  const awayColors = getTeamColorsLocal('away');

  // Function to determine background style based on color scheme
  const getBackgroundStyle = (colors: any, team: any) => {
    if (team?.colorScheme === 'custom') {
      // For custom colors, use solid color without gradient
      return colors.primary;
    } else {
      // For preset colors, use gradient
      return `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`;
    }
  };

  return (
    <>
      {/* Dynamic CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
      
      <Card className={`w-full ${isOverlay ? 'bg-transparent border-none shadow-none' : ''}`}>
        {!isOverlay && (
          <div className="broadcast-header text-white p-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Live Scoreboard</h2>
              <div className="flex items-center space-x-2 text-xs">
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
        
        {/* Pill-like Scorebug Design - Like the LOVB Stream */}
        <div className={`scorebug-overlay text-white p-2 ${isOverlay ? 'bg-transparent' : 'broadcast-bg'}`}>
          
          <div className="flex items-center">
            {/* Sponsor Logo - Left of Pills */}
            {gameState?.displayOptions?.showSponsors && (
              <div className="mr-3 flex-shrink-0">
                {settings?.sponsorLogoPath ? (
                  <img 
                    src={settings.sponsorLogoPath} 
                    alt="Sponsor logo"
                    className="h-20 w-auto object-contain rounded bg-white/10 backdrop-blur-sm"
                    style={{ minHeight: '80px', minWidth: '40px' }}
                    onError={(e) => {
                      console.error('Sponsor logo failed to load:', e);
                      // Fallback to generic logo placeholder if sponsor logo fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                    onLoad={() => console.log('Sponsor logo loaded successfully:', settings.sponsorLogoPath)}
                  />
                ) : (
                  <div className="h-20 w-8 bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-xs text-white">NO LOGO</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Team Score Pills - Stacked Vertically with Scores and Sets */}
            <div className="flex flex-col space-y-2">
              
              {/* Home Team Pill with Score and Sets */}
              <div 
                className="scorebug-pill home-team-pill"
                style={{
                  background: getBackgroundStyle(homeColors, homeTeam),
                  borderColor: homeColors.primary,
                  width: 'fit-content',
                  minWidth: '280px'
                }}
              >
                <div className="flex items-center justify-between px-4 py-1.5">
                  <div className="flex items-center space-x-2">
                    {/* Team Logo or Color Dot Fallback */}
                    <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                      {homeTeam?.logoPath ? (
                        <img 
                          src={homeTeam.logoPath} 
                          alt={`${homeTeam.name} logo`}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            // Fallback to colored dot if logo fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: homeColors.primary }}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="font-bold truncate scorebug-text"
                        style={{ color: homeColors.text }}
                      >
                        {homeTeam?.name || 'HOME'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Sets Won Column - Left of Score */}
                  <div className="flex items-center space-x-3 ml-4">
                    <div className="flex items-center justify-center min-w-[2.5rem]">
                      <div 
                        className="backdrop-blur-md rounded-xl px-3 py-1.5 shadow-2xl relative overflow-hidden"
                        style={{ 
                          background: homeTeam?.colorScheme === 'custom' && homeTeam?.customSetBackgroundColor 
                            ? `linear-gradient(135deg, ${homeTeam.customSetBackgroundColor}40, ${homeTeam.customSetBackgroundColor}20)`
                            : `linear-gradient(135deg, ${homeColors.setBackground}, ${homeColors.setBackground.replace('0.4', '0.2')})`,
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        {/* Glass highlight overlay */}
                        <div 
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)',
                            pointerEvents: 'none'
                          }}
                        />
                        <div 
                          className="text-2xl font-bold scorebug-score score-animate relative z-10"
                          style={{ color: homeColors.text }}
                        >
                          {match?.homeSetsWon || 0}
                        </div>
                      </div>
                    </div>
                    
                    {/* Score Column */}
                    <div 
                      className="text-2xl font-bold scorebug-score score-animate min-w-[2.5rem] text-center"
                      style={{ color: homeColors.text }}
                    >
                      {gameState?.homeScore || 0}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Away Team Pill with Score and Sets */}
              <div 
                className="scorebug-pill away-team-pill"
                style={{
                  background: getBackgroundStyle(awayColors, awayTeam),
                  borderColor: awayColors.primary,
                  width: 'fit-content',
                  minWidth: '280px'
                }}
              >
                <div className="flex items-center justify-between px-4 py-1.5">
                  <div className="flex items-center space-x-2">
                    {/* Team Logo or Color Dot Fallback */}
                    <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                      {awayTeam?.logoPath ? (
                        <img 
                          src={awayTeam.logoPath} 
                          alt={`${awayTeam.name} logo`}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            // Fallback to colored dot if logo fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: awayColors.primary }}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="font-bold truncate scorebug-text"
                        style={{ color: awayColors.text }}
                      >
                        {awayTeam?.name || 'AWAY'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Sets Won Column - Left of Score */}
                  <div className="flex items-center space-x-3 ml-4">
                    <div className="flex items-center justify-center min-w-[2.5rem]">
                      <div 
                        className="backdrop-blur-md rounded-xl px-3 py-1.5 shadow-2xl relative overflow-hidden"
                        style={{ 
                          background: awayTeam?.colorScheme === 'custom' && awayTeam?.customSetBackgroundColor 
                            ? `linear-gradient(135deg, ${awayTeam.customSetBackgroundColor}40, ${awayTeam.customSetBackgroundColor}20)`
                            : `linear-gradient(135deg, ${awayColors.setBackground}, ${awayColors.setBackground.replace('0.4', '0.2')})`,
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        {/* Glass highlight overlay */}
                        <div 
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)',
                            pointerEvents: 'none'
                          }}
                        />
                        <div 
                          className="text-2xl font-bold scorebug-score score-animate relative z-10"
                          style={{ color: awayColors.text }}
                        >
                          {match?.awaySetsWon || 0}
                        </div>
                      </div>
                    </div>
                    
                    {/* Score Column */}
                    <div 
                      className="text-2xl font-bold scorebug-score score-animate min-w-[2.5rem] text-center"
                      style={{ color: awayColors.text }}
                    >
                      {gameState?.awayScore || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
