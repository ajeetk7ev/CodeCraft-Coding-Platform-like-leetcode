import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    BarChart3,
    UserCircle,
    FolderCode,
    Sliders
} from "lucide-react";
import { motion } from "framer-motion";

const BottomNav = () => {
    const navItems = [
        { to: "/admin", label: "Home", icon: LayoutDashboard, end: true },
        { to: "/admin/analytics", label: "Stats", icon: BarChart3 },
        { to: "/admin/users", label: "Users", icon: UserCircle },
        { to: "/admin/problems", label: "Tasks", icon: FolderCode },
        { to: "/admin/settings", label: "System", icon: Sliders },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
            <motion.nav
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center justify-around p-2 pointer-events-auto shadow-2xl shadow-indigo-500/10"
            >
                {navItems.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            `relative flex flex-col items-center justify-center p-2 min-w-[64px] transition-all duration-300 ${isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className={`h-5 w-5 mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>

                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-active"
                                        className="absolute -top-1 w-8 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </motion.nav>
        </div>
    );
};

export default BottomNav;
