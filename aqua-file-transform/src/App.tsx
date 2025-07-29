// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/LoginPage";
import { AuthProvider } from "@/context/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import Logout from "@/components/LogoutPage"; 
import Home from "@/pages/Homepage";
import { HashRouter } from "react-router-dom";


const queryClient = new QueryClient();

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/app" element={<PrivateRoute><Index /></PrivateRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* TOASTERS precisam estar aqui para funcionar */}
            <Toaster />
            <Sonner />
          </QueryClientProvider>
        </TooltipProvider>
      </HashRouter>
    </AuthProvider>
  );
}