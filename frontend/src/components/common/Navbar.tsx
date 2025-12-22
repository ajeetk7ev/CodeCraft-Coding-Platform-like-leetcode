import { Code2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Code2 className="text-indigo-400" />
          <span className="text-lg font-bold tracking-tight">CodeArena</span>
        </div>

        {/* Center: Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <NavItem label="Problems" />
          <NavItem label="Contests" />
          <NavItem label="Discuss" />
          <NavItem label="Leaderboard" />
        </nav>

        {/* Right: Search + Auth */}
        <div className="flex items-center gap-4">
          {/* Auth Buttons */}
          <Link
            to={"/login"}
            className="px-4 py-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition"
          >
            Login
          </Link>

        </div>
      </div>
    </header>
  );
}

function NavItem({ label }: { label: string }) {
  return (
    <button className="relative text-gray-400 hover:text-white transition">
      {label}
      <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-indigo-500 transition-all group-hover:w-full" />
    </button>
  );
}
