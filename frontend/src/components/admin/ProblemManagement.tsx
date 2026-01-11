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
  Search,
  FilterX,
  Code,
  Layout,
  FileText,
  TestTube,
  BookOpen,
  Briefcase,
  Layers,
  CheckCircle2,
  FileEdit,
  Globe,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "">("");

  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [editing, setEditing] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

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
    switch (d) {
      case "easy":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "hard":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
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
    setActiveTab("basic");
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setFormOpen(true);
  };

  const openEdit = async (problem: Problem) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/problems/${problem.slug}`, authHeaders);
      setEditing(problem);
      setForm(res.data.data);
      setActiveTab("basic");
      setFormOpen(true);
    } catch {
      toast.error("Failed to load problem");
    } finally {
      setIsLoading(false);
    }
  };

  const submitProblem = async () => {
    setIsLoading(true);
    try {
      if (editing) {
        await axios.put(`${API_URL}/problems/${editing._id}`, form, authHeaders);
        toast.success("Problem updated successfully");
      } else {
        await axios.post(`${API_URL}/problems`, form, authHeaders);
        toast.success("Problem created successfully");
      }
      setFormOpen(false);
      fetchProblems();
    } catch {
      toast.error(editing ? "Failed to update problem" : "Failed to create problem");
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
      toast.success(published ? "Problem unpublished" : "Problem published");
      fetchProblems();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setDifficulty("");
    setPage(1);
  };

  /* ---------------- UI ---------------- */

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase flex items-center gap-4">
            Problem <span className="text-indigo-500">Management</span>
          </h1>
          <p className="text-slate-400 font-medium">Create, manage and publish coding challenges</p>
        </div>

        <Button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-6 shadow-lg shadow-indigo-500/20 transition-all duration-300 flex items-center gap-2 group"
        >
          <div className="bg-white/10 rounded-lg p-1 group-hover:bg-white/20 transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg">Create Problem</span>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by title or slug..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-10 bg-slate-950/50 border-slate-800 focus:border-indigo-500 transition-all h-11 rounded-xl"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {["easy", "medium", "hard"].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setPage(1);
                  setDifficulty(difficulty === d ? "" : (d as any));
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap ${difficulty === d
                  ? d === "easy"
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    : d === "medium"
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                      : "bg-rose-500/20 border-rose-500/50 text-rose-400"
                  : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}

            {(search || difficulty) && (
              <Button
                variant="ghost"
                onClick={resetFilters}
                className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-xl px-3"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Problem List */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed"
            >
              <LoaderCircle className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-400">Fetching challenges...</p>
            </motion.div>
          ) : problems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed"
            >
              <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-300">No problems found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your filters or search terms</p>
              <Button
                variant="link"
                onClick={resetFilters}
                className="mt-4 text-indigo-400 hover:text-indigo-300"
              >
                Clear all filters
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Challenge</th>
                      <th className="px-6 py-4 font-semibold text-center">Difficulty</th>
                      <th className="px-6 py-4 font-semibold text-center">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-slate-800/50"
                  >
                    {problems.map((p) => (
                      <motion.tr
                        key={p._id}
                        variants={itemVariants}
                        className="hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors cursor-pointer capitalize">
                              {p.title}
                            </span>
                            <span className="text-xs text-slate-500 font-mono mt-0.5">/{p.slug}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-widest ${difficultyBadge(p.difficulty)}`}>
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${p.published
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-slate-700/30 text-slate-400 border-slate-700/50"
                              }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${p.published ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                            {p.published ? "Live" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(p)}
                              className="h-9 w-9 rounded-xl hover:bg-slate-700/50 hover:text-indigo-400 transition-all"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => togglePublish(p._id, p.published)}
                              className={`h-9 w-9 rounded-xl hover:bg-slate-700/50 transition-all ${p.published ? "text-emerald-400" : "text-slate-400"}`}
                              title={p.published ? "Unpublish" : "Publish"}
                            >
                              {p.published ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setPreviewOpen(true);
                              }}
                              className="h-9 w-9 rounded-xl hover:bg-slate-700/50 hover:text-sky-400 transition-all"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 gap-4"
                >
                  {problems.map((p) => (
                    <motion.div
                      key={p._id}
                      variants={itemVariants}
                      className="bg-slate-900 border border-slate-800 p-5 rounded-3xl"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-slate-100 capitalize">{p.title}</h3>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">/{p.slug}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-tighter ${difficultyBadge(p.difficulty)}`}>
                          {p.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/50">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${p.published
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-slate-700/30 text-slate-400 border-slate-700/50"
                            }`}
                        >
                          <span className={`h-1 w-1 rounded-full ${p.published ? "bg-emerald-400" : "bg-slate-400"}`} />
                          {p.published ? "Live" : "Draft"}
                        </span>

                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(p)}
                            className="h-9 w-9 bg-slate-800 rounded-xl"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => togglePublish(p._id, p.published)}
                            className={`h-9 w-9 bg-slate-800 rounded-xl ${p.published ? "text-emerald-400" : "text-slate-400"}`}
                          >
                            {p.published ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          <span className="text-sm text-slate-400 order-2 md:order-1 font-medium italic">
            Displaying {problems.length} challenges per page
          </span>

          <div className="flex items-center gap-1 order-1 md:order-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="rounded-xl border-slate-700 hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center px-4 h-8 bg-slate-800/50 rounded-lg border border-slate-700">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-widest">
                Page {page} <span className="text-slate-500">of</span> {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="rounded-xl border-slate-700 hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && setFormOpen(false)}>
        <DialogContent className="max-w-[90vw] w-full max-h-[95vh] overflow-hidden bg-slate-950 border-slate-800 p-0 rounded-3xl flex flex-col">
          <DialogHeader className="p-6 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20`}>
                    {editing ? <FileEdit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                  </div>
                  {editing ? "Edit Challenge" : "Craft New Challenge"}
                </DialogTitle>
                <DialogDescription className="text-slate-400 mt-1">
                  Fill in the details to {editing ? "update" : "create"} a technical problem
                </DialogDescription>
              </div>
              <div className="hidden md:flex items-center gap-3 pr-8">
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold border capitalize transition-all ${difficultyBadge(form.difficulty)}`}>
                  {form.difficulty}
                </div>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-900 bg-slate-950/50">
              <TabsList className="bg-slate-900/40 p-1 rounded-2xl border border-slate-800 flex justify-start w-full overflow-x-auto scrollbar-none gap-1 h-auto">
                <TabsTrigger
                  value="basic"
                  className="rounded-xl px-4 py-2.5 text-xs font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200 whitespace-nowrap"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="rounded-xl px-4 py-2.5 text-xs font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200 whitespace-nowrap"
                >
                  <Layout className="h-4 w-4 mr-2" />
                  Details & Tags
                </TabsTrigger>
                <TabsTrigger
                  value="boilerplates"
                  className="rounded-xl px-4 py-2.5 text-xs font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200 whitespace-nowrap"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Boilerplates
                </TabsTrigger>
                <TabsTrigger
                  value="examples"
                  className="rounded-xl px-4 py-2.5 text-xs font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200 whitespace-nowrap"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Examples
                </TabsTrigger>
                <TabsTrigger
                  value="testcases"
                  className="rounded-xl px-4 py-2.5 text-xs font-bold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 hover:text-slate-200 whitespace-nowrap"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Cases
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-20 custom-scrollbar">
              <TabsContent value="basic" className="m-0 space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      Problem Title
                    </label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Reverse Linked List"
                      className="bg-slate-900 border-slate-800 focus:ring-1 ring-indigo-500 h-11 rounded-xl text-slate-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-indigo-400" />
                      Difficulty Level
                    </label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 h-11 text-sm text-gray-100 focus:outline-none focus:ring-1 ring-indigo-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                    Problem Description
                  </label>
                  <textarea
                    className="w-full h-96 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-200 focus:outline-none focus:ring-1 ring-indigo-500 resize-none font-sans leading-relaxed"
                    placeholder="Describe the challenge in detail. Use Markdown for formatting if supported by backend."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                  <p className="text-[10px] text-slate-500 italic">Formatting is important for user readability.</p>
                </div>
              </TabsContent>

              <TabsContent value="content" className="m-0 space-y-8">
                <TagInput
                  label="Problem Constraints"
                  icon={<Settings2 className="h-4 w-4" />}
                  values={form.constraints}
                  onChange={(v) => setForm({ ...form, constraints: v })}
                  placeholder="Add constraint (e.g. 1 <= n <= 10^5)"
                />

                <div className="space-y-8">
                  <TagInput
                    label="Topics / Categories"
                    icon={<Layers className="h-4 w-4" />}
                    values={form.tags}
                    onChange={(v) => setForm({ ...form, tags: v })}
                    placeholder="Add tag (e.g. Array, Dynamic Programming)"
                  />

                  <TagInput
                    label="Company Tags"
                    icon={<Briefcase className="h-4 w-4" />}
                    values={form.companyTags}
                    onChange={(v) => setForm({ ...form, companyTags: v })}
                    placeholder="Add company (e.g. Google, Meta)"
                  />
                </div>
              </TabsContent>

              <TabsContent value="boilerplates" className="m-0 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-200">Execution Templates</h3>
                    <p className="text-sm text-slate-500">Define the starter code for each supported language</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      setForm({
                        ...form,
                        boilerplates: [
                          ...form.boilerplates,
                          { language: "cpp", userCodeTemplate: "", fullCodeTemplate: "" },
                        ],
                      })
                    }
                    className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Language
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {form.boilerplates.map((bp, index) => (
                    <div key={index} className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
                      <div className="bg-slate-800/80 px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Language</label>
                          <select
                            value={bp.language}
                            onChange={(e) => {
                              const copy = [...form.boilerplates];
                              copy[index].language = e.target.value;
                              setForm({ ...form, boilerplates: copy });
                            }}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs text-indigo-300 focus:outline-none"
                          >
                            {SUPPORTED_LANGUAGES.map((l) => (
                              <option key={l.id} value={l.id}>{l.label}</option>
                            ))}
                          </select>
                        </div>
                        {form.boilerplates.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setForm({
                                ...form,
                                boilerplates: form.boilerplates.filter((_, i) => i !== index),
                              })
                            }
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-2"
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="p-4 space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-400">Starter Code (Editor)</label>
                            <span className="text-[10px] text-slate-600">Visible to students</span>
                          </div>
                          <div className="rounded-xl border border-slate-800 overflow-hidden">
                            <Editor
                              height="450px"
                              theme="vs-dark"
                              language={bp.language}
                              value={bp.userCodeTemplate}
                              options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                fontSize: 13,
                                padding: { top: 10, bottom: 10 },
                              }}
                              onChange={(v) => {
                                const copy = [...form.boilerplates];
                                copy[index].userCodeTemplate = v || "";
                                setForm({ ...form, boilerplates: copy });
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-400">Full Execution Wrapper</label>
                            <span className="text-[10px] text-slate-600 italic">Internal Judge Logic</span>
                          </div>
                          <div className="rounded-xl border border-slate-800 overflow-hidden">
                            <Editor
                              height="450px"
                              theme="vs-dark"
                              language={bp.language}
                              value={bp.fullCodeTemplate}
                              options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                fontSize: 13,
                                padding: { top: 10, bottom: 10 },
                              }}
                              onChange={(v) => {
                                const copy = [...form.boilerplates];
                                copy[index].fullCodeTemplate = v || "";
                                setForm({ ...form, boilerplates: copy });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="examples" className="m-0 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-200">Public Examples</h3>
                    <p className="text-sm text-slate-500">Provide clear usage examples for users</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      setForm({
                        ...form,
                        examples: [...form.examples, { input: "", output: "", explanation: "" }],
                      })
                    }
                    className="bg-sky-600/10 text-sky-400 hover:bg-sky-600/20 border border-sky-500/20 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Example
                  </Button>
                </div>

                <div className="space-y-6">
                  {form.examples.map((ex, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 relative group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Example Case #{i + 1}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setForm({ ...form, examples: form.examples.filter((_, idx) => idx !== i) })}
                          className="h-7 w-7 text-rose-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FilterX className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">Input Stream</label>
                          <textarea
                            className="w-full h-16 bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:ring-1 ring-sky-500 font-mono"
                            placeholder="Input values..."
                            value={ex.input}
                            onChange={(e) => {
                              const copy = [...form.examples];
                              copy[i].input = e.target.value;
                              setForm({ ...form, examples: copy });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">Verified Output</label>
                          <textarea
                            className="w-full h-16 bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:ring-1 ring-sky-500 font-mono"
                            placeholder="Expected output..."
                            value={ex.output}
                            onChange={(e) => {
                              const copy = [...form.examples];
                              copy[i].output = e.target.value;
                              setForm({ ...form, examples: copy });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight ml-1">Rationale</label>
                          <textarea
                            className="w-full h-20 bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:ring-1 ring-sky-500 italic"
                            placeholder="Explain the logic (optional)..."
                            value={ex.explanation}
                            onChange={(e) => {
                              const copy = [...form.examples];
                              copy[i].explanation = e.target.value;
                              setForm({ ...form, examples: copy });
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {form.examples.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                      <p className="text-slate-500 select-none">No public examples defined yet.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="testcases" className="m-0 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-200">Judge Scenarios</h3>
                    <p className="text-sm text-slate-500">Comprehensive test suite for correctness verification</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      setForm({
                        ...form,
                        testcases: [...form.testcases, { input: "", output: "", isHidden: true }],
                      })
                    }
                    className="bg-amber-600/10 text-amber-400 hover:bg-amber-600/20 border border-amber-500/20 rounded-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Testcase
                  </Button>
                </div>

                <div className="space-y-4">
                  {form.testcases.map((tc, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-2xl border border-slate-800 bg-slate-900 p-5 ${tc.isHidden ? 'ring-1 ring-amber-500/20' : ''}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-slate-500 uppercase">TC #{i + 1}</span>
                          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => {
                            const copy = [...form.testcases];
                            copy[i].isHidden = !copy[i].isHidden;
                            setForm({ ...form, testcases: copy });
                          }}>
                            <div className={`p-1.5 rounded-lg transition-colors ${tc.isHidden ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                              {tc.isHidden ? <Eye className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                            </div>
                            <span className={`text-[10px] font-bold uppercase transition-colors ${tc.isHidden ? 'text-amber-400' : 'text-slate-500'}`}>
                              {tc.isHidden ? "Restricted (Judge-Only)" : "Public (Debuggable)"}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setForm({ ...form, testcases: form.testcases.filter((_, idx) => idx !== i) })}
                          className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 h-8 self-end md:self-auto"
                        >
                          Discard
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Input Data</label>
                          <textarea
                            className="w-full h-24 bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono resize-none focus:ring-1 ring-amber-500/30"
                            placeholder="Stdin input..."
                            value={tc.input}
                            onChange={(e) => {
                              const copy = [...form.testcases];
                              copy[i].input = e.target.value;
                              setForm({ ...form, testcases: copy });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Expected Stdout</label>
                          <textarea
                            className="w-full h-24 bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono resize-none focus:ring-1 ring-amber-500/30"
                            placeholder="Expected output string..."
                            value={tc.output}
                            onChange={(e) => {
                              const copy = [...form.testcases];
                              copy[i].output = e.target.value;
                              setForm({ ...form, testcases: copy });
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {form.testcases.length > 0 && (
                    <div className="flex justify-center pt-4">
                      <Button
                        size="sm"
                        onClick={() =>
                          setForm({
                            ...form,
                            testcases: [...form.testcases, { input: "", output: "", isHidden: true }],
                          })
                        }
                        className="bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl px-8"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Test Case
                      </Button>
                    </div>
                  )}
                  {form.testcases.length === 0 && (
                    <div className="py-20 text-center bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                      <TestTube className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500">No judge tests defined. Execution will fail without testcases.</p>
                      <Button
                        size="sm"
                        onClick={() =>
                          setForm({
                            ...form,
                            testcases: [...form.testcases, { input: "", output: "", isHidden: true }],
                          })
                        }
                        className="mt-4 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl px-6"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Test Case
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>

            <div className="p-6 border-t border-slate-800/80 bg-slate-900/50 backdrop-blur-md flex items-center justify-between mt-auto sticky bottom-0 z-10">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    const tabs = ["basic", "content", "boilerplates", "examples", "testcases"];
                    const currentIdx = tabs.indexOf(activeTab);
                    if (currentIdx > 0) setActiveTab(tabs[currentIdx - 1]);
                  }}
                  disabled={activeTab === "basic"}
                  className="rounded-xl border-slate-800 text-slate-400 hover:text-slate-100 h-11"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const tabs = ["basic", "content", "boilerplates", "examples", "testcases"];
                    const currentIdx = tabs.indexOf(activeTab);
                    if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1]);
                  }}
                  disabled={activeTab === "testcases"}
                  className="rounded-xl border-slate-800 text-slate-400 hover:text-slate-100 h-11"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl text-slate-400 hover:bg-slate-800 h-11 px-6 font-medium"
                >
                  Cancel
                </Button>

                <Button
                  onClick={submitProblem}
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 group transition-all active:scale-95"
                >
                  {isLoading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  )}
                  {isLoading ? "Synchronizing..." : editing ? "Save Changes" : "Deploy Challenge"}
                </Button>
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* PREVIEW DIALOG */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-800 rounded-3xl p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Eye className="h-6 w-6 text-sky-400" />
              Content Visualization
            </DialogTitle>
            <DialogDescription>
              This is how your description will render in the Problem View page
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-950/50 p-8 rounded-2xl border border-slate-800">
            <div
              className="prose prose-invert prose-indigo max-w-none prose-headings:text-slate-100 prose-p:text-slate-300 prose-strong:text-indigo-400"
              dangerouslySetInnerHTML={{
                __html: form.description || "<p class='italic text-slate-500'>No description content provided.</p>",
              }}
            />
          </div>

          <div className="flex justify-end mt-8">
            <Button onClick={() => setPreviewOpen(false)} className="rounded-xl bg-slate-800 hover:bg-slate-700">
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- ACCESSORY COMPONENTS ---------------- */

function TagInput({
  label,
  icon,
  values,
  onChange,
  placeholder = "Add entry and press Enter...",
}: {
  label: string;
  icon?: React.ReactNode;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim() && !values.includes(input.trim())) {
      onChange([...values, input.trim()]);
      setInput("");
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
        {icon}
        {label}
        <span className="text-[10px] text-slate-500 font-normal italic ml-auto">Press Enter to add</span>
      </label>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 focus-within:ring-1 ring-indigo-500 transition-all">
        <div className="flex flex-wrap gap-2 mb-3">
          {values.length > 0 ? (
            values.map((tag, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 text-xs font-semibold group"
              >
                {tag}
                <button
                  onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                  className="hover:text-rose-400 text-slate-500 transition-colors"
                >
                  ✕
                </button>
              </motion.span>
            ))
          ) : (
            <span className="text-xs text-slate-600 italic px-1">No items added yet</span>
          )}
        </div>

        <Input
          value={input}
          placeholder={placeholder}
          className="bg-slate-950/50 border-slate-800 text-slate-100 h-10 rounded-xl"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
      </div>
    </div>
  );
}
