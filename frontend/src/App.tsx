import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import PrivateRoute from "@/components/PrivateRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CitizenDashboard from "./pages/CitizenDashboard";
import ReportIssue from "./pages/ReportIssue";
import ComplaintDetails from "./pages/ComplaintDetails";
import TrackComplaint from "./pages/TrackComplaint";
import AdminDashboard from "./pages/AdminDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import NotFound from "./pages/NotFound";
// ── NGO / Eco Club Module ──────────────────────────────────────────────────
import NgoRegistrationPage from "./pages/NgoRegistrationPage";
import NgoDashboard from "./pages/NgoDashboard";
import CreateEventPage from "./pages/CreateEventPage";
import EventDiscoveryPage from "./pages/EventDiscoveryPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import BadgesPage from "./pages/BadgesPage";
import EcoImpactDashboard from "./pages/EcoImpactDashboard";
import NotificationsPage from "./pages/NotificationsPage";

const queryClient = new QueryClient();

/**
 * Listens for the "auth:unauthorized" custom event dispatched by api.ts
 * whenever the backend returns a 401. Handles logout and navigation
 * cleanly inside React Router so no hard browser reload is needed.
 */
const AuthRedirectHandler = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      if (isAuthenticated) {
        logout();
      }
      navigate("/login", { replace: true });
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [isAuthenticated, logout, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthRedirectHandler />
          <Layout>
            <Routes>
              {/* ── Existing Routes ──────────────────────────────────── */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/track" element={<TrackComplaint />} />
              <Route path="/complaint/:id" element={<ComplaintDetails />} />
              <Route path="/report" element={
                <PrivateRoute roles={["citizen"]}><ReportIssue /></PrivateRoute>
              } />
              <Route path="/dashboard" element={
                <PrivateRoute roles={["citizen"]}><CitizenDashboard /></PrivateRoute>
              } />
              <Route path="/admin" element={
                <PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>
              } />
              <Route path="/worker" element={
                <PrivateRoute roles={["worker"]}><WorkerDashboard /></PrivateRoute>
              } />

              {/* ── NGO / Eco Module – Public ─────────────────────── */}
              <Route path="/events" element={<EventDiscoveryPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/badges" element={<BadgesPage />} />
              <Route path="/eco-impact" element={<EcoImpactDashboard />} />

              {/* ── NGO / Eco Module – Authenticated ─────────────── */}
              <Route path="/notifications" element={
                <PrivateRoute roles={["citizen", "admin", "worker", "ngo"]}>
                  <NotificationsPage />
                </PrivateRoute>
              } />
              <Route path="/ngo/register" element={
                <PrivateRoute roles={["citizen", "admin", "ngo"]}>
                  <NgoRegistrationPage />
                </PrivateRoute>
              } />
              <Route path="/ngo/dashboard" element={
                <PrivateRoute roles={["citizen", "admin", "ngo"]}>
                  <NgoDashboard />
                </PrivateRoute>
              } />
              <Route path="/ngo/events/create" element={
                <PrivateRoute roles={["citizen", "admin", "ngo"]}>
                  <CreateEventPage />
                </PrivateRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
