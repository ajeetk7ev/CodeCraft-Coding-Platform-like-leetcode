import { useEffect, useState } from "react";
import { Plus, Trash } from "lucide-react";

type Testcase = {
  input?: string;
  output?: string;
};

type Example = {
  input: string;
};

type ParsedInput = {
  key: string;
  value: string;
};

type UITestcase = {
  id: string;
  inputs: ParsedInput[];
  isCustom: boolean;
};

/* ---------- helpers ---------- */

// Extract keys from example input
function extractKeys(exampleInput = ""): string[] {
  return exampleInput
    .split(",")
    .map((p) => p.split("=")[0].trim());
}

// Combine example keys + testcase values
function buildInputs(exampleInput: string, testcaseInput = ""): ParsedInput[] {
  const keys = extractKeys(exampleInput);

  if (keys.length === 1) {
    return [{ key: keys[0], value: testcaseInput }];
  }

  const values = testcaseInput.split(",").map((v) => v.trim());

  return keys.map((key, i) => ({
    key,
    value: values[i] ?? "",
  }));
}

export default function TestcasePanel({
  testcases,
  examples,
}: {
  testcases: Testcase[];
  examples: Example[];
}) {
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");
  const [activeCase, setActiveCase] = useState(0);
  const [uiCases, setUiCases] = useState<UITestcase[]>([]);



  /* ---------- init from backend ---------- */
  useEffect(() => {
    const baseExample = examples?.[0]?.input ?? "x";

    const initialCases = testcases.map((tc, idx) => ({
      id: `backend-${idx}`,
      inputs: buildInputs(baseExample, tc.input),
      isCustom: false,
    }));

    setUiCases(initialCases);
    setActiveCase(0);
  }, [testcases, examples]);

  const currentCase = uiCases[activeCase];

  /* ---------- add custom ---------- */
  function addCustomCase() {
    if (!uiCases[0]) return;

    setUiCases((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        inputs: prev[0].inputs.map((i) => ({ ...i, value: "" })),
        isCustom: true,
      },
    ]);

    setActiveCase(uiCases.length);
  }

  /* ---------- remove ---------- */
  function removeCase(index: number) {
    if (!uiCases[index]?.isCustom) return;

    const updated = uiCases.filter((_, i) => i !== index);
    setUiCases(updated);
    setActiveCase(Math.max(0, index - 1));
  }

  /* ---------- reset ---------- */
  function resetCase() {
    if (!currentCase || currentCase.isCustom) return;

    const baseExample = examples?.[0]?.input ?? "x";
    const originalInput = testcases[activeCase]?.input ?? "";

    const updated = [...uiCases];
    updated[activeCase] = {
      ...updated[activeCase],
      inputs: buildInputs(baseExample, originalInput),
    };

    setUiCases(updated);
  }

  return (
    <div className="h-64 bg-gray-900 border-t border-gray-800 text-sm flex flex-col">
      {/* Tabs */}
      <div className="flex gap-6 px-4 pt-3 border-b border-gray-800">
        {["testcase", "result"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 ${
              activeTab === tab
                ? "text-white border-b-2 border-green-500"
                : "text-gray-400"
            }`}
          >
            {tab === "testcase" ? "Testcase" : "Test Result"}
          </button>
        ))}
      </div>

      {activeTab === "testcase" && (
        <>
          {/* Case buttons */}
          <div className="flex gap-2 px-4 py-3">
            {uiCases.map((tc, idx) => (
              <div key={tc.id} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveCase(idx)}
                  className={`px-3 py-1 rounded-md ${
                    activeCase === idx
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  Case {idx + 1}
                </button>

                {tc.isCustom && (
                  <button
                    onClick={() => removeCase(idx)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash size={14} />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addCustomCase}
              className="text-gray-400 hover:text-white px-2"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Inputs */}
          <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
            {currentCase?.inputs.map((input, idx) => (
              <div key={idx}>
                <div className="text-gray-400 mb-1">{input.key} =</div>
                <input
                  value={input.value}
                  onChange={(e) => {
                    const updated = [...uiCases];
                    updated[activeCase].inputs[idx].value = e.target.value;
                    setUiCases(updated);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-200 outline-none"
                />
              </div>
            ))}

            {!currentCase?.isCustom && (
              <button
                onClick={resetCase}
                className="text-xs text-gray-500 hover:underline"
              >
                Reset Testcase
              </button>
            )}
          </div>
        </>
      )}

      {activeTab === "result" && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          You must run your code first
        </div>
      )}
    </div>
  );
}
