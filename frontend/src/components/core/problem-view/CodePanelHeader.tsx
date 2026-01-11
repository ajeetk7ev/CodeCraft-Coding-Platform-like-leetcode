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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  isFullscreen: boolean;
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
  isFullscreen,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center px-4 py-2 bg-[#0f172a] border-b border-[#1e293b] shadow-sm z-30">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/problems")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden lg:inline">Problems</span>
        </button>

        <div className="h-6 w-[1px] bg-gray-800 mx-1 hidden sm:block" />

        {/* Language Selector */}
        <div className="relative group">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="appearance-none bg-[#1e293b] text-gray-200 text-xs font-medium border border-[#334155] rounded-md px-3 py-1.5 pr-8 outline-none hover:border-gray-600 transition-all cursor-pointer min-w-[120px]"
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
          className="h-8 text-gray-300 hover:text-white hover:bg-white/10 px-4 gap-2 transition-all font-semibold text-xs active:scale-95"
        >
          {runCodeLoading ? (
            <LoaderCircle size={14} className="animate-spin text-indigo-400" />
          ) : (
            <Play size={14} className="fill-current text-gray-400 group-hover:text-white" />
          )}
          Run
        </Button>

        <Button
          size="sm"
          disabled={runCodeLoading || submitCodeLoading}
          onClick={onSubmit}
          className="h-8 bg-green-600 hover:bg-green-500 text-white px-5 gap-2 transition-all font-bold text-xs shadow-lg shadow-green-900/10 active:scale-95"
        >
          {submitCodeLoading ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          <span className="hidden xs:inline">Submit</span>
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
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
  );
}
