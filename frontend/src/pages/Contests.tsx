import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import { Trophy, Calendar, Users, ChevronRight, Loader2, Sparkles, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import DotBackground from "../components/core/home/hero/DotBackground";

interface Contest {
    _id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    problems: string[];
    createdBy: string;
    registrationDeadline?: string;
}

const Contests: React.FC = () => {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "past">("live");
    const { token } = useAuthStore();
    const navigate = useNavigate();

    const fetchContests = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/contests`);
            if (res.data.success) {
                setContests(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch contests", error);
            toast.error("Failed to load contests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContests();
    }, []);

    const handleJoin = async (contestId: string) => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/contests/${contestId}/join`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.data.success) {
                toast.success(res.data.message || "Joined contest!");
                navigate(`/contests/${contestId}`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to join contest");
        }
    };

    const isContestActive = (startTime: string, endTime: string) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);
        return now >= start && now <= end;
    };

    const isContestUpcoming = (startTime: string) => {
        const now = new Date();
        const start = new Date(startTime);
        return now < start;
    };

    const filteredContests = contests.filter(contest => {
        const active = isContestActive(contest.startTime, contest.endTime);
        const upcoming = isContestUpcoming(contest.startTime);

        if (activeTab === "live") return active;
        if (activeTab === "upcoming") return upcoming;
        if (activeTab === "past") return !active && !upcoming;
        return false;
    });

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 selection:bg-indigo-500/30 relative overflow-hidden">
            <Navbar />

            {/* Background elements to match Home page */}
            <DotBackground />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/50 to-gray-950 pointer-events-none" />
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-[128px] pointer-events-none" />

            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-20">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
                            <Trophy className="relative text-indigo-400" size={64} />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-linear-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                        Competitive Arenas
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="flex bg-gray-900/50 p-1.5 rounded-2xl border border-gray-800 backdrop-blur-sm">
                        {[
                            { id: "live", label: "Live Now", icon: Sparkles },
                            { id: "upcoming", label: "Upcoming", icon: Calendar },
                            { id: "past", label: "Past Events", icon: Clock },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
                        <p className="text-gray-500 animate-pulse font-medium">Synchronizing with the arena...</p>
                    </div>
                ) : filteredContests.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/40 rounded-[2.5rem] border border-gray-800 border-dashed max-w-3xl mx-auto">
                        <Calendar className="mx-auto text-gray-700 mb-4" size={64} />
                        <h3 className="text-2xl font-bold text-gray-400">Nothing here yet</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            {activeTab === 'live' ? "The arena is currently calm. No live battles happening." :
                                activeTab === 'upcoming' ? "No upcoming battles scheduled yet. Stay tuned!" :
                                    "You haven't missed anything yet. The history is empty."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {filteredContests.map((contest) => {
                            const active = isContestActive(contest.startTime, contest.endTime);
                            const upcoming = isContestUpcoming(contest.startTime);

                            return (
                                <div
                                    key={contest._id}
                                    className="group relative flex flex-col bg-gray-900/40 hover:bg-gray-900/60 border border-gray-800 hover:border-indigo-500/30 rounded-[2rem] overflow-hidden transition-all duration-500 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-indigo-500/10"
                                >
                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4 z-10 font-mono">
                                        {active ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-wider animate-pulse">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Live
                                            </span>
                                        ) : upcoming ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                                                Upcoming
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-900/50 border border-gray-800 text-gray-500 text-[10px] font-black uppercase tracking-wider">
                                                Ended
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-8 pb-0">
                                        <div className="mb-6 inline-flex p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                                            {active ? <Sparkles size={24} /> : upcoming ? <Calendar size={24} /> : <Clock size={24} />}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors line-clamp-1">
                                            {contest.title}
                                        </h3>
                                        <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-6 h-8">
                                            {contest.description}
                                        </p>
                                    </div>

                                    <div className="mt-auto p-8 pt-4 space-y-4">
                                        <div className="flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-800 pt-6 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-indigo-500/60" />
                                                <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users size={14} className="text-indigo-500/60" />
                                                <span>{contest.problems.length} Challenges</span>
                                            </div>
                                            {contest.registrationDeadline && isContestUpcoming(contest.startTime) && (
                                                <div className="flex items-center gap-2 text-rose-400">
                                                    <Clock size={14} />
                                                    <span>Reg ends: {new Date(contest.registrationDeadline).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => (active || !upcoming) ? navigate(`/contests/${contest._id}`) : handleJoin(contest._id)}
                                            className={`w-full group/btn flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all duration-500 ${active
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20'
                                                : upcoming
                                                    ? 'bg-gray-800 hover:bg-gray-750 text-indigo-400 border border-gray-800'
                                                    : 'bg-gray-950 hover:bg-gray-900 text-gray-400 border border-gray-800'
                                                }`}
                                        >
                                            {active ? 'Enter Arena' : upcoming ? 'Join Contest' : 'Ended'}
                                            <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                    <div className="absolute -bottom-1 left-0 w-0 h-1 bg-indigo-500 group-hover:w-full transition-all duration-700" />
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Contests;
