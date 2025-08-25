import { queryClient } from "./queryClient";

export interface ScoreboardData {
  match: any;
  homeTeam: any;
  awayTeam: any;
  gameState: any;
}

// Volleyball scoring constants
const VOLLEYBALL_SET_POINTS = 25;
const VOLLEYBALL_MIN_MARGIN = 2;
const VOLLEYBALL_MAX_SETS = 5;

// Enhanced score validation
const isValidVolleyballScore = (homeScore: number, awayScore: number): boolean => {
  if (homeScore < 0 || awayScore < 0) return false;
  
  // Check if a team has won the set (25+ points with 2+ point margin)
  if (homeScore >= VOLLEYBALL_SET_POINTS || awayScore >= VOLLEYBALL_SET_POINTS) {
    const margin = Math.abs(homeScore - awayScore);
    return margin >= VOLLEYBALL_MIN_MARGIN;
  }
  
  return true;
};

// Check if set is complete
export const isSetComplete = (homeScore: number, awayScore: number): boolean => {
  if (homeScore >= VOLLEYBALL_SET_POINTS || awayScore >= VOLLEYBALL_SET_POINTS) {
    const margin = Math.abs(homeScore - awayScore);
    return margin >= VOLLEYBALL_MIN_MARGIN;
  }
  return false;
};

// Get set winner
const getSetWinner = (homeScore: number, awayScore: number): 'home' | 'away' | null => {
  if (isSetComplete(homeScore, awayScore)) {
    return homeScore > awayScore ? 'home' : 'away';
  }
  return null;
};

export const incrementScore = async (team: 'home' | 'away', matchId: number, currentScore: number) => {
  const newScore = currentScore + 1;
  const updateKey = team === 'home' ? 'homeScore' : 'awayScore';
  
  // Get current game state to check both scores
  const currentMatch = await queryClient.fetchQuery({
    queryKey: ['/api/current-match'],
    queryFn: async () => {
      const response = await fetch('/api/current-match');
      if (!response.ok) throw new Error('Failed to get current match');
      return response.json();
    }
  });
  
  const homeScore = team === 'home' ? newScore : currentMatch.gameState.homeScore;
  const awayScore = team === 'away' ? newScore : currentMatch.gameState.awayScore;
  
  // Validate the new score combination
  if (!isValidVolleyballScore(homeScore, awayScore)) {
    throw new Error('Invalid volleyball score combination');
  }
  
  const response = await fetch(`/api/game-state/${matchId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [updateKey]: newScore })
  });
  if (!response.ok) throw new Error('Failed to update score');
  
  // Auto-completion disabled - users can manually complete sets at any score
  // if (isSetComplete(homeScore, awayScore)) {
  //   await handleSetCompletion(matchId, homeScore, awayScore, currentMatch.match.currentSet, currentMatch.match.setHistory, matchId);
  // }
  
  queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
};

export const decrementScore = async (team: 'home' | 'away', matchId: number, currentScore: number) => {
  if (currentScore <= 0) return;
  
  const newScore = currentScore - 1;
  const updateKey = team === 'home' ? 'homeScore' : 'awayScore';
  
  const response = await fetch(`/api/game-state/${matchId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [updateKey]: newScore })
  });
  if (!response.ok) throw new Error('Failed to update score');
  
  queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
};

export const resetCurrentSet = async (matchId: number) => {
  try {
    console.log('🔄 Resetting scores for match:', matchId);
    
    // Reset scores to 0
    const response = await fetch(`/api/game-state/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeScore: 0, awayScore: 0 })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to reset scores: ${response.status} ${response.statusText}`);
    }
    
    const resetGameState = await response.json();
    console.log('🔄 Scores reset successfully:', resetGameState);
    
    // Force refresh the current match data
    await queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
    console.log('🔄 Data refreshed after score reset');
  } catch (error) {
    console.error('❌ Error in resetCurrentSet:', error);
    throw new Error('Failed to reset set scores');
  }
};

export const resetMatch = async (matchId: number) => {
  try {
    // Reset everything for a new match
    await fetch(`/api/matches/${matchId}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
  } catch (error) {
    throw new Error('Failed to reset match');
  }
};

export const completeSet = async (matchId: number, homeScore: number, awayScore: number, currentSet: number, setHistory: any[]) => {
  try {
    await handleSetCompletion(matchId, homeScore, awayScore, currentSet, setHistory, matchId);
  } catch (error) {
    console.error('Error in completeSet:', error);
    throw error;
  }
};

// Simplified set completion handler
const handleSetCompletion = async (matchId: number, homeScore: number, awayScore: number, currentSet: number, setHistory: any[], matchIdForFormat: number) => {
  try {
    // Determine winner based on current scores (allow any score)
    let winner: 'home' | 'away';
    if (homeScore > awayScore) {
      winner = 'home';
    } else if (awayScore > homeScore) {
      winner = 'away';
    } else {
      // If scores are equal, default to home team
      winner = 'home';
    }
    
    // Get current match to see existing sets won
    const matchResponse = await fetch(`/api/matches/${matchIdForFormat}`);
    if (!matchResponse.ok) {
      throw new Error(`Failed to fetch match: ${matchResponse.status} ${matchResponse.statusText}`);
    }
    
    const matchData = await matchResponse.json();
    console.log('📋 Current match data:', { 
      currentSet, 
      homeSetsWon: matchData.homeSetsWon, 
      awaySetsWon: matchData.awaySetsWon,
      format: matchData.format 
    });
    
    // Calculate new sets won
    const currentHomeSetsWon = matchData.homeSetsWon || 0;
    const currentAwaySetsWon = matchData.awaySetsWon || 0;
    const newHomeSetsWon = winner === 'home' ? currentHomeSetsWon + 1 : currentHomeSetsWon;
    const newAwaySetsWon = winner === 'away' ? currentAwaySetsWon + 1 : currentAwaySetsWon;
    
    // Get match format
    const matchFormat = matchData.format || 5;
    
    // Check if match is complete
    const isMatchComplete = newHomeSetsWon > matchFormat / 2 || newAwaySetsWon > matchFormat / 2;
    
    if (isMatchComplete) {
      // Match is complete
      console.log('🏁 Match completed! Final score:', { home: newHomeSetsWon, away: newAwaySetsWon });
      const completeResponse = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeSetsWon: newHomeSetsWon,
          awaySetsWon: newAwaySetsWon,
          status: 'completed',
          winner: newHomeSetsWon > newAwaySetsWon ? 'home' : 'away'
        })
      });
      
      if (!completeResponse.ok) {
        throw new Error(`Failed to complete match: ${completeResponse.status} ${completeResponse.statusText}`);
      }
      
      console.log('🏆 Match marked as completed');
    } else if (currentSet >= matchFormat) {
      // We're already at the maximum sets, don't advance further
      console.log('⚠️ Already at maximum sets, updating sets won only');
      const updateResponse = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeSetsWon: newHomeSetsWon,
          awaySetsWon: newAwaySetsWon
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update match: ${updateResponse.status} ${updateResponse.statusText}`);
      }
      
      const updatedMatch = await updateResponse.json();
      console.log('📊 Match updated successfully:', updatedMatch);
    } else {
      // Move to next set
      const nextSet = currentSet + 1;
      console.log('➡️ Advancing to set:', nextSet);
      
      // Update match with new sets won and next set
      const updateResponse = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeSetsWon: newHomeSetsWon,
          awaySetsWon: newAwaySetsWon,
          currentSet: nextSet
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`Failed to update match: ${updateResponse.status} ${updateResponse.statusText}`);
      }
      
      const updatedMatch = await updateResponse.json();
      console.log('📊 Match updated successfully:', updatedMatch);
      
      // Reset scores for next set
      await resetCurrentSet(matchId);
    }
    
    // Force refresh the current match data
    await queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
    console.log('✅ Set completion successful - data refreshed');
  } catch (error) {
    console.error('❌ Error in handleSetCompletion:', error);
    throw error;
  }
};

// Enhanced sets won management
export const updateSetsWon = async (matchId: number, homeSetsWon: number, awaySetsWon: number) => {
  try {
    // Get match format dynamically
    const matchResponse = await fetch(`/api/matches/${matchId}`);
    if (!matchResponse.ok) {
      throw new Error(`Failed to fetch match: ${matchResponse.status} ${matchResponse.statusText}`);
    }
    
    const matchData = await matchResponse.json();
    const matchFormat = matchData.format || 5; // Default to best of 5
    
    // Validate sets won don't exceed match format
    if (homeSetsWon + awaySetsWon > matchFormat) {
      throw new Error(`Total sets won cannot exceed match format (${matchFormat})`);
    }
    
    // Check if this would complete the match
    const isMatchComplete = homeSetsWon > matchFormat / 2 || awaySetsWon > matchFormat / 2;
    
    await fetch(`/api/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        homeSetsWon: Math.max(0, Math.min(5, homeSetsWon)),
        awaySetsWon: Math.max(0, Math.min(5, awaySetsWon)),
        status: isMatchComplete ? 'completed' : 'in_progress',
        winner: isMatchComplete ? (homeSetsWon > awaySetsWon ? 'home' : 'away') : null
      })
    });
    
    queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
  } catch (error) {
    throw new Error('Failed to update sets won');
  }
};

// Emergency reset function to fix corrupted match data
export const emergencyResetMatch = async (matchId: number) => {
  try {
    console.log('🚨 Emergency reset of corrupted match data');
    
    // Reset to a valid state
    const resetResponse = await fetch(`/api/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentSet: 1,
        homeSetsWon: 0,
        awaySetsWon: 0,
        status: 'in_progress',
        winner: null
      })
    });
    
    if (!resetResponse.ok) {
      throw new Error(`Failed to reset match: ${resetResponse.status}`);
    }
    
    // Reset game state scores
    await resetCurrentSet(matchId);
    
    // Force refresh
    await queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
    
    console.log('✅ Emergency reset completed');
  } catch (error) {
    console.error('❌ Emergency reset failed:', error);
    throw error;
  }
};
