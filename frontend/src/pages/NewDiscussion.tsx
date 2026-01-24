import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import { useDiscussStore } from "../stores/discussStore";
import { useNavigate } from "react-router-dom";
import { 
  Send, 
  X, 
  Hash, 
  Layout,
  Eye
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const categories = [
  "General",
  "Interview Question",
  "Interview Experience",
  "Career",
  "Feedback",
  "Support"
];

const NewDiscussion: React.FC = () => {
    const { createDiscussion, isLoading: loading } = useDiscussStore();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("General");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [preview, setPreview] = useState(false);
    const navigate = useNavigate();

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        try {
            const response = await createDiscussion({
                title,
                content,
                category: category as any,
                tags
            });
            if (response.success) {
                toast.success("New data point broadcasted to the grid");
                navigate(`/discuss/${response.data._id}`);
            }
        } catch (error) {
            console.error("Failed to create discussion", error);
        }
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

            <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate("/discuss")}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                        >
                            <X className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Initiate <span className="text-indigo-400">Discussion</span></h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Transmit your insights to the grid</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setPreview(!preview)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all text-xs font-black uppercase tracking-widest ${preview ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/20 hover:text-slate-200"}`}
                        >
                            <Eye className="w-4 h-4" />
                            {preview ? "Edit Mode" : "Preview Mode"}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title Input */}
                        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] overflow-hidden focus-within:border-indigo-500/30 transition-all shadow-2xl">
                            <input 
                                type="text" 
                                placeholder="Topic Title" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent px-8 py-6 text-2xl font-black uppercase tracking-tight outline-none placeholder:text-slate-800 text-white"
                                required
                            />
                        </div>

                        {/* Content Input */}
                        <div className={`bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden focus-within:border-indigo-500/30 transition-all shadow-2xl min-h-[500px] flex flex-col`}>
                            {preview ? (
                                <div className="p-10 prose prose-invert max-w-none prose-pre:bg-slate-950 prose-pre:border prose-pre:border-white/5 overflow-y-auto max-h-[700px]">
                                    <ReactMarkdown>{content || "*Nothing to preview yet*"}</ReactMarkdown>
                                </div>
                            ) : (
                                <textarea 
                                    placeholder="Execute your thoughts here... (Markdown accepted)" 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-full bg-transparent px-10 py-10 outline-none resize-none placeholder:text-slate-800 text-slate-300 flex-1 min-h-[500px] font-medium leading-relaxed"
                                    required
                                />
                            )}
                        </div>

                        {/* Submit Section */}
                        <div className="flex justify-end pt-4">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:scale-100 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/20 border border-indigo-500/30"
                            >
                                {loading ? "Transmitting..." : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Publish to Grid
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Metadata Sidebar */}
                    <aside className="space-y-8">
                        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center gap-2">
                                <Layout className="w-4 h-4" />
                                Parameters
                            </h3>
                            
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-1">Category</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {categories.map((cat) => (
                                            <button 
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat)}
                                                className={`text-left px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 ${category === cat ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/5" : "bg-slate-950/40 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"}`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${category === cat ? "bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-slate-800"}`} />
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 px-1">Tags</label>
                                    
                                    {/* Tag Chips */}
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {tags.map((tag, index) => (
                                                <div 
                                                    key={index} 
                                                    className="relative bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center group transition-all"
                                                >
                                                    {tag}
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="absolute -top-1.5 -right-1.5 bg-slate-900 border border-white/10 rounded-full p-0.5 hover:bg-rose-500 hover:border-rose-500 text-white transition-all scale-100 opacity-100 sm:scale-0 sm:opacity-0 sm:group-hover:scale-100 sm:group-hover:opacity-100 shadow-xl"
                                                    >
                                                        <X className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="relative group">
                                        <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                                        <input 
                                            type="text" 
                                            placeholder="Press ENTER to add" 
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            className="w-full bg-slate-950/40 border border-white/5 focus:border-indigo-500/30 text-white pl-12 pr-5 py-4 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest transition-all"
                                        />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-700 mt-3 px-2 uppercase tracking-tighter">Submit with Enter key</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-linear-to-br from-amber-950/40 to-slate-900/40 backdrop-blur-2xl border border-amber-500/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-all duration-700" />
                            <h3 className="text-xl font-black text-amber-500 mb-6 flex items-center gap-2 uppercase tracking-tighter">
                                Advice
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <span className="text-[10px] font-black text-amber-500/60 mt-0.5">01</span>
                                    <span className="text-xs font-bold text-amber-200/40 tracking-tight leading-relaxed">Precision title required for maximum indexing efficiency.</span>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <span className="text-[10px] font-black text-amber-500/60 mt-0.5">02</span>
                                    <span className="text-xs font-bold text-amber-200/40 tracking-tight leading-relaxed">Verify technical integrity before transmission.</span>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <span className="text-[10px] font-black text-amber-500/60 mt-0.5">03</span>
                                    <span className="text-xs font-bold text-amber-200/40 tracking-tight leading-relaxed">Encapsulate code modules in standard markdown syntax.</span>
                                </li>
                            </ul>
                        </div>
                    </aside>
                </form>
            </main>
        </div>
    );
};

export default NewDiscussion;
