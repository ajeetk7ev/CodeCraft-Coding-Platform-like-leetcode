import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { Navigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import StatsCards from "../components/admin/StatsCards";
import ProblemManagement from "../components/admin/ProblemManagement";
import ChartsSection from "@/components/admin/ChartsSection";
import UserManagement from "@/components/admin/UserManagement";

const Admin = () => {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");

  console.log("Admin User:", user);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "User Management" },
    { id: "problems", label: "Problem Management" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage platform statistics, users, and problems
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === "dashboard" && (
            <>
              <StatsCards />
              <ChartsSection />
            </>
          )}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "problems" && <ProblemManagement />}
        </div>
      </div>
    </div>
  );
};

export default Admin;