import Editor from "@monaco-editor/react";
import { useRef, useState, useEffect } from "react";
import CodePanelHeader from "./CodePanelHeader";
import type { Boilerplate } from "@/types";
import { setToLocalStorage } from "@/utils/localstorage";
import { getFromLocalStorage } from "@/utils/localstorage";

interface Props {
  boilerplates: Boilerplate[];
  loading: boolean;
  onRun: (code: string, language: string) => void;
  onSubmit: (code: string, language: string) => void;
}

export default function CodePanel({
  boilerplates,
  loading,
  onRun,
  onSubmit,
}: Props) {
  const initialLanguage =
   getFromLocalStorage("language") || boilerplates[0].language;

  const [language, setLanguage] = useState(initialLanguage);

  const editorRef = useRef<any>(null);
  const codeRef = useRef("");

  // 🔹 Load code on mount / language change
  useEffect(() => {
    const savedCode = getFromLocalStorage(`code:${language}`);
    const bp = boilerplates.find((b) => b.language === language);

    codeRef.current = savedCode || bp?.userCodeTemplate || "";

    if (editorRef.current) {
      editorRef.current.setValue(codeRef.current);
    }
  }, [language, boilerplates]);

  const changeLang = (lang: string) => {
    setLanguage(lang);
    setToLocalStorage("language", lang);
  };

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    editor.setValue(codeRef.current);
  };

  return (
    <div className="h-full flex flex-col border-l border-gray-800">
      <CodePanelHeader
        language={language}
        onLanguageChange={changeLang}
        onRun={() => onRun(codeRef.current, language)}
        onSubmit={() => onSubmit(codeRef.current, language)}
        loading={loading}
      />

      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        onMount={handleEditorMount}
        onChange={(v) => {
          const value = v || "";
          codeRef.current = value;
          setToLocalStorage(`code:${language}`, value);
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
}
