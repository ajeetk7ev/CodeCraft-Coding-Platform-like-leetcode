import { useEffect, useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { API_URL } from "@/utils/api";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";



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

interface ProblemSubmissionProps {
  problemId: string;
}

export default function ProblemSubmission({ problemId }: ProblemSubmissionProps) {
  const ITEMS_PER_PAGE = 6;
  const token = useAuthStore((s) => s.token);

  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/submissions/my-submissions`, {
          params: { problemId },
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
  }, [token, problemId]);

  const totalPages = Math.max(1, Math.ceil(submissions.length / ITEMS_PER_PAGE));
  const start = (page - 1) * ITEMS_PER_PAGE;
  const currentData = submissions.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
          <span className="w-1 h-5 bg-indigo-500 rounded-full" />
          My Submissions
        </h2>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {loading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <SkeletonRow key={i} />
          ))
          : error ? (
            <div className="text-red-400 text-sm p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
              {error}
            </div>
          )
            : currentData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <p className="text-sm">No submissions yet for this problem.</p>
              </div>
            )
              : currentData.map((s) => (
                <div
                  key={s._id}
                  onClick={() => setSelected(s)}
                  className="group cursor-pointer rounded-xl border border-gray-800 bg-gray-900/40 p-4 hover:bg-gray-800/60 hover:border-gray-700 transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${s.verdict === 'ACCEPTED' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={`text-sm font-semibold ${s.verdict === 'ACCEPTED' ? 'text-green-400' : 'text-red-400'}`}>
                        {s.verdict}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatDate(s.createdAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-950/50 rounded px-2 py-1.5 border border-gray-800/50 text-gray-400 flex justify-between">
                      <span>Lang</span>
                      <span className="text-gray-200 font-medium font-mono">{s.language}</span>
                    </div>
                    <div className="bg-gray-950/50 rounded px-2 py-1.5 border border-gray-800/50 text-gray-400 flex justify-between">
                      <span>Time</span>
                      <span className="text-gray-200 font-medium font-mono">{s.totalRuntime ?? "-"} ms</span>
                    </div>
                    <div className="bg-gray-950/50 rounded px-2 py-1.5 border border-gray-800/50 text-gray-400 flex justify-between">
                      <span>Mem</span>
                      <span className="text-gray-200 font-medium font-mono">{s.totalMemory ?? "-"} KB</span>
                    </div>
                  </div>
                </div>
              ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-2 border-t border-gray-800/50">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>

          <span className="text-xs text-gray-500 font-mono">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* ---------------- MODAL ---------------- */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelected(null)}
          />

          <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#0a0a0a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">Submission Details</h3>
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${selected.verdict === 'ACCEPTED'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                  {selected.verdict}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (!selected?.code) return;
                    try {
                      await navigator.clipboard.writeText(selected.code);
                      toast.success("Code copied!");
                    } catch (err) {
                      toast.error("Failed to copy");
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                >
                  Copy Code
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Language</div>
                  <div className="text-sm font-mono text-gray-200">{selected.language}</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Runtime</div>
                  <div className="text-sm font-mono text-gray-200">{selected.totalRuntime ?? "-"} ms</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Memory</div>
                  <div className="text-sm font-mono text-gray-200">{selected.totalMemory ?? "-"} KB</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Date</div>
                  <div className="text-sm text-gray-200">{formatDate(selected.createdAt)}</div>
                </div>
              </div>

              {/* Test Cases */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Test Cases</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.isArray(selected.testcaseResults) && selected.testcaseResults.length > 0 ? (
                    selected.testcaseResults.map((t: any, i: number) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between ${t.passed
                          ? "bg-green-500/5 border-green-500/10 text-green-400"
                          : "bg-red-500/5 border-red-500/10 text-red-400"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${t.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span>Test {i + 1}</span>
                        </div>
                        <div className="font-mono opacity-80">{t.runtime}ms</div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-sm text-gray-500 italic">No testcase details available</div>
                  )}
                </div>
              </div>

              {/* Code Editor */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Source Code</h4>
                <div className="border border-gray-800 rounded-xl overflow-hidden">
                  <Editor
                    height="400px"
                    defaultLanguage={mapLanguageToMonaco(selected.language)}
                    language={mapLanguageToMonaco(selected.language)}
                    value={selected.code || ""}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      padding: { top: 16, bottom: 16 }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
