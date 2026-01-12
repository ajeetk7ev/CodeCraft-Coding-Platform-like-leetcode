import Sidebar from "@/components/admin/Sidebar";
import BottomNav from "@/components/admin/BottomNav";
import Navbar from "@/components/common/Navbar";
import { useDashboardCollapsedStore } from "@/stores/dashboardCollapsedStore";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";


export default function AdminLayout() {
  const collapsed = useDashboardCollapsedStore((state) => state.collapsed);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {

    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pt-16">
      <Navbar />

      <div className="flex flex-1 relative">
        <Sidebar />

        {/* Main content */}
        <main
          className={`flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 lg:p-12 pb-32 md:pb-12 transition-all duration-500 w-full`}
          style={{
            marginLeft: isDesktop ? (collapsed ? "5.5rem" : "18rem") : "0",
            paddingRight: isDesktop ? "3rem" : "1.5rem",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
