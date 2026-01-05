import Editor from "@monaco-editor/react";
import { useRef, useState, useEffect } from "react";
import CodePanelHeader from "./CodePanelHeader";
import type { Boilerplate } from "@/types";
import { setToLocalStorage, getFromLocalStorage } from "@/utils/localstorage";

interface Props {
  boilerplates: Boilerplate[];
  problemSlug: string;
  runCodeLoading: boolean;
  submitCodeLoading: boolean;
  onRun: (code: string, language: string) => void;
  onSubmit: (code: string, language: string) => void;
}

export default function CodePanel({
  boilerplates,
  problemSlug,
  runCodeLoading,
  submitCodeLoading,
  onRun,
  onSubmit,
}: Props) {
  const initialLanguage =
    getFromLocalStorage("language") || boilerplates[0].language;

  const [language, setLanguage] = useState(initialLanguage);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(
    Number(getFromLocalStorage("fontSize")) || 14
  );

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

  const applySettings = () => {
    setToLocalStorage("fontSize", String(fontSize));
    editorRef.current?.updateOptions({ fontSize });
    setShowSettings(false);
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
            className="mt-3 w-full bg-green-600 hover:bg-green-700 text-black py-1.5 rounded text-sm"
          >
            Apply
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
