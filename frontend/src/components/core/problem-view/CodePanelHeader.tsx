import { Button } from "@/components/ui/button";
import { Play, Upload, ChevronDown } from "lucide-react";

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
  loading: boolean;
}

function CodePanelHeader({ language, onLanguageChange, onRun , onSubmit, loading }: Props) {
  return (
    <div className="flex justify-between items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
      {/* Language Selector */}
      <div className="relative">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="
            bg-gray-800 text-gray-200 text-sm
            border border-gray-700 rounded-md
            px-3 py-1.5 pr-8
            outline-none cursor-pointer
            hover:border-gray-600
            focus:border-indigo-500
          "
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={14}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={onRun}
          className="flex items-center gap-1.5 text-green-400 hover:bg-green-500/10"
        >
          <Play className="h-4 w-4" />
          {loading ? "Running..." : "Run"}
        </Button>

        <Button
          size="sm"
          disabled={loading}
          onClick={onSubmit}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
        >
          <Upload className="h-4 w-4" />
          Submit
        </Button>
      </div>
    </div>
  );
}

export default CodePanelHeader;
