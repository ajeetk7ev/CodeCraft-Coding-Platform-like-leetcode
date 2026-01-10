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
import { useAuthStore } from "./stores/authStore";

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser(); // Load user data and set auth token on app start
  }, [loadUser]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:slug" element={<ProblemView />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />}>
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
