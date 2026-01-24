import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { useDiscussStore } from "../stores/discussStore";
import { 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Plus,
  ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  "General",
  "Interview Question",
  "Interview Experience",
  "Career",
  "Feedback",
  "Support"
];

const Discuss: React.FC = () => {
    const { discussions, isLoading: loading, fetchDiscussions } = useDiscussStore();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>("");
    const [sort, setSort] = useState("newest");

    useEffect(() => {
        fetchDiscussions({
            category: category || undefined,
            search: search || undefined,
            sort,
            limit: 20
        });
    }, [category, sort]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchDiscussions({
            category: category || undefined,
            search: search || undefined,
            sort,
            limit: 20
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden selection:bg-indigo-500/30 font-sans">
            <Navbar />
            
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.05, 0.03] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-purple-600/15 blur-[120px]"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 backdrop-blur-sm"
                        >
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Community Knowledge</span>
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 uppercase">
                            Global <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">Discuss</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium max-w-2xl">Connect, share, and grow with the world's most ambitious developers.</p>
                    </div>
                    <Link 
                        to="/discuss/new"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/20 border border-indigo-500/30"
                    >
                        <Plus className="w-5 h-5 font-black" />
                        New Discussion
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Sidebar Filters */}
                    <aside className="lg:col-span-3 space-y-8">
                        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Categories
                            </h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => setCategory("")}
                                    className={`w-full text-left px-5 py-3 rounded-2xl transition-all flex items-center justify-between group text-xs font-black uppercase tracking-widest ${category === "" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5 transition-all" : "text-slate-500 border border-transparent hover:bg-white/5 hover:text-slate-200"}`}
                                >
                                    All Topics
                                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${category === "" ? "opacity-100" : "opacity-0"}`} />
                                </button>
                                {categories.map((cat) => (
                                    <button 
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`w-full text-left px-5 py-3 rounded-2xl transition-all flex items-center justify-between group text-xs font-black uppercase tracking-widest ${category === cat ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5" : "text-slate-500 border border-transparent hover:bg-white/5 hover:text-slate-200"}`}
                                    >
                                        {cat}
                                        <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${category === cat ? "opacity-100" : "opacity-0"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-linear-to-br from-indigo-950/40 to-slate-900/40 backdrop-blur-2xl border border-indigo-500/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-700" />
                            <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2 uppercase tracking-tighter">
                                Community Rules
                            </h3>
                            <p className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest mb-6 leading-relaxed">
                                Elite standards for elite coders.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                                    <span className="text-xs font-bold text-slate-400 tracking-tight">Radical Respect Only</span>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                                    <span className="text-xs font-bold text-slate-400 tracking-tight">Zero Tolerance Spam</span>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                                    <span className="text-xs font-bold text-slate-400 tracking-tight">Deep Technical Utility</span>
                                </li>
                            </ul>
                        </div>
                    </aside>

                    {/* Main Feed */}
                    <div className="lg:col-span-9 space-y-8">
                        {/* Search and Sort Toolbar */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <form onSubmit={handleSearch} className="relative flex-1 group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search the hive mind..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-slate-900/40 backdrop-blur-xl border border-white/5 focus:border-indigo-500/30 text-white pl-14 pr-6 py-5 rounded-[1.5rem] outline-none transition-all shadow-2xl font-medium tracking-tight"
                                />
                            </form>
                            <div className="flex bg-slate-900/40 backdrop-blur-xl p-1.5 border border-white/5 rounded-[1.5rem] shadow-2xl">
                                <button 
                                    onClick={() => setSort("newest")}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${sort === "newest" ? "bg-white/10 text-white shadow-xl" : "text-slate-500 hover:text-slate-300"}`}
                                >
                                    Newest
                                </button>
                                <button 
                                    onClick={() => setSort("trending")}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${sort === "trending" ? "bg-white/10 text-white shadow-xl" : "text-slate-500 hover:text-slate-300"}`}
                                >
                                    Trending
                                </button>
                                <button 
                                    onClick={() => setSort("upvoted")}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${sort === "upvoted" ? "bg-white/10 text-white shadow-xl" : "text-slate-500 hover:text-slate-300"}`}
                                >
                                    Elite
                                </button>
                            </div>
                        </div>

                        {/* Discussions List */}
                        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            {loading ? (
                                <div className="divide-y divide-white/5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="p-8 h-32 animate-pulse flex gap-6">
                                            <div className="w-12 h-16 bg-white/5 rounded-2xl block" />
                                            <div className="flex-1 space-y-4">
                                                <div className="h-4 bg-white/5 rounded-full w-1/4" />
                                                <div className="h-6 bg-white/5 rounded-full w-3/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : discussions.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {discussions.map((post, index) => (
                                        <motion.div
                                            key={post._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: (index % 10) * 0.05 }}
                                        >
                                            <Link 
                                                to={`/discuss/${post._id}`}
                                                className="group block p-8 transition-all hover:bg-white/[0.03]"
                                            >
                                                <div className="flex gap-8 items-start">
                                                    {/* Vote Indicator */}
                                                    <div className="hidden sm:flex flex-col items-center justify-center bg-slate-950/60 border border-white/5 rounded-2xl px-4 py-3 min-w-[60px] group-hover:border-indigo-500/30 transition-all shadow-xl group-hover:scale-105">
                                                        <ThumbsUp className={`w-4 h-4 mb-2 ${post.upvotes > 0 ? "text-indigo-400" : "text-slate-600"}`} />
                                                        <span className={`text-sm font-black tabular-nums tracking-tighter ${post.upvotes > 0 ? "text-indigo-400" : "text-slate-500"}`}>
                                                            {post.upvotes - post.downvotes}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="inline-flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-lg">
                                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">
                                                                    {post.category}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {formatDistanceToNow(new Date(post.createdAt))} ago
                                                            </div>
                                                        </div>
                                                        
                                                        <h2 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors mb-5 tracking-tight line-clamp-2 uppercase">
                                                            {post.title}
                                                        </h2>
                                                        
                                                        <div className="flex flex-wrap items-center gap-6">
                                                            <div className="flex items-center gap-3 group/user">
                                                                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] text-white font-black overflow-hidden group-hover/user:scale-110 transition-transform shadow-lg shadow-black/20">
                                                                    {post.author.avatar ? <img src={post.author.avatar} alt="" className="w-full h-full object-cover" /> : post.author.username.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover/user:text-indigo-400 transition-colors">{post.author.username}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-2 text-slate-500">
                                                                    <MessageSquare className="w-4 h-4" />
                                                                    <span className="text-[10px] font-black tabular-nums tracking-widest">{post.commentCount}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-slate-500">
                                                                    <Eye className="w-4 h-4" />
                                                                    <span className="text-[10px] font-black tabular-nums tracking-widest">{post.views}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-24 px-8">
                                    <div className="flex justify-center mb-8">
                                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/5">
                                            <Search className="w-10 h-10 text-slate-700" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Zero Matches Found</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">The hive mind has no record of this. Adjust your filters or initiate a new request.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Discuss;
