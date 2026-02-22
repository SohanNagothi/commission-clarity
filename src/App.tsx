import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import { AppLayout } from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// --- Pages ---

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Common Pages
import Settings from "./pages/Settings";
import Account from "./pages/Account";

// Teacher Pages (existing)
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Payments from "./pages/Payments";
import Settlements from "./pages/Settlements";
import Analytics from "./pages/Analytics";

// Owner Pages (New)
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerTeachers from "./pages/owner/OwnerTeachers";
import OwnerSettlements from "./pages/owner/OwnerSettlements";
import OwnerLogin from "./pages/owner/OwnerLogin";

// Student/Client Pages (New)
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentFees from "./pages/student/StudentFees";
import StudentLogin from "./pages/student/StudentLogin";

// Footer static pages (public)
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/owner/login" element={<OwnerLogin />} />
              <Route path="/student/login" element={<StudentLogin />} />

              {/* Footer static pages */}
              <Route path="/features" element={<Features />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />

              {/* Protected App Shell */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* 1. Teacher Routes */}
                <Route element={<ProtectedRoute allowedRoles={["teacher"]} children={<></>} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/:id" element={<ClientDetail />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/settlements" element={<Settlements />} />
                  <Route path="/analytics" element={<Analytics />} />
                </Route>

                {/* 2. Owner Routes */}
                <Route element={<ProtectedRoute allowedRoles={["owner"]} children={<></>} />}>
                  <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                  <Route path="/owner/teachers" element={<OwnerTeachers />} />
                  <Route path="/owner/settlements" element={<OwnerSettlements />} />
                </Route>

                {/* 3. Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={["client"]} children={<></>} />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/fees" element={<StudentFees />} />
                </Route>

                {/* 4. Shared Routes */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/account" element={<Account />} />

                {/* Role-based Landing redirect after login */}
                <Route path="/app-entry" element={<AppEntryRedirect />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);

/** Helper to redirect users to their correct dashboard after login */
function AppEntryRedirect() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const paths: Record<string, string> = {
    teacher: "/dashboard",
    owner: "/owner/dashboard",
    client: "/student/dashboard"
  };

  return <Navigate to={role ? paths[role] : "/login"} replace />;
}

export default App;
