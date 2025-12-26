import Editor from "@monaco-editor/react";
import { useState } from "react";
import CodePanelHeader from "./CodePanelHeader";
import type{ Boilerplate } from "@/types";

export default function CodePanel({
  boilerplates,
}: {
  boilerplates: Boilerplate[];
}) {
  const [language, setLanguage] = useState(boilerplates[0].language);
  const [code, setCode] = useState(boilerplates[0].userCodeTemplate);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);

    const bp = boilerplates.find((b) => b.language === lang);
    if (bp) {
      setCode(bp.userCodeTemplate);
    }
  };

  return (
    <div className="flex flex-col h-full border-l border-gray-800">
      {/* Header */}
      <CodePanelHeader
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Monaco Editor */}
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(v) => setCode(v || "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}
