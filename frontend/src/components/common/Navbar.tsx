import { Code2, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuthStore } from "@/stores/authStore";

export default function Navbar() {
  const { token, user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const location = useLocation();

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
          <NavItem label="Problems" to="/problems" />
          <NavItem label="Contests" to="/contests" />
          <NavItem label="Discuss" to="/discuss" />
          <NavItem label="Leaderboard" to="/leaderboard" />
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {!token && (
            <Link
              to="/login"
              className="px-4 py-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              Login
            </Link>
          )}

          {token && (
            <Avatar>
              <AvatarImage src={user?.avatar || "https://github.com/shadcn.png"} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
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
  return (
    <Link
      to={to}
      className="group relative text-gray-400 hover:text-white transition"
    >
      {label}
      <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-indigo-500 transition-all group-hover:w-full" />
    </Link>
  );
}

/* ---------------- Mobile Nav ---------------- */

function MobileNav({ closeSheet, token }: { closeSheet: () => void, token:string | null }) {
  return (
    <div className="flex flex-col gap-6 mt-10">
      <MobileNavItem to="/problems" label="Problems" onClick={closeSheet} />
      <MobileNavItem to="/contests" label="Contests" onClick={closeSheet} />
      <MobileNavItem to="/discuss" label="Discuss" onClick={closeSheet} />
      <MobileNavItem
        to="/leaderboard"
        label="Leaderboard"
        onClick={closeSheet}
      />

      <div className="pt-6 border-t border-gray-800">
        {!token &&
        <Link
          to="/login"
          onClick={closeSheet}
          className="block w-full text-center px-4 py-3 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition"
        >
          Login
        </Link>
        }
      </div>
    </div>
  );
}

function MobileNavItem({
  to,
  label,
  onClick,
}: {
  to: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-gray-300 hover:text-white text-lg transition"
    >
      {label}
    </Link>
  );
}
