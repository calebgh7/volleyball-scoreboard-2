import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";

export default function ScoreboardPage() {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeSets, setHomeSets] = useState(0);
  const [awaySets, setAwaySets] = useState(0);

  const { data: currentMatch, isLoading } = useQuery({
    queryKey: ["/api/current-match"],
    queryFn: async () => {
      const response = await fetch("/api/current-match");
      if (!response.ok) {
        throw new Error("Failed to fetch current match");
      }
      return response.json();
    },
  });

  const handleScoreUpdate = async (team: 'home' | 'away', increment: boolean) => {
    try {
      const newScore = team === 'home' 
        ? Math.max(0, homeScore + (increment ? 1 : -1))
        : Math.max(0, awayScore + (increment ? 1 : -1));

      if (team === 'home') {
        setHomeScore(newScore);
      } else {
        setAwayScore(newScore);
      }

      // Update via API
      const response = await fetch("/api/scores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          homeScore: team === 'home' ? newScore : homeScore,
          awayScore: team === 'away' ? newScore : awayScore
        }),
      });

      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/current-match"] });
      }
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const handleSetComplete = async (winner: 'home' | 'away') => {
    try {
      if (winner === 'home') {
        setHomeSets(homeSets + 1);
      } else {
        setAwaySets(awaySets + 1);
      }

      // Reset scores for next set
      setHomeScore(0);
      setAwayScore(0);

      // Update via API
      const response = await fetch("/api/sets/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          matchId: currentMatch?.id || "demo-match-1",
          winner 
        }),
      });

      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/current-match"] });
      }
    } catch (error) {
      console.error("Error completing set:", error);
    }
  };

  const handleResetScores = async () => {
    try {
      setHomeScore(0);
      setAwayScore(0);

      const response = await fetch("/api/scores/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          matchId: currentMatch?.id || "demo-match-1"
        }),
      });

      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ["/api/current-match"] });
      }
    } catch (error) {
      console.error("Error resetting scores:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading scoreboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Volleyball Scoreboard
        </h1>

        {/* Score Display */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Home Team */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">Home Team</h2>
            <div className="text-6xl font-bold text-gray-800 mb-4">{homeScore}</div>
            <div className="text-xl text-gray-600 mb-4">Sets Won: {homeSets}</div>
            <div className="space-y-2">
              <button
                onClick={() => handleScoreUpdate('home', true)}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                +1 Point
              </button>
              <button
                onClick={() => handleScoreUpdate('home', false)}
                className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                -1 Point
              </button>
            </div>
          </div>

          {/* Away Team */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Away Team</h2>
            <div className="text-6xl font-bold text-gray-800 mb-4">{awayScore}</div>
            <div className="text-xl text-gray-600 mb-4">Sets Won: {awaySets}</div>
            <div className="space-y-2">
              <button
                onClick={() => handleScoreUpdate('away', true)}
                className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                +1 Point
              </button>
              <button
                onClick={() => handleScoreUpdate('away', false)}
                className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                -1 Point
              </button>
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Game Controls</h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleSetComplete('home')}
              className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 font-semibold"
            >
              Home Wins Set
            </button>
            <button
              onClick={() => handleSetComplete('away')}
              className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 font-semibold"
            >
              Away Wins Set
            </button>
            <button
              onClick={handleResetScores}
              className="bg-yellow-500 text-white py-3 px-6 rounded-lg hover:bg-yellow-600 font-semibold"
            >
              Reset Scores
            </button>
          </div>
        </div>

        {/* Match Info */}
        {currentMatch && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Match Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Match ID:</strong> {currentMatch.id}
              </div>
              <div>
                <strong>Format:</strong> {currentMatch.format || 'Best of 5'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
