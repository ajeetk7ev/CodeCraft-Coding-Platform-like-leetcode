import { Button } from "@/components/ui/button";
import {
  Play,
  Upload,
  ChevronDown,
  ArrowLeft,
  Settings,
  Maximize2,
  Minimize2,
  LoaderCircle,
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
    <div className="flex justify-between items-center px-3 py-2 bg-gray-900 border-b border-gray-800">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/problems")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Problem List</span>
        </button>

        {/* Language Selector */}
        <div className="relative">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-gray-800 text-gray-200 text-sm border border-gray-700 rounded-md px-3 py-1.5 pr-7 outline-none"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={runCodeLoading || submitCodeLoading}
          onClick={onRun}
          className="text-green-400 hover:bg-green-500/10"
        >
          {runCodeLoading ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />

            </>
          ) : (
            <>
              <Play size={16} />
              Run
            </>
          )}
        </Button>

        <Button
          size="sm"
          disabled={runCodeLoading || submitCodeLoading}
          onClick={onSubmit}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {submitCodeLoading ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload size={16} />
              Submit
            </>
          )}
        </Button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          onClick={onToggleSettings}
          className="text-gray-400 hover:text-white"
        >
          <Settings size={18} />
        </Button>

        <Button
          size="icon"
          onClick={onToggleFullscreen}
          className="text-gray-400 hover:text-white"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </Button>
      </div>
    </div>
  );
}
