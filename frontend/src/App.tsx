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
import ContestList from "./pages/admin/ContestList";
import Leaderboard from "./pages/Leaderboard";
import Contests from "./pages/Contests";
import ContestDetail from "./pages/ContestDetail";
import Discuss from "./pages/Discuss";
import NewDiscussion from "./pages/NewDiscussion";
import EditDiscussion from "./pages/EditDiscussion";
import DiscussionDetail from "./pages/DiscussionDetail";
import AuthSuccess from "./pages/AuthSuccess";
import { useAuthStore } from "./stores/authStore";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import PublicRoute from "./components/routing/PublicRoute";
import AdminProtectedRoute from "./components/routing/AdminProtectedRoute";

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
        <Route
          path="/contests/:id"
          element={
            <ProtectedRoute>
              <ContestDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/discuss" element={<Discuss />} />
        <Route path="/discuss/new" element={<ProtectedRoute><NewDiscussion /></ProtectedRoute>} />
        <Route path="/discuss/edit/:id" element={<ProtectedRoute><EditDiscussion /></ProtectedRoute>} />
        <Route path="/discuss/:id" element={<DiscussionDetail />} />
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
        <Route path="/auth-success" element={<AuthSuccess />} />

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
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<Users />} />
          <Route path="problems" element={<ProblemsList />} />
          <Route path="contests" element={<ContestList />} />
          <Route path="settings" element={<Settings />} />

        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
