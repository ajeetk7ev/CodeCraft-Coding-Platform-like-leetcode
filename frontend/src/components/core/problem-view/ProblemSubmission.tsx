import { useEffect, useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { API_URL } from "@/utils/api";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

const verdictStyle = (v: string) =>
  v === "ACCEPTED"
    ? "text-green-400 bg-green-400/10 border-green-400/30"
    : "text-red-400 bg-red-400/10 border-red-400/30";

const formatDate = (d: string) => new Date(d).toLocaleString();

const SkeletonRow = () => (
  <div className="animate-pulse h-16 bg-gray-900 rounded-xl" />
);

const mapLanguageToMonaco = (lang?: string) => {
  if (!lang) return "plaintext";
  const l = lang.toLowerCase();
  if (l.startsWith("py")) return "python";
  if (l === "js" || l === "javascript") return "javascript";
  if (l === "ts" || l === "typescript") return "typescript";
  if (l === "cpp" || l === "c++") return "cpp";
  if (l === "c") return "c";
  if (l === "java") return "java";
  return l;
};

export default function ProblemSubmission() {
  const ITEMS_PER_PAGE = 6;

  const token = useAuthStore((s) => s.token);

  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  console.log("submissions", submissions);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/submissions/my-submissions`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        setSubmissions(res.data.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [token]);

  const totalPages = Math.max(1, Math.ceil(submissions.length / ITEMS_PER_PAGE));
  const start = (page - 1) * ITEMS_PER_PAGE;
  const currentData = submissions.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 relative">
      <h2 className="text-xl font-semibold text-gray-200">My Submissions</h2>

      {/* LIST */}
      <div className="space-y-4">
        {loading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <SkeletonRow key={i} />
            ))
          : error
          ? (
              <div className="text-red-400 text-sm">{error}</div>
            )
          : currentData.map((s) => (
              <div
                key={s._id}
                onClick={() => setSelected(s)}
                className="cursor-pointer rounded-xl border border-gray-800 bg-gray-950 p-4 hover:bg-gray-900/60 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-indigo-400 font-medium">
                      {s.problem?.title}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {s.problem?.difficulty}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full border text-xs ${verdictStyle(
                      s.verdict
                    )}`}
                  >
                    {s.verdict}
                  </span>
                </div>

                <div className="mt-3 flex gap-6 text-xs text-gray-400">
                  <span>{(s.language || "").toUpperCase()}</span>
                  <span>{s.totalRuntime ?? "-"} ms</span>
                  <span>{s.totalMemory ?? "-"} KB</span>
                  <span>{formatDate(s.createdAt)}</span>
                </div>
              </div>
            ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end items-center gap-3">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 text-sm rounded-md border border-gray-700 text-gray-300 disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-sm text-gray-400">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 text-sm rounded-md border border-gray-700 text-gray-300 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* ---------------- MODAL ---------------- */}
      {selected && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelected(null)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-950 border border-gray-800 rounded-xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-200">Submission Details</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      const code = selected?.code || "";
                      if (!code) {
                        toast.error("No code to copy");
                        return;
                      }
                      try {
                        await navigator.clipboard.writeText(code);
                        toast.success("Code copied to clipboard");
                      } catch (err) {
                        // fallback
                        const ta = document.createElement("textarea");
                        ta.value = code;
                        document.body.appendChild(ta);
                        ta.select();
                        try {
                          document.execCommand("copy");
                          toast.success("Code copied to clipboard");
                        } catch (e) {
                          toast.error("Failed to copy code");
                        }
                        document.body.removeChild(ta);
                      }
                    }}
                    className="px-3 py-1 text-sm rounded-md border border-gray-700 text-gray-300 hover:bg-gray-900/40"
                  >
                    Copy
                  </button>

                  <button
                    onClick={() => setSelected(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
            </div>

            {/* META */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div>Language: {selected.language}</div>
              <div>Verdict: {selected.verdict}</div>
              <div>Runtime: {selected.totalRuntime ?? "-"} ms</div>
              <div>Memory: {selected.totalMemory ?? "-"} KB</div>
              <div className="col-span-2 text-gray-500">{formatDate(selected.createdAt)}</div>
            </div>

            {/* TESTCASES */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-200 mb-3">Testcases</h4>
              <div className="space-y-2">
                {Array.isArray(selected.testcaseResults) && selected.testcaseResults.length > 0 ? (
                  selected.testcaseResults.map((t: any, i: number) => (
                    <div
                      key={i}
                      className={`p-3 rounded-md border text-xs ${
                        t.passed
                          ? "border-green-400/30 bg-green-400/10 text-green-400"
                          : "border-red-400/30 bg-red-400/10 text-red-400"
                      }`}
                    >
                      Testcase {i + 1} – {t.passed ? "Passed" : "Failed"} | {t.runtime} ms | {t.memory} KB
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No testcase results</div>
                )}
              </div>
            </div>

            {/* CODE (Monaco) */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-200 mb-2">Code</h4>
              <div className="border border-gray-800 rounded-md overflow-hidden">
                <Editor
                  height="60vh"
                  defaultLanguage={mapLanguageToMonaco(selected.language)}
                  language={mapLanguageToMonaco(selected.language)}
                  value={selected.code || ""}
                  theme="vs-dark"
                  options={{ readOnly: true, minimap: { enabled: false } }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
