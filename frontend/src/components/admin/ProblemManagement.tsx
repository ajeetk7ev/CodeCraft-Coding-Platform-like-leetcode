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

/* ---------------- TYPES ---------------- */

interface Testcase {
  input: string;
  output: string;
  isHidden: boolean;
}

interface Boilerplate {
  language: string;
  userCodeTemplate: string;
  fullCodeTemplate: string;
}

interface Problem {
  _id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  published: boolean;
  version?: number;
  slug: string;
}

interface ProblemForm {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  constraints: string[];
  tags: string[];
  companyTags: string[];
  boilerplates: Boilerplate[];
  testcases: Testcase[];
}

/* ---------------- COMPONENT ---------------- */

export default function ProblemManagement() {
  const { token } = useAuthStore();

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [editing, setEditing] = useState<Problem | null>(null);
  const [previewData, setPreviewData] = useState<ProblemForm | null>(null);

  const [form, setForm] = useState<ProblemForm>({
    title: "",
    difficulty: "easy",
    description: "",
    constraints: [],
    tags: [],
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
      const res = await axios.get(`${API_URL}/problems`, {
        ...authHeaders,
      });
      console.log("res:", res);
      setProblems(res.data.data);
    } catch {
      toast.error("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      difficulty: "easy",
      description: "",
      constraints: [],
      tags: [],
      companyTags: [],
      boilerplates: [
        { language: "cpp", userCodeTemplate: "", fullCodeTemplate: "" },
      ],
      testcases: [],
    });
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
    try {
      if (editing) {
        await axios.put(
          `${API_URL}/problems/${editing._id}`,
          form,
          authHeaders
        );
        toast.success("Problem updated (new version)");
      } else {
        await axios.post(`${API_URL}/problems`, form, authHeaders);
        toast.success("Problem created");
      }
      setFormOpen(false);
      fetchProblems();
    } catch {
      toast.error("Failed to save problem");
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
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Problem
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3">Difficulty</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {!loading &&
              problems.map((p) => (
                <tr key={p._id}>
                  <td className="px-6 py-4">{p.title}</td>
                  <td className="px-6 py-4 capitalize">{p.difficulty}</td>
                  <td className="px-6 py-4">
                    {p.published ? "Published" : "Draft"}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(p)}
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
                        <ToggleLeft className="h-5 w-5" />
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
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- CREATE / EDIT ---------------- */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-6xl bg-slate-900">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Problem" : "Create Problem"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Problem title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <textarea
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded p-3"
              placeholder="Problem description (HTML supported)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <Input
              placeholder="Tags (comma separated)"
              value={form.tags.join(",")}
              onChange={(e) =>
                setForm({ ...form, tags: e.target.value.split(",") })
              }
            />

            <Input
              placeholder="Company tags"
              value={form.companyTags.join(",")}
              onChange={(e) =>
                setForm({
                  ...form,
                  companyTags: e.target.value.split(","),
                })
              }
            />

            {/* Monaco Editors */}
            <Editor
              height="180px"
              language="cpp"
              theme="vs-dark"
              value={form.boilerplates[0].userCodeTemplate}
              onChange={(v) =>
                setForm({
                  ...form,
                  boilerplates: [
                    {
                      ...form.boilerplates[0],
                      userCodeTemplate: v || "",
                    },
                  ],
                })
              }
            />

            <Editor
              height="180px"
              language="cpp"
              theme="vs-dark"
              value={form.boilerplates[0].fullCodeTemplate}
              onChange={(v) =>
                setForm({
                  ...form,
                  boilerplates: [
                    {
                      ...form.boilerplates[0],
                      fullCodeTemplate: v || "",
                    },
                  ],
                })
              }
            />

            {/* Testcases */}
            <Button
              variant="outline"
              onClick={() =>
                setForm({
                  ...form,
                  testcases: [
                    ...form.testcases,
                    { input: "", output: "", isHidden: false },
                  ],
                })
              }
            >
              + Add Testcase
            </Button>

            {form.testcases.map((tc, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <textarea
                  className="bg-slate-950 border border-slate-800 rounded p-2"
                  placeholder="Input"
                  value={tc.input}
                  onChange={(e) => {
                    const t = [...form.testcases];
                    t[i].input = e.target.value;
                    setForm({ ...form, testcases: t });
                  }}
                />
                <textarea
                  className="bg-slate-950 border border-slate-800 rounded p-2"
                  placeholder="Output"
                  value={tc.output}
                  onChange={(e) => {
                    const t = [...form.testcases];
                    t[i].output = e.target.value;
                    setForm({ ...form, testcases: t });
                  }}
                />
              </div>
            ))}

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitProblem}>
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------------- DRAFT PREVIEW ---------------- */}
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
