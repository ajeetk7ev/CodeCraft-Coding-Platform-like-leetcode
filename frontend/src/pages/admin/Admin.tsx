import Sidebar from "@/components/admin/Sidebar";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDashboardCollapsedStore } from "@/stores/dashboardCollapsedStore";

const AdminDashboard = () => {
  const { collapsed, setCollapsed } = useDashboardCollapsedStore();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setCollapsed(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <div className="lg:fixed lg:inset-y-0 lg:left-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto p-6 transition-all duration-300"
        style={{
          marginLeft: isDesktop ? (collapsed ? "5rem" : "16rem") : "0",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
