import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import { API_URL } from "@/utils/api";
import {
  Eye,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

const SUPPORTED_LANGUAGES = [
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
];

/* ---------------- TYPES ---------------- */

interface Testcase {
  input: string;
  output: string;
  isHidden: boolean;
}

interface Example {
  input: string;
  output: string;
  explanation: string;
}

interface Boilerplate {
  language: string;
  userCodeTemplate: string;
  fullCodeTemplate: string;
}

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  published: boolean;
}

interface ProblemForm {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  constraints: string[];
  tags: string[];
  examples: Example[];
  companyTags: string[];
  boilerplates: Boilerplate[];
  testcases: Testcase[];
}

/* ---------------- COMPONENT ---------------- */

export default function ProblemManagement() {
  const { token } = useAuthStore();

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "">(
    ""
  );

  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [editing, setEditing] = useState<Problem | null>(null);
  const [previewData, setPreviewData] = useState<ProblemForm | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<ProblemForm>({
    title: "",
    difficulty: "easy",
    description: "",
    constraints: [],
    tags: [],
    examples: [],
    companyTags: [],
    boilerplates: [
      { language: "cpp", userCodeTemplate: "", fullCodeTemplate: "" },
    ],
    testcases: [],
  });

  /* ---------------- API ---------------- */

  const fetchProblems = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/problems/admin`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit,
          search: search || undefined,
          difficulty: difficulty || undefined,
        },
      });

      setProblems(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch {
      toast.error("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [page, search, difficulty]);

  /* ---------------- HELPERS ---------------- */

  const difficultyBadge = (d: Problem["difficulty"]) => {
    if (d === "easy")
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    if (d === "medium")
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    return "bg-red-500/10 text-red-400 border border-red-500/20";
  };

  const resetForm = () => {
    setForm({
      title: "",
      difficulty: "easy",
      description: "",
      constraints: [],
      tags: [],
      companyTags: [],
      examples: [],
      boilerplates: [
        { language: "cpp", userCodeTemplate: "", fullCodeTemplate: "" },
      ],
      testcases: [],
    });
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setFormOpen(true);
  };

  const openEdit = async (problem: Problem) => {
    try {
      const res = await axios.get(
        `${API_URL}/problems/${problem.slug}`,
        authHeaders
      );
      setEditing(problem);
      setForm(res.data.data);
      setFormOpen(true);
    } catch {
      toast.error("Failed to load problem");
    }
  };

  const submitProblem = async () => {
    setIsLoading(true);
    try {
      if (editing) {
        await axios.put(
          `${API_URL}/problems/${editing._id}`,
          form,
          authHeaders
        );
        toast.success("Problem updated");
      } else {
       
        await axios.post(`${API_URL}/problems`, form, authHeaders);
        toast.success("Problem created");
      }
      setFormOpen(false);
      fetchProblems();
    } catch {
      toast.error("Failed to save problem");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublish = async (id: string, published: boolean) => {
    try {
      await axios.patch(
        `${API_URL}/admin/problems/${id}/publish`,
        { published: !published },
        authHeaders
      );
      toast.success(published ? "Unpublished" : "Published");
      fetchProblems();
    } catch {
      toast.error("Publish failed");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Problem Management</h2>

        <Button
          onClick={(e) => {
            e.preventDefault();
            openCreate();
          }}
          className="
 bg-linear-to-r from-emerald-600 to-teal-600
  text-white
  rounded-xl
  px-5 py-2
  shadow-md
  hover:from-emerald-500 hover:to-teal-500
  hover:shadow-lg
  transition-all duration-200
  flex items-center
"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Problem
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Search problems..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="max-w-sm"
        />

        <select
          value={difficulty}
          onChange={(e) => {
            setPage(1);
            setDifficulty(e.target.value as any);
          }}
          className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <table className="min-w-full border-collapse text-sm">
          {/* ---------- HEADER ---------- */}
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Problem</th>

              <th className="px-6 py-3 text-center font-medium">Difficulty</th>

              <th className="px-6 py-3 text-center font-medium">Status</th>

              <th className="px-6 py-3 text-right font-medium w-40">
                Actions
              </th>
            </tr>
          </thead>

          {/* ---------- BODY ---------- */}
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  Loading problems...
                </td>
              </tr>
            ) : (
              problems.map((p) => (
                <tr
                  key={p._id}
                  className="hover:bg-slate-800/60 transition-colors"
                >
                  {/* Problem */}
                  <td className="px-6 py-4 align-middle">
                    <div className="font-medium text-slate-100 hover:text-indigo-400 transition">
                      {p.title}
                    </div>
                  
                  </td>

                  {/* Difficulty */}
                  <td className="px-6 py-4 text-center align-middle">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${difficultyBadge(
                        p.difficulty
                      )}`}
                    >
                      {p.difficulty}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center align-middle">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        p.published
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          openEdit(p);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
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

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setPreviewData(form);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-400">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <Dialog open={formOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-100">
              {editing ? "Edit Problem" : "Create Problem"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-sm text-slate-400">Problem Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Two Sum"
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1">
              <label className="text-sm text-slate-400">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm({
                    ...form,
                    difficulty: e.target.value as any,
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-gray-100"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm text-slate-400">
                Problem Description
              </label>
              <textarea
                className="w-full h-36 bg-slate-950 border border-slate-800 rounded p-3 text-slate-100"
                placeholder="Write problem statement"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* Constraints */}
            <TagInput
              label="Constraints"
              values={form.constraints}
              onChange={(v) => setForm({ ...form, constraints: v })}
            />

            {/* Tags */}
            <TagInput
              label="Tags"
              values={form.tags}
              onChange={(v) => setForm({ ...form, tags: v })}
            />

            {/* Company Tags */}
            <TagInput
              label="Company Tags"
              values={form.companyTags}
              onChange={(v) => setForm({ ...form, companyTags: v })}
            />

            {/* Boilerplate Editors */}
            {/* ---------------- BOILERPLATES ---------------- */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-400">
                  Boilerplates (Multi-Language)
                </label>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      ...form,
                      boilerplates: [
                        ...form.boilerplates,
                        {
                          language: "cpp",
                          userCodeTemplate: "",
                          fullCodeTemplate: "",
                        },
                      ],
                    })
                  }
                >
                  + Add Language
                </Button>
              </div>

              {form.boilerplates.map((bp, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        Language #{index + 1}
                      </span>

                      <select
                        value={bp.language}
                        onChange={(e) => {
                          const copy = [...form.boilerplates];
                          copy[index].language = e.target.value;
                          setForm({ ...form, boilerplates: copy });
                        }}
                        className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sm text-gray-50"
                      >
                        {SUPPORTED_LANGUAGES.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {form.boilerplates.length > 1 && (
                      <Button
                        size="sm"
                        className="text-red-400 hover:text-red-300 bg-red-500/10 border-red-500/20"
                        onClick={() =>
                          setForm({
                            ...form,
                            boilerplates: form.boilerplates.filter(
                              (_, i) => i !== index
                            ),
                          })
                        }
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* User Code Template */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">
                      User Code Template
                    </label>
                    <Editor
                      height="160px"
                      theme="vs-dark"
                      language={bp.language}
                      value={bp.userCodeTemplate}
                      onChange={(v) => {
                        const copy = [...form.boilerplates];
                        copy[index].userCodeTemplate = v || "";
                        setForm({ ...form, boilerplates: copy });
                      }}
                    />
                  </div>

                  {/* Full Code Template */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">
                      Full Code Template
                    </label>
                    <Editor
                      height="160px"
                      theme="vs-dark"
                      language={bp.language}
                      value={bp.fullCodeTemplate}
                      onChange={(v) => {
                        const copy = [...form.boilerplates];
                        copy[index].fullCodeTemplate = v || "";
                        setForm({ ...form, boilerplates: copy });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* ---------------- EXAMPLES ---------------- */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-400">
                  Examples (Visible to users)
                </label>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      ...form,
                      examples: [
                        ...form.examples,
                        {
                          input: "",
                          output: "",
                          explanation: "",
                        },
                      ],
                    })
                  }
                >
                  + Add Example
                </Button>
              </div>

              {form.examples.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">
                      Example #{i + 1}
                    </span>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                      onClick={() =>
                        setForm({
                          ...form,
                          examples: form.examples.filter((_, idx) => idx !== i),
                        })
                      }
                    >
                      Remove
                    </Button>
                  </div>

                  {/* Input */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Input</label>
                    <textarea
                      className="w-full min-h-20 bg-slate-900 border border-slate-800 rounded p-2 text-sm text-slate-100"
                      placeholder="Example input"
                      value={ex.input}
                      onChange={(e) => {
                        const copy = [...form.examples];
                        copy[i].input = e.target.value;
                        setForm({ ...form, examples: copy });
                      }}
                    />
                  </div>

                  {/* Output */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Output</label>
                    <textarea
                      className="w-full min-h-20 bg-slate-900 border border-slate-800 rounded p-2 text-sm text-slate-100"
                      placeholder="Example output"
                      value={ex.output}
                      onChange={(e) => {
                        const copy = [...form.examples];
                        copy[i].output = e.target.value;
                        setForm({ ...form, examples: copy });
                      }}
                    />
                  </div>

                  {/* Explanation */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">
                      Explanation
                    </label>
                    <textarea
                      className="w-full min-h-17.5 bg-slate-900 border border-slate-800 rounded p-2 text-sm text-slate-100"
                      placeholder="Explain how this example works"
                      value={ex.explanation}
                      onChange={(e) => {
                        const copy = [...form.examples];
                        copy[i].explanation = e.target.value;
                        setForm({ ...form, examples: copy });
                      }}
                    />
                  </div>
                </div>
              ))}

              {form.examples.length === 0 && (
                <div className="text-xs text-slate-500 italic">
                  No examples added yet. At least one example is recommended.
                </div>
              )}
            </div>

            {/* Testcases */}
            {/* ---------------- TESTCASES ---------------- */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-400">Testcases</label>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      ...form,
                      testcases: [
                        ...form.testcases,
                        {
                          input: "",
                          output: "",
                          isHidden: false,
                        },
                      ],
                    })
                  }
                >
                  + Add Testcase
                </Button>
              </div>

              {form.testcases.map((tc, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">
                      Testcase #{i + 1}
                    </span>

                    <div className="flex items-center gap-4">
                      {/* Hidden Toggle */}
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={() => {
                            const copy = [...form.testcases];
                            copy[i].isHidden = !copy[i].isHidden;
                            setForm({ ...form, testcases: copy });
                          }}
                          className="accent-yellow-500"
                        />
                        <span
                          className={
                            tc.isHidden ? "text-yellow-400" : "text-slate-400"
                          }
                        >
                          {tc.isHidden ? "Hidden (Judge Only)" : "Public"}
                        </span>
                      </label>

                      {/* Remove */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                        onClick={() =>
                          setForm({
                            ...form,
                            testcases: form.testcases.filter(
                              (_, idx) => idx !== i
                            ),
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Input</label>
                    <textarea
                      className="w-full min-h-20 bg-slate-900 border border-slate-800 rounded p-2 text-sm text-slate-100"
                      placeholder="Enter input"
                      value={tc.input}
                      onChange={(e) => {
                        const copy = [...form.testcases];
                        copy[i].input = e.target.value;
                        setForm({ ...form, testcases: copy });
                      }}
                    />
                  </div>

                  {/* Output */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">
                      Expected Output
                    </label>
                    <textarea
                      className="w-full min-h-20 bg-slate-900 border border-slate-800 rounded p-2 text-sm text-slate-100"
                      placeholder="Enter expected output"
                      value={tc.output}
                      onChange={(e) => {
                        const copy = [...form.testcases];
                        copy[i].output = e.target.value;
                        setForm({ ...form, testcases: copy });
                      }}
                    />
                  </div>

                  {tc.isHidden && (
                    <div className="text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                      ⚠ This testcase will be used only by the judge and won’t
                      be visible to users.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              onClick={() => setFormOpen(false)}
              className="bg-gray-700 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>

            <Button
              onClick={submitProblem}
              disabled={isLoading}
              className="bg-gray-800 text-white hover:bg-gray-700 flex items-center gap-2"
            >
              {isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}

              {isLoading
                ? editing
                  ? "Updating..."
                  : "Creating..."
                : editing
                ? "Update Problem"
                : "Create Problem"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PREVIEW */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl bg-slate-900">
          <DialogHeader>
            <DialogTitle>Draft Preview</DialogTitle>
          </DialogHeader>
          <div
            className="prose prose-invert"
            dangerouslySetInnerHTML={{
              __html: previewData?.description || "",
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TagInput({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-400">{label}</label>

      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 rounded-full bg-yellow-500/10 text-yellow-400 px-3 py-1 text-xs"
          >
            {tag}
            <button
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              className="hover:text-yellow-300"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <Input
        value={input}
        placeholder={`Add ${label.toLowerCase()} and press Enter`}
        className="bg-slate-950 border-slate-800 text-slate-100"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            onChange([...values, input.trim()]);
            setInput("");
          }
        }}
      />
    </div>
  );
}
