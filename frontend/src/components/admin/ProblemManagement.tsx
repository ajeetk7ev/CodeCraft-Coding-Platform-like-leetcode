import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/api";
import {
  Eye,
  ToggleLeft,
  ToggleRight,
  Search,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import toast from "react-hot-toast";

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  published: boolean;
  createdBy: {
    username: string;
  };
  createdAt: string;
}

interface ProblemDetails extends Problem {
  description: string;
  constraints: string[];
  examples: any[];
  tags: string[];
  stats: {
    totalSubmissions: number;
    acceptedSubmissions: number;
  };
}

const ProblemManagement = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProblemDetails | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);


  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append("limit", "100");
      if (search) params.append("search", search);

      const res = await axios.get(`${API_URL}/problems?${params}`);
      console.log(res.data);
      setProblems(res.data.data);
    } catch (err) {
      console.error("Failed to load problems:", err);
      setError("Failed to load problems. Using demo data.");
      // Set demo data as fallback
      setProblems([
        {
          _id: "demo1",
          title: "Two Sum",
          slug: "two-sum",
          difficulty: "easy",
          published: true,
          createdBy: { username: "admin" },
          createdAt: new Date().toISOString(),
        },
        {
          _id: "demo2",
          title: "Add Two Numbers",
          slug: "add-two-numbers",
          difficulty: "medium",
          published: true,
          createdBy: { username: "admin" },
          createdAt: new Date().toISOString(),
        },
        {
          _id: "demo3",
          title: "Longest Substring Without Repeating Characters",
          slug: "longest-substring-without-repeating-characters",
          difficulty: "medium",
          published: false,
          createdBy: { username: "admin" },
          createdAt: new Date().toISOString(),
        },
      ]);
      toast.error("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [search]);


  const togglePublish = async (id: string, published: boolean) => {
    try {
      await axios.patch(`${API_URL}/admin/problems/${id}/publish`, {
        published: !published,
      });
      toast.success(published ? "Unpublished" : "Published");
      fetchProblems();
    } catch (err: any) {
      console.error("Failed to toggle publish status:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Admin authentication required");
      } else {
        toast.error("Action failed");
      }
    }
  };

  const previewProblem = async (slug: string) => {
    try {
      const res = await axios.get(`${API_URL}/problems/${slug}`);
      setSelected(res.data.data || res.data);
      setPreviewOpen(true);
    } catch {
      toast.error("Failed to load problem");
    }
  };

  const difficultyBadge = (d: string) => {
    if (d === "easy") return "bg-emerald-500/10 text-emerald-400";
    if (d === "medium") return "bg-yellow-500/10 text-yellow-400";
    return "bg-red-500/10 text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems..."
            className="pl-9 bg-slate-950 border-slate-800"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Problem</th>
              <th className="px-6 py-3">Difficulty</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created By</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                    Loading problems...
                  </div>
                </td>
              </tr>
            ) : problems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No problems found
                </td>
              </tr>
            ) : (
              problems.map((p) => (
                <tr
                  key={p._id}
                  className="hover:bg-slate-800/60 transition"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-slate-400">/{p.slug}</div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${difficultyBadge(
                        p.difficulty
                      )}`}
                    >
                      {p.difficulty}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        p.published
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {p.createdBy.username}
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => previewProblem(p.slug)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => togglePublish(p._id, p.published)}
                    >
                      {p.published ? (
                        <ToggleRight className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-slate-400" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl bg-slate-900 border border-slate-800">
          <DialogHeader>
            <DialogTitle>Problem Preview</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{selected.title}</h2>
                <div className="flex gap-3 mt-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${difficultyBadge(
                      selected.difficulty
                    )}`}
                  >
                    {selected.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">
                    By {selected.createdBy.username}
                  </span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-sm">
                <div
                  dangerouslySetInnerHTML={{
                    __html: selected.description,
                  }}
                />
              </div>

              {selected.constraints?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Constraints</h4>
                  <ul className="list-disc list-inside text-sm text-slate-300">
                    {selected.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selected.tags.map((t, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-indigo-500/10 text-indigo-400 px-2 py-1 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="rounded-lg bg-slate-800 p-4 text-center">
                  <div className="text-xl font-bold">
                    {selected.stats.totalSubmissions}
                  </div>
                  <div className="text-xs text-slate-400">
                    Submissions
                  </div>
                </div>
                <div className="rounded-lg bg-slate-800 p-4 text-center">
                  <div className="text-xl font-bold">
                    {selected.stats.acceptedSubmissions}
                  </div>
                  <div className="text-xs text-slate-400">
                    Accepted
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProblemManagement;
