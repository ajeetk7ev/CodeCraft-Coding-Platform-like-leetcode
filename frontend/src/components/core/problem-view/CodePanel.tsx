import Editor from "@monaco-editor/react";
import { useState } from "react";
import CodePanelHeader from "./CodePanelHeader";
import type { Boilerplate } from "@/types";

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
  const [language, setLanguage] = useState(boilerplates[0].language);
  const [code, setCode] = useState(boilerplates[0].userCodeTemplate);

  const changeLang = (lang: string) => {
    setLanguage(lang);
    const bp = boilerplates.find((b) => b.language === lang);
    if (bp) setCode(bp.userCodeTemplate);
  };

  return (
    <div className="h-full flex flex-col border-l border-gray-800">
      <CodePanelHeader
        language={language}
        onLanguageChange={changeLang}
        onRun={() => onRun(code, language)}
        onSubmit={() => onSubmit(code, language)}
        loading={loading}
      />

      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(v) => setCode(v || "")}
        options={{ minimap: { enabled: false }, fontSize: 14 }}
      />
    </div>
  );
}
