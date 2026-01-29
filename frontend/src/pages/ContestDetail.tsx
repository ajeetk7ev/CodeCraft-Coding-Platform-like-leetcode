import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/common/Navbar";
import { socket } from "../utils/socket";
import { Trophy, Timer, List, TrendingUp, ChevronRight, Loader2, User, Users, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";

interface Participant {
    user: {
        username: string;
        avatar?: string;
        rating?: number;
    };
    score: number; // This will now store points
    penalty: number;
    lastSolvedAt?: string;
    isVirtual?: boolean;
}

interface ContestSubmission {
    _id: string;
    problem: {
        title: string;
        slug: string;
    };
    verdict: string;
    createdAt: string;
}

interface Contest {
    _id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    problems: {
        _id: string;
        title: string;
        slug: string;
        difficulty: 'easy' | 'medium' | 'hard';
    }[];
    hasJoined?: boolean;
    isRated?: boolean;
    isVirtual?: boolean;
    virtualStartTime?: string;
    solvedProblems?: string[];
}

const ContestDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [contest, setContest] = useState<Contest | null>(null);
    const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
    const [submissions, setSubmissions] = useState<ContestSubmission[]>([]);
    const [activeTab, setActiveTab] = useState<"challenges" | "leaderboard" | "submissions">("challenges");
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState("");
    const [_, setIsEnded] = useState(false);

    const { token } = useAuthStore();

    const fetchContest = async () => {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const [contestRes, leaderboardRes, submissionsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/contests/${id}`, config),
                axios.get(`${import.meta.env.VITE_API_URL}/contests/${id}/leaderboard`),
                token ? axios.get(`${import.meta.env.VITE_API_URL}/contests/${id}/submissions`, config) : Promise.resolve({ data: { success: true, data: [] } })
            ]);

            if (contestRes.data.success) setContest(contestRes.data.data);
            if (leaderboardRes.data.success) setLeaderboard(leaderboardRes.data.data);
            if (submissionsRes.data.success) setSubmissions(submissionsRes.data.data);
        } catch (error) {
            console.error("Failed to fetch contest", error);
            toast.error("Failed to load contest details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContest();

        // Socket setup
        socket.connect();
        socket.emit("join_contest", id);

        socket.on("leaderboard_update", (updatedLeaderboard: Participant[]) => {
            setLeaderboard(updatedLeaderboard);
        });

        return () => {
            socket.off("leaderboard_update");
            socket.disconnect();
        };
    }, [id]);

    useEffect(() => {
        if (!contest) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            let start = new Date(contest.startTime).getTime();
            let end = new Date(contest.endTime).getTime();

            // If virtual participation, adjust start and end times
            if (contest.isVirtual && contest.virtualStartTime) {
                const duration = end - start;
                start = new Date(contest.virtualStartTime).getTime();
                end = start + duration;
            }

            if (now < start) {
                const diff = start - now;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`Starts in: ${hours}h ${minutes}m ${seconds}s`);
            } else if (now > end) {
                setTimeLeft("Contest ended");
                setIsEnded(true);
                clearInterval(timer);
            } else {
                const diff = end - now;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [contest]);

    const handleJoin = async () => {
        if (!token) return toast.error("Please login to participate");
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/contests/${id}/join`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success("Joined successfully!");
                fetchContest();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to join");
        }
    };

    const handleVirtualJoin = async () => {
        if (!token) return toast.error("Please login to participate");
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/contests/${id}/virtual-join`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success("Virtual Participation Started!");
                fetchContest();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to start virtual session");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-950">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
            </div>
        );
    }

    if (!contest) return <div>Contest not found</div>;

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-indigo-500/30">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20">
                {/* Contest Header */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8 mb-10 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="bg-gray-950/50 border border-gray-800 rounded-2xl px-6 py-4 flex flex-col items-center">
                            <Timer className="text-indigo-400 mb-1" size={20} />
                            <span className="text-2xl font-black font-mono tracking-tighter text-indigo-100">{timeLeft}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">Remaining Time</span>
                        </div>
                    </div>

                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                                Competition
                            </span>
                        </div>
                        <h1 className="text-4xl font-black mb-4 bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {contest.title}
                        </h1>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            {contest.description}
                        </p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <List size={16} className="text-indigo-500" />
                                <span>{contest.problems.length} Challenges</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Users size={16} className="text-indigo-500" />
                                <span>{leaderboard.length} Participants</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 border-b border-gray-800 mb-8 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'challenges', label: 'Challenges', icon: List },
                        { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp },
                        { id: 'submissions', label: 'My Submissions', icon: Timer }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 py-4 border-b-2 transition-all font-bold text-sm whitespace-nowrap ${activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'challenges' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-6">
                            {!contest.hasJoined ? (
                                <div className="bg-gray-900/40 border-2 border-dashed border-gray-800 rounded-[2.5rem] p-12 text-center">
                                    <Trophy className="mx-auto text-gray-700 mb-6" size={80} />
                                    <h2 className="text-3xl font-black mb-4">You're not in the arena yet</h2>
                                    <p className="text-gray-400 max-w-md mx-auto mb-8 text-lg">
                                        {new Date() < new Date(contest.startTime)
                                            ? "Register now to access these challenges when the contest starts!"
                                            : "This arena has ended. Start a virtual session to test your skills."}
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        {new Date() < new Date(contest.startTime) ? (
                                            <button
                                                onClick={handleJoin}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-3xl font-black text-lg transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                                            >
                                                Register Official
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleVirtualJoin}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-3xl font-black text-lg transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-2"
                                            >
                                                <Timer size={24} />
                                                Virtual Participation
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {contest.problems.map((prob, idx) => {
                                        const isSolved = contest.solvedProblems?.includes(prob._id);
                                        return (
                                            <Link
                                                key={prob._id}
                                                to={`/problems/${prob.slug}?contest=${id}`}
                                                className={`group flex items-center justify-between hover:bg-gray-900/60 border hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 ${isSolved ? 'bg-indigo-900/10 border-indigo-500/20' : 'bg-gray-900/30 border-gray-800'}`}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border transition-all ${isSolved ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gray-950 border-gray-800 text-indigo-500 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10'}`}>
                                                        {isSolved ? <CheckCircle2 size={24} /> : String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold group-hover:text-indigo-400 transition-colors uppercase tracking-tight flex items-center gap-2">
                                                            {prob.title}
                                                            {isSolved && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-black tracking-widest">SOLVED</span>}
                                                        </h3>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${prob.difficulty === 'easy' ? 'text-green-400' :
                                                                prob.difficulty === 'medium' ? 'text-amber-400' : 'text-rose-400'
                                                                }`}>
                                                                {prob.difficulty}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                                            <span className="text-xs text-gray-500 font-bold">
                                                                {prob.difficulty === 'easy' ? '100' : prob.difficulty === 'medium' ? '200' : '300'} Points
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" size={20} />
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quick Stats / Mini Leaderboard */}
                        <div className="hidden lg:block space-y-6">
                            <div className="bg-gray-900/30 border border-gray-800 rounded-[2.5rem] p-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                    <TrendingUp size={20} className="text-indigo-400" />
                                    Top Rankings
                                </h3>
                                <div className="space-y-4">
                                    {leaderboard.slice(0, 5).map((player, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-gray-600 w-4">{idx + 1}</span>
                                                <span className="text-sm font-medium text-gray-300">{player.user.username}</span>
                                            </div>
                                            <span className="text-sm font-black text-indigo-400">{player.score}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setActiveTab('leaderboard')}
                                    className="w-full mt-8 py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    View Full Leaderboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'leaderboard' && (
                    <div className="bg-gray-900/30 border border-gray-800 rounded-[2.5rem] overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-950/50">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Rank</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Contender</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Points</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Penalty</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Last Solve</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {leaderboard.map((player, idx) => (
                                    <tr key={idx} className={`hover:bg-white/[0.02] transition-colors ${idx < 3 ? 'bg-indigo-500/[0.03]' : ''}`}>
                                        <td className="px-8 py-6">
                                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black ${idx === 0 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/20' :
                                                idx === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/20' :
                                                    idx === 2 ? 'bg-amber-800/20 text-amber-700 border border-amber-800/20' :
                                                        'text-gray-500'
                                                }`}>
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center border border-gray-700 overflow-hidden">
                                                    {player.user.avatar ? <img src={player.user.avatar} className="w-full h-full object-cover" /> : <User size={20} className="text-gray-500" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold flex items-center gap-2">
                                                        {player.user.username}
                                                        {player.isVirtual && <span className="text-[8px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700 font-black tracking-widest uppercase">Virtual</span>}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-600">Rating: {player.user.rating || 1500}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-xl font-black text-indigo-400">{player.score}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right text-sm text-gray-400 font-mono">
                                            {player.penalty || 0}m
                                        </td>
                                        <td className="px-8 py-6 text-right text-gray-500 text-xs font-bold">
                                            {player.lastSolvedAt ? new Date(player.lastSolvedAt).toLocaleTimeString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {leaderboard.length === 0 && (
                            <div className="py-20 text-center text-gray-500 italic">No rankings registered yet.</div>
                        )}
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <div className="space-y-6">
                        <div className="bg-gray-900/30 border border-gray-800 rounded-[2.5rem] overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-950/50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Problem</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Verdict</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {submissions.map((sub) => (
                                        <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6">
                                                <Link to={`/problems/${sub.problem.slug}?contest=${id}`} className="font-bold text-gray-200 hover:text-indigo-400 transition-colors">
                                                    {sub.problem.title}
                                                </Link>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${sub.verdict === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                    }`}>
                                                    {sub.verdict}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right text-gray-500 text-xs font-bold">
                                                {new Date(sub.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {submissions.length === 0 && (
                                <div className="py-20 text-center text-gray-500 italic">No submissions made yet in this arena.</div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ContestDetail;
