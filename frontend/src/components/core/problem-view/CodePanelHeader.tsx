import { Button } from "@/components/ui/button";
import {
  Play,
  Upload,
  ChevronDown,
  Settings,
  Maximize2,
  Minimize2,
  LoaderCircle,
  ChevronLeft,
  Home,
  Sparkles,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LANGUAGES = [
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
];

interface Props {
  language: string;
  onLanguageChange: (lang: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  runCodeLoading: boolean;
  submitCodeLoading: boolean;
  onBack: () => void;
  onToggleSettings: () => void;
  onToggleFullscreen: () => void;
  onToggleArena: () => void;
  isFullscreen: boolean;
  isArenaOpen: boolean;
}

export default function CodePanelHeader({
  language,
  onLanguageChange,
  onRun,
  onSubmit,
  runCodeLoading,
  submitCodeLoading,
  onToggleSettings,
  onToggleFullscreen,
  onToggleArena,
  isFullscreen,
  isArenaOpen,
}: Props) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="flex justify-between items-center px-2 py-1 md:px-4 md:py-2 bg-[#0f172a] border-b border-[#1e293b] shadow-sm z-30 transition-all">
      {/* Left Section */}
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          to="/"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e293b] text-gray-400 hover:text-white hover:bg-indigo-600 transition-all"
          title="Home"
        >
          <Home size={16} />
        </Link>

        <button
          onClick={() => navigate("/problems")}
          className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden md:inline">Problems</span>
        </button>

        <div className="h-6 w-[1px] bg-gray-800 mx-1 hidden sm:block" />

        {/* Language Selector */}
        <div className="relative group">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="appearance-none bg-[#1e293b] text-gray-200 text-xs font-medium border border-[#334155] rounded-md px-2 md:px-3 py-1.5 pr-8 outline-none hover:border-gray-600 transition-all cursor-pointer min-w-[100px] md:min-w-[120px]"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-gray-300 transition-colors"
          />
        </div>
      </div>

      {/* Center Action (Only on Desktop maybe, or just keep layout clean) */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={runCodeLoading || submitCodeLoading}
          onClick={onRun}
          className="h-8 text-gray-300 hover:text-white hover:bg-white/10 px-2 md:px-4 gap-2 transition-all font-semibold text-xs active:scale-95"
        >
          {runCodeLoading ? (
            <LoaderCircle size={14} className="animate-spin text-indigo-400" />
          ) : (
            <Play size={14} className="fill-current text-gray-400 group-hover:text-white" />
          )}
          <span className="hidden sm:inline">Run</span>
        </Button>

        <Button
          size="sm"
          disabled={runCodeLoading || submitCodeLoading}
          onClick={onSubmit}
          className="h-8 bg-green-600 hover:bg-green-500 text-white px-3 md:px-5 gap-2 transition-all font-bold text-xs shadow-lg shadow-green-900/10 active:scale-95"
        >
          {submitCodeLoading ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          <span className="hidden sm:inline">Submit</span>
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 md:gap-3">
        {user && (
          <Link to={`/profile/${user.username}`}>
            <Avatar className="h-8 w-8 border border-[#1e293b] hover:border-indigo-500 transition-colors cursor-pointer hidden sm:block">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-indigo-600 text-xs text-white">
                {user.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}

        {user && <div className="hidden sm:block h-5 w-[1px] bg-[#1e293b]" />}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleArena}
            className={`h-8 gap-1.5 px-2 md:px-3 transition-all font-semibold text-xs active:scale-95 ${isArenaOpen
              ? "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 hover:text-indigo-300 border border-indigo-500/30"
              : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <Sparkles size={14} className={isArenaOpen ? "animate-pulse" : ""} />
            <span className="hidden md:inline">Arena</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSettings}
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
          >
            <Settings size={16} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
