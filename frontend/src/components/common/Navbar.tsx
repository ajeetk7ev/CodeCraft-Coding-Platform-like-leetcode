import { Code2, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, ChevronDown, Shield } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuthStore } from "@/stores/authStore";
import StreakIcon from "./StreakIcon";

export default function Navbar() {
  const { token, user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Code2 className="text-indigo-400" />
          <span className="text-lg font-bold tracking-tight text-white">
            CodeArena
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <NavItem label="Home" to="/" />
          <NavItem label="Problems" to="/problems" />
          <NavItem label="Contests" to="/contests" />
          <NavItem label="Discuss" to="/discuss" />
          <NavItem label="Leaderboard" to="/leaderboard" />
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {token && <StreakIcon />}

          {!token && (
            <Link
              to="/login"
              className="px-4 py-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              Login
            </Link>
          )}

          {token && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-800 hover:bg-gray-800 transition">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.avatar || "https://github.com/shadcn.png"}
                    />
                    <AvatarFallback>
                      {user.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <span className="text-sm text-gray-200">{user.username}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-44 bg-gray-900 border border-gray-800 p-1"
              >
                {/* PROFILE */}
                <DropdownMenuItem asChild>
                  <Link
                    to={`/profile/${user.username}`}
                    className="
            flex items-center gap-2 rounded-md px-2 py-2
            text-gray-200
            hover:bg-gray-800 hover:text-white
            focus:bg-gray-800 focus:text-white
          "
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                {/* ADMIN - Only show for admin users */}
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin"
                      className="
            flex items-center gap-2 rounded-md px-2 py-2
            text-gray-200
            hover:bg-gray-800 hover:text-white
            focus:bg-gray-800 focus:text-white
          "
                    >
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-gray-800 my-1" />

                {/* LOGOUT */}
                <DropdownMenuItem
                  onClick={() => {
                    useAuthStore.getState().logout();
                    navigate("/");
                  }}
                  className="
          flex items-center gap-2 rounded-md px-2 py-2
          text-red-400
          hover:bg-red-500/10 hover:text-red-400
          focus:bg-red-500/10 focus:text-red-400
        "
                >
                  <LogOut className="h-4 w-4 text-red-400" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon">
                <Menu className="h-6 w-6 text-gray-300" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="bg-gray-950 border-gray-800">
              {/* Close Button */}
              <SheetClose className="absolute right-4 top-4 p-1 rounded-md hover:bg-gray-800 transition">
                <X className="h-5 w-5 text-gray-300" />
              </SheetClose>

              {/* Mobile Nav */}
              <div className="mt-16 px-6">
                <MobileNav closeSheet={() => setOpen(false)} token={token} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Desktop Nav Item ---------------- */

function NavItem({ label, to }: { label: string; to: string }) {
  const location = useLocation();

  const isActive =
    to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`
        px-3 py-1.5 rounded-md transition
        ${isActive
          ? "bg-gray-800 text-white"
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }
      `}
    >
      {label}
    </Link>
  );
}



/* ---------------- Mobile Nav ---------------- */

function MobileNav({
  closeSheet,
  token,
}: {
  closeSheet: () => void;
  token: string | null;
}) {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col gap-2 mt-10">
      <MobileNavItem to="/problems" label="Problems" onClick={closeSheet} />
      <MobileNavItem to="/contests" label="Contests" onClick={closeSheet} />
      <MobileNavItem to="/discuss" label="Discuss" onClick={closeSheet} />
      <MobileNavItem to="/leaderboard" label="Leaderboard" onClick={closeSheet} />

      {token && user && (
        <>
          <div className="my-4 border-t border-gray-800" />

          {/* PROFILE */}
          <MobileNavItem
            to={`/profile/${user.username}`}
            label="Profile"
            icon={<User className="h-5 w-5" />}
            onClick={closeSheet}
          />

          {/* ADMIN */}
          {user.role === "admin" && (
            <MobileNavItem
              to="/admin"
              label="Admin Panel"
              icon={<Shield className="h-5 w-5" />}
              onClick={closeSheet}
            />
          )}

          {/* LOGOUT */}
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              closeSheet();
            }}
            className="
              flex items-center gap-3 px-4 py-3 rounded-md
              text-red-400 hover:bg-red-500/10 transition
            "
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </>
      )}

      {!token && (
        <Link
          to="/login"
          onClick={closeSheet}
          className="
            mt-6 block text-center px-4 py-3 rounded-md
            bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition
          "
        >
          Login
        </Link>
      )}
    </div>
  );
}

function MobileNavItem({
  to,
  label,
  icon,
  onClick,
}: {
  to: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  const location = useLocation();

  const isActive =
    to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-md text-lg transition
        ${isActive
          ? "bg-gray-800 text-white font-semibold"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }
      `}
    >
      {icon}
      {label}
    </Link>
  );
}



