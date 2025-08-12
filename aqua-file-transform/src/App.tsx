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
import Conversions from "./pages/Conversions";
import Tickets from "./pages/Tickets";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import MainLayout from "./components/MainLayout";
import { Button } from "@/components/ui/button";
import Auth from "./pages/Auth";
import Homepage from "@/pages/Homepage";
import XmlValidation from "./pages/XmlValidation";
import ApiIntegration from "./pages/ApiIntegration";




const queryClient = new QueryClient();

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <Routes>
              {/* Rotas SEM layout */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/logout" element={<Logout />} />

              {/* Rotas COM layout */}
              <Route
                path="/"
                element={
                 <Homepage />
                }
              />
              <Route
                path="/api/auth/login"
                element={
                  
                   <Auth />
                  
                }
              />
              <Route
                path="/api/dashboard"
                element={
                  <PrivateRoute>
                    <MainLayout><Index /></MainLayout>
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/api/xml-validation"
                element={
                  <PrivateRoute>
                    <MainLayout><XmlValidation /></MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/api/api-integration"
                element={
                  <PrivateRoute>
                    <MainLayout><ApiIntegration /></MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/api/conversions"
                element={
                  <PrivateRoute>
                    <MainLayout><Conversions /></MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/api/tickets"
                element={
                  <PrivateRoute>
                    <MainLayout><Tickets /></MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/api/analytics"
                element={
                  <PrivateRoute>
                    <MainLayout><Analytics /></MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/api/settings"
                element={
                  <PrivateRoute>
                    <MainLayout><Settings /></MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/api/profile"
                element={
                  <PrivateRoute>
                    <MainLayout><Profile /></MainLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/api/help"
                element={
                  <PrivateRoute>
                    <MainLayout><Help /></MainLayout>
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Toaster />
            <Sonner />
          </QueryClientProvider>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}