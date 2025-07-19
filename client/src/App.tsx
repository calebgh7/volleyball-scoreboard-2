import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Scoreboard from "@/pages/scoreboard";
import { useEffect } from "react";
import type { Settings } from "@shared/schema";

function SettingsLoader() {
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (settings?.primaryColor && settings?.accentColor) {
      const root = document.documentElement;
      root.style.setProperty('--primary', settings.primaryColor);
      root.style.setProperty('--accent', settings.accentColor);
      
      // Update CSS custom properties for scoreboard colors
      root.style.setProperty('--color-primary', settings.primaryColor);
      root.style.setProperty('--color-accent', settings.accentColor);
      root.style.setProperty('--color-secondary', settings.accentColor);
    }
  }, [settings]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Scoreboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsLoader />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
