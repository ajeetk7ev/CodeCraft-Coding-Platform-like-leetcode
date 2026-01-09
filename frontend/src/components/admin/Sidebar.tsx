import { NavLink } from "react-router-dom";
import {
  Shield,
  Home,
  TrendingUp,
  Users,
  FileText,
  Settings,
} from "lucide-react";
import { useDashboardCollapsedStore } from "@/stores/dashboardCollapsedStore";

const Sidebar = () => {
  const { collapsed, toggle } = useDashboardCollapsedStore();

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: Home, end: true },
    { to: "/admin/analytics", label: "Analytics", icon: TrendingUp },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/problems", label: "Problems", icon: FileText },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 bottom-0
        h-calc(100vh-5rem) bg-slate-900 border-r border-slate-800
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800">
        <Shield className="h-7 w-7 text-indigo-400" />
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight">
            Admin
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="px-2 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm
                transition
                ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-slate-800">
        <button
          onClick={toggle}
          className="w-full text-xs text-slate-400 hover:text-white"
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
