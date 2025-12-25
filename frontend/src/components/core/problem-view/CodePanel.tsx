import Editor from "@monaco-editor/react";
import { useState } from "react";
import CodePanelHeader from "./CodePanelHeader";

type Boilerplate = {
  language: string;
  userCodeTemplate: string;
};

export default function CodePanel({
  boilerplates,
}: {
  boilerplates: Boilerplate[];
}) {
  const [code, setCode] = useState(boilerplates[0].userCodeTemplate);

  return (
    <div className="flex flex-col h-full border-l border-gray-800">
      {/* Header */}
      <CodePanelHeader/>

      {/* Monaco Editor */}
      <Editor
        height="100%"
        language="cpp"
        theme="vs-dark"
        value={code}
        onChange={(v:any) => setCode(v || "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}
