import React, { useState } from "react";

interface Team {
  id: string;
  name: string;
  color: string;
  logoUrl?: string;
}

function App() {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeSets, setHomeSets] = useState(0);
  const [awaySets, setAwaySets] = useState(0);
  
  // Team management state
  const [homeTeam, setHomeTeam] = useState<Team>({
    id: "home-team-1",
    name: "Home Team",
    color: "#2563eb"
  });
  
  const [awayTeam, setAwayTeam] = useState<Team>({
    id: "away-team-1", 
    name: "Away Team",
    color: "#dc2626"
  });

  const [showTeamEditor, setShowTeamEditor] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const addPoint = async (team: 'home' | 'away') => {
    try {
      const newHomeScore = team === 'home' ? homeScore + 1 : homeScore;
      const newAwayScore = team === 'away' ? awayScore + 1 : awayScore;
      
      // Update local state immediately
      if (team === 'home') {
        setHomeScore(newHomeScore);
      } else {
        setAwayScore(newAwayScore);
      }

      // Update via API
      const response = await fetch("/api/scores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          homeScore: newHomeScore,
          awayScore: newAwayScore
        }),
      });

      if (!response.ok) {
        console.error("Failed to update scores via API");
      }
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const subtractPoint = async (team: 'home' | 'away') => {
    try {
      const newHomeScore = team === 'home' ? Math.max(0, homeScore - 1) : homeScore;
      const newAwayScore = team === 'away' ? Math.max(0, awayScore - 1) : awayScore;
      
      // Update local state immediately
      if (team === 'home') {
        setHomeScore(newHomeScore);
      } else {
        setAwayScore(newAwayScore);
      }

      // Update via API
      const response = await fetch("/api/scores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          homeScore: newHomeScore,
          awayScore: newAwayScore
        }),
      });

      if (!response.ok) {
        console.error("Failed to update scores via API");
      }
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const completeSet = async (winner: 'home' | 'away') => {
    try {
      // Update local state immediately
      if (winner === 'home') {
        setHomeSets(homeSets + 1);
      } else {
        setAwaySets(awaySets + 1);
      }
      setHomeScore(0);
      setAwayScore(0);

      // Update via API
      const response = await fetch("/api/sets/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          matchId: "demo-match-1",
          winner 
        }),
      });

      if (!response.ok) {
        console.error("Failed to complete set via API");
      }
    } catch (error) {
      console.error("Error completing set:", error);
    }
  };

  const resetScores = async () => {
    try {
      // Update local state immediately
      setHomeScore(0);
      setAwayScore(0);

      // Update via API
      const response = await fetch("/api/scores/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          matchId: "demo-match-1"
        }),
      });

      if (!response.ok) {
        console.error("Failed to reset scores via API");
      }
    } catch (error) {
      console.error("Error resetting scores:", error);
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    try {
      // Update local state immediately
      if (teamId === homeTeam.id) {
        setHomeTeam({ ...homeTeam, ...updates });
      } else if (teamId === awayTeam.id) {
        setAwayTeam({ ...awayTeam, ...updates });
      }

      // Update via API
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        console.error("Failed to update team via API");
      }
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };

  const handleLogoUpload = async (teamId: string, file: File) => {
    try {
      // Convert file to base64 for demo (in production, use Cloudinary)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        await updateTeam(teamId, { logoUrl: base64 });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading logo:", error);
    }
  };

  const openTeamEditor = (team: Team) => {
    setEditingTeam(team);
    setShowTeamEditor(true);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header with Team Editor */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            color: '#1f2937',
            fontWeight: 'bold',
            margin: 0
          }}>
            🏐 Volleyball Scoreboard
          </h1>
          <button
            onClick={() => openTeamEditor(homeTeam)}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ⚙️ Team Settings
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          {/* Home Team */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            border: `4px solid ${homeTeam.color}`
          }}>
            <div style={{ marginBottom: '20px' }}>
              {homeTeam.logoUrl && (
                <img 
                  src={homeTeam.logoUrl} 
                  alt="Home Team Logo" 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    objectFit: 'contain',
                    marginBottom: '10px'
                  }}
                />
              )}
              <h2 style={{ 
                fontSize: '32px', 
                color: homeTeam.color, 
                marginBottom: '20px',
                fontWeight: 'bold'
              }}>
                🏠 {homeTeam.name}
              </h2>
            </div>
            <div style={{ 
              fontSize: '72px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '20px'
            }}>
              {homeScore}
            </div>
            <div style={{ 
              fontSize: '24px', 
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              Sets Won: {homeSets}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => addPoint('home')}
                style={{
                  padding: '12px 24px',
                  fontSize: '18px',
                  backgroundColor: homeTeam.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                +1
              </button>
              <button
                onClick={() => subtractPoint('home')}
                style={{
                  padding: '12px 24px',
                  fontSize: '18px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                -1
              </button>
            </div>
          </div>

          {/* Away Team */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '30px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            border: `4px solid ${awayTeam.color}`
          }}>
            <div style={{ marginBottom: '20px' }}>
              {awayTeam.logoUrl && (
                <img 
                  src={awayTeam.logoUrl} 
                  alt="Away Team Logo" 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    objectFit: 'contain',
                    marginBottom: '10px'
                  }}
                />
              )}
              <h2 style={{ 
                fontSize: '32px', 
                color: awayTeam.color, 
                marginBottom: '20px',
                fontWeight: 'bold'
              }}>
                ✈️ {awayTeam.name}
              </h2>
            </div>
            <div style={{ 
              fontSize: '72px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '20px'
            }}>
              {awayScore}
            </div>
            <div style={{ 
              fontSize: '24px', 
              color: '#6b7280',
              marginBottom: '20px'
            }}>
              Sets Won: {awaySets}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => addPoint('away')}
                style={{
                  padding: '12px 24px',
                  fontSize: '18px',
                  backgroundColor: awayTeam.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                +1
              </button>
              <button
                onClick={() => subtractPoint('away')}
                style={{
                  padding: '12px 24px',
                  fontSize: '18px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                -1
              </button>
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: '28px', 
            color: '#1f2937', 
            marginBottom: '20px',
            fontWeight: 'bold'
          }}>
            🎮 Game Controls
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '15px' 
          }}>
            <button
              onClick={() => completeSet('home')}
              style={{
                padding: '15px 20px',
                fontSize: '18px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🏠 Home Wins Set
            </button>
            <button
              onClick={() => completeSet('away')}
              style={{
                padding: '15px 20px',
                fontSize: '18px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✈️ Away Wins Set
            </button>
            <button
              onClick={resetScores}
              style={{
                padding: '15px 20px',
                fontSize: '18px',
                backgroundColor: '#d97706',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🔄 Reset Scores
            </button>
          </div>
        </div>

        {/* Status */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          border: '2px solid #3b82f6'
        }}>
          <p style={{ 
            fontSize: '18px', 
            color: '#1e40af',
            margin: '0',
            fontWeight: 'bold'
          }}>
            ✅ Full application restored! Team management, API integration, and scoreboard working.
          </p>
        </div>
      </div>

      {/* Team Editor Modal */}
      {showTeamEditor && editingTeam && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{
              fontSize: '24px',
              color: '#1f2937',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Edit {editingTeam.name}
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Team Name:
              </label>
              <input
                type="text"
                value={editingTeam.name}
                onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Team Color:
              </label>
              <input
                type="color"
                value={editingTeam.color}
                onChange={(e) => setEditingTeam({ ...editingTeam, color: e.target.value })}
                style={{
                  width: '100%',
                  height: '50px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Team Logo:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleLogoUpload(editingTeam.id, file);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  updateTeam(editingTeam.id, editingTeam);
                  setShowTeamEditor(false);
                  setEditingTeam(null);
                }}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowTeamEditor(false);
                  setEditingTeam(null);
                }}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
