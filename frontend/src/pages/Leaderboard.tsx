import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/utils/api";
import Navbar from "@/components/common/Navbar";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal, Trophy, Crown, Flame, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardUser {
    _id: string;
    user: {
        _id: string;
        username: string;
        avatar?: string;
        fullName?: string;
    };
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
}

export default function Leaderboard() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(`${API_URL}/leaderboard`);
                if (res.data.success) {
                    setUsers(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);

            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const topThree = users.slice(0, 3);
    const remainingUsers = users.slice(3);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-2xl h-12 w-12 border-t-2 border-indigo-500 mx-auto mb-6 shadow-lg shadow-indigo-500/20"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Rankings</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 relative overflow-hidden selection:bg-indigo-500/30">
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

            <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">
                {/* Header Section */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 backdrop-blur-sm"
                    >
                        <Trophy className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">The CodeArena Elite</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 uppercase"
                    >
                        Global <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Rankings</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-slate-500 text-lg font-medium max-w-2xl mx-auto"
                    >
                        Where logic meets speed. Competitive performance analytics of the top problem solvers in the CodeCraft ecosystem.
                    </motion.p>
                </div>

                {/* Podium Section */}
                {users.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end">
                        {/* 2nd Place */}
                        {topThree[1] && <PodiumItem user={topThree[1]} rank={2} delay={0.2} />}
                        {/* 1st Place */}
                        {topThree[0] && <PodiumItem user={topThree[0]} rank={1} delay={0} />}
                        {/* 3rd Place */}
                        {topThree[2] && <PodiumItem user={topThree[2]} rank={3} delay={0.4} />}
                    </div>
                )}

                {/* List Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                    {/* List Header */}
                    <div className="grid grid-cols-12 gap-4 p-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.02]">
                        <div className="col-span-1 text-center">Rank</div>
                        <div className="col-span-5">Contestant</div>
                        <div className="col-span-2 text-center">Total Solved</div>
                        <div className="col-span-4 grid grid-cols-3 text-center">
                            <span>Easy</span>
                            <span>Medium</span>
                            <span>Hard</span>
                        </div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {remainingUsers.length === 0 && users.length <= 3 && (
                            <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-xs italic">
                                Join the ranks by conquering challenges
                            </div>
                        )}
                        {remainingUsers.map((entry, index) => (
                            <LeaderboardRow key={entry._id} entry={entry} index={index + 4} />
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function PodiumItem({ user, rank, delay }: { user: LeaderboardUser; rank: number; delay: number }) {
    const isFirst = rank === 1;
    const colors: any = {
        1: "from-yellow-400 to-yellow-600 shadow-yellow-500/20 border-yellow-500/30",
        2: "from-slate-300 to-slate-500 shadow-slate-500/20 border-slate-500/30",
        3: "from-amber-600 to-amber-800 shadow-amber-500/20 border-amber-500/30",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className={`relative group ${isFirst ? 'md:-translate-y-12 order-first md:order-none' : 'order-last'}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-b ${colors[rank]} blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />

            <div className={`relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-[3rem] text-center shadow-2xl transition-all duration-500 group-hover:border-white/20 group-hover:scale-[1.02]`}>
                {/* Medal/Crown Icon */}
                <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[rank]} flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-500`}>
                    {isFirst ? <Crown className="h-6 w-6 text-white" /> : <Medal className="h-6 w-6 text-white" />}
                </div>

                <Link to={`/profile/${user.user.username}`} className="block mb-6 pt-4">
                    <div className="relative inline-block">
                        <div className={`absolute -inset-1.5 rounded-[2rem] bg-gradient-to-br ${colors[rank]} opacity-50 blur-sm`} />
                        <Avatar className="h-24 w-24 rounded-[2rem] border-4 border-slate-950 relative z-10">
                            <AvatarImage src={user.user.avatar} className="object-cover" />
                            <AvatarFallback className="bg-slate-800 text-white font-black text-2xl">{user.user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-black text-white text-xs z-20">
                            {rank}
                        </div>
                    </div>
                </Link>

                <div className="space-y-1 mb-6 text-center">
                    <h3 className="text-xl font-black text-white tracking-tight truncate px-2 group-hover:text-indigo-400 transition-colors uppercase">
                        {user.user.username}
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Rank #{rank}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Masters</p>
                    <p className="text-3xl font-black text-white tracking-tighter">{user.totalSolved}</p>
                </div>

                <div className="mt-6 flex justify-center gap-3">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">Easy</span>
                        <span className="text-xs font-bold text-slate-300">{user.easySolved}</span>
                    </div>
                    <div className="w-px h-8 bg-white/5" />
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">Medium</span>
                        <span className="text-xs font-bold text-slate-300">{user.mediumSolved}</span>
                    </div>
                    <div className="w-px h-8 bg-white/5" />
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">Hard</span>
                        <span className="text-xs font-bold text-slate-300">{user.hardSolved}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardUser; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (index % 10) * 0.05 }}
            className="grid grid-cols-12 gap-4 p-5 px-8 items-center bg-transparent hover:bg-white/[0.03] transition-all group"
        >
            <div className="col-span-1 text-center font-black text-slate-500 group-hover:text-indigo-400 transition-colors text-sm tracking-tighter">
                #{index}
            </div>

            <div className="col-span-5">
                <Link to={`/profile/${entry.user.username}`} className="flex items-center gap-4 group/user">
                    <Avatar className="h-10 w-10 rounded-xl border border-white/10 group-hover/user:scale-110 transition-transform duration-300">
                        <AvatarImage src={entry.user.avatar} className="object-cover" />
                        <AvatarFallback className="bg-slate-800 text-white font-black text-xs uppercase">{entry.user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-200 group-hover/user:text-white transition-colors uppercase tracking-tight line-clamp-1">
                            {entry.user.username}
                        </span>
                        <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Contestant</span>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="col-span-2 text-center">
                <div className="inline-flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-lg">
                    <TrendingUp className="h-3 w-3 text-indigo-400" />
                    <span className="text-sm font-black text-white tabular-nums tracking-tighter">{entry.totalSolved}</span>
                </div>
            </div>

            <div className="col-span-4 grid grid-cols-3 text-center items-center">
                <span className="text-green-500/80 font-bold text-sm tabular-nums">{entry.easySolved}</span>
                <span className="text-indigo-400/80 font-bold text-sm tabular-nums">{entry.mediumSolved}</span>
                <span className="text-rose-500/80 font-bold text-sm tabular-nums">{entry.hardSolved}</span>
            </div>
        </motion.div>
    );
}
