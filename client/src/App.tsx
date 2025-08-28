import React, { useState } from "react";

function App() {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeSets, setHomeSets] = useState(0);
  const [awaySets, setAwaySets] = useState(0);

  const addPoint = (team: 'home' | 'away') => {
    if (team === 'home') {
      setHomeScore(homeScore + 1);
    } else {
      setAwayScore(awayScore + 1);
    }
  };

  const subtractPoint = (team: 'home' | 'away') => {
    if (team === 'home') {
      setHomeScore(Math.max(0, homeScore - 1));
    } else {
      setAwayScore(Math.max(0, awayScore - 1));
    }
  };

  const completeSet = (winner: 'home' | 'away') => {
    if (winner === 'home') {
      setHomeSets(homeSets + 1);
    } else {
      setAwaySets(awaySets + 1);
    }
    setHomeScore(0);
    setAwayScore(0);
  };

  const resetScores = () => {
    setHomeScore(0);
    setAwayScore(0);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          textAlign: 'center', 
          fontSize: '48px', 
          color: '#1f2937',
          marginBottom: '40px',
          fontWeight: 'bold'
        }}>
          🏐 Volleyball Scoreboard
        </h1>

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
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: '32px', 
              color: '#2563eb', 
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              🏠 Home Team
            </h2>
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
                  backgroundColor: '#2563eb',
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
            textAlign: 'center'
          }}>
            <h2 style={{ 
              fontSize: '32px', 
              color: '#dc2626', 
              marginBottom: '20px',
              fontWeight: 'bold'
            }}>
              ✈️ Away Team
            </h2>
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
                  backgroundColor: '#dc2626',
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
            ✅ Application is working! You can now track volleyball scores.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
