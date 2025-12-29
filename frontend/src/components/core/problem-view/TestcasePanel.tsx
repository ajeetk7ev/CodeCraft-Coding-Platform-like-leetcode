import { useEffect, useState } from "react";

/* ---------- types ---------- */

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

type RunTestcase = {
  stdin: string;
  expectedOutput: string;
};

interface Props {
  testcases: Testcase[];
  examples: Example[];
  result: any;
  onChange: (cases: RunTestcase[]) => void;
}

/* ---------- helpers ---------- */

const extractKeys = (input = "") =>
  input.split(",").map((p) => p.split("=")[0].trim());

const buildInputs = (example: string, value = "") => {
  const keys = extractKeys(example);
  const values = value.split(",");

  return keys.map((k, i) => ({
    key: k,
    value: values[i]?.trim() || "",
  }));
};

/* ====================================================== */

export default function TestcasePanel({
  testcases,
  examples,
  result,
  onChange,
}: Props) {
  const [activeTab, setActiveTab] =
    useState<"testcase" | "result">("testcase");
  const [activeCase, setActiveCase] = useState(0);
  const [cases, setCases] = useState<ParsedInput[][]>([]);

  /* ---------- init testcases ---------- */
  useEffect(() => {
    const baseExample = examples?.[0]?.input ?? "x";

    const parsed = testcases.map((tc) =>
      buildInputs(baseExample, tc.input)
    );

    setCases(parsed);
    setActiveCase(0);

    onChange(
      testcases.map((tc) => ({
        stdin: tc.input ?? "",
        expectedOutput: tc.output ?? "",
      }))
    );
  }, [testcases, examples]);

  /* ---------- detect result type ---------- */
  const isRunResult = result?.results;
  const isSubmitResult = result?.testcaseResults;

  return (
    <div className="h-64 bg-gray-800 border-t border-gray-800 flex flex-col text-sm">
      {/* Tabs */}
      <div className="flex gap-6 px-4 pt-3 border-b border-gray-800">
        {["testcase", "result"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 ${
              activeTab === tab
                ? "border-b-2 border-green-500 text-white"
                : "text-gray-400"
            }`}
          >
            {tab === "testcase" ? "Testcase" : "Result"}
          </button>
        ))}
      </div>

      {/* ================= TESTCASES ================= */}
      {activeTab === "testcase" && (
        <>
          <div className="flex gap-2 px-4 py-3">
            {cases.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCase(idx)}
                className={`px-3 py-1 rounded-md ${
                  activeCase === idx
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Case {idx + 1}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
            {cases[activeCase]?.map((input, idx) => (
              <div key={idx}>
                <div className="text-gray-400 mb-1">
                  {input.key} =
                </div>
                <input
                  value={input.value}
                  readOnly
                  disabled
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-300"
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= RESULTS ================= */}
      {activeTab === "result" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {!result && (
            <div className="text-gray-400 text-center">
              Run or submit your code to see results
            </div>
          )}

          {/* ---------- RUN RESULT ---------- */}
          {isRunResult &&
            result.results.map((r: any, idx: number) => (
              <div
                key={idx}
                className="bg-gray-800 border border-gray-700 rounded-md p-3"
              >
                <div className="flex justify-between mb-1">
                  <span>Case {r.testcase}</span>
                  <span
                    className={
                      r.verdict === "ACCEPTED"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {r.verdict}
                  </span>
                </div>

                <div className="text-xs text-gray-400">
                  Output: {r.stdout}
                </div>
              </div>
            ))}

          {/* ---------- SUBMIT RESULT ---------- */}
          {isSubmitResult && (
            <>
              {/* Overall verdict */}
              <div className="flex justify-between text-sm mb-2">
                <span>Status: {result.status}</span>
                <span
                  className={
                    result.verdict === "ACCEPTED"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {result.verdict}
                </span>
              </div>

              {/* Per testcase */}
              {result.testcaseResults.map((tc: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-gray-800 border border-gray-700 rounded-md p-3"
                >
                  <div className="flex justify-between mb-1">
                    <span>Case {idx + 1}</span>
                    <span
                      className={
                        tc.passed
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {tc.passed ? "PASSED" : "FAILED"}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400 space-y-1">
                    {tc.input && (
                      <div>Input: {tc.input}</div>
                    )}
                    {tc.expectedOutput && (
                      <div>
                        Expected: {tc.expectedOutput}
                      </div>
                    )}
                    <div>Output: {tc.userOutput}</div>
                    <div>
                      Runtime: {tc.runtime} ms | Memory:{" "}
                      {tc.memory} KB
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="text-xs text-gray-400 mt-3">
                Total Runtime: {result.totalRuntime} ms | Total
                Memory: {result.totalMemory} KB
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
