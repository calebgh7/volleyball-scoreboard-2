import { queryClient } from "./queryClient";

export interface ScoreboardData {
  match: any;
  homeTeam: any;
  awayTeam: any;
  gameState: any;
}

export const incrementScore = async (team: 'home' | 'away', matchId: number, currentScore: number) => {
  const newScore = currentScore + 1;
  const updateKey = team === 'home' ? 'homeScore' : 'awayScore';
  
  const response = await fetch(`/api/game-state/${matchId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [updateKey]: newScore })
  });
  if (!response.ok) throw new Error('Failed to update score');
  
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
  await queryClient.fetchQuery({
    queryKey: [`/api/game-state/${matchId}`],
    queryFn: async () => {
      const response = await fetch(`/api/game-state/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeScore: 0, awayScore: 0 })
      });
      if (!response.ok) throw new Error('Failed to reset scores');
      return response.json();
    }
  });
  
  queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
};

export const completeSet = async (matchId: number, homeScore: number, awayScore: number, currentSet: number, setHistory: any[]) => {
  const winner = homeScore > awayScore ? 'home' : 'away';
  const newSetHistory = [...setHistory];
  
  // Update current set in history or add new set
  const currentSetIndex = newSetHistory.findIndex(set => set.setNumber === currentSet);
  if (currentSetIndex >= 0) {
    newSetHistory[currentSetIndex] = {
      setNumber: currentSet,
      homeScore,
      awayScore,
      winner
    };
  } else {
    // Add the new completed set
    newSetHistory.push({
      setNumber: currentSet,
      homeScore,
      awayScore,
      winner
    });
  }
  
  // Add next set placeholder if not at end of match
  const nextSet = currentSet + 1;
  const hasNextSet = newSetHistory.some(set => set.setNumber === nextSet);
  if (!hasNextSet && nextSet <= 5) { // Max 5 sets
    newSetHistory.push({
      setNumber: nextSet,
      homeScore: 0,
      awayScore: 0,
      winner: null
    });
  }
  
  // Update match with new set winner and history
  await queryClient.fetchQuery({
    queryKey: [`/api/matches/${matchId}`],
    queryFn: async () => {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setHistory: newSetHistory,
          homeSetsWon: newSetHistory.filter(set => set.winner === 'home').length,
          awaySetsWon: newSetHistory.filter(set => set.winner === 'away').length,
          currentSet: nextSet
        })
      });
      if (!response.ok) throw new Error('Failed to complete set');
      return response.json();
    }
  });
  
  // Reset scores for next set
  await resetCurrentSet(matchId);
  
  queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
};
