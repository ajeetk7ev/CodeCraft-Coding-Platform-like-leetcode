import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import { useDiscussStore } from "../stores/discussStore";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Clock, 
  Share2, 
  MoreVertical,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  CornerDownRight,
  Send,
  Zap,
  Eye,
  Copy,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from 'react-markdown';
import { useAuthStore } from "../stores/authStore";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const DiscussionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { 
        currentDiscussion: discussion, 
        comments, 
        isLoading: loading, 
        fetchDiscussionById, 
        fetchComments, 
        toggleVote, 
        addComment,
        deleteDiscussion
    } = useDiscussStore();
    
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        if (id) {
            fetchDiscussionById(id);
            fetchComments(id);
        }
    }, [id]);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success("Connection link replicated to clipboard", {
            style: {
                background: '#0f172a',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                fontSize: '10px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
            }
        });
    };

    const handleDelete = async () => {
        if (!id) return;
        if (window.confirm("Initiate permanent data erasure?")) {
            await deleteDiscussion(id);
            toast.error("Data point purged from grid");
            navigate("/discuss");
        }
    };

    const handleVote = async (targetId: string, targetType: "Discussion" | "Comment", voteType: 1 | -1) => {
        if (!user) return alert("Please login to vote");
        try {
            await toggleVote(targetId, { targetType, voteType });
        } catch (error) {
            console.error("Failed to vote", error);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !id) return;

        setSubmitting(true);
        try {
            const response = await addComment(id, { content: newComment });
            if (response.success) {
                setNewComment("");
            }
        } catch (error) {
            console.error("Failed to add comment", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 pt-40 animate-pulse">
                <div className="h-12 bg-white/5 rounded-2xl w-3/4 mb-6"></div>
                <div className="h-4 bg-white/5 rounded-full w-1/4 mb-12"></div>
                <div className="h-96 bg-white/5 rounded-[2.5rem]"></div>
            </div>
        </div>
    );

    if (!discussion) return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 pt-40 text-center">
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Data Point Not Located</h2>
                <Link to="/discuss" className="text-indigo-400 font-black uppercase tracking-widest text-xs hover:text-indigo-300 transition-colors">Return to Grid</Link>
            </div>
        </div>
    );

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
                {/* Header Section */}
                <div className="mb-12">
                    <Link to="/discuss" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all group mb-10">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Return to Grid
                    </Link>

                    <div className="flex gap-10 items-start">
                        {/* Vote Vertical Bar */}
                        <div className="flex flex-col items-center gap-3 bg-slate-900/40 backdrop-blur-xl border border-white/5 p-3 rounded-[1.5rem] shadow-2xl h-fit">
                            <button 
                                onClick={() => handleVote(discussion._id, "Discussion", 1)}
                                className="p-2 hover:text-indigo-400 hover:bg-white/5 rounded-xl transition-all"
                            >
                                <ArrowUp className="w-6 h-6" />
                            </button>
                            <span className="font-black text-xl tabular-nums tracking-tighter">{discussion.upvotes - discussion.downvotes}</span>
                            <button 
                                onClick={() => handleVote(discussion._id, "Discussion", -1)}
                                className="p-2 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-all"
                            >
                                <ArrowDown className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="inline-flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-lg">
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                        {discussion.category}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <Clock className="w-4 h-4" />
                                    {formatDistanceToNow(new Date(discussion.createdAt))} ago
                                </div>
                            </div>
                            
                            <h1 className="text-5xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.9]">
                                {discussion.title}
                            </h1>
                            
                            <div className="flex items-center gap-6 pb-12">
                                <Link to={`/profile/${discussion.author.username}`} className="flex items-center gap-4 group/user">
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-slate-800 border border-white/10 flex items-center justify-center text-white font-black ring-8 ring-white/0 group-hover/user:ring-white/[0.03] transition-all overflow-hidden shadow-2xl">
                                        {discussion.author.avatar ? <img src={discussion.author.avatar} alt="" className="w-full h-full object-cover" /> : discussion.author.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white group-hover/user:text-indigo-400 transition-colors uppercase tracking-tight">{discussion.author.username}</h4>
                                        <div className="flex items-center gap-1.5 opacity-50">
                                            <Zap className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Verified Engineer</p>
                                        </div>
                                    </div>
                                </Link>
                                <div className="h-10 w-px bg-white/5 mx-2" />
                                <div className="flex items-center gap-4 text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="text-[10px] font-black tracking-[0.2em]">{discussion.commentCount} SEC</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-[10px] font-black tracking-[0.2em]">{discussion.views} IMPR</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 shadow-2xl mb-16 relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -mr-32 -mt-32 group-hover:bg-indigo-500/10 transition-all duration-700" />
                    <div className="prose prose-invert max-w-none prose-pre:bg-slate-950 prose-pre:border prose-pre:border-white/5 text-slate-300 font-medium leading-[1.8] text-lg">
                        <ReactMarkdown>{discussion.content}</ReactMarkdown>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-4">
                            <button 
                                onClick={handleShare}
                                className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all transform active:scale-95"
                            >
                                <Share2 className="w-4 h-4" />
                                Broadcast
                            </button>
                            
                            <div className="relative">
                                <button 
                                    onClick={() => setShowOptions(!showOptions)}
                                    className={`flex items-center gap-2 px-6 py-2.5 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-95 ${showOptions ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-white/5 hover:bg-white/10 border-white/5 text-slate-400 hover:text-white"}`}
                                >
                                    <MoreVertical className="w-4 h-4" />
                                    Options
                                </button>

                                <AnimatePresence>
                                    {showOptions && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-40" 
                                                onClick={() => setShowOptions(false)}
                                            />
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute bottom-full mb-4 left-0 w-56 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden"
                                            >
                                                <div className="p-2 space-y-1">
                                                    <button 
                                                        onClick={() => { handleShare(); setShowOptions(false); }}
                                                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-left group"
                                                    >
                                                        <Copy className="w-4 h-4 text-slate-500 group-hover:text-white" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Copy Link</span>
                                                    </button>
                                                    
                                                    {user?.username === discussion.author.username ? (
                                                        <>
                                                            <Link 
                                                                to={`/discuss/edit/${discussion._id}`}
                                                                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-indigo-500/10 rounded-xl transition-all text-left group"
                                                            >
                                                                <Edit className="w-4 h-4 text-indigo-500/60 group-hover:text-indigo-400" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60 group-hover:text-indigo-400">Edit Entry</span>
                                                            </Link>
                                                            <button 
                                                                onClick={() => { handleDelete(); setShowOptions(false); }}
                                                                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-rose-500/10 rounded-xl transition-all text-left group"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-rose-500/60 group-hover:text-rose-400" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 group-hover:text-rose-400">Purge Data</span>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button 
                                                            onClick={() => { toast.error("Report protocol initialized"); setShowOptions(false); }}
                                                            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-amber-500/10 rounded-xl transition-all text-left group"
                                                        >
                                                            <AlertTriangle className="w-4 h-4 text-amber-500/60 group-hover:text-amber-400" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 group-hover:text-amber-400">Flag Inconsistency</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comment Section */}
                <div className="space-y-12">
                    <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Transmission Logs</h3>
                        <div className="h-0.5 bg-white/5 flex-1 mx-8" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{discussion.commentCount} Units</span>
                    </div>
                    
                    {/* Comment Input */}
                    {user ? (
                        <form onSubmit={handleCommentSubmit} className="group">
                            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden focus-within:border-indigo-500/30 transition-all shadow-2xl p-6">
                                <textarea 
                                    placeholder="Execute response..." 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="w-full bg-transparent px-4 py-6 outline-none resize-none placeholder:text-slate-800 text-slate-300 min-h-[150px] font-medium"
                                    required
                                />
                                <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-6 px-4">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Standard Markdown Protocol Active</p>
                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/10 border border-indigo-500/20"
                                    >
                                        {submitting ? "Transmitting..." : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Publish Log
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-slate-950/40 backdrop-blur-xl border border-dashed border-white/5 rounded-[2.5rem] p-12 text-center">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Authentication required for log entry. <Link to="/login" className="text-indigo-400 hover:underline">Initiate Login</Link></p>
                        </div>
                    )}

                    {/* Comment List */}
                    <div className="space-y-10">
                        {comments.length > 0 ? comments.map((comment) => (
                            <motion.div 
                                key={comment._id} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="group/comment relative"
                            >
                                <div className="flex gap-8">
                                    <div className="flex flex-col items-center gap-3 h-fit">
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-xl">
                                            {comment.author.username[0].toUpperCase()}
                                        </div>
                                        <div className="w-px bg-white/5 flex-1 min-h-[40px] group-last/comment:hidden" />
                                    </div>
                                    
                                    <div className="flex-1 bg-slate-900/30 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.03] transition-all shadow-xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-white uppercase tracking-tight">{comment.author.username}</span>
                                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                                    {formatDistanceToNow(new Date(comment.createdAt))} ago
                                                </span>
                                            </div>
                                        </div>
                                        <div className="prose prose-sm prose-invert max-w-none text-slate-400 font-medium leading-relaxed">
                                            <ReactMarkdown>{comment.content}</ReactMarkdown>
                                        </div>
                                        
                                        <div className="flex items-center gap-8 mt-8">
                                            <div className="flex items-center bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                                                <button 
                                                    onClick={() => handleVote(comment._id, "Comment", 1)}
                                                    className="p-1.5 hover:text-indigo-400 transition-all"
                                                >
                                                    <ThumbsUp className="w-4 h-4" />
                                                </button>
                                                <span className="text-xs font-black mx-3 tabular-nums tracking-tighter">{comment.upvotes - comment.downvotes}</span>
                                                <button 
                                                    onClick={() => handleVote(comment._id, "Comment", -1)}
                                                    className="p-1.5 hover:text-rose-400 transition-all"
                                                >
                                                    <ThumbsDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 flex items-center gap-2 transition-all group/reply">
                                                <CornerDownRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                Echo Response
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="text-center py-20 opacity-30 italic">
                                <p className="text-xs font-black uppercase tracking-[0.2em]">Silence on the grid. Initiate first response.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DiscussionDetail;
