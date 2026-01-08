import Editor from "@monaco-editor/react";

export default function MonacoEditorField({
  label,
  value,
  onChange,
}: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-400">{label}</label>
      <div className="border border-slate-800 rounded overflow-hidden">
        <Editor
          height="200px"
          language="cpp"
          theme="vs-dark"
          value={value}
          onChange={(v) => onChange(v || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </div>
    </div>
  );
}
