import { useEffect, useState } from "react";
// import ProblemHeader from "@/components/core/problems/ProblemHeader"; // Replacing with custom header
// import ProblemTable from "@/components/core/problems/ProblemTable"; // Replacing with custom list
import ProblemHeaderSkeleton from "@/components/core/problems/ProblemSkeleton";
import ProblemTableSkeleton from "@/components/core/problems/ProblemTableSkeleton";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import { API_URL } from "@/utils/api";
import Navbar from "@/components/common/Navbar";
import { Search, Filter, Tag, Briefcase, ChevronLeft, ChevronRight, Layers, CheckCircle2 } from "lucide-react";
import MultiSelect from "@/components/common/MultiSelect";
import DifficultyBadge from "@/components/core/problems/DifficultyBadge";
import { Link } from "react-router-dom";

// Types
interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  companies: string[];
  isSolved: boolean;
}

interface FilterOptions {
  tags: string[];
  companies: string[];
}

export default function Problems() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ tags: [], companies: [] });

  // Filters State
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);


  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  /* ---------------- FETCH FILTERS ---------------- */
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axios.get(`${API_URL}/problems/param-filters`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data.success) {
          setFilterOptions(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch filters", error);
      }
    };
    fetchFilters();
  }, []);

  /* ---------------- FETCH PROBLEMS ---------------- */
  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", page.toString());
        queryParams.append("limit", limit.toString());
        if (search) queryParams.append("search", search);
        if (difficulty) queryParams.append("difficulty", difficulty);
        if (status) queryParams.append("status", status);
        if (selectedTags.length) queryParams.append("tags", selectedTags.join(","));
        if (selectedCompanies.length) queryParams.append("companies", selectedCompanies.join(","));

        const res = await axios.get(
          `${API_URL}/problems?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setProblems(res.data.data);
          setTotalPages(res.data.pagination.pages);
        }
      } catch (error) {
        console.error("Failed to fetch problems", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      if (token) fetchProblems();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [page, limit, token, search, difficulty, status, selectedTags, selectedCompanies]);

  /* ---------------- HANDLERS ---------------- */
  const handleTagChange = (tags: string[]) => {
    setSelectedTags(tags);
    setPage(1); // Reset to page 1 on filter change
  };

  const handleCompanyChange = (companies: string[]) => {
    setSelectedCompanies(companies);
    setPage(1);
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(1);
  };


  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-gray-950 min-h-screen text-gray-100 font-sans selection:bg-indigo-500/30 pt-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header Section */}
        <div className="mb-10 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Problem Set
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Master your skills with our curated collection of coding challenges.
            Filter by topic, company, or difficulty to find your perfect match.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="relative z-30 bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-5 mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

            {/* Search */}
            <div className="md:col-span-4 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Search</label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search problems by title, slug..."
                  className="w-full bg-gray-900 border border-gray-800 focus:border-indigo-500/50 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status */}
            <div className="md:col-span-2 lg:col-span-1.5">
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={handleStatusChange}
                  className="w-full bg-gray-900 border border-gray-800 focus:border-indigo-500/50 rounded-lg py-2.5 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none appearance-none cursor-pointer hover:border-gray-700 transition-colors"
                >
                  <option value="">All</option>
                  <option value="solved">Solved</option>
                  <option value="unsolved">Unsolved</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
              </div>
            </div>

            {/* Difficulty */}
            <div className="md:col-span-2 lg:col-span-1.5">
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Difficulty</label>
              <div className="relative">
                <select
                  value={difficulty}
                  onChange={handleDifficultyChange}
                  className="w-full bg-gray-900 border border-gray-800 focus:border-indigo-500/50 rounded-lg py-2.5 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none appearance-none cursor-pointer hover:border-gray-700 transition-colors"
                >
                  <option value="">All</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
              </div>
            </div>

            {/* Tags */}
            <div className="md:col-span-2 lg:col-span-3">
              <MultiSelect
                label="Tags"
                placeholder="Select Topics"
                options={filterOptions.tags.map(t => ({ id: t, label: t }))}
                selected={selectedTags}
                onChange={handleTagChange}
              />
            </div>

            {/* Companies */}
            <div className="md:col-span-2 lg:col-span-3">
              <MultiSelect
                label="Companies"
                placeholder="Select Companies"
                options={filterOptions.companies.map(c => ({ id: c, label: c }))}
                selected={selectedCompanies}
                onChange={handleCompanyChange}
              />
            </div>
          </div>
        </div>

        {/* Problems List */}
        {loading ? (
          <div className="space-y-4">
            <ProblemHeaderSkeleton />
            <ProblemTableSkeleton />
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {!problems || problems.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
                  <Layers className="mx-auto text-gray-600 mb-4" size={48} />
                  <h3 className="text-xl font-medium text-gray-300">No problems found</h3>
                  <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setDifficulty("");
                      setStatus("");
                      setSelectedTags([]);
                      setSelectedCompanies([]);
                    }}
                    className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                problems.map((problem) => (
                  <div
                    key={problem._id}
                    className="group relative bg-gray-900/40 hover:bg-gray-900/80 border border-gray-800 hover:border-indigo-500/30 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {problem.isSolved ? (
                            <CheckCircle2 size={24} className="text-green-500 shrink-0" />
                          ) : (
                            <div className="w-6 h-6 shrink-0" /> /* Spacer for alignment */
                          )}
                          <Link
                            to={`/problems/${problem.slug}`}
                            className="text-lg font-semibold text-gray-100 group-hover:text-indigo-400 transition-colors line-clamp-1"
                          >
                            {problem.title}
                          </Link>
                          <DifficultyBadge difficulty={problem.difficulty} />
                        </div>

                        <div className="flex flex-wrap gap-2 items-center ml-9">
                          {problem.companies && problem.companies.length > 0 && (
                            <div className="flex items-center gap-1.5 mr-3">
                              <Briefcase size={14} className="text-gray-500" />
                              {problem.companies.slice(0, 3).map(company => (
                                <span key={company} className="text-xs text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded border border-gray-800">
                                  {company}
                                </span>
                              ))}
                              {problem.companies.length > 3 && (
                                <span className="text-xs text-gray-500">+{problem.companies.length - 3}</span>
                              )}
                            </div>
                          )}

                          {problem.tags && problem.tags.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Tag size={14} className="text-gray-500" />
                              {problem.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs text-indigo-300/80 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                  {tag}
                                </span>
                              ))}
                              {problem.tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{problem.tags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <Link
                          to={`/problems/${problem.slug}`}
                          className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 group-hover:bg-indigo-600 text-gray-400 group-hover:text-white transition-all transform group-hover:translate-x-1"
                        >
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1 text-sm font-medium text-gray-400">
                  <span className="text-indigo-400">{page}</span>
                  <span className="text-gray-600">/</span>
                  <span>{totalPages}</span>
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
