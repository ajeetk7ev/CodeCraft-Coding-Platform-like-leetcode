import { useEffect, useState } from "react";
import { Plus, Trash } from "lucide-react";

type Testcase = {
  input?: string;
  output?: string;
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

/* ---------------- Helper: Parse input string ---------------- */
function parseInput(input = ""): ParsedInput[] {
  return input
    .split(",")
    .map((part) => part.trim())
    .map((part) => {
      const [key, value] = part.split("=").map((s) => s.trim());
      return { key, value };
    });
}

/* ---------------- Helper: Convert inputs back to string ---------------- */
function stringifyInput(inputs: ParsedInput[]) {
  return inputs.map((i) => `${i.key} = ${i.value}`).join(", ");
}

export default function TestcasePanel({
  testcases,
}: {
  testcases: Testcase[];
}) {
  const backendCases = testcases.filter((t) => !t.isHidden);

  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");
  const [activeCase, setActiveCase] = useState(0);
  const [uiCases, setUiCases] = useState<UITestcase[]>([]);

  /* ---------------- Init UI cases from backend ---------------- */
  useEffect(() => {
    const initialCases: UITestcase[] = backendCases.map((tc, idx) => ({
      id: `backend-${idx}`,
      inputs: parseInput(tc.input),
      isCustom: false,
    }));
    setUiCases(initialCases);
  }, [testcases]);

  const currentCase = uiCases[activeCase];

  /* ---------------- Add Custom Case ---------------- */
  function addCustomCase() {
    const baseInputs =
      backendCases[0]?.input
        ? parseInput(backendCases[0].input)
        : [{ key: "x", value: "" }];

    const newCase: UITestcase = {
      id: `custom-${Date.now()}`,
      inputs: baseInputs,
      isCustom: true,
    };

    setUiCases((prev) => [...prev, newCase]);
    setActiveCase(uiCases.length);
  }

  /* ---------------- Remove Case ---------------- */
  function removeCase(index: number) {
    if (!uiCases[index]?.isCustom) return;

    const updated = uiCases.filter((_, i) => i !== index);
    setUiCases(updated);
    setActiveCase(Math.max(0, index - 1));
  }

  /* ---------------- Reset Case ---------------- */
  function resetCase() {
    if (!currentCase || currentCase.isCustom) return;

    const original = backendCases[activeCase]?.input;
    if (!original) return;

    const updated = [...uiCases];
    updated[activeCase] = {
      ...updated[activeCase],
      inputs: parseInput(original),
    };
    setUiCases(updated);
  }

  return (
    <div className="h-64 bg-gray-900 border-t border-gray-800 text-sm flex flex-col">
      {/* Top Tabs */}
      <div className="flex items-center gap-6 px-4 pt-3 border-b border-gray-800">
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
          {/* Case Tabs */}
          <div className="flex items-center gap-2 px-4 py-3">
            {uiCases.map((tc, idx) => (
              <div key={tc.id} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveCase(idx)}
                  className={`px-3 py-1 rounded-md text-sm ${
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
                <div className="text-gray-400 mb-1">
                  {input.key} =
                </div>
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

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
              <span>{"</>"} Source</span>

              {!currentCase?.isCustom && (
                <button onClick={resetCase} className="hover:underline">
                  Reset Testcase
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Result Tab */}
      {activeTab === "result" && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          You must run your code first
        </div>
      )}
    </div>
  );
}
