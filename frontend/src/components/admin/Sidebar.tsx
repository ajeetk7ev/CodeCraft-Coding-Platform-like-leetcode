import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  BarChart3,
  UserCircle,
  FolderCode,
  Sliders,
  Trophy
} from "lucide-react";
import { useDashboardCollapsedStore } from "@/stores/dashboardCollapsedStore";
import { useAuthStore } from "@/stores/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const { collapsed, toggle } = useDashboardCollapsedStore();
  const { user, logout } = useAuthStore();

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/users", label: "User Control", icon: UserCircle },
    { to: "/admin/problems", label: "Challenges", icon: FolderCode },
    { to: "/admin/contests", label: "Contests", icon: Trophy },
    { to: "/admin/settings", label: "System Config", icon: Sliders },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 84 : 280 }}
      className="hidden md:flex fixed top-16 left-0 bottom-0 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/50 flex-col z-40 transition-all duration-300 ease-in-out shadow-2xl shadow-indigo-500/5"
    >
      {/* Profile Section */}
      <div className="p-4 border-b border-white/5 bg-white/[0.02]">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 shrink-0">
              {user?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-sm font-bold text-slate-100 truncate">
                  {user?.fullName || user?.username}
                </span>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  Administrator
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-none">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 ${isActive
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
              }`
            }
          >
            <Icon className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110`} />

            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="truncate"
              >
                {label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2 border-t border-white/5 bg-white/[0.01]">
        <Button
          variant="ghost"
          onClick={logout}
          className={`w-full flex items-center gap-3 justify-start rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-11 ${collapsed ? 'px-0 justify-center' : 'px-3'}`}
          title="Logout"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="font-semibold">Sign Out</span>}
        </Button>

        <button
          onClick={toggle}
          className="w-full h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all group"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Collapse Panel</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
