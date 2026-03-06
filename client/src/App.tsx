import { BrowserRouter } from "react-router-dom";
import { ClerkProvider, ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AppRoutes } from "@/router";
import { GrainOverlay } from "@/components/animation/GrainOverlay";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

function AppContent() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
          <AppRoutes />
        </div>
        <GrainOverlay />
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn("Missing VITE_CLERK_PUBLISHABLE_KEY — running without auth");
    return (
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <ClerkLoading>
          <LoadingScreen />
        </ClerkLoading>
        <ClerkLoaded>
          <AppContent />
        </ClerkLoaded>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;
