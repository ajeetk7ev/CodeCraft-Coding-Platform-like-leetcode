import { Code2, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Code2 className="text-indigo-400" />
          <span className="text-lg font-bold tracking-tight text-white">
            CodeArena
          </span>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <NavItem label="Problems" />
          <NavItem label="Contests" />
          <NavItem label="Discuss" />
          <NavItem label="Leaderboard" />
        </nav>

        {/* Right: Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon">
                <Menu className="h-6 w-6 text-gray-300" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="bg-gray-950 border-gray-800">
              {/* Close Button */}
              <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-gray-950 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <X className="h-5 w-5 text-gray-300" />
              </SheetClose>

              {/* Content */}
              <div className="mt-16 px-6">
                <MobileNav />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function NavItem({ label }: { label: string }) {
  return (
    <button className="group relative text-gray-400 hover:text-white transition">
      {label}
      <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-indigo-500 transition-all group-hover:w-full" />
    </button>
  );
}

function MobileNav() {
  return (
    <div className="flex flex-col gap-6 mt-10">
      <Link className="text-gray-300 hover:text-white text-lg" to="/">
        Problems
      </Link>
      <Link className="text-gray-300 hover:text-white text-lg" to="/">
        Contests
      </Link>
      <Link className="text-gray-300 hover:text-white text-lg" to="/">
        Discuss
      </Link>
      <Link className="text-gray-300 hover:text-white text-lg" to="/">
        Leaderboard
      </Link>

      <div className="pt-6 border-t border-gray-800">
        <Link
          to="/login"
          className="block w-full text-center px-4 py-3 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
