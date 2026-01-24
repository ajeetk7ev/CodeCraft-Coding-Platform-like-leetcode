import { Code2, Menu, User, LogOut, ChevronDown, Shield, LayoutDashboard, Trophy, MessageSquare, BookOpen, Crown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

import { useAuthStore } from "@/stores/authStore";
import StreakIcon from "./StreakIcon";

export default function Navbar() {
  const { token, user, logout } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "py-3 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-indigo-500/5"
        : "py-5 bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
            <Code2 className="text-white h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white leading-none">
              CODECRAFT
            </span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none mt-1">
              Arena
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
          <NavItem label="Home" to="/" icon={<BookOpen className="h-4 w-4" />} />
          <NavItem label="Problems" to="/problems" icon={<LayoutDashboard className="h-4 w-4" />} />
          <NavItem label="Contests" to="/contests" icon={<Trophy className="h-4 w-4" />} />
          <NavItem label="Discuss" to="/discuss" icon={<MessageSquare className="h-4 w-4" />} />
          <NavItem label="Leaderboard" to="/leaderboard" icon={<Crown className="h-4 w-4" />} />
        </nav>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-4">
          {token && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-black text-amber-200">{user?.contestPoints || 0}</span>
                <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-tight">pts</span>
              </div>
              <StreakIcon />
            </div>
          )}

          {!token && (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-bold text-slate-400 hover:text-white transition-colors px-4"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
              >
                Get Started
              </Link>
            </div>
          )}

          {token && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center gap-3 p-1 pr-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="relative">
                    <Avatar className="h-9 w-9 rounded-xl border border-white/10">
                      <AvatarImage src={user.avatar || "https://github.com/shadcn.png"} />
                      <AvatarFallback className="bg-indigo-600 text-white font-bold">
                        {user.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                  </div>

                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold text-slate-100 uppercase tracking-tight line-clamp-1 max-w-[100px]">
                      {user.username}
                    </span>
                    <div className="flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
                      <span className="text-[10px] font-black uppercase text-slate-500">Account</span>
                      <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                    </div>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 bg-slate-900/90 backdrop-blur-xl border-slate-800 p-2 rounded-2xl mt-2 shadow-2xl"
              >
                <div className="px-3 py-4 border-b border-white/5 mb-2">
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Signed in as</p>
                  <p className="text-sm font-bold text-slate-100 truncate">{user.fullName || user.username}</p>
                </div>

                <DropdownMenuItem asChild>
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <User className="h-4 w-4 text-indigo-400" />
                    My Profile
                  </Link>
                </DropdownMenuItem>

                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors mt-1"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-white/5 my-2" />

                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden flex items-center gap-4">
          {token && <StreakIcon />}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-xl hover:bg-white/5">
                <Menu className="h-6 w-6 text-gray-300" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="bg-slate-950/95 backdrop-blur-xl border-white/5 w-[300px] p-0">
              <div className="flex flex-col h-full bg-gradient-to-b from-indigo-500/5 to-transparent">
                <div className="p-8 border-b border-white/5">
                  <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                      <Code2 className="text-white h-6 w-6" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white">CODECRAFT</span>
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                  <MobileNavItem to="/" label="Home" icon={<BookOpen className="h-5 w-5" />} onClick={() => setOpen(false)} />
                  <MobileNavItem to="/problems" label="Problems" icon={<LayoutDashboard className="h-5 w-5" />} onClick={() => setOpen(false)} />
                  <MobileNavItem to="/contests" label="Contests" icon={<Trophy className="h-5 w-5" />} onClick={() => setOpen(false)} />
                  <MobileNavItem to="/discuss" label="Discuss" icon={<MessageSquare className="h-5 w-5" />} onClick={() => setOpen(false)} />
                  <MobileNavItem to="/leaderboard" label="Leaderboard" icon={<Crown className="h-5 w-5" />} onClick={() => setOpen(false)} />

                  {token && user && (
                    <>
                      <div className="py-4">
                        <div className="h-px bg-white/5" />
                      </div>
                      <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">User Account</p>
                      <MobileNavItem to={`/profile/${user.username}`} label="Profile" icon={<User className="h-5 w-5" />} onClick={() => setOpen(false)} />
                      {user.role === "admin" && (
                        <MobileNavItem to="/admin" label="Admin Panel" icon={<Shield className="h-5 w-5" />} onClick={() => setOpen(false)} />
                      )}
                    </>
                  )}
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                  {!token ? (
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      Sign In
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors font-bold"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Desktop Nav Item ---------------- */

function NavItem({ label, to, icon }: { label: string; to: string; icon: React.ReactNode }) {
  const location = useLocation();
  const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className="relative group px-4 py-2 rounded-xl transition-all duration-300 overflow-hidden"
    >
      <div className={`flex items-center gap-2 relative z-10 transition-colors duration-300 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-100"
        }`}>
        <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-indigo-400" : ""}`}>{icon}</span>
        <span className="text-sm font-bold uppercase tracking-tight">{label}</span>
      </div>

      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      {!isActive && (
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 rounded-xl" />
      )}
    </Link>
  );
}

/* ---------------- Mobile Nav Item ---------------- */

function MobileNavItem({ to, label, icon, onClick }: { to: string; label: string; icon: React.ReactNode; onClick: () => void }) {
  const location = useLocation();
  const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
        }`}
    >
      <span className={`${isActive ? "text-white" : "text-indigo-500/60 group-hover:text-indigo-400"} transition-colors`}>{icon}</span>
      <span className="text-base font-bold uppercase tracking-tight">{label}</span>
      {isActive && (
        <motion.div
          layoutId="mobileActive"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
        />
      )}
    </Link>
  );
}
