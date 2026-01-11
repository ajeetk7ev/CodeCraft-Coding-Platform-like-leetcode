import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Problems from "./pages/Problems";
import ProblemsList from "./pages/admin/ProblemsList";
import ProblemView from "./pages/ProblemView";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Admin";
import Dashboard from "./pages/admin/Dashboard";
import Analytics from "./pages/admin/Analytics";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import Leaderboard from "./pages/Leaderboard";
import Contests from "./pages/Contests";
import Discuss from "./pages/Discuss";
import { useAuthStore } from "./stores/authStore";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import PublicRoute from "./components/routing/PublicRoute";

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser(); // Load user data and set auth token on app start
  }, [loadUser]);

  return (
    <div>
      <Routes>
        {/* Public Routes - Accessible to everyone */}
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:slug" element={<ProblemView />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/discuss" element={<Discuss />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Auth Routes - Only accessible when NOT logged in */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes - Require authentication */}
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<Users />} />
          <Route path="problems" element={<ProblemsList />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
