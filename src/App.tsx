import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import HomeScreen from "./pages/HomeScreen";
import MapScreen from "./pages/MapScreen";
import FeedScreen from "./pages/FeedScreen";
import ProfileScreen from "./pages/ProfileScreen";
import YourProfileScreen from "./pages/YourProfileScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RoutesWrapper() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/map" element={<MapScreen />} />
        <Route path="/feed" element={<FeedScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/your-profile" element={<YourProfileScreen />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
}

const App = () => {
  const isProduction = import.meta.env.PROD;
  const useHash = import.meta.env.VITE_USE_HASH === "true" || isProduction; // Force HashRouter for production

  // Set dark theme
  document.documentElement.classList.add("dark");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppProvider>
          {useHash ? (
            <HashRouter>
              <RoutesWrapper />
            </HashRouter>
          ) : (
            <BrowserRouter basename="/">
              <RoutesWrapper />
            </BrowserRouter>
          )}
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

