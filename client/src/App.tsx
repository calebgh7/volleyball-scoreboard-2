import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ScoreboardPage from "./pages/scoreboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  console.log("🔧 App component rendering...");
  
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <div style={{ padding: "20px", backgroundColor: "#f0f0f0" }}>
          <h1 style={{ color: "red", textAlign: "center" }}>DEBUG: App is rendering</h1>
          <ScoreboardPage />
        </div>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("❌ Error in App component:", error);
    return (
      <div style={{ padding: "20px", backgroundColor: "red", color: "white" }}>
        <h1>ERROR IN APP COMPONENT</h1>
        <pre>{error instanceof Error ? error.message : String(error)}</pre>
        <pre>{error instanceof Error ? error.stack : "No stack trace"}</pre>
      </div>
    );
  }
}
