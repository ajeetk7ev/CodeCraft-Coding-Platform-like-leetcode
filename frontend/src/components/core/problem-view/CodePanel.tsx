import Editor from "@monaco-editor/react";
import { useRef, useState, useEffect } from "react";
import CodePanelHeader from "./CodePanelHeader";
import type { Boilerplate, Preferences } from "@/types";
import { setToLocalStorage, getFromLocalStorage } from "@/utils/localstorage";
import toast from "react-hot-toast";
import { API_URL } from "@/utils/api";
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { LoaderCircle } from "lucide-react";

interface Props {
  boilerplates: Boilerplate[];
  problemSlug: string;
  runCodeLoading: boolean;
  submitCodeLoading: boolean;
  onRun: (code: string, language: string) => void;
  onSubmit: (code: string, language: string) => void;
  preferences: Preferences;
}

export default function CodePanel({
  boilerplates,
  problemSlug,
  runCodeLoading,
  submitCodeLoading,
  onRun,
  onSubmit,
  preferences,
}: Props) {
  const { token } = useAuthStore();
  const initialLanguage =
    getFromLocalStorage("language") || boilerplates[0].language;

  const [language, setLanguage] = useState(initialLanguage);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(preferences?.fontSize || 14);
  const [applySettingsLoading, setApplySettingsLoading] = useState(false);

  const editorRef = useRef<any>(null);
  const codeRef = useRef("");

  // 🔹 Restore code per problem + language
  useEffect(() => {
    const storageKey = `code:${problemSlug}:${language}`;
    const savedCode = getFromLocalStorage(storageKey);
    const bp = boilerplates.find((b) => b.language === language);

    codeRef.current = savedCode || bp?.userCodeTemplate || "";
    editorRef.current?.setValue(codeRef.current);
  }, [language, problemSlug, boilerplates]);

  const applySettings = async () => {
    setApplySettingsLoading(true);
    try {
      const res = await axios.put(
        `${API_URL}/user/preferences`,
        { fontSize },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Settings Applied.");
        editorRef.current?.updateOptions({ fontSize });
        setShowSettings(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    } finally {
      setApplySettingsLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col border-l border-gray-800 bg-gray-900 ${
        isFullscreen ? "fixed inset-0 z-50" : "h-full"
      }`}
    >
      <CodePanelHeader
        language={language}
        onLanguageChange={(l) => {
          setLanguage(l);
          setToLocalStorage("language", l);
        }}
        onRun={() => onRun(codeRef.current, language)}
        onSubmit={() => onSubmit(codeRef.current, language)}
        runCodeLoading={runCodeLoading}
        submitCodeLoading={submitCodeLoading}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onBack={() => setIsFullscreen(false)}
      />

      {/* SETTINGS PANEL */}
      {showSettings && (
        <div className="absolute top-12 right-4 w-64 bg-gray-800 border border-gray-700 rounded-lg p-4 z-50">
          <div className="text-sm text-gray-300 mb-2">Editor Settings</div>

          <label className="text-xs text-gray-400">Font Size</label>
          <input
            type="number"
            min={12}
            max={24}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full mt-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
          />

          <button
            onClick={applySettings}
            disabled={applySettingsLoading}
            className={`
    mt-3 w-full flex items-center justify-center gap-2
    bg-green-600 hover:bg-green-700
    disabled:bg-green-600/60 disabled:cursor-not-allowed
    text-black py-1.5 rounded text-sm
  `}
          >
            {applySettingsLoading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Apply"
            )}
          </button>
        </div>
      )}

      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        onMount={(editor) => {
          editorRef.current = editor;
          editor.updateOptions({ fontSize });
          editor.setValue(codeRef.current);
        }}
        onChange={(v) => {
          const value = v || "";
          codeRef.current = value;
          setToLocalStorage(`code:${problemSlug}:${language}`, value);
        }}
        options={{
          minimap: { enabled: false },
          fontSize,
        }}
      />
    </div>
  );
}
