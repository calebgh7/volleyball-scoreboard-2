import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamEditTest() {
  const [homeTeamName, setHomeTeamName] = useState("Home Team");
  const [awayTeamName, setAwayTeamName] = useState("Away Team");
  const [testMessage, setTestMessage] = useState("");

  const handleHomeTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setHomeTeamName(newName);
    setTestMessage(`Home team name changed to: ${newName}`);
    console.log("🔧 Home team name changed to:", newName);
  };

  const handleAwayTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setAwayTeamName(newName);
    setTestMessage(`Away team name changed to: ${newName}`);
    console.log("🔧 Away team name changed to:", newName);
  };

  const testAPI = async () => {
    try {
      setTestMessage("Testing API...");
      const response = await fetch('/api/teams/home-team-1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: "API Test Team" }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestMessage(`API Success: ${JSON.stringify(data)}`);
        console.log("✅ API test successful:", data);
      } else {
        setTestMessage(`API Error: ${response.status}`);
        console.error("❌ API test failed:", response.status);
      }
    } catch (error) {
      setTestMessage(`API Error: ${error}`);
      console.error("❌ API test error:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Team Edit Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="homeTeam">Home Team Name</Label>
          <Input
            id="homeTeam"
            value={homeTeamName}
            onChange={handleHomeTeamChange}
            placeholder="Enter home team name"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="awayTeam">Away Team Name</Label>
          <Input
            id="awayTeam"
            value={awayTeamName}
            onChange={handleAwayTeamChange}
            placeholder="Enter away team name"
            className="mt-1"
          />
        </div>

        <Button onClick={testAPI} className="w-full">
          Test API Call
        </Button>

        {testMessage && (
          <div className="p-3 bg-gray-100 rounded border">
            <strong>Test Result:</strong> {testMessage}
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>Current Home Team: <strong>{homeTeamName}</strong></p>
          <p>Current Away Team: <strong>{awayTeamName}</strong></p>
        </div>
      </CardContent>
    </Card>
  );
}
