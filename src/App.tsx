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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const Router = import.meta.env.VITE_USE_HASH === "true" ? HashRouter : BrowserRouter;
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppProvider>
          <Router>
            <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="/feed" element={<FeedScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </Router>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
