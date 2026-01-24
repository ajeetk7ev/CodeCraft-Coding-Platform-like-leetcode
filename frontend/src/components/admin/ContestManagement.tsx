import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../../stores/authStore";
import { Plus, Trophy, Calendar, Users, Trash2, Edit, Loader2, Search, CheckCircle2, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface Problem {
    _id: string;
    title: string;
    difficulty: string;
}

interface Contest {
    _id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    problems: string[];
    isRated: boolean;
    status: "draft" | "published";
    registrationDeadline?: string;
}

const ContestManagement: React.FC = () => {
    const [contests, setContests] = useState<Contest[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingContest, setEditingContest] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [problemFilter, setProblemFilter] = useState("");
    const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
    const [showPreview, setShowPreview] = useState(false);
    const { token } = useAuthStore();

    // Form Stats
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        registrationDeadline: "",
        selectedProblems: [] as string[],
        isRated: false,
        status: "draft" as "draft" | "published"
    });

    const fetchData = async () => {
        try {
            const [contestsRes, problemsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/contests`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/problems`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (contestsRes.data.success) setContests(contestsRes.data.data);
            if (problemsRes.data.success) setProblems(problemsRes.data.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load management data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Custom Validation
        if (new Date(formData.endTime) <= new Date(formData.startTime)) {
            toast.error("End time must be after start time");
            return;
        }

        if (formData.registrationDeadline && new Date(formData.registrationDeadline) >= new Date(formData.endTime)) {
            toast.error("Registration deadline must be before contest end time");
            return;
        }

        if (formData.selectedProblems.length === 0) {
            toast.error("Please select at least one problem");
            return;
        }

        try {
            const url = editingContest
                ? `${import.meta.env.VITE_API_URL}/contests/${editingContest}`
                : `${import.meta.env.VITE_API_URL}/contests`;

            const method = editingContest ? "put" : "post";

            const res = await axios[method](
                url,
                {
                    ...formData,
                    problems: formData.selectedProblems
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (res.data.success) {
                toast.success(editingContest ? "Contest updated!" : "Contest created!");
                closeForm();
                fetchData();
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setFormErrors(error.response.data.errors);
                toast.error("Please fix the validation errors");
            } else {
                toast.error(error.response?.data?.message || "Failed to save contest");
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this contest?")) return;

        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/contests/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success("Contest deleted");
                fetchData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete contest");
        }
    };

    const handleEdit = (contest: Contest) => {
        setEditingContest(contest._id);
        setFormData({
            title: contest.title,
            description: contest.description,
            startTime: new Date(contest.startTime).toISOString().slice(0, 16),
            endTime: new Date(contest.endTime).toISOString().slice(0, 16),
            registrationDeadline: contest.registrationDeadline ? new Date(contest.registrationDeadline).toISOString().slice(0, 16) : "",
            selectedProblems: contest.problems,
            isRated: contest.isRated,
            status: contest.status
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingContest(null);
        setFormData({ title: "", description: "", startTime: "", endTime: "", registrationDeadline: "", selectedProblems: [], isRated: false, status: "draft" });
        setFormErrors({});
    };

    const toggleProblem = (id: string) => {
        setFormData(prev => ({
            ...prev,
            selectedProblems: prev.selectedProblems.includes(id)
                ? prev.selectedProblems.filter(p => p !== id)
                : [...prev.selectedProblems, id]
        }));
    };

    const toggleAllFiltered = () => {
        const allFilteredIds = filteredProblems.map(p => p._id);
        const allSelected = allFilteredIds.every(id => formData.selectedProblems.includes(id));

        if (allSelected) {
            setFormData(prev => ({
                ...prev,
                selectedProblems: prev.selectedProblems.filter(id => !allFilteredIds.includes(id))
            }));
        } else {
            const newSelected = new Set([...formData.selectedProblems, ...allFilteredIds]);
            setFormData(prev => ({
                ...prev,
                selectedProblems: Array.from(newSelected)
            }));
        }
    };

    const filteredProblems = problems.filter(p =>
        p.title.toLowerCase().includes(problemFilter.toLowerCase())
    );

    const filteredContests = contests.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Trophy className="text-indigo-400" />
                        Contest Management
                    </h2>
                    <p className="text-slate-400 mt-1">Create and oversee high-stakes coding battles</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search contests..."
                            className="bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 outline-none focus:border-indigo-500/50 transition-all min-w-[240px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => showForm ? closeForm() : setShowForm(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        {showForm ? <X size={20} /> : <Plus size={20} />}
                        {showForm ? "Cancel" : "New Contest"}
                    </button>
                </div>
            </div>

            {showForm ? (
                <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 space-y-8 max-w-5xl mx-auto backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
                        {editingContest ? <Edit className="text-indigo-400" size={20} /> : <Plus className="text-indigo-400" size={20} />}
                        {editingContest ? "Edit Contest" : "Create New Contest"}
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Contest Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-950 border border-white/5 focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-white outline-none transition-all shadow-inner"
                                    placeholder="e.g. CodeCraft Genesis Battle"
                                    value={formData.title}
                                    onChange={e => {
                                        setFormData({ ...formData, title: e.target.value });
                                        if (formErrors.title) setFormErrors(prev => ({ ...prev, title: [] }));
                                    }}
                                />
                                {formErrors.title?.[0] && <p className="text-rose-500 text-[11px] mt-1 ml-1 font-bold">{formErrors.title[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Arena Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    className={`w-full bg-slate-950 border ${formErrors.description?.[0] ? 'border-rose-500/50' : 'border-white/5'} focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-white outline-none transition-all resize-none shadow-inner`}
                                    placeholder="Set the stage for the warriors..."
                                    value={formData.description}
                                    onChange={e => {
                                        setFormData({ ...formData, description: e.target.value });
                                        if (formErrors.description) setFormErrors(prev => ({ ...prev, description: [] }));
                                    }}
                                />
                                {formErrors.description?.[0] && <p className="text-rose-500 text-[11px] mt-1 ml-1 font-bold">{formErrors.description[0]}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Commencement</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className={`w-full bg-slate-950 border ${formErrors.startTime?.[0] ? 'border-rose-500/50' : 'border-white/5'} focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-white outline-none transition-all shadow-inner`}
                                        value={formData.startTime}
                                        onChange={e => {
                                            setFormData({ ...formData, startTime: e.target.value });
                                            if (formErrors.startTime) setFormErrors(prev => ({ ...prev, startTime: [] }));
                                        }}
                                    />
                                    {formErrors.startTime?.[0] && <p className="text-rose-500 text-[11px] mt-1 ml-1 font-bold">{formErrors.startTime[0]}</p>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Conclusion</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className={`w-full bg-slate-950 border ${formErrors.endTime?.[0] ? 'border-rose-500/50' : 'border-white/5'} focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-white outline-none transition-all shadow-inner`}
                                        value={formData.endTime}
                                        onChange={e => {
                                            setFormData({ ...formData, endTime: e.target.value });
                                            if (formErrors.endTime) setFormErrors(prev => ({ ...prev, endTime: [] }));
                                        }}
                                    />
                                    {formErrors.endTime?.[0] && <p className="text-rose-500 text-[11px] mt-1 ml-1 font-bold">{formErrors.endTime[0]}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Registration Deadline (Optional)</label>
                                <input
                                    type="datetime-local"
                                    className={`w-full bg-slate-950 border ${formErrors.registrationDeadline?.[0] ? 'border-rose-500/50' : 'border-white/5'} focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-white outline-none transition-all shadow-inner`}
                                    value={formData.registrationDeadline}
                                    onChange={e => {
                                        setFormData({ ...formData, registrationDeadline: e.target.value });
                                        if (formErrors.registrationDeadline) setFormErrors(prev => ({ ...prev, registrationDeadline: [] }));
                                    }}
                                />
                                <p className="text-[10px] text-slate-600 mt-2 ml-1">If blank, registration remains open until the end.</p>
                                {formErrors.registrationDeadline?.[0] && <p className="text-rose-500 text-[11px] mt-1 ml-1 font-bold">{formErrors.registrationDeadline[0]}</p>}
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 flex items-center gap-3 p-4 bg-slate-950 border border-white/5 rounded-2xl shadow-inner group cursor-pointer" onClick={() => setFormData(p => ({ ...p, isRated: !p.isRated }))}>
                                    <div className={`w-10 h-6 rounded-full transition-all relative ${formData.isRated ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isRated ? 'left-5' : 'left-1'}`} />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-white">Rated Contest</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest leading-none">Affects user's global ranking</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center gap-3 p-4 bg-slate-950 border border-white/5 rounded-2xl shadow-inner group cursor-pointer" onClick={() => setFormData(p => ({ ...p, status: p.status === 'draft' ? 'published' : 'draft' }))}>
                                    <div className={`w-10 h-6 rounded-full transition-all relative ${formData.status === 'published' ? 'bg-green-600' : 'bg-slate-800'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.status === 'published' ? 'left-5' : 'left-1'}`} />
                                    </div>
                                    <div>
                                        <span className={`block text-sm font-bold ${formData.status === 'published' ? 'text-green-400' : 'text-slate-400'}`}>{formData.status === 'published' ? 'Published' : 'Draft Mode'}</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest leading-none">{formData.status === 'published' ? 'Visible to everyone' : 'Hidden from candidates'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col h-full">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Challenge Selection</label>
                            <div className="flex-1 bg-slate-950 border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-inner min-h-[400px]">
                                <div className="p-4 border-b border-white/5 flex flex-col gap-3 bg-slate-900/30">
                                    <div className="flex items-center gap-3">
                                        <Search size={16} className="text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Find challenges by title..."
                                            className="bg-transparent text-sm outline-none w-full text-white"
                                            value={problemFilter}
                                            onChange={(e) => setProblemFilter(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={toggleAllFiltered}
                                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-400 px-3 py-1.5 rounded-lg border border-white/5 font-bold uppercase tracking-wide transition-all"
                                        >
                                            {filteredProblems.every(p => formData.selectedProblems.includes(p._id)) && filteredProblems.length > 0 ? "Deselect All" : "Select All Visible"}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                    {filteredProblems.map(prob => (
                                        <div
                                            key={prob._id}
                                            onClick={() => toggleProblem(prob._id)}
                                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${formData.selectedProblems.includes(prob._id)
                                                ? 'bg-indigo-600/20 border border-indigo-500/30'
                                                : 'hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white">{prob.title}</span>
                                                <span className={`text-[10px] uppercase font-black tracking-widest mt-1 ${prob.difficulty === 'easy' ? 'text-emerald-400' :
                                                    prob.difficulty === 'medium' ? 'text-amber-400' : 'text-rose-400'
                                                    }`}>
                                                    {prob.difficulty}
                                                </span>
                                            </div>
                                            {formData.selectedProblems.includes(prob._id) && <CheckCircle2 size={18} className="text-indigo-400" />}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-slate-900/50 border-t border-white/5 text-[10px] font-black uppercase text-slate-500 flex justify-between tracking-widest">
                                    <span>{formData.selectedProblems.length} Tactical Challenges Selected</span>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, selectedProblems: [] }))} className="text-indigo-400 hover:text-indigo-300 transition-colors">Reset</button>
                                </div>
                                {formErrors.problems?.[0] && <p className="text-rose-500 text-[11px] px-4 pb-4 font-bold">{formErrors.problems[0]}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => setShowPreview(true)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 text-indigo-400 hover:bg-slate-700 transition-all font-bold"
                        >
                            <Search size={18} />
                            Preview Arena
                        </button>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="px-8 py-3.5 rounded-2xl border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold"
                            >
                                Abort Mission
                            </button>
                            <button
                                type="submit"
                                className="px-12 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all font-black shadow-xl shadow-indigo-600/30 active:scale-95"
                            >
                                {editingContest ? "Finalize Updates" : "Ignite Arena"}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredContests.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-slate-900/20 border border-dashed border-white/5 rounded-3xl">
                            <Trophy size={48} className="mx-auto text-slate-800 mb-4" />
                            <p className="text-slate-500 font-medium">No contests found matching your search</p>
                        </div>
                    ) : filteredContests.map(contest => (
                        <div key={contest._id} className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 hover:border-indigo-500/30 transition-all group relative overflow-hidden flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400 shadow-inner">
                                    <Trophy size={24} />
                                </div>
                                <div className="flex gap-1">
                                    {contest.status === 'draft' && (
                                        <span className="px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-wider border border-yellow-500/20 flex items-center mr-2">
                                            Draft
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleEdit(contest)}
                                        className="p-2.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(contest._id)}
                                        className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{contest.title}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2 mb-6 h-10 leading-relaxed">{contest.description}</p>

                            <div className="space-y-3 pt-6 border-t border-white/5 mt-auto">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-indigo-400/60" />
                                        <span>Starts {new Date(contest.startTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-indigo-400/60" />
                                        <span>{contest.problems.length} Challenges</span>
                                    </div>
                                </div>
                            </div>

                            {contest.isRated && new Date() > new Date(contest.endTime) && (
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            const res = await axios.post(`${import.meta.env.VITE_API_URL}/contests/${contest._id}/finish`, {}, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            if (res.data.success) toast.success("Ratings updated successfully!");
                                        } catch (error: any) {
                                            toast.error(error.response?.data?.message || "Failed to update ratings");
                                        }
                                    }}
                                    className="mt-4 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Update Contest Ratings
                                </button>
                            )}

                            <div className="absolute -bottom-1 left-0 w-0 h-1 bg-indigo-600 group-hover:w-full transition-all duration-700" />
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
                    <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute top-8 right-8 p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all z-10"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-12">
                            <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-10 mb-10 relative overflow-hidden">
                                <div className="max-w-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                            Arena Preview
                                        </span>
                                        {formData.status === 'draft' && (
                                            <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                                                Draft Mode
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-5xl font-black mb-6 bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                        {formData.title || "Untitled Arena"}
                                    </h1>
                                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                        {formData.description || "No description provided yet..."}
                                    </p>
                                    <div className="flex gap-8">
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Calendar className="text-indigo-400" size={20} />
                                            <span className="font-bold">{formData.startTime ? new Date(formData.startTime).toLocaleString() : "Start Time TBD"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Users className="text-indigo-400" size={20} />
                                            <span className="font-bold">{formData.selectedProblems.length} Tactical Challenges</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-2 space-y-6">
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-4">
                                        <Trophy className="text-indigo-400" size={24} />
                                        Challenge Roster
                                    </h2>
                                    <div className="space-y-4">
                                        {formData.selectedProblems.length === 0 ? (
                                            <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-3xl text-slate-500">
                                                No challenges selected for this arena
                                            </div>
                                        ) : (
                                            formData.selectedProblems.map((probId, idx) => {
                                                const prob = problems.find(p => p._id === probId);
                                                return (
                                                    <div key={probId} className="flex items-center justify-between bg-slate-950/50 border border-white/5 rounded-2xl p-6">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center font-black text-xl text-indigo-400 border border-white/5 shadow-inner">
                                                                {String.fromCharCode(65 + idx)}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-bold text-white">{prob?.title || "Unknown Problem"}</h3>
                                                                <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${prob?.difficulty === 'easy' ? 'text-emerald-400' :
                                                                    prob?.difficulty === 'medium' ? 'text-amber-400' : 'text-rose-400'
                                                                    }`}>
                                                                    {prob?.difficulty || "N/A"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="px-4 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black">100 PTS</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-4">
                                        <Users className="text-indigo-400" size={24} />
                                        Leaderboard
                                    </h2>
                                    <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-8 text-center text-slate-500 italic">
                                        Leaderboard will go live once the arena commences.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContestManagement;
