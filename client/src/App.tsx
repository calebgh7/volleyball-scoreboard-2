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
  return (
    <QueryClientProvider client={queryClient}>
      <ScoreboardPage />
    </QueryClientProvider>
  );
}
